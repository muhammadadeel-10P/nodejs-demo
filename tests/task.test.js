const request = require('supertest');
const app = require('../src/app');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const { createUser, createTodoStatus, tokenFor } = require('./helpers');

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe('GET /todos', () => {
  it('rejects requests without a token', async () => {
    const res = await request(app).get('/todos');
    expect(res.status).toBe(401);
  });

  it('lists the seeded todo statuses', async () => {
    const admin = await createUser({ username: 'todo-admin1', role: 'admin' });
    await createTodoStatus('Backlog');
    await createTodoStatus('InProgress');

    const res = await request(app)
      .get('/todos')
      .set('Authorization', `Bearer ${tokenFor(admin)}`);

    expect(res.status).toBe(200);
    expect(res.body.map((t) => t.name)).toEqual(expect.arrayContaining(['Backlog', 'InProgress']));
  });
});

describe('POST /tasks', () => {
  it('rejects requests without a token', async () => {
    const res = await request(app).post('/tasks').send({ title: 'Do something' });
    expect(res.status).toBe(401);
  });

  it('rejects non-admin users', async () => {
    const user = await createUser({ username: 'task-user1' });
    const status = await createTodoStatus('Todo');

    const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${tokenFor(user)}`)
      .send({ title: 'Do something', status: status._id, assigned_to: user._id });

    expect(res.status).toBe(403);
  });

  it('rejects an unknown status id', async () => {
    const admin = await createUser({ username: 'task-admin1', role: 'admin' });
    const assignee = await createUser({ username: 'task-assignee1' });

    const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .send({
        title: 'Do something',
        status: '64b64c8f9c1a4a1a1a1a1a1a',
        assigned_to: assignee._id,
      });

    expect(res.status).toBe(400);
  });

  it('rejects an unknown assignee', async () => {
    const admin = await createUser({ username: 'task-admin2', role: 'admin' });
    const status = await createTodoStatus('Backlog');

    const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .send({
        title: 'Do something',
        status: status._id,
        assigned_to: '64b64c8f9c1a4a1a1a1a1a1a',
      });

    expect(res.status).toBe(400);
  });

  it('lets an admin create and assign a task', async () => {
    const admin = await createUser({ username: 'task-admin3', role: 'admin' });
    const assignee = await createUser({ username: 'task-assignee2' });
    const status = await createTodoStatus('Backlog');

    const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .send({
        title: 'Write the report',
        description: 'Summarize Q3 numbers',
        status: status._id,
        assigned_to: assignee._id,
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Write the report');
    expect(res.body.assigned_to).toBe(assignee._id.toString());
  });
});

describe('GET /tasks', () => {
  it('only returns a regular user their own tasks', async () => {
    const admin = await createUser({ username: 'task-admin4', role: 'admin' });
    const userA = await createUser({ username: 'task-user-a' });
    const userB = await createUser({ username: 'task-user-b' });
    const status = await createTodoStatus('Backlog');

    await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .send({ title: 'For A', status: status._id, assigned_to: userA._id });
    await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .send({ title: 'For B', status: status._id, assigned_to: userB._id });

    const res = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${tokenFor(userA)}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('For A');
  });

  it("returns every task for an admin's board", async () => {
    const admin = await createUser({ username: 'task-admin5', role: 'admin' });
    const userA = await createUser({ username: 'task-user-c' });
    const status = await createTodoStatus('Backlog');

    await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .send({ title: 'For C', status: status._id, assigned_to: userA._id });

    const res = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${tokenFor(admin)}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('PATCH /tasks/:id/status', () => {
  it('lets the assignee move their own task', async () => {
    const admin = await createUser({ username: 'task-admin6', role: 'admin' });
    const assignee = await createUser({ username: 'task-assignee3' });
    const backlog = await createTodoStatus('Backlog');
    const inProgress = await createTodoStatus('InProgress');

    const created = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .send({ title: 'Move me', status: backlog._id, assigned_to: assignee._id });

    const res = await request(app)
      .patch(`/tasks/${created.body._id}/status`)
      .set('Authorization', `Bearer ${tokenFor(assignee)}`)
      .send({ status: inProgress._id });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(inProgress._id.toString());
  });

  it('rejects a user who is not the assignee and not an admin', async () => {
    const admin = await createUser({ username: 'task-admin7', role: 'admin' });
    const assignee = await createUser({ username: 'task-assignee4' });
    const stranger = await createUser({ username: 'task-stranger1' });
    const backlog = await createTodoStatus('Backlog');
    const inProgress = await createTodoStatus('InProgress');

    const created = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .send({ title: 'Guard me', status: backlog._id, assigned_to: assignee._id });

    const res = await request(app)
      .patch(`/tasks/${created.body._id}/status`)
      .set('Authorization', `Bearer ${tokenFor(stranger)}`)
      .send({ status: inProgress._id });

    expect(res.status).toBe(403);
  });

  it('returns 404 for a non-existent task', async () => {
    const admin = await createUser({ username: 'task-admin8', role: 'admin' });
    const status = await createTodoStatus('Backlog');

    const res = await request(app)
      .patch('/tasks/64b64c8f9c1a4a1a1a1a1a1a/status')
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .send({ status: status._id });

    expect(res.status).toBe(404);
  });
});
