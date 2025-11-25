// server/models/TestResultModel.js
const mongoose = require('mongoose');

const testResultSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Прив'язка до конкретного бійця
    },
    testName: {
      type: String,
      required: true,
      default: 'Тест на сумісність',
    },
    answers: [
      {
        questionId: Number,
        answer: Number, // Наприклад, бал від 1 до 5
      },
    ],
    totalScore: {
      type: Number,
      required: true,
    },
    conclusion: {
      type: String, // Висновок: "Сумісний", "Конфліктний" тощо
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TestResult = mongoose.model('TestResult', testResultSchema);
module.exports = TestResult;