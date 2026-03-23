import mongoose from "mongoose";

export const connectDB = async () => {
  // Use MongoDB Atlas connection string
  const uri = process.env.MONGO_URI || 'mongodb+srv://shubhamjha4830:shubhamjha4830@cluster0.qgcyns1.mongodb.net/Taskify?retryWrites=true&w=majority&appName=Cluster0';
  
  console.log('Attempting to connect to MongoDB with URI:', uri);

  try {
    await mongoose.connect(uri);
    console.log('DB CONNECTED');
    
    // Add connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};