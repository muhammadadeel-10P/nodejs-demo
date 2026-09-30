const User = require('../src/models/user.model');
const { signToken } = require('../src/controllers/auth.controller');

const VALID_PASSWORD = 'Str0ng!Pass';

async function createUser({ username, email, role = 'user', password = VALID_PASSWORD } = {}) {
  const user = new User({
    username: username || `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    email: email || `${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`,
    password,
    role,
  });
  await user.save();
  return user;
}

function tokenFor(user) {
  return signToken(user);
}

module.exports = { createUser, tokenFor, VALID_PASSWORD };
