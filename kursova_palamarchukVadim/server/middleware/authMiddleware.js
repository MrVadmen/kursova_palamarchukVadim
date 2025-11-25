const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

// 1. Захист для звичайних користувачів (перевірка токена)
const protect = async (req, res, next) => {
  let token;

  // Перевіряємо, чи є заголовок Authorization з токеном Bearer
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Отримуємо токен (прибираємо слово 'Bearer ')
      token = req.headers.authorization.split(' ')[1];

      // Розшифровуємо токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Шукаємо користувача в базі за ID з токена
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Пропускаємо далі
    } catch (error) {
      console.error(error);
      res.status(401).json({ msg: 'Не авторизовано, токен невірний' });
    }
  }

  if (!token) {
    res.status(401).json({ msg: 'Не авторизовано, немає токена' });
  }
};

// 2. 👇 Захист для Адміна (Командира)
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next(); // Якщо адмін - пропускаємо далі
  } else {
    res.status(401).json({ msg: 'Доступ заборонено (Тільки для командирів)' });
  }
};

module.exports = { protect, admin };