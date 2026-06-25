const express = require('express');
const router = express.Router();

// GET /api/tasks — list all tasks
router.get('/', (req, res) => {
  res.json({ tasks: [] });
});

// POST /api/tasks — create a task
router.post('/', (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const task = { id: Date.now(), title, description, done: false };
  res.status(201).json(task);
});

module.exports = router;
