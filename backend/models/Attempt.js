const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedOption: { type: String, required: true },
  isCorrect: { type: Boolean, required: true }
});

const attemptSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null if guest
  },
  guestId: {
    type: String,
    default: null // Used for tracking guest attempts in local storage or session
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  responses: [responseSchema],
  timeTakenMs: {
    type: Number,
    default: 0
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Attempt', attemptSchema);
