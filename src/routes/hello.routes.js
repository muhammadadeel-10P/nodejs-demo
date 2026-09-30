const express = require('express');
const { getHello } = require('../controllers/hello.controller');

const router = express.Router();

router.get('/hello', getHello);

module.exports = router;
