const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  shortId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null if guest
  },
  questions: [questionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quiz', quizSchema);
