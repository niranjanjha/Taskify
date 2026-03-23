import mongoose from 'mongoose';

const userSchema= new mongoose.Schema(
    {
        name:{
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique:true
        },

        password:{
             type: String,
            required: true
        },

        faceData: {
            type: [Number], // Store face descriptor as array of numbers
            required: false
        },

        role: {
            type: String,
            enum: ["user", "superuser"],
            default: "user",
        },
    }
)

const userModel=mongoose.model("user",userSchema);

export default userModel;