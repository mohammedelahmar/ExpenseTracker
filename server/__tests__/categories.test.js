import request from 'supertest';
import { initTestServer, registerAndLogin, authHeader } from './helpers.js';

let server, token;

describe('Categories API', () => {
  beforeAll(async () => {
    server = await initTestServer();
    const auth = await registerAndLogin(server);
    token = auth.token;
  });

  test('CRUD category', async () => {
    // Create
    const create = await request(server)
      .post('/api/categories')
      .set(authHeader(token))
  // Use a unique, non-default name to avoid clashing with seeded defaults
  .send({ name: 'MyCategory', color: '#ff0000', icon: 'pizza' });
    expect(create.status).toBe(201);
    const id = create.body._id;

    // Get all
    const list = await request(server).get('/api/categories').set(authHeader(token));
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);

    // Get by id
    const get = await request(server).get(`/api/categories/${id}`).set(authHeader(token));
  expect(get.status).toBe(200);
  expect(get.body.name).toBe('MyCategory');

    // Update
    const upd = await request(server)
      .put(`/api/categories/${id}`)
      .set(authHeader(token))
      .send({ name: 'Groceries' });
    expect(upd.status).toBe(200);
    expect(upd.body.name).toBe('Groceries');

    // Delete
    const del = await request(server).delete(`/api/categories/${id}`).set(authHeader(token));
    expect(del.status).toBe(200);
    expect(del.body).toHaveProperty('message');
  });
});
