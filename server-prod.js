// Production backend server for LCL-Level Challenge List
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3002;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(cors());
app.use(bodyParser.json());

// Serve static frontend files in production
if (NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
}

// In-memory storage
let levels = [];
let pendingLevels = [];

// API Routes

// Submit a level (any user)
app.post('/api/send-level', (req, res) => {
  const level = req.body;
  pendingLevels.push(level);
  res.json({ success: true });
});

// Get pending levels (admin)
app.get('/api/pending-levels', (req, res) => {
  res.json(pendingLevels);
});

// Approve a level (admin)
app.post('/api/approve-level', (req, res) => {
  const { idx } = req.body;
  const level = pendingLevels[idx];
  if (level) {
    levels.push(level);
    pendingLevels.splice(idx, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Level not found' });
  }
});

// Delete a pending level (admin)
app.post('/api/delete-pending', (req, res) => {
  const { idx } = req.body;
  if (pendingLevels[idx]) {
    pendingLevels.splice(idx, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Level not found' });
  }
});

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
  res.json(levels);
});

// Replace leaderboard level (admin)
app.post('/api/replace-leaderboard', (req, res) => {
  const { idx, level } = req.body;
  if (levels[idx]) {
    levels[idx] = level;
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Level not found' });
  }
});

// Delete leaderboard level (admin)
app.post('/api/delete-leaderboard', (req, res) => {
  const { idx } = req.body;
  if (levels[idx]) {
    levels.splice(idx, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Level not found' });
  }
});

// Reorder leaderboard (admin)
app.post('/api/reorder-leaderboard', (req, res) => {
  const { from, to } = req.body;
  if (levels[from] && levels[to] !== undefined) {
    const [moved] = levels.splice(from, 1);
    levels.splice(to, 0, moved);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid indices' });
  }
});

// Serve frontend in production
if (NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`LCL-Level backend running on port ${PORT} (${NODE_ENV})`);
});
