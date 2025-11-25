const express = require('express');
const router = express.Router();
// Імпортуємо обидві функції захисту
const { protect, admin } = require('../middleware/authMiddleware');
const TestResult = require('../models/TestResultModel');

// @route   POST /api/tests
// @desc    Зберегти результат тесту (Доступно всім бійцям)
router.post('/', protect, async (req, res) => {
  const { testName, answers, totalScore, conclusion } = req.body;

  try {
    const result = await TestResult.create({
      user: req.user.id,
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
// @desc    Отримати ТІЛЬКИ СВОЇ результати (Доступно всім)
router.get('/myresults', protect, async (req, res) => {
  try {
    const results = await TestResult.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ msg: 'Помилка отримання результатів' });
  }
});

// @route   GET /api/tests/all-results
// @desc    ОТРИМАТИ ВСІ РЕЗУЛЬТАТИ (Тільки для Адміна)
router.get('/all-results', protect, admin, async (req, res) => {
  try {
    const results = await TestResult.find({})
      .populate('user', 'name email') // Підтягуємо ім'я бійця
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ msg: 'Помилка отримання всіх результатів' });
  }
});

// @route   DELETE /api/tests/:id
// @desc    ВИДАЛИТИ РЕЗУЛЬТАТ (Тільки для Адміна)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const test = await TestResult.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ msg: 'Тест не знайдено' });
    }

    await test.deleteOne();
    res.json({ msg: 'Результат видалено' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Помилка видалення' });
  }
});

module.exports = router;