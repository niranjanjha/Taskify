import ToDo from "../models/todoModel.js";

// CREATE A NEW TODO
export const createToDo = async (req, res) => {
    try {
        const { taskText, doodleData } = req.body;
        
        const todo = new ToDo({
            userId: req.user.id,
            taskText,
            doodleData: doodleData || "",
            isCompleted: false
        });
        
        const saved = await todo.save();
        res.status(201).json({ success: true, todo: saved });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// GET ALL TODOS FOR LOGGED IN USER
export const getToDos = async (req, res) => {
    try {
        const todos = await ToDo.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, todos });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET SINGLE TODO BY ID
export const getToDoById = async (req, res) => {
    try {
        const todo = await ToDo.findOne({ 
            _id: req.params.id,
            userId: req.user.id
        });
        
        if (!todo)
            return res.status(404).json({
                success: false,
                message: "To Do not found",
            });
            
        res.json({ success: true, todo });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// UPDATE A TODO
export const updateToDo = async (req, res) => {
    try {
        const { taskText, isCompleted, doodleData } = req.body;
        
        const updated = await ToDo.findOneAndUpdate(
            { 
                _id: req.params.id,
                userId: req.user.id
            },
            {
                taskText,
                isCompleted,
                doodleData
            },
            { new: true, runValidators: true }
        );

        if (!updated)
            return res.status(404).json({
                success: false,
                message: "To Do not found",
            });
            
        res.json({ success: true, todo: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE A TODO
export const deleteToDo = async (req, res) => {
    try {
        const deleted = await ToDo.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!deleted)
            return res.status(404).json({
                success: false,
                message: "To Do not found",
            });
            
        res.json({ success: true, message: "To Do deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};