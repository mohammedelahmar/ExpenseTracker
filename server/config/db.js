// MongoDB connection setup
// This file is responsible for connecting to the MongoDB database using Mongoose.
// It uses environment variables to get the connection URL and handles errors during the connection process.
// It exports a function that can be called to establish the connection.
// Importing required modules
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let memoryServer; // optional in-memory server handle

const connectDB = async () => {
     try {
          let uri = process.env.CONNECTION_URL;

          // Optional: allow running with an in-memory MongoDB server
          if (process.env.USE_IN_MEMORY_DB === 'true') {
               // Lazy import to avoid adding to production bundle unless used
               const { MongoMemoryServer } = await import('mongodb-memory-server');
               memoryServer = await MongoMemoryServer.create();
               uri = memoryServer.getUri();
               process.env.CONNECTION_URL = uri; // expose for other modules if needed
               if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.log('Using in-memory MongoDB instance for runtime');
               }
          }

          if (!uri) {
               throw new Error('CONNECTION_URL is not set and USE_IN_MEMORY_DB is not enabled');
          }

          await mongoose.connect(uri);
          if (process.env.NODE_ENV !== 'production') {
               // eslint-disable-next-line no-console
               console.log('MongoDB connected');
          }
     } catch (error) {
          // eslint-disable-next-line no-console
          console.error('MongoDB connection failed', error.message);
          process.exit(1);
     }
};

export default connectDB;