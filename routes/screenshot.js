// backend/routes/screenshot.js
const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const Screenshot = require('../models/Screenshot');
const Session = require('../models/Session');

const router = express.Router();

const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + ext); // ensures file has correct extension like .png
  }
});

const upload = multer({ storage });


// POST /screenshot (expects form-data with 'image' and 'sessionId')
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  const sessionId = req.body.sessionId;
  try {
    const session = await Session.findById(sessionId);
    if (!session || session.user.toString() !== req.user._id.toString()) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    const screenshot = new Screenshot({
      user: req.user._id,
      session: sessionId,
      imagePath: req.file.path, // now has .png extension
    });
    await screenshot.save();

    res.json({ message: 'Screenshot uploaded successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error uploading screenshot' });
  }
});


module.exports = router;
