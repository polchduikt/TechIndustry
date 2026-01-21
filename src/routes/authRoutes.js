const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

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

module.exports = router;