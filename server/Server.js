const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => console.log('Connected to PostgreSQL'));
pool.on('error', (err) => console.error('PostgreSQL error:', err.message));

app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE is_active = TRUE');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error.message);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  const { wallet_address, x_profile } = req.body;
  if (!wallet_address || !x_profile) {
    return res.status(400).json({ error: 'Missing wallet_address or x_profile' });
  }

  try {
    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(countResult.rows[0].count) >= 222) {
      return res.status(400).json({ error: 'User limit of 222 reached' });
    }

    const existingUser = await pool.query(
      'SELECT id, wallet_address, x_profile FROM users WHERE wallet_address = $1',
      [wallet_address]
    );

    if (existingUser.rows.length > 0) {
      return res.json(existingUser.rows[0]);
    }

    const result = await pool.query(
      'INSERT INTO users (wallet_address, x_profile) VALUES ($1, $2) RETURNING id, wallet_address, x_profile',
      [wallet_address, x_profile]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.post('/api/boost', async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' });
  }

  try {
    const userResult = await pool.query(
      'SELECT points, last_boost_time FROM users WHERE id = $1',
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { points, last_boost_time } = userResult.rows[0];
    const now = new Date();
    const lastBoostTime = last_boost_time ? new Date(last_boost_time) : null;

    if (lastBoostTime && now - lastBoostTime < 24 * 60 * 60 * 1000) {
      return res.status(400).json({ error: 'Can only boost once per day' });
    }

    await pool.query(
      'UPDATE users SET points = $1, last_boost_time = $2 WHERE id = $3',
      [points + 1, now.toISOString(), user_id]
    );

    res.json({ points: points + 1 });
  } catch (error) {
    console.error('Error boosting:', error.message);
    res.status(500).json({ error: 'Failed to boost' });
  }
});

app.post('/api/tasks/complete', async (req, res) => {
  const { user_id, task_id, task_points } = req.body;
  if (!user_id || !task_id || !task_points) {
    return res.status(400).json({ error: 'Missing user_id, task_id, or task_points' });
  }

  try {
    const userResult = await pool.query(
      'SELECT completed_tasks, points FROM users WHERE id = $1',
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { completed_tasks, points } = userResult.rows[0];
    if (completed_tasks.includes(task_id)) {
      return res.status(400).json({ error: 'Task already completed' });
    }

    const newCompletedTasks = [...completed_tasks, task_id];
    await pool.query(
      'UPDATE users SET points = $1, completed_tasks = $2 WHERE id = $3',
      [points + task_points, newCompletedTasks, user_id]
    );

    res.json({ points: points + task_points, completed_tasks: newCompletedTasks });
  } catch (error) {
    console.error('Error completing task:', error.message);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { description, link, points } = req.body;
  if (!description || !link || !points) {
    return res.status(400).json({ error: 'Missing description, link, or points' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO tasks (description, link, points, is_active) VALUES ($1, $2, $3, TRUE) RETURNING *',
      [description, link, Number(points)]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error.message);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error.message);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.patch('/api/tasks/:id/toggle', async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ error: 'is_active must be a boolean' });
  }

  try {
    await pool.query('UPDATE tasks SET is_active = $1 WHERE id = $2', [is_active, id]);
    res.json({ is_active });
  } catch (error) {
    console.error('Error toggling task:', error.message);
    res.status(500).json({ error: 'Failed to toggle task' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});