import mongoose from "mongoose";

const subtaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed'],
        default: 'Pending'
    },
    dueDate: {
        type: Date
    },
    task: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Task',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Subtask = mongoose.models.Subtask || mongoose.model('Subtask', subtaskSchema);

export default Subtask;