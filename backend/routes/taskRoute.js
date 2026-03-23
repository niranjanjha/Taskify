import express from 'express'
import authMiddleware from '../middleware/auth.js'
import {
  createTask,
  getTasks,
  getTasksById,
  deleteTask,
  updateTask,
  assignUserToTask,
  removeUserFromTask,
  createSubtask,
  getSubtasks,
  updateSubtask,
  deleteSubtask,
  getAllUsers
} from '../controllers/taskController.js'

const taskRouter =express.Router()

taskRouter.route('/gp')
 .get(authMiddleware,getTasks)
 .post(authMiddleware,createTask);

taskRouter.route('/:id/gp')
 .get(authMiddleware,getTasksById)
 .put(authMiddleware,updateTask)
 .delete(authMiddleware,deleteTask)

// User assignment routes
taskRouter.route('/assign')
 .post(authMiddleware, assignUserToTask);

taskRouter.route('/remove')
 .post(authMiddleware, removeUserFromTask);

// Subtask routes
taskRouter.route('/subtasks')
 .post(authMiddleware, createSubtask);

taskRouter.route('/subtasks/:taskId')
 .get(authMiddleware, getSubtasks);

taskRouter.route('/subtasks/update/:subtaskId')
 .put(authMiddleware, updateSubtask);

taskRouter.route('/subtasks/delete/:subtaskId')
 .delete(authMiddleware, deleteSubtask);

// User routes
taskRouter.route('/users')
 .get(authMiddleware, getAllUsers);

 export default taskRouter;