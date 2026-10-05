# Node Assignment - User Management API

Express + MongoDB backend for the Node assignment: users, JWT auth, avatar upload, a per-user
todo board, logging, tests, API docs.

## Stack

Express 5, Mongoose, JWT + bcrypt, Multer for uploads, Winston/Morgan for logging,
express-validator, Jest/Supertest for tests, Swagger UI for docs, ESLint + Prettier.

## Layout

```
src/
  config/       env, logger, db connection, swagger spec
  models/       User, Todo (status) and Task schemas
  validators/   express-validator rules
  middlewares/  jwt auth, admin check, validation, multer, error handler
  controllers/
  routes/
  app.js
  server.js
scripts/seedAdmin.js         creates the first admin user
scripts/seedTodoStatuses.js  creates the four todo statuses (Backlog/Todo/InProgress/Completed)
tests/
uploads/avatars/      uploaded images (gitignored)
```

## Getting it running

```bash
npm install
cp .env.example .env
```

You need a MongoDB instance to actually run the app (tests don't need one, see below). Easiest
options: install it locally (`brew tap mongodb/brew && brew install mongodb-community`), run it
in Docker, or point `MONGO_URI` at an Atlas cluster.

Since every `/users` route (even create) needs a JWT per the assignment spec, there's no open
signup endpoint - you need an admin to exist first. Run:

```bash
npm run seed
```

which creates one from the `ADMIN_*` values in `.env`. Then hit `POST /login` with those
creds to get a token and go from there.

The todo board needs its status lookup values to exist before you can create a task against
them:

```bash
npm run seed:todos
```

creates the four fixed statuses (`Backlog`, `Todo`, `InProgress`, `Completed`) if they aren't
already there.

```bash
npm run dev    # nodemon
npm start
```

Runs on `PORT` (3000 by default). `/hello` for a health check, `/api-docs` for Swagger UI.

## Tests

```bash
npm test
npm run test:coverage
```

Uses `mongodb-memory-server` so there's no need for a real Mongo instance to run the suite -
one instance is spun up for the whole run via Jest's globalSetup/globalTeardown instead of one
per test file (much faster). Coverage sits around 87% lines/statements, threshold is set at 60%.

One thing that ate a lot of time debugging: mongoose 9 (pulling in mongodb driver 7.x) has a race
in its client-metadata handshake code that shows up specifically under Jest - connections would
fail with `Missing required sub-document 'driver'`, but only there, never in a plain node script.
Traced it to an async metadata-building step in the driver that doesn't always finish before the
first handshake goes out. Pinned mongoose to `8.24.4` (mongodb driver 6.x) instead, which doesn't
have this issue and is still a very current, widely used version.

## Routes

- `GET /hello` - no auth
- `POST /login` - username + password -> JWT
- `POST /users`, `GET /users` - JWT required
- `PATCH /users/:id`, `DELETE /users/:id` (soft delete) - JWT + admin role
- `POST /upload` - JWT required, multipart `avatar` field
- `GET /todos` - JWT required, lists the fixed status values tasks can be in
- `POST /tasks` - JWT + admin role, creates a task and assigns it to a user
- `GET /tasks` - JWT required; an admin gets every task, a regular user gets only their own
- `PATCH /tasks/:id/status` - JWT required; the assignee or an admin can move a task between
  statuses

Full schemas are in `/api-docs` once the server's up.

Password rule: min 8 chars, needs upper + lower + number + symbol.

Deletes are soft (`isDeleted` flag) - `GET /users` and login both skip deleted accounts.

## A few decisions worth flagging

- Update and delete on `/users/:id` are both admin-only. The spec bullet groups them together
  ("updating and soft deleting... only admin can perform this action"), so I read it as both
  actions being gated, not just delete.
- Avatars go to local disk under `uploads/avatars/`, per the assignment allowing that as an
  alternative to S3/MinIO. Swapping storage engines later just means changing
  `upload.middleware.js`, the controller doesn't care where the file ends up.
- Helmet's CSP is turned off globally so the Swagger UI page can load its inline scripts/styles.
  Not a big deal for a JSON API with no other HTML pages.
- The assignment describes `todo` as "a collection with values", so it's modelled as a lookup
  collection (one document per status) rather than a hardcoded enum on `Task.status` - `status`
  and `assigned_to` are both stored as ObjectId refs, same pattern mongoose uses for any
  relation. `GET /tasks` populates both so the board is usable without a second round trip.
- "Todo board for each user" is read as: an admin can see and assign across every user's board,
  a regular user only ever sees their own tasks. Status updates follow the same split - the
  assignee can drag their own task between columns, and an admin can override any task.

## Docs / Postman

Swagger UI at `/api-docs`, raw spec at `/api-docs.json` - you can import that URL straight into
Postman as a collection too.
