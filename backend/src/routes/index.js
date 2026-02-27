const express = require('express');
const router = express.Router();

// Routes will be mounted here (keep business logic out of routes)
router.get('/health', (req, res) => res.json({ ok: true }));

module.exports = router;
