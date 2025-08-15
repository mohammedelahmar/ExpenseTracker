import request from 'supertest';
import { initTestServer, registerAndLogin, authHeader } from './helpers.js';

let server, token;

describe('Goals API', () => {
  beforeAll(async () => {
    server = await initTestServer();
    const auth = await registerAndLogin(server);
    token = auth.token;
  });

  test('CRUD goal', async () => {
    const payload = {
      name: 'Save for vacation',
      targetAmount: 1000,
      targetDate: new Date(Date.now() + 86400000).toISOString(),
      category: 'Travel'
    };

    // Create
    const create = await request(server).post('/api/goals').set(authHeader(token)).send(payload);
    expect(create.status).toBe(201);
    const id = create.body._id;

    // List
    const list = await request(server).get('/api/goals').set(authHeader(token));
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);

    // Get by id
    const get = await request(server).get(`/api/goals/${id}`).set(authHeader(token));
    expect(get.status).toBe(200);

    // Contribute
    const contrib = await request(server)
      .post(`/api/goals/${id}/contribute`)
      .set(authHeader(token))
      .send({ amount: 100 });
    expect(contrib.status).toBe(200);
    expect(contrib.body.currentAmount).toBeGreaterThanOrEqual(100);

    // Update
    const upd = await request(server).put(`/api/goals/${id}`).set(authHeader(token)).send({ description: 'Summer trip' });
    expect(upd.status).toBe(200);

    // Delete
    const del = await request(server).delete(`/api/goals/${id}`).set(authHeader(token));
    expect(del.status).toBe(200);
  });
});
