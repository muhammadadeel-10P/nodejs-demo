const { body, param } = require('express-validator');

// At least one lowercase, one uppercase, one number, one symbol, min length 8
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const createUserRules = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('username must be between 3 and 30 characters'),
  body('email').trim().isEmail().withMessage('a valid email is required').normalizeEmail(),
  body('password')
    .matches(PASSWORD_REGEX)
    .withMessage(
      'password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a symbol',
    ),
  body('role').optional().isIn(['user', 'admin']).withMessage('role must be user or admin'),
];

const updateUserRules = [
  param('id').isMongoId().withMessage('invalid user id'),
  body('username').optional().trim().isLength({ min: 3, max: 30 }),
  body('email').optional().trim().isEmail().normalizeEmail(),
  body('password')
    .optional()
    .matches(PASSWORD_REGEX)
    .withMessage(
      'password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a symbol',
    ),
  body('role').optional().isIn(['user', 'admin']).withMessage('role must be user or admin'),
];

const idParamRule = [param('id').isMongoId().withMessage('invalid user id')];

module.exports = { createUserRules, updateUserRules, idParamRule, PASSWORD_REGEX };
