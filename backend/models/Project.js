const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: String,
  status: { type: String, default: 'In Planung' },
  createdBy: String,
  createdAt: { type: Date, default: Date.now }
});



module.exports = mongoose.model('Project', projectSchema);