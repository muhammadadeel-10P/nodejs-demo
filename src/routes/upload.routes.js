const express = require('express');
const { uploadAvatar } = require('../controllers/upload.controller');
const authenticate = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

router.post('/', authenticate, upload.single('avatar'), uploadAvatar);

module.exports = router;
