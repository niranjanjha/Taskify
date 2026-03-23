import User from "../models/userModel.js";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
const TOKEN_EXPIRES = '24 hours';

const createToken = (userId) => jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });

// Calculate Euclidean distance between two face descriptors
const calculateDistance = (descriptor1, descriptor2) => {
    if (!descriptor1 || !descriptor2 || descriptor1.length !== descriptor2.length) {
        return Infinity;
    }
    
    let sum = 0;
    for (let i = 0; i < descriptor1.length; i++) {
        const diff = descriptor1[i] - descriptor2[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
};

// Register face data for a user
export async function registerFace(req, res) {
    const { faceData } = req.body;
    const userId = req.user.id;
    
    console.log("Face registration attempt for user:", userId);

    if (!faceData) {
        console.log("Face registration failed: Missing face data");
        return res.status(400).json({ success: false, message: "Face data is required" });
    }

    // Validate faceData is an array
    if (!Array.isArray(faceData)) {
        console.log("Face registration failed: Invalid face data format");
        return res.status(400).json({ success: false, message: "Invalid face data format" });
    }

    try {
        console.log("Updating user with face data...");
        const user = await User.findByIdAndUpdate(
            userId,
            { faceData },
            { new: true }
        );
        
        if (!user) {
            console.log("Face registration failed: User not found");
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        console.log("Face registered successfully for user:", userId);
        res.json({ success: true, message: "Face registered successfully" });
    } catch (err) {
        console.error("Face registration error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

// Authenticate user using face recognition
export async function loginWithFace(req, res) {
    const { faceData } = req.body;
    
    console.log("Face login attempt");

    if (!faceData) {
        console.log("Face login failed: Missing face data");
        return res.status(400).json({ success: false, message: "Face data is required" });
    }

    // Validate faceData is an array
    if (!Array.isArray(faceData)) {
        console.log("Face login failed: Invalid face data format");
        return res.status(400).json({ success: false, message: "Invalid face data format" });
    }

    try {
        console.log("Finding users with face data...");
        // Find all users with faceData
        const users = await User.find({ faceData: { $exists: true } });
        
        if (users.length === 0) {
            console.log("Face login failed: No users with face data found");
            return res.status(401).json({ success: false, message: "No registered faces found" });
        }
        
        // Find the best matching user
        let bestMatch = null;
        let minDistance = Infinity;
        const threshold = 0.6; // Threshold for face recognition match
        
        console.log(`Comparing with ${users.length} users...`);
        
        for (const user of users) {
            const distance = calculateDistance(faceData, user.faceData);
            console.log(`User ${user._id}: distance = ${distance}`);
            
            if (distance < minDistance) {
                minDistance = distance;
                bestMatch = user;
            }
        }
        
        // Check if the best match is within the threshold
        if (bestMatch && minDistance < threshold) {
            console.log("Face login successful for user:", bestMatch._id, "with distance:", minDistance);
            const token = createToken(bestMatch._id);
            res.json({
                success: true,
                token,
                user: { id: bestMatch._id, name: bestMatch.name, email: bestMatch.email },
                message: "Face authentication successful"
            });
        } else {
            console.log("Face login failed: No matching face found within threshold");
            return res.status(401).json({ success: false, message: "Face not recognized" });
        }
    } catch (err) {
        console.error("Face login error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

// Check if user has face registered
export async function checkFaceRegistration(req, res) {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        const hasFace = !!user.faceData && user.faceData.length > 0;
        res.json({ success: true, hasFace });
    } catch (err) {
        console.error("Check face registration error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}