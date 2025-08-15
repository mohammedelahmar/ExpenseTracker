import request from 'supertest';
import { initTestServer, registerAndLogin, authHeader } from './helpers.js';

let server, token;

describe('Subscriptions API', () => {
  beforeAll(async () => {
    server = await initTestServer();
    const auth = await registerAndLogin(server);
    token = auth.token;
  });

  test('CRUD subscription and record payment', async () => {
    const payload = {
      name: 'Netflix',
      amount: 9.99,
      frequency: 'monthly',
      category: 'Entertainment',
      description: 'Streaming service',
      startDate: new Date().toISOString(),
      autoPay: false
    };

    // Create
    const create = await request(server).post('/api/subscriptions').set(authHeader(token)).send(payload);
    expect(create.status).toBe(201);
    const id = create.body._id;

    // List
    const list = await request(server).get('/api/subscriptions').set(authHeader(token));
    expect(list.status).toBe(200);

    // Get by id
    const get = await request(server).get(`/api/subscriptions/${id}`).set(authHeader(token));
    expect(get.status).toBe(200);

    // Update
    const upd = await request(server).put(`/api/subscriptions/${id}`).set(authHeader(token)).send({ amount: 12.99 });
    expect(upd.status).toBe(200);
    expect(upd.body.amount).toBe(12.99);

    // Upcoming
    const up = await request(server).get('/api/subscriptions/upcoming').set(authHeader(token));
    expect(up.status).toBe(200);

    // Record payment
    const pay = await request(server).post(`/api/subscriptions/${id}/payment`).set(authHeader(token)).send({});
    expect(pay.status).toBe(200);
    expect(pay.body).toHaveProperty('expense');

    // Delete
    const del = await request(server).delete(`/api/subscriptions/${id}`).set(authHeader(token));
    expect(del.status).toBe(200);
  });
});
