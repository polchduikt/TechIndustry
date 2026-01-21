const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const db = require('./src/models');
const authRoutes = require('./src/routes/authRoutes');
const auth = require('./src/middleware/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);

app.get('/', auth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

db.sequelize.sync({ alter: true }).then(() => {
    console.log('База даних синхронізована');
    app.listen(PORT, () => {
        console.log(`Сервер запущено на http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Помилка синхронізації БД:', err);
});