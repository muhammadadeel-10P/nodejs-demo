const request = require('supertest');
const app = require('../src/app');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const { createUser, tokenFor, VALID_PASSWORD } = require('./helpers');

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe('POST /users', () => {
  it('rejects requests without a token', async () => {
    const res = await request(app).post('/users').send({
      username: 'newuser',
      email: 'newuser@example.com',
      password: VALID_PASSWORD,
    });
    expect(res.status).toBe(401);
  });

  it('rejects a weak password', async () => {
    const admin = await createUser({ username: 'admin1', role: 'admin' });
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .send({ username: 'weakpass', email: 'weak@example.com', password: 'weak' });
    expect(res.status).toBe(400);
  });

  it('creates a user with valid data and a token', async () => {
    const admin = await createUser({ username: 'admin2', role: 'admin' });
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .send({ username: 'newuser2', email: 'newuser2@example.com', password: VALID_PASSWORD });
    expect(res.status).toBe(201);
    expect(res.body.username).toBe('newuser2');
    expect(res.body.password).toBeUndefined();
  });

  it('rejects a duplicate email', async () => {
    const admin = await createUser({ username: 'admin3', role: 'admin' });
    await createUser({ username: 'dup1', email: 'dup@example.com' });
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .send({ username: 'dup2', email: 'dup@example.com', password: VALID_PASSWORD });
    expect(res.status).toBe(409);
  });
});

describe('GET /users', () => {
  it('rejects requests without a token', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(401);
  });

  it('lists users excluding soft-deleted ones', async () => {
    const admin = await createUser({ username: 'admin4', role: 'admin' });
    const other = await createUser({ username: 'visible-user' });
    const deleted = await createUser({ username: 'hidden-user' });
    deleted.isDeleted = true;
    await deleted.save();

    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${tokenFor(admin)}`);

    expect(res.status).toBe(200);
    const usernames = res.body.map((u) => u.username);
    expect(usernames).toContain(admin.username);
    expect(usernames).toContain(other.username);
    expect(usernames).not.toContain(deleted.username);
  });
});

describe('PATCH /users/:id', () => {
  it('rejects non-admin users', async () => {
    const user = await createUser({ username: 'regular1' });
    const res = await request(app)
      .patch(`/users/${user._id}`)
      .set('Authorization', `Bearer ${tokenFor(user)}`)
      .send({ username: 'renamed' });
    expect(res.status).toBe(403);
  });

  it('allows an admin to update a user', async () => {
    const admin = await createUser({ username: 'admin5', role: 'admin' });
    const user = await createUser({ username: 'target1' });

    const res = await request(app)
      .patch(`/users/${user._id}`)
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .send({ username: 'renamed-target' });

    expect(res.status).toBe(200);
    expect(res.body.username).toBe('renamed-target');
  });

  it('returns 404 for a non-existent user', async () => {
    const admin = await createUser({ username: 'admin6', role: 'admin' });
    const res = await request(app)
      .patch('/users/64b64c8f9c1a4a1a1a1a1a1a')
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .send({ username: 'ghost' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /users/:id', () => {
  it('rejects non-admin users', async () => {
    const user = await createUser({ username: 'regular2' });
    const res = await request(app)
      .delete(`/users/${user._id}`)
      .set('Authorization', `Bearer ${tokenFor(user)}`);
    expect(res.status).toBe(403);
  });

  it('allows an admin to soft-delete a user', async () => {
    const admin = await createUser({ username: 'admin7', role: 'admin' });
    const user = await createUser({ username: 'target2' });

    const res = await request(app)
      .delete(`/users/${user._id}`)
      .set('Authorization', `Bearer ${tokenFor(admin)}`);
    expect(res.status).toBe(200);

    const listRes = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${tokenFor(admin)}`);
    const usernames = listRes.body.map((u) => u.username);
    expect(usernames).not.toContain('target2');
  });
});
