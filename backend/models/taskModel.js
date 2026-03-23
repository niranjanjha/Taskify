import mongoose from "mongoose";

const taskSchema=new mongoose.Schema({
    title:{
        type:String,
        required: true
    },
    description:{
        type:String,
        default:''
    },
    priority:{
        type: String,
        enum:['Low','Medium','High'],default:'Low'
    },
    dueDate:{
        type:Date
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId, ref:'user',required:true
    },
    // Multi-user assignment and role designation
    assignedTo: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        role: { type: String, default: 'Member' }
    }],
    completed:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

// Add a virtual property to calculate completion based on subtasks
taskSchema.virtual('isComplete').get(function() {
    // If the task is manually marked as completed, return true
    if (this.completed) return true;
    
    // Otherwise, check if all subtasks are completed
    // This will be calculated in the controller when populating subtasks
    return this._allSubtasksCompleted || false;
});

// Ensure virtual fields are serialized
taskSchema.set('toJSON', { virtuals: true });

const Task= mongoose.models.Task||mongoose.model('Task',taskSchema);

export default Task;