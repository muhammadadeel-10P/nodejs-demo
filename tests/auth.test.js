const request = require('supertest');
const app = require('../src/app');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const { createUser, VALID_PASSWORD } = require('./helpers');

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe('POST /login', () => {
  it('rejects missing credentials', async () => {
    const res = await request(app).post('/login').send({});
    expect(res.status).toBe(400);
  });

  it('rejects invalid credentials', async () => {
    await createUser({ username: 'bob' });
    const res = await request(app)
      .post('/login')
      .send({ username: 'bob', password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('rejects login for a non-existent user', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'ghost', password: VALID_PASSWORD });
    expect(res.status).toBe(401);
  });

  it('returns a JWT for valid credentials', async () => {
    await createUser({ username: 'alice' });
    const res = await request(app)
      .post('/login')
      .send({ username: 'alice', password: VALID_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.username).toBe('alice');
    expect(res.body.user.password).toBeUndefined();
  });

  it('rejects login for a soft-deleted user', async () => {
    const user = await createUser({ username: 'deleted-user' });
    user.isDeleted = true;
    await user.save();

    const res = await request(app)
      .post('/login')
      .send({ username: 'deleted-user', password: VALID_PASSWORD });
    expect(res.status).toBe(401);
  });
});
