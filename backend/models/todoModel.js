import mongoose from "mongoose";

const toDoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    taskText: {
        type: String,
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    doodleData: {
        type: String, // Base64 string of the doodle image
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
toDoSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const ToDo = mongoose.models.ToDo || mongoose.model('ToDo', toDoSchema);

export default ToDo;