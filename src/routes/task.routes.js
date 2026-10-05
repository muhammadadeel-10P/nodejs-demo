const express = require('express');
const { createTask, getTasks, updateTaskStatus } = require('../controllers/task.controller');
const { createTaskRules, updateTaskStatusRules } = require('../validators/task.validator');
const validate = require('../middlewares/validate.middleware');
const authenticate = require('../middlewares/auth.middleware');
const requireAdmin = require('../middlewares/admin.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/', requireAdmin, createTaskRules, validate, createTask);
router.get('/', getTasks);

router.patch('/:id/status', updateTaskStatusRules, validate, updateTaskStatus);

module.exports = router;
