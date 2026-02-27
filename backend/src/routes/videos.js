const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middlewares/authMiddleware');
const videoController = require('../controllers/videoController');

router.post('/', authMiddleware, [body('title').notEmpty()], (req, res, next) => {
  // allow either file_path (local upload) or external_url (drive link)
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  videoController.create(req, res, next);
});

router.get('/', videoController.list);
router.get('/seed/all', videoController.seed);
router.get('/seed/test', videoController.seedTest);
// Bookmarks for authenticated user
router.get('/bookmarks', authMiddleware, videoController.getBookmarks);
router.get('/:id', videoController.getById);

router.post('/:id/like', authMiddleware, videoController.like);
router.post('/:id/comment', authMiddleware, [body('content').notEmpty()], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  videoController.comment(req, res, next);
});
router.post('/:id/bookmark', authMiddleware, videoController.bookmark);
router.get('/:id/comments', videoController.getComments);

module.exports = router;
