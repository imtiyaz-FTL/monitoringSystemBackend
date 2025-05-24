// backend/models/Session.js
const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  loginTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', SessionSchema);
