const request = require('supertest');
const app = require('../src/app');
const { connect, closeDatabase, clearDatabase } = require('./setup');

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe('authenticate middleware', () => {
  it('rejects a malformed Authorization header', async () => {
    const res = await request(app).get('/users').set('Authorization', 'Token abc123');
    expect(res.status).toBe(401);
  });

  it('rejects an invalid/garbage token', async () => {
    const res = await request(app).get('/users').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });
});
