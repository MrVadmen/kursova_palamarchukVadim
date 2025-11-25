const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Імпортуємо наш захист
const TestResult = require('../models/TestResultModel');

// @route   POST /api/tests
// @desc    Зберегти результат тесту
// @access  Private (Тільки для зареєстрованих)
router.post('/', protect, async (req, res) => {
  const { testName, answers, totalScore, conclusion } = req.body;

  try {
    const result = await TestResult.create({
      user: req.user.id, // Беремо ID користувача з токена
      testName,
      answers,
      totalScore,
      conclusion,
    });
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Помилка збереження результату' });
  }
});

// @route   GET /api/tests/myresults
// @desc    Отримати історію тестів поточного користувача
// @access  Private
router.get('/myresults', protect, async (req, res) => {
  try {
    // Знаходимо всі тести цього користувача і сортуємо (нові зверху)
    const results = await TestResult.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ msg: 'Помилка отримання результатів' });
  }
});

module.exports = router;