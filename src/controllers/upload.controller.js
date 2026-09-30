const logger = require('../config/logger');
const User = require('../models/user.model');
const { ApiError } = require('../middlewares/error.middleware');

async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded');
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findOne({ _id: req.user._id, isDeleted: false });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    user.avatar = avatarPath;
    await user.save();

    logger.info('Avatar uploaded', { userId: user._id.toString(), avatar: avatarPath });
    res.status(200).json({ message: 'Avatar uploaded successfully', avatar: avatarPath });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadAvatar };
