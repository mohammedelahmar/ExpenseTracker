import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { jest } from '@jest/globals';

// Increase default Jest timeout to accommodate DB spin-up
jest.setTimeout(90000);

let mongoServer;

async function startInMemoryMongo(retries = 2) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const server = await MongoMemoryServer.create({
        instance: { storageEngine: 'wiredTiger' },
        timeout: 60000,
      });
      return server;
    } catch (err) {
      lastErr = err;
      // Small backoff before retrying
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
  throw lastErr;
}

beforeAll(async () => {
  mongoServer = await startInMemoryMongo(3);
  const uri = mongoServer.getUri();
  process.env.CONNECTION_URL = uri;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
});

afterAll(async () => {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
  } catch (e) {
    // ignore cleanup errors
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  const { connections } = mongoose;
  for (const connection of connections) {
    if (!connection || connection.readyState !== 1 || !connection.db) continue;
    const collections = await connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
});
