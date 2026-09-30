const path = require('path');
const request = require('supertest');
const app = require('../src/app');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const { createUser, tokenFor } = require('./helpers');

const PNG_FIXTURE = path.join(__dirname, 'fixtures', 'test-avatar.png');
const TXT_FIXTURE = path.join(__dirname, 'fixtures', 'test-file.txt');

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe('POST /upload', () => {
  it('rejects requests without a token', async () => {
    const res = await request(app).post('/upload').attach('avatar', PNG_FIXTURE);
    expect(res.status).toBe(401);
  });

  it('rejects requests without a file', async () => {
    const user = await createUser();
    const res = await request(app)
      .post('/upload')
      .set('Authorization', `Bearer ${tokenFor(user)}`);
    expect(res.status).toBe(400);
  });

  it('rejects a non-image file', async () => {
    const user = await createUser();
    const res = await request(app)
      .post('/upload')
      .set('Authorization', `Bearer ${tokenFor(user)}`)
      .attach('avatar', TXT_FIXTURE);
    expect(res.status).toBe(400);
  });

  it('uploads an image and links it to the user', async () => {
    const user = await createUser();
    const res = await request(app)
      .post('/upload')
      .set('Authorization', `Bearer ${tokenFor(user)}`)
      .attach('avatar', PNG_FIXTURE);

    expect(res.status).toBe(200);
    expect(res.body.avatar).toMatch(/^\/uploads\/avatars\//);
  });
});
