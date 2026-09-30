const jwt = require('jsonwebtoken');
const env = require('../config/env');
const logger = require('../config/logger');
const User = require('../models/user.model');
const { ApiError } = require('../middlewares/error.middleware');

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username, isDeleted: false }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      logger.warn('Failed login attempt', { username });
      throw new ApiError(401, 'Invalid username or password');
    }

    const token = signToken(user);
    logger.info('User logged in', { userId: user._id.toString(), username: user.username });

    res.status(200).json({ token, user: user.toJSON() });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, signToken };
