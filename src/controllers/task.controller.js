const logger = require('../config/logger');
const Task = require('../models/task.model');
const Todo = require('../models/todo.model');
const User = require('../models/user.model');
const { ApiError } = require('../middlewares/error.middleware');

async function createTask(req, res, next) {
  try {
    const { title, description, status, assigned_to: assignedTo } = req.body;

    const todoStatus = await Todo.findById(status);
    if (!todoStatus) {
      throw new ApiError(400, 'status does not match a known todo status');
    }

    const assignee = await User.findOne({ _id: assignedTo, isDeleted: false });
    if (!assignee) {
      throw new ApiError(400, 'assigned_to does not match an existing user');
    }

    const task = await Task.create({ title, description, status, assigned_to: assignedTo });

    logger.info('Task created', {
      taskId: task._id.toString(),
      assignedTo,
      by: req.user._id.toString(),
    });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

async function getTasks(req, res, next) {
  try {
    const filter = req.user.role === 'admin' ? {} : { assigned_to: req.user._id };
    const tasks = await Task.find(filter)
      .populate('status', 'name')
      .populate('assigned_to', 'username email')
      .sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
}

async function updateTaskStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    const isOwner = task.assigned_to.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      throw new ApiError(403, 'You are not allowed to update this task');
    }

    const todoStatus = await Todo.findById(status);
    if (!todoStatus) {
      throw new ApiError(400, 'status does not match a known todo status');
    }

    task.status = status;
    await task.save();

    logger.info('Task status updated', {
      taskId: task._id.toString(),
      status,
      by: req.user._id.toString(),
    });
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
}

module.exports = { createTask, getTasks, updateTaskStatus };
