const Todo = require('../models/todo.model');

async function getTodoStatuses(req, res, next) {
  try {
    const statuses = await Todo.find().sort({ createdAt: 1 });
    res.status(200).json(statuses);
  } catch (err) {
    next(err);
  }
}

module.exports = { getTodoStatuses };
