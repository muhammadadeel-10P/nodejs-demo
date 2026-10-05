const { body, param } = require('express-validator');

const createTaskRules = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('title must be between 3 and 100 characters'),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('status').isMongoId().withMessage('status must be a valid todo status id'),
  body('assigned_to').isMongoId().withMessage('assigned_to must be a valid user id'),
];

const updateTaskStatusRules = [
  param('id').isMongoId().withMessage('invalid task id'),
  body('status').isMongoId().withMessage('status must be a valid todo status id'),
];

const idParamRule = [param('id').isMongoId().withMessage('invalid task id')];

module.exports = { createTaskRules, updateTaskStatusRules, idParamRule };
