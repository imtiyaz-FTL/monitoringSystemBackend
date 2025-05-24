// backend/routes/appUsage.js
const express = require("express");
const auth = require("../middleware/auth");
const AppUsage = require("../models/AppUsage");
const Session = require("../models/Session");

const router = express.Router();

// POST /app-usage (expects JSON with application, startTime, endTime, sessionId)
router.post("/record", auth, async (req, res) => {
  console.log(req.body);
  const { application, startTime, endTime, sessionId } = req.body;
  try {
    // Verify session
    const session = await Session.findById(sessionId);
    if (!session || session.user.toString() !== req.user._id.toString()) {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    // Save usage log
    const usage = new AppUsage({
      user: req.user._id,
      session: sessionId,
      application,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });
    await usage.save();

    res.json({ message: "App usage logged successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error logging app usage" });
  }
});

module.exports = router;
