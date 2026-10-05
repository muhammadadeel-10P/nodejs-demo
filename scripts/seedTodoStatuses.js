const logger = require('../src/config/logger');
const { connectDB, disconnectDB } = require('../src/config/db');
const Todo = require('../src/models/todo.model');

async function seedTodoStatuses() {
  await connectDB();

  for (const name of Todo.TODO_STATUSES) {
    const existing = await Todo.findOne({ name });
    if (existing) {
      logger.info('Todo status already exists, skipping', { name });
    } else {
      await Todo.create({ name });
      logger.info('Todo status created', { name });
    }
  }

  await disconnectDB();
}

seedTodoStatuses()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error('Failed to seed todo statuses', { error: err.message });
    process.exit(1);
  });
