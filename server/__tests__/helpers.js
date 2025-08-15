import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';

export const initTestServer = async () => {
  // Ensure we connect using in-memory URI set in setup
  if (!mongoose.connection.readyState) {
    await connectDB();
  }
  return app;
};

export const registerAndLogin = async (server, user = {}) => {
  const payload = {
    username: user.username || `user${Date.now()}`,
    email: user.email || `user${Date.now()}@test.com`,
    password: user.password || 'Password123',
  };
  const res = await request(server).post('/api/users/register').send(payload);
  const token = res.body.token;
  return { token, user: res.body };
};

export const authHeader = (token) => ({ Authorization: `Bearer ${token}` });
