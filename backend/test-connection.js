import mongoose from 'mongoose';

// Use the same connection string from your .env file
const uri = 'mongodb+srv://shubhamjha4830:shubhamjha4830@cluster0.qgcyns1.mongodb.net/Taskify?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Connection failed:', err);
  });