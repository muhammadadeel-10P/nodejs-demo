const env = require('../src/config/env');
const logger = require('../src/config/logger');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/user.model');

async function seedAdmin() {
  await connectDB();

  const existing = await User.findOne({ username: env.admin.username });
  if (existing) {
    logger.info('Admin user already exists, skipping seed', { username: env.admin.username });
  } else {
    const admin = new User({
      username: env.admin.username,
      email: env.admin.email,
      password: env.admin.password,
      role: 'admin',
    });
    await admin.save();
    logger.info('Admin user created', { username: admin.username, email: admin.email });
  }

  await disconnectDB();
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error('Failed to seed admin user', { error: err.message });
    process.exit(1);
  });
