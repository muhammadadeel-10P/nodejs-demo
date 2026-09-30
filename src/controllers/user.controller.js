const logger = require('../config/logger');
const User = require('../models/user.model');
const { ApiError } = require('../middlewares/error.middleware');

async function createUser(req, res, next) {
  try {
    const { username, email, password, role } = req.body;
    const user = new User({ username, email, password, role });
    await user.save();

    logger.info('User created', { userId: user._id.toString(), username: user.username });
    res.status(201).json(user.toJSON());
  } catch (err) {
    next(err);
  }
}

async function getUsers(req, res, next) {
  try {
    const users = await User.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.status(200).json(users.map((u) => u.toJSON()));
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const allowedFields = ['username', 'email', 'password', 'role', 'avatar'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const user = await User.findOne({ _id: id, isDeleted: false });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    Object.assign(user, updates);
    await user.save();

    logger.info('User updated', { userId: user._id.toString(), by: req.user._id.toString() });
    res.status(200).json(user.toJSON());
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id, isDeleted: false });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    logger.info('User soft-deleted', { userId: user._id.toString(), by: req.user._id.toString() });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createUser, getUsers, updateUser, deleteUser };
