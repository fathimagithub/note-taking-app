const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', noteController.getNotes);
router.post('/', noteController.createNote);
router.put('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);
router.get('/archived', noteController.getArchivedNotes);
router.get('/trash', noteController.getTrashNotes);
router.get('/search', noteController.searchNotes);

module.exports = router;