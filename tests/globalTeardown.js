const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '.mongo-config.json');

module.exports = async function globalTeardown() {
  const instance = global.__MONGOINSTANCE;
  if (instance) {
    await instance.stop();
  }
  if (fs.existsSync(CONFIG_PATH)) {
    fs.unlinkSync(CONFIG_PATH);
  }
};
