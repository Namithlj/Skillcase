const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { randomUUID } = require('crypto');
const db = require('../config/db');
const { authMiddleware } = require('../middlewares/authMiddleware');

// multer setup: store uploaded files in backend/uploads
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 1024 * 1024 * 500 } });

// Lists files in the uploads folder and returns objects with id, title, url
router.get('/', (req, res) => {
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
  fs.readdir(uploadsDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Unable to read uploads' });
    const vids = files
      .filter(f => /\.(mp4|webm|mov)$/i.test(f))
      .map(f => ({ id: f, title: f.replace(/\.[^.]+$/, ''), file_path: `/uploads/${encodeURIComponent(f)}` }));
    res.json(vids);
  });
});

// Upload a raw video and create a video entry (authenticated)
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const filename = req.file.filename;
    const file_path = `/uploads/${encodeURIComponent(filename)}`;
    const title = req.body.title || req.file.originalname.replace(/\.[^.]+$/, '');
    const id = randomUUID();
    await db.query('INSERT INTO videos (id, title, description, category, file_path) VALUES ($1,$2,$3,$4,$5)', [id, title, '', null, file_path]);
    res.status(201).json({ id, title, file_path });
  } catch (err) {
    console.error('Upload error', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
