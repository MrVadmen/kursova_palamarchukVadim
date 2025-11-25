const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @route   POST /api/users
// @desc    Реєстрація
router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Будь ласка, введіть усі поля' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: 'Користувач вже існує' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin, // 👇 ДОДАЛИ: Передаємо статус адміна при реєстрації
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ msg: 'Невірні дані користувача' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Помилка сервера');
  }
});

// @route   POST /api/users/login
// @desc    Вхід (Логін)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin, // 👇 ДОДАЛИ: Передаємо статус адміна при вході
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ msg: 'Невірний email або пароль' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Помилка сервера');
  }
});

module.exports = router;