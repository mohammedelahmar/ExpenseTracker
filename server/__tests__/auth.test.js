import request from 'supertest';
import app from '../app.js';
import { initTestServer, authHeader } from './helpers.js';

let server;

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    server = await initTestServer();
  });

  test('register -> login -> access protected profile', async () => {
    // Register
    const reg = await request(server).post('/api/users/register').send({
      username: 'alice',
      email: 'alice@test.com',
      password: 'Password123'
    });
    expect(reg.status).toBe(201);
    expect(reg.body).toHaveProperty('token');

    // Login
    const login = await request(server).post('/api/users/login').send({
      email: 'alice@test.com',
      password: 'Password123'
    });
    expect(login.status).toBe(200);
    const token = login.body.token;

    // Access profile
    const prof = await request(server).get('/api/users/profile').set(authHeader(token));
    expect(prof.status).toBe(200);
    expect(prof.body).toHaveProperty('email', 'alice@test.com');
  });

  test('protected route without token should fail', async () => {
    const res = await request(server).get('/api/users/profile');
    expect(res.status).toBe(401);
  });
});
