const express = require('express');
const { login } = require('../controllers/auth.controller');
const { loginRules } = require('../validators/auth.validator');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

router.post('/login', loginRules, validate, login);

module.exports = router;
