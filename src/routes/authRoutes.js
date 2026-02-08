const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const multer = require('multer');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
});

const updateProfileValidation = [
    body('email').optional().isEmail().withMessage('Невалідна пошта'),
    body('username').optional().trim().isLength({ min: 3 }).withMessage('Мінімум 3 символи')
];

router.post('/request-email-verification', authController.requestEmailVerification);
router.post('/verify-email-code', authController.verifyEmailCode);
router.post('/register', upload.single('avatar'), authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/update-profile', auth, updateProfileValidation, userController.updateProfile);
router.post('/change-password', auth, userController.changePassword);
router.post('/upload-avatar', auth, upload.single('avatar'), userController.uploadAvatar);
router.post('/delete-avatar', auth, userController.deleteAvatar);
router.post('/delete-account', auth, authController.deleteAccount);
router.post('/request-reset', authController.requestPasswordReset);
router.post('/verify-reset-code', authController.verifyResetCode);
router.post('/reset-password', authController.resetPassword);

module.exports = router;