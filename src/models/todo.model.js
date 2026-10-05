const mongoose = require('mongoose');

const { Schema } = mongoose;

const TODO_STATUSES = ['Backlog', 'Todo', 'InProgress', 'Completed'];

const todoSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: TODO_STATUSES,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Todo', todoSchema);
module.exports.TODO_STATUSES = TODO_STATUSES;
