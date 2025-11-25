// server/index.js
console.log('[index.js] Файл починає виконуватись...');

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

console.log('[index.js] Завантажуємо dotenv...');
dotenv.config();

console.log('[index.js] Завантажуємо connectDB...');
const connectDB = require('./config/db');

console.log('[index.js] Підключаємось до БД...');
connectDB();

console.log('[index.js] Створюємо додаток Express...');
const app = express();

app.use(cors());
app.use(express.json());

console.log('[index.js] Завантажуємо маршрути...');

// 👇 МАРШРУТИ КОРИСТУВАЧІВ
app.use('/api/users', require('./routes/userRoutes'));

// 👇 ОСЬ ЦЬОГО РЯДКА НЕ ВИСТАЧАЛО! (Маршрути тестів)
app.use('/api/tests', require('./routes/testRoutes')); 

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`[index.js] Сервер успішно стартував на порту: ${PORT}`));