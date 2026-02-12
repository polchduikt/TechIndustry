const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { RATE_LIMITS } = require('../config/constants');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
});

const loginLimiter = rateLimit(RATE_LIMITS.LOGIN);
const registerLimiter = rateLimit(RATE_LIMITS.REGISTER);
const emailVerifyLimiter = rateLimit(RATE_LIMITS.EMAIL_VERIFICATION);
const passwordResetLimiter = rateLimit(RATE_LIMITS.PASSWORD_RESET);


const registerValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Некоректний email'),
    body('username').trim().isLength({ min: 3 }).escape().withMessage('Логін мінімум 3 символи'),
    body('password').isLength({ min: 8 }).withMessage('Пароль мінімум 8 символів'),
    body('first_name').trim().escape().notEmpty().withMessage("Ім'я обов'язкове"),
    body('last_name').trim().escape().notEmpty().withMessage("Прізвище обов'язкове"),
    body('phone').trim().escape()
];

const loginValidation = [
    body('login').trim().escape().notEmpty().withMessage('Введіть логін або email'),
    body('password').notEmpty().withMessage('Введіть пароль')
];

const emailValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Некоректний email')
];

const resetPasswordValidation = [
    body('newPassword').isLength({ min: 8 }).withMessage('Пароль мінімум 8 символів')
];

const updateProfileValidation = [
    body('email').optional().isEmail().withMessage('Невалідна пошта'),
    body('username').optional().trim().isLength({ min: 3 }).withMessage('Мінімум 3 символи')
];

router.post('/request-email-verification', emailVerifyLimiter, emailValidation, authController.requestEmailVerification);
router.post('/verify-email-code', emailVerifyLimiter, authController.verifyEmailCode);

router.post('/register', registerLimiter, upload.single('avatar'), registerValidation, authController.register);
router.post('/login', loginLimiter, loginValidation, authController.login);
router.post('/logout', authController.logout);

router.post('/update-profile', auth, updateProfileValidation, userController.updateProfile);
router.post('/change-password', auth, userController.changePassword);
router.post('/upload-avatar', auth, upload.single('avatar'), userController.uploadAvatar);
router.post('/delete-avatar', auth, userController.deleteAvatar);
router.post('/delete-account', auth, authController.deleteAccount);
router.post('/update-preferences', auth, userController.updatePreferences);

router.post('/request-reset', passwordResetLimiter, authController.requestPasswordReset);
router.post('/verify-reset-code', passwordResetLimiter, authController.verifyResetCode);
router.post('/reset-password', passwordResetLimiter, resetPasswordValidation, authController.resetPassword);
router.post('/check-availability', authController.checkAvailability);

module.exports = router;