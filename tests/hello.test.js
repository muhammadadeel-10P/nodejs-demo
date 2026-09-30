const request = require('supertest');
const app = require('../src/app');
const { connect, closeDatabase } = require('./setup');

beforeAll(async () => {
  await connect();
});

afterAll(async () => {
  await closeDatabase();
});

describe('GET /hello', () => {
  it('returns a greeting message', async () => {
    const res = await request(app).get('/hello');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(typeof res.body.message).toBe('string');
  });
});

describe('unknown routes', () => {
  it('returns 404 for an undefined route', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
  });
});
