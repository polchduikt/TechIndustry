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

const registerValidation = [
    body('username').trim().isLength({ min: 3 }).withMessage('Імʼя користувача має бути мінімум 3 символи'),
    body('password').isLength({ min: 8 }).withMessage('Пароль має бути мінімум 8 символів'),
    body('email').isEmail().withMessage('Невалідна пошта'),
    body('phone').matches(/^\+380\d{9}$/).withMessage('Невалідний телефон. Формат: +380XXXXXXXXX'),
    body('first_name').notEmpty().withMessage('Імʼя обовʼязкове'),
    body('last_name').notEmpty().withMessage('Прізвище обовʼязкове'),
    body('birth_date').optional({ nullable: true, checkFalsy: true }).custom((value) => {
        if (value && value.trim() !== '') {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                throw new Error('Невалідна дата народження');
            }
        }
        return true;
    })
];

const updateProfileValidation = [
    body('email').optional().isEmail().withMessage('Невалідна пошта'),
    body('phone').optional().matches(/^\+380\d{9}$/).withMessage('Невалідний телефон'),
    body('username').optional().trim().isLength({ min: 3 }).withMessage('Ім\'я користувача має бути мінімум 3 символи')
];

router.post('/register', upload.single('avatar'), registerValidation, authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/profile', auth, userController.getProfile);
router.patch('/update-profile', auth, updateProfileValidation, userController.updateProfile);
router.patch('/change-password', auth, userController.changePassword);
router.post('/upload-avatar', auth, upload.single('avatar'), userController.uploadAvatar);
router.delete('/delete-avatar', auth, userController.deleteAvatar);

module.exports = router;