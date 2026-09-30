process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const CONFIG_PATH = path.join(__dirname, '.mongo-config.json');

async function connect() {
  const { uri } = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
}

async function closeDatabase() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
}

async function clearDatabase() {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}

module.exports = { connect, closeDatabase, clearDatabase };
