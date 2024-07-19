const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [{ type: String }],
  color: { type: String, default: 'white' },
  isArchived: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);