import Task from "../models/taskModel.js";
import Subtask from "../models/subtaskModel.js";
import userModel from "../models/userModel.js";
import { sendTaskAssignmentEmail } from "../services/taskAssignmentEmailService.js";
import {
  storeTaskCreatedMemory,
  storeTaskCompletedMemory,
  storeAssignmentMemory,
} from "../services/aiService.js";

// Helper function to calculate if all subtasks are completed
const calculateTaskCompletion = async (taskId) => {
  const subtasks = await Subtask.find({ task: taskId });
  if (subtasks.length === 0) return false;
  
  // Check if all subtasks are completed
  return subtasks.every(subtask => subtask.status === 'Completed');
};

// Helper function to populate subtasks and calculate completion
const populateTaskWithSubtasks = async (task) => {
  const subtasks = await Subtask.find({ task: task._id });
  task._allSubtasksCompleted = subtasks.length > 0 && subtasks.every(subtask => subtask.status === 'Completed');
  task.subtasks = subtasks;
  return task;
};

//CREATE A NEW TASK
export const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, completed, assignedTo } = req.body;
    
    // Validate assigned users if provided
    if (assignedTo && assignedTo.length > 0) {
      // Extract user IDs from the assignedTo array
      const userIds = assignedTo.map(assignment => assignment.user);
      
      // Check if all users exist in the database
      const existingUsers = await userModel.find({ _id: { $in: userIds } });
      const existingUserIds = existingUsers.map(user => user._id.toString());
      
      // Check if any assigned user doesn't exist
      const invalidUserIds = userIds.filter(userId => !existingUserIds.includes(userId));
      if (invalidUserIds.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid user IDs: ${invalidUserIds.join(', ')}. These users do not exist.` 
        });
      }
    }
    
    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      completed: completed === "Yes" || completed === true,
      owner: req.user.id,
      assignedTo: assignedTo || [] // Array of {user, role} objects
    });
    const saved = await task.save();
    
    // Populate the owner and assigned users
    await saved.populate('owner', 'name email');
    await saved.populate('assignedTo.user', 'name email');

    void storeTaskCreatedMemory(req.user.id, saved);
    
    res.status(201).json({ success: true, task: saved });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

//Get All Task for Logged in user (including assigned tasks)
export const getTasks = async (req, res) => {
  try {
    let tasks = await Task.find({
      $or: [
        { owner: req.user.id },
        { "assignedTo.user": req.user.id }
      ]
    }).sort({
      createdAt: -1,
    }).populate('assignedTo.user', 'name email').populate('owner', 'name email');
    
    // Populate subtasks and calculate completion status for each task
    tasks = await Promise.all(tasks.map(populateTaskWithSubtasks));
    
    res.json({ success: true, tasks });
  } catch (err) {
    console.error("Error in getTasks:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

//GET SINGLE TASK BY ID (must belong to that particular user or be assigned to them)
export const getTasksById = async (req, res) => {
  try {
    let task = await Task.findOne({ 
      _id: req.params.id,
      $or: [
        { owner: req.user.id },
        { "assignedTo.user": req.user.id }
      ]
    }).populate('assignedTo.user', 'name email').populate('owner', 'name email');
    
    if (!task)
      return res.status(404).json({
        success: false,
        message: "Task Not Found",
      });
      
    // Populate subtasks and calculate completion status
    task = await populateTaskWithSubtasks(task);
    
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE A TASK
export const updateTask = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.completed !== undefined) {
      data.completed = data.completed === "Yes" || data.completed === true;
    }
    
    // Validate assigned users if provided in update
    if (data.assignedTo && data.assignedTo.length > 0) {
      // Extract user IDs from the assignedTo array
      const userIds = data.assignedTo.map(assignment => assignment.user);
      
      // Check if all users exist in the database
      const existingUsers = await userModel.find({ _id: { $in: userIds } });
      const existingUserIds = existingUsers.map(user => user._id.toString());
      
      // Check if any assigned user doesn't exist
      const invalidUserIds = userIds.filter(userId => !existingUserIds.includes(userId));
      if (invalidUserIds.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid user IDs: ${invalidUserIds.join(', ')}. These users do not exist.` 
        });
      }
    }
    
    let updated = await Task.findOneAndUpdate(
      { 
        _id: req.params.id, 
        $or: [
          { owner: req.user.id },
          { "assignedTo.user": req.user.id }
        ]
      },
      data,
      { new: true, runValidators: true }
    ).populate('assignedTo.user', 'name email').populate('owner', 'name email');

    if (!updated)
      return res.status(404).json({
        success: false,
        message: "Task Not Found or Not Yours",
      });
      
    // Populate subtasks and calculate completion status
    updated = await populateTaskWithSubtasks(updated);

    if (data.completed !== undefined && updated.completed) {
      void storeTaskCompletedMemory(req.user.id, updated);
    }
    
    res.json({ success: true, task: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//DELETE A TASK FUNCTION
export const deleteTask = async (req, res) => {
  try {
    console.log("Attempting to delete task:", req.params.id);
    console.log("User ID:", req.user.id);
    
    // Only allow task owner to delete the task
    const deleted = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });
    
    console.log("Delete result:", deleted);

    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Task not found or you don't have permission to delete this task" });
        
    // Also delete all subtasks associated with this task
    await Subtask.deleteMany({ task: req.params.id });
    
    res.json({ success: true, message: "Task Deleted" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ASSIGN USER TO TASK
export const assignUserToTask = async (req, res) => {
  try {
    console.log('Assign user to task request received:', req.body);
    const { taskId, userId, role } = req.body;
    
    // Check if the user exists
    const userExists = await userModel.findById(userId);
    if (!userExists) {
      console.log('User not found:', userId);
      return res.status(400).json({
        success: false,
        message: "User not found. You can only assign tasks to existing users."
      });
    }
    
    const task = await Task.findOne({
      _id: taskId,
      owner: req.user.id // Only owner can assign users
    }).populate('owner', 'name email'); // Populate owner data for email notification
    
    if (!task) {
      console.log('Task not found or user is not owner:', taskId);
      return res.status(404).json({
        success: false,
        message: "Task not found or you don't have permission to assign users"
      });
    }
    
    // Check if user is already assigned
    const isAlreadyAssigned = task.assignedTo.some(
      assignment => assignment.user.toString() === userId
    );
    
    if (isAlreadyAssigned) {
      console.log('User already assigned to task:', userId, taskId);
      return res.status(400).json({
        success: false,
        message: "User is already assigned to this task"
      });
    }
    
    task.assignedTo.push({ user: userId, role: role || 'Member' });
    await task.save();
    
    // Populate the assigned user data
    await task.populate('assignedTo.user', 'name email');

    void storeAssignmentMemory(
      req.user.id,
      task.title,
      userExists.name || userExists.email || "Teammate",
      role || "Member"
    );
    
    // Send email notification to the assigned user
    try {
      console.log('Sending task assignment email to:', userExists.email);
      const emailSent = await sendTaskAssignmentEmail(
        userExists, // assigned user
        task.owner, // assigning user (task owner)
        task // task details
      );
      
      if (emailSent) {
        console.log('Task assignment email sent successfully');
      } else {
        console.warn('Failed to send task assignment email');
      }
    } catch (emailError) {
      console.error('Failed to send task assignment email:', emailError);
      // Continue with the response even if email fails
    }
    
    res.json({ success: true, task, emailSent: true });
  } catch (err) {
    console.error('Error in assignUserToTask:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// REMOVE USER FROM TASK
export const removeUserFromTask = async (req, res) => {
  try {
    const { taskId, userId } = req.body;
    
    const task = await Task.findOne({
      _id: taskId,
      owner: req.user.id // Only owner can remove users
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or you don't have permission to remove users"
      });
    }
    
    task.assignedTo = task.assignedTo.filter(
      assignment => assignment.user.toString() !== userId
    );
    
    await task.save();
    
    // Populate the assigned user data
    await task.populate('assignedTo.user', 'name email');
    
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// SUBTASK CONTROLLERS
// CREATE SUBTASK
export const createSubtask = async (req, res) => {
  try {
    const { title, description, dueDate, status, taskId } = req.body;
    
    // Check if the task exists and user has access
    const task = await Task.findOne({
      _id: taskId,
      $or: [
        { owner: req.user.id },
        { "assignedTo.user": req.user.id }
      ]
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or you don't have permission to add subtasks"
      });
    }
    
    const subtask = new Subtask({
      title,
      description,
      dueDate,
      status: status || 'Pending',
      task: taskId,
      assignedTo: req.user.id // By default, assigned to the creator
    });
    
    const saved = await subtask.save();
    
    // After creating a subtask, check if the task completion status needs to be updated
    const allSubtasksCompleted = await calculateTaskCompletion(taskId);
    if (task.completed && !allSubtasksCompleted) {
      // If task was marked complete but not all subtasks are complete, update it
      task.completed = false;
      await task.save();
    }
    
    res.status(201).json({ success: true, subtask: saved });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET SUBTASKS FOR A TASK
export const getSubtasks = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Check if the task exists and user has access
    const task = await Task.findOne({
      _id: taskId,
      $or: [
        { owner: req.user.id },
        { "assignedTo.user": req.user.id }
      ]
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or you don't have permission to view subtasks"
      });
    }
    
    const subtasks = await Subtask.find({ task: taskId }).sort({ createdAt: -1 });
    
    res.json({ success: true, subtasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE SUBTASK
export const updateSubtask = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const updateData = req.body;
    
    const subtask = await Subtask.findById(subtaskId);
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: "Subtask not found"
      });
    }
    
    // Check if user has access to the parent task
    const task = await Task.findOne({
      _id: subtask.task,
      $or: [
        { owner: req.user.id },
        { "assignedTo.user": req.user.id }
      ]
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Parent task not found or you don't have permission to update subtasks"
      });
    }
    
    const updated = await Subtask.findByIdAndUpdate(
      subtaskId,
      updateData,
      { new: true, runValidators: true }
    );
    
    // After updating a subtask, check if the task completion status needs to be updated
    const allSubtasksCompleted = await calculateTaskCompletion(task._id);
    if (allSubtasksCompleted && !task.completed) {
      // If all subtasks are complete but task is not marked complete, update it
      task.completed = true;
      await task.save();
    } else if (!allSubtasksCompleted && task.completed && updateData.status !== 'Completed') {
      // If not all subtasks are complete but task is marked complete, update it
      task.completed = false;
      await task.save();
    }
    
    res.json({ success: true, subtask: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE SUBTASK
export const deleteSubtask = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    
    const subtask = await Subtask.findById(subtaskId);
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: "Subtask not found"
      });
    }
    
    // Check if user has access to the parent task
    const task = await Task.findOne({
      _id: subtask.task,
      $or: [
        { owner: req.user.id },
        { "assignedTo.user": req.user.id }
      ]
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Parent task not found or you don't have permission to delete subtasks"
      });
    }
    
    await Subtask.findByIdAndDelete(subtaskId);
    
    // After deleting a subtask, check if the task completion status needs to be updated
    const allSubtasksCompleted = await calculateTaskCompletion(task._id);
    if (task.completed && !allSubtasksCompleted) {
      // If task was marked complete but not all subtasks are complete, update it
      task.completed = false;
      await task.save();
    }
    
    res.json({ success: true, message: "Subtask deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET ALL USERS (for assignment purposes)
export const getAllUsers = async (req, res) => {
  try {
    // Get all users except the current user
    const users = await userModel.find({ _id: { $ne: req.user.id } }, 'name email');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
