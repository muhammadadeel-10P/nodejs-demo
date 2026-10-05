const express = require('express');
const { getTodoStatuses } = require('../controllers/todo.controller');
const authenticate = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getTodoStatuses);

module.exports = router;
