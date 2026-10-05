const env = require('./env');

const userSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string', example: '651f1f77bcf86cd799439011' },
    username: { type: 'string', example: 'jdoe' },
    email: { type: 'string', format: 'email', example: 'jdoe@example.com' },
    role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
    avatar: { type: 'string', nullable: true, example: '/uploads/avatars/abc123.png' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const todoSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string', example: '651f1f77bcf86cd799439099' },
    name: { type: 'string', enum: ['Backlog', 'Todo', 'InProgress', 'Completed'] },
  },
};

const taskSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string', example: '651f1f77bcf86cd799439022' },
    title: { type: 'string', example: 'Write the report' },
    description: { type: 'string', example: 'Summarize Q3 numbers' },
    status: { type: 'string', description: 'Todo status id', example: '651f1f77bcf86cd799439099' },
    assigned_to: { type: 'string', description: 'User id', example: '651f1f77bcf86cd799439011' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

// Hand-rolled OpenAPI doc instead of scanning route files with swagger-jsdoc -
// easier to keep in sync than annotation comments spread across every route.
module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Node Assignment API',
    version: '1.0.0',
    description: 'User management API with JWT auth, avatar upload, and logging.',
  },
  servers: [{ url: `http://localhost:${env.port}` }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: { User: userSchema, Todo: todoSchema, Task: taskSchema },
  },
  paths: {
    '/hello': {
      get: {
        summary: 'Health check',
        tags: ['Health'],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { message: { type: 'string', example: 'Hello, world!' } },
                },
              },
            },
          },
        },
      },
    },
    '/login': {
      post: {
        summary: 'Log in and get a JWT',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', example: 'admin' },
                  password: { type: 'string', format: 'password', example: 'Admin@12345' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { description: 'invalid username or password' },
        },
      },
    },
    '/users': {
      post: {
        summary: 'Create a user',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'email', 'password'],
                properties: {
                  username: { type: 'string', example: 'jdoe' },
                  email: { type: 'string', format: 'email', example: 'jdoe@example.com' },
                  password: { type: 'string', format: 'password', example: 'Str0ng!Pass' },
                  role: { type: 'string', enum: ['user', 'admin'] },
                },
              },
            },
          },
        },
        responses: {
          201: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          400: { description: 'validation failed' },
          409: { description: 'username/email already taken' },
        },
      },
      get: {
        summary: 'List active users (soft-deleted ones are excluded)',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/User' } },
              },
            },
          },
        },
      },
    },
    '/users/{id}': {
      patch: {
        summary: 'Update a user (admin only)',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                  role: { type: 'string', enum: ['user', 'admin'] },
                },
              },
            },
          },
        },
        responses: {
          200: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          403: { description: 'not an admin' },
          404: { description: 'user not found' },
        },
      },
      delete: {
        summary: 'Soft-delete a user (admin only)',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'deleted' },
          403: { description: 'not an admin' },
          404: { description: 'user not found' },
        },
      },
    },
    '/upload': {
      post: {
        summary: 'Upload an avatar for the logged-in user (png/jpeg/webp, max 5MB)',
        tags: ['Upload'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['avatar'],
                properties: { avatar: { type: 'string', format: 'binary' } },
              },
            },
          },
        },
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    avatar: { type: 'string', example: '/uploads/avatars/abc123.png' },
                  },
                },
              },
            },
          },
          400: { description: 'no file, or wrong type/too large' },
        },
      },
    },
    '/todos': {
      get: {
        summary: 'List the available todo statuses',
        tags: ['Todo'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Todo' } },
              },
            },
          },
        },
      },
    },
    '/tasks': {
      post: {
        summary: 'Create a task and assign it to a user (admin only)',
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'status', 'assigned_to'],
                properties: {
                  title: { type: 'string', example: 'Write the report' },
                  description: { type: 'string', example: 'Summarize Q3 numbers' },
                  status: { type: 'string', example: '651f1f77bcf86cd799439099' },
                  assigned_to: { type: 'string', example: '651f1f77bcf86cd799439011' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } },
          },
          400: { description: 'validation failed, unknown status, or unknown assignee' },
          403: { description: 'not an admin' },
        },
      },
      get: {
        summary: "List tasks (admin sees everyone's board, a user sees only their own)",
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
              },
            },
          },
        },
      },
    },
    '/tasks/{id}/status': {
      patch: {
        summary: 'Update a task status (the assignee or an admin)',
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: { status: { type: 'string', example: '651f1f77bcf86cd799439099' } },
              },
            },
          },
        },
        responses: {
          200: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } },
          },
          403: { description: 'not the assignee or an admin' },
          404: { description: 'task not found' },
        },
      },
    },
  },
};
