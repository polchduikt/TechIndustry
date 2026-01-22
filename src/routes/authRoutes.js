const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }
});

const registerValidation = [
    body('username').trim().isLength({ min: 3 }).withMessage('Username має бути мінімум 3 символи'),
    body('password').isLength({ min: 6 }).withMessage('Пароль має бути мінімум 6 символів'),
    body('email').isEmail().withMessage('Невалідна пошта'),
    body('phone').matches(/^\+?[0-9]{10,15}$/).withMessage('Невалідний телефон'),
    body('first_name').notEmpty().withMessage('Імʼя обовʼязкове'),
    body('last_name').notEmpty().withMessage('Прізвище обовʼязкове'),
    body('birth_date').isDate().withMessage('Невалідна дата народження')
];

router.post('/register', registerValidation, authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/profile', auth, authController.getProfile);
router.patch('/update-profile', auth, authController.updateProfile);
router.patch('/update-profile', auth, authController.updateProfile);
router.patch('/change-password', auth, authController.changePassword);
router.post('/upload-avatar', auth, (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'Файл занадто великий (макс. 5МБ)' });
            }
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(500).json({ message: 'Помилка завантаження' });
        }
        next();
    });
}, authController.uploadAvatar);

module.exports = router;