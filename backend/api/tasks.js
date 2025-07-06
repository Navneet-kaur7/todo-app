const express = require('express');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/tasks - Get all tasks for authenticated user
router.get('/', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('_id title description completed createdAt updatedAt');
    
    // Format response to match frontend expectations
    const formattedTasks = tasks.map(task => ({
      id: task._id,
      text: task.title, // Map title to text for frontend compatibility
      completed: task.completed,
      created_at: task.createdAt,
      updated_at: task.updatedAt
    }));
    
    res.json(formattedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
});

// POST /api/tasks - Create a new task
router.post('/', protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task text is required'
      });
    }

    const task = await Task.create({
      title: text.trim(),
      userId: req.user._id
    });

    // Format response to match frontend expectations
    const formattedTask = {
      id: task._id,
      text: task.title,
      completed: task.completed,
      created_at: task.createdAt,
      updated_at: task.updatedAt
    };

    res.status(201).json(formattedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
});

// PUT /api/tasks/:id - Update a task
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, completed } = req.body;

    // Build update object
    const updateData = {};
    if (text !== undefined) {
      updateData.title = text.trim();
    }
    if (completed !== undefined) {
      updateData.completed = completed;
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized'
      });
    }

    // Format response to match frontend expectations
    const formattedTask = {
      id: task._id,
      text: task.title,
      completed: task.completed,
      created_at: task.createdAt,
      updated_at: task.updatedAt
    };

    res.json(formattedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message
    });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
});

// DELETE /api/tasks/completed - Delete all completed tasks
router.delete('/completed', protect, async (req, res) => {
  try {
    const result = await Task.deleteMany({
      userId: req.user._id,
      completed: true
    });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} completed tasks`
    });
  } catch (error) {
    console.error('Error deleting completed tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting completed tasks',
      error: error.message
    });
  }
});

module.exports = router;