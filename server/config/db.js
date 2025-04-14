// MongoDB connection setup
// This file is responsible for connecting to the MongoDB database using Mongoose.
// It uses environment variables to get the connection URL and handles errors during the connection process.
// It exports a function that can be called to establish the connection.
// Importing required modules
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const CONNECTION_URL=process.env.CONNECTION_URL;

const connectDB = async ()=>{
     try{
          await mongoose.connect(CONNECTION_URL,{
               useNewUrlParser: true,
               useUnifiedTopology: true,
          })
          console.log('MongoDB connected successfully');
     }catch(error){
          console.log('MongoDB connection failed',error.message);
          process.exit(1); 
     }
};
export default connectDB;