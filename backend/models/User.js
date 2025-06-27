const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, default: 'content' } // z. B. 'admin', 'programmierer', etc.
});

module.exports = mongoose.model('User', userSchema);