import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import {connectDB} from './config/db.js'
import userRouter from './routes/userRoute.js';
import taskRouter from './routes/taskRoute.js';
import todoRouter from './routes/todoRoute.js';
import faceRouter from './routes/faceRoute.js';
import aiRouter from './routes/aiRoute.js';
import scheduleEmailReminders from './services/emailReminderService.js';
import { initializeTransporter } from './services/emailService.js';
import { initializeVideoCallService } from './services/videoCallService.js';
import http from 'http';

import authMiddleware from './middleware/auth.js'

const app=express();
const server = http.createServer(app);
const port =process.env.PORT ||4000;

//MIDDLEWARE
app.use(express.json());
app.use(cors());
app.use(express.urlencoded ({extended: true}))


//DB connect
connectDB().then(() => {
  // Initialize email services only after DB connection is successful
  initializeTransporter();
  scheduleEmailReminders();
  // Initialize video call service
  initializeVideoCallService(server);
}).catch((err) => {
  console.error('Failed to connect to database:', err);
  console.log('Server will start without email services');
});

//ROUTES
app.use("/api/user", userRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/todos", todoRouter);
app.use("/api/face", faceRouter);
app.use("/api/ai", aiRouter);

app.get('/',(req,res)=>{
    res.send('API WORKING');
})

server.listen(port,()=>{
    console.log(`server started on http://localhost:${port}`)
});