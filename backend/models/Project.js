const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: String,
  status: { type: String, default: "In Planung" },
  createdBy: String,
  createdAt: { type: Date, default: Date.now },
  comments: [
    {
      text: String,
      author: String,
      createdAt: Date,
      reactions: {
        type: Map,
        of: [String], // Liste von Benutzern je Emoji
      },
    },
  ],
});

module.exports = mongoose.model("Project", projectSchema);
