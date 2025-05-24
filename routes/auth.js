// backend/routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const Session = require("../models/Session");
const User = require("../models/User");

const router = express.Router();

// POST /auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    console.log(username, password);
    // Check user existence
    const user = await User.findOne({ username });
    console.log(user);
    if (!user) {
      console.log("kkkk");
      res.status(401).json({ error: "Invalid username or password" });
    }
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid  password" });

    // Create session
    const session = new Session({ user: user._id });
    await session.save();

    // Sign JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, sessionId: session._id });
  } catch (err) {
    res.status(500).json({ error: "Server error during login" });
  }
});

// POST /auth/register
// Proper registration
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const user = new User({ username, password }); // Don't hash manually
    await user.save(); // This triggers pre-save hook

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post("/logout", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the active session (assuming one active session per user)
    const session = await Session.findOne({ user: userId }).sort({ loginTime: -1 });

    if (!session) {
      return res.status(400).json({ message: "No active session found" });
    }

    // Update logout time
    session.logoutTime = new Date();
    await session.save();

    res.json({ message: "Logged out successfully", sessionId: session._id });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error during logout" });
  }
});

module.exports = router;
