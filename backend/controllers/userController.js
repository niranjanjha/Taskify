import User from "../models/userModel.js";
import validator from 'validator' 
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sendWelcomeEmail } from '../services/welcomeEmailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
const TOKEN_EXPIRES = '24 hours';

const createToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), role: user.role || "user" },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES }
  );

// Register Function

export async function registerUser(req,res){
    const {name,email,password}=req.body;
    console.log("Registration attempt with data:", {name, email, password: password ? '****' : 'empty'});

    if(!name || !email || !password)
    {
        console.log("Registration failed: Missing required fields");
        return res.status(400).json({success: false, message:"All fields are required"});
    }

    if(!validator.isEmail(email)){
        console.log("Registration failed: Invalid email format");
        return res.status(400).json({success: false, message:"Invalid email"});
    }

    if(password.length < 8)
    {
        console.log("Registration failed: Password too short");
        return res.status(400).json({success:false,message:"Password must be more than 8 characters"});
    }

    try{
        console.log("Checking if user already exists...");
        const existingUser = await User.findOne({email});
        if(existingUser){
            console.log("Registration failed: User already exists");
            return res.status(409).json ({success:false,message:"User already exist"});
        }
        
        console.log("Hashing password...");
        const hashed = await bcrypt.hash(password,10);
        console.log("Creating user...");
        const user = await User.create({name,email,password:hashed});
        console.log("User created successfully:", user._id);
        
        // Send welcome email (non-blocking)
        sendWelcomeEmail(user).then(result => {
            if (result) {
                console.log(`Welcome email successfully sent to ${user.email}`);
            } else {
                console.warn(`Failed to send welcome email to ${user.email}`);
            }
        }).catch(error => {
            console.error(`Error sending welcome email to ${user.email}:`, error);
        });
        
        const token = createToken(user);
        console.log("Token created for user:", user._id);

        res.status(201).json({
          success: true,
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role || "user",
          },
        });
    }
    catch(err)
    {
        console.error("Registration error:", err);
        res.status(500).json({success: false,message:"Server error" });
    }
}

// LOGIN FUNCTION

export async function loginUser(req,res){
    const {email,password}=req.body; // Removed unused 'name' from destructuring
    console.log("Login attempt with data:", {email, password: password ? '****' : 'empty'});

    if( !email || !password)
    {
        console.log("Login failed: Missing required fields");
        return res.status(400).json({success: false, message:"Email and password are required"});
    }

    try{
        console.log("Finding user...");
        const user= await User.findOne({email}).select('+password'); // Added .select('+password') to ensure password is retrieved
        if(!user)
        {
            console.log("Login failed: User not found");
            return res.status(401).json({success:false,message:"Invalid Credentials"});
        }

        console.log("Comparing passwords...");
        const match= await bcrypt.compare(password,user.password);
        if(!match)
        {
            console.log("Login failed: Password mismatch");
            return res.status(401).json({success:false,message:"Invalid Credentials"});
        }
        
        console.log("Login successful for user:", user._id);
        const token = createToken(user);
        res.json({
          success: true,
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role || "user",
          },
        });
    }
    catch(err)
    {
        console.error("Login error:", err);
        res.status(500).json({success: false,message:"Server error" });
    }
}

// GET CURRENT USER

export async function getCurrentUser(req,res)
{
    try{
        console.log("Getting current user:", req.user.id);
        const user=await User.findById(req.user.id);
        if(!user)
        {
            console.log("User not found");
            return res.status(404).json({success:false,message:"User not found"});
        }
        res.json({
          success: true,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role || "user",
          },
        });
    }
    catch(err){
        console.error("Error getting current user:", err);
        res.status(500).json({success:false,message:"Server error"});
    }
}

// UPDATE PROFILE
export async function updateProfile(req,res){
    try{
        const {name,email}=req.body;
        console.log("Updating profile for user:", req.user.id, {name, email});

        // Validate email if provided
        if(email && !validator.isEmail(email)){
            return res.status(400).json({success:false,message:"Invalid email format"});
        }

        const updateData={};
        if(name) updateData.name=name;
        if(email) updateData.email=email;

        const user=await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            {new:true,runValidators:true}
        );

        if(!user)
        {
            return res.status(404).json({success:false,message:"User not found"});
        }

        res.json({
          success: true,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role || "user",
          },
        });
    }
    catch(err){
        console.error("Error updating profile:", err);
        res.status(500).json({success:false,message:"Server error"});
    }
}

// UPDATE PASSWORD
export async function updatePassword(req,res){
    try{
        const {current,new: newPassword}=req.body;
        console.log("Updating password for user:", req.user.id);

        if(!current || !newPassword)
        {
            return res.status(400).json({success:false,message:"Current and new passwords are required"});
        }

        if(newPassword.length<8)
        {
            return res.status(400).json({success:false,message:"New password must be at least 8 characters"});
        }

        const user=await User.findById(req.user.id).select('+password');
        if(!user)
        {
            return res.status(404).json({success:false,message:"User not found"});
        }

        const match=await bcrypt.compare(current,user.password);
        if(!match)
        {
            return res.status(401).json({success:false,message:"Current password is incorrect"});
        }

        const hashed=await bcrypt.hash(newPassword,10);
        user.password=hashed;
        await user.save();

        res.json({success:true,message:"Password updated successfully"})
    }
    catch(err){
        console.error("Error updating password:", err);
        res.status(500).json({success:false,message:"Server error"});
    }
}