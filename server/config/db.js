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
          if (process.env.NODE_ENV !== 'production') {
               // eslint-disable-next-line no-console
               console.log('MongoDB connected');
          }
     }catch(error){
          // eslint-disable-next-line no-console
          console.error('MongoDB connection failed', error.message);
          process.exit(1); 
     }
};
export default connectDB;