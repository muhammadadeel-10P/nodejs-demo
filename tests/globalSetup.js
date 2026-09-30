const fs = require('fs');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

const CONFIG_PATH = path.join(__dirname, '.mongo-config.json');

module.exports = async function globalSetup() {
  const instance = await MongoMemoryServer.create();
  global.__MONGOINSTANCE = instance;
  fs.writeFileSync(CONFIG_PATH, JSON.stringify({ uri: instance.getUri() }));
};
