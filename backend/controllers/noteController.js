const Note = require('../models/Note');

exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id, isDeleted: false });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes' });
  }
};

exports.createNote = async (req, res) => {
  try {
    const { title, content, tags, color } = req.body;
    const note = new Note({
      user: req.user.id,
      title,
      content,
      tags,
      color,
    });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Error creating note' });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { title, content, tags, color, isArchived } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, content, tags, color, isArchived },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Error updating note' });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note moved to trash' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note' });
  }
};

exports.getArchivedNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id, isArchived: true, isDeleted: false });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching archived notes' });
  }
};

exports.getTrashNotes = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const notes = await Note.find({
      user: req.user.id,
      isDeleted: true,
      deletedAt: { $gte: thirtyDaysAgo },
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trash notes' });
  }
};

exports.searchNotes = async (req, res) => {
  try {
    const { q } = req.query;
    const notes = await Note.find({
      user: req.user.id,
      isDeleted: false,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ],
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error searching notes' });
  }
};