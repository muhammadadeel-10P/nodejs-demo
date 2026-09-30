const express = require('express');
const { createUser, getUsers, updateUser, deleteUser } = require('../controllers/user.controller');
const { createUserRules, updateUserRules, idParamRule } = require('../validators/user.validator');
const validate = require('../middlewares/validate.middleware');
const authenticate = require('../middlewares/auth.middleware');
const requireAdmin = require('../middlewares/admin.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/', createUserRules, validate, createUser);
router.get('/', getUsers);

router.patch('/:id', requireAdmin, updateUserRules, validate, updateUser);
router.delete('/:id', requireAdmin, idParamRule, validate, deleteUser);

module.exports = router;
