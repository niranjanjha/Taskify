import express from 'express';
import { registerFace, loginWithFace, checkFaceRegistration } from '../controllers/faceController.js';
import authMiddleware from '../middleware/auth.js';

const faceRouter = express.Router();

// Register face data for authenticated user
faceRouter.post('/register', authMiddleware, registerFace);

// Login with face data (no authentication required)
faceRouter.post('/login', loginWithFace);

// Check if user has face registered
faceRouter.get('/check', authMiddleware, checkFaceRegistration);

export default faceRouter;