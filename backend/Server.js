const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors({ origin: ['http://localhost:3000', process.env.FRONTEND_URL] }));
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect((err) => {
  if (err) console.error('Error connecting to PostgreSQL:', err.message);
  else console.log('Connected to PostgreSQL');
});

const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      wallet_address TEXT UNIQUE,
      x_profile TEXT,
      points INTEGER DEFAULT 0,
      last_boost_time TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      description TEXT,
      link TEXT,
      points INTEGER,
      is_active BOOLEAN DEFAULT true
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_tasks (
      user_id INTEGER,
      task_id INTEGER,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, task_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    )
  `);
};
initDb().catch(err => console.error('Error initializing DB:', err));

app.get('/api/tasks', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tasks WHERE is_active = true');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching tasks:', err.message);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { description, link, points } = req.body;
  if (!description || !link || !points) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO tasks (description, link, points, is_active) VALUES ($1, $2, $3, true) RETURNING *',
      [description, link, points]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error adding task:', err.message);
    res.status(500).json({ error: 'Failed to add task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting task:', err.message);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.patch('/api/tasks/:id/toggle', async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tasks SET is_active = $1 WHERE id = $2 RETURNING *',
      [is_active, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error toggling task:', err.message);
    res.status(500).json({ error: 'Failed to toggle task' });
  }
});

app.post('/api/users', async (req, res) => {
  const { rows: userCount } = await pool.query('SELECT COUNT(*) FROM users');
  if (parseInt(userCount[0].count) >= 222) {
    return res.status(403).json({ error: 'User limit reached' });
  }
  const { wallet_address, x_profile } = req.body;
  if (!wallet_address || !x_profile) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (wallet_address, x_profile, points) VALUES ($1, $2, 0) ON CONFLICT (wallet_address) DO UPDATE SET x_profile = EXCLUDED.x_profile RETURNING *',
      [wallet_address, x_profile]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error registering user:', err.message);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/api/boost', async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' });
  }
  try {
    const result = await pool.query(
      'UPDATE users SET points = points + 1, last_boost_time = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [user_id]
    );
    if (result.rowCount === 0) {
      return res.status(400).json({ error: 'Invalid user' });
    }
    res.json({ points: result.rows[0].points, last_boost_time: result.rows[0].last_boost_time });
  } catch (err) {
    console.error('Error boosting:', err.message);
    res.status(500).json({ error: 'Failed to boost' });
  }
});

app.post('/api/tasks/complete', async (req, res) => {
  const { user_id, task_id, task_points } = req.body;
  if (!user_id || !task_id || !task_points) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const taskResult = await pool.query(
      'INSERT INTO user_tasks (user_id, task_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [user_id, task_id]
    );
    if (taskResult.rowCount) {
      await pool.query('UPDATE users SET points = points + $1 WHERE id = $2', [task_points, user_id]);
    }
    const user = await pool.query(
      'SELECT points, (SELECT ARRAY_AGG(task_id) FROM user_tasks WHERE user_id = $1) AS completed_tasks FROM users WHERE id = $1',
      [user_id]
    );
    res.json({ points: user.rows[0].points, completed_tasks: user.rows[0].completed_tasks || [] });
  } catch (err) {
    console.error('Error completing task:', err.message);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.*, (SELECT ARRAY_AGG(task_id) FROM user_tasks WHERE user_id = u.id) AS completed_tasks
      FROM users u
    `);
    res.json(rows.map(row => ({
      ...row,
      completed_tasks: row.completed_tasks || []
    })));
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));