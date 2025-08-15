import request from 'supertest';
import { initTestServer, registerAndLogin, authHeader } from './helpers.js';

let server, token;

describe('Expenses API', () => {
  beforeAll(async () => {
    server = await initTestServer();
    const auth = await registerAndLogin(server);
    token = auth.token;
  });

  test('CRUD expense', async () => {
    // Create
    const create = await request(server)
      .post('/api/expenses')
      .set(authHeader(token))
      .send({ date: new Date().toISOString(), amount: 12.5, category: 'Food', description: 'Lunch' });
    expect(create.status).toBe(201);
    const id = create.body._id;

    // List
    const list = await request(server).get('/api/expenses').set(authHeader(token));
    expect(list.status).toBe(200);
    expect(list.body).toHaveProperty('expenses');

    // Get by id
    const get = await request(server).get(`/api/expenses/${id}`).set(authHeader(token));
    expect(get.status).toBe(200);

    // Update
    const upd = await request(server)
      .put(`/api/expenses/${id}`)
      .set(authHeader(token))
      .send({ amount: 15.0 });
    expect(upd.status).toBe(200);
    expect(upd.body.amount).toBe(15);

    // Delete
    const del = await request(server).delete(`/api/expenses/${id}`).set(authHeader(token));
    expect(del.status).toBe(200);
  });
});
