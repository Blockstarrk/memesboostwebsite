const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors({ origin: ['http://localhost:3000', process.env.FRONTEND_URL] }));
app.use(express.json());

// SQLite connection
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) console.error('Error connecting to SQLite:', err.message);
  else console.log('Connected to SQLite');
});

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wallet_address TEXT UNIQUE,
      x_profile TEXT,
      points INTEGER DEFAULT 0,
      last_boost_time DATETIME
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT,
      link TEXT,
      points INTEGER,
      is_active BOOLEAN DEFAULT 1
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS user_tasks (
      user_id INTEGER,
      task_id INTEGER,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, task_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    )
  `);
});

// API Endpoints
app.get('/api/tasks', (req, res) => {
  db.all('SELECT * FROM tasks WHERE is_active = 1', [], (err, rows) => {
    if (err) {
      console.error('Error fetching tasks:', err.message);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
    res.json(rows);
  });
});

app.post('/api/tasks', (req, res) => {
  const { description, link, points } = req.body;
  if (!description || !link || !points) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.run(
    'INSERT INTO tasks (description, link, points, is_active) VALUES (?, ?, ?, 1)',
    [description, link, points],
    function (err) {
      if (err) {
        console.error('Error adding task:', err.message);
        return res.status(500).json({ error: 'Failed to add task' });
      }
      res.status(201).json({ id: this.lastID, description, link, points, is_active: 1 });
    }
  );
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
    if (err || this.changes === 0) {
      console.error('Error deleting task:', err?.message);
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send();
  });
});

app.patch('/api/tasks/:id/toggle', (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  db.run(
    'UPDATE tasks SET is_active = ? WHERE id = ?',
    [is_active ? 1 : 0, id],
    function (err) {
      if (err || this.changes === 0) {
        console.error('Error toggling task:', err?.message);
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json({ id, is_active });
    }
  );
});

app.post('/api/users', (req, res) => {
  db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
    if (err) {
      console.error('Error counting users:', err.message);
      return res.status(500).json({ error: 'Failed to check user count' });
    }
    if (row.count >= 222) {
      return res.status(403).json({ error: 'User limit reached' });
    }
    const { wallet_address, x_profile } = req.body;
    if (!wallet_address || !x_profile) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    db.run(
      'INSERT OR REPLACE INTO users (wallet_address, x_profile, points) VALUES (?, ?, ?)',
      [wallet_address, x_profile, 0],
      function (err) {
        if (err) {
          console.error('Error registering user:', err.message);
          return res.status(500).json({ error: 'Failed to register user' });
        }
        res.status(201).json({ id: this.lastID, wallet_address, x_profile, points: 0 });
      }
    );
  });
});

app.post('/api/boost', (req, res) => {
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' });
  }
  db.run(
    'UPDATE users SET points = points + 1, last_boost_time = CURRENT_TIMESTAMP WHERE id = ?',
    [user_id],
    function (err) {
      if (err || this.changes === 0) {
        console.error('Error boosting:', err?.message);
        return res.status(400).json({ error: 'Invalid user' });
      }
      db.get('SELECT points, last_boost_time FROM users WHERE id = ?', [user_id], (err, row) => {
        if (err) {
          console.error('Error fetching user:', err.message);
          return res.status(500).json({ error: 'Failed to fetch user' });
        }
        res.json({ points: row.points, last_boost_time: row.last_boost_time });
      });
    }
  );
});

app.post('/api/tasks/complete', (req, res) => {
  const { user_id, task_id, task_points } = req.body;
  if (!user_id || !task_id || !task_points) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.run(
    'INSERT OR IGNORE INTO user_tasks (user_id, task_id) VALUES (?, ?)',
    [user_id, task_id],
    function (err) {
      if (err) {
        console.error('Error completing task:', err.message);
        return res.status(500).json({ error: 'Failed to complete task' });
      }
      if (this.changes) {
        db.run('UPDATE users SET points = points + ? WHERE id = ?', [task_points, user_id], (err) => {
          if (err) {
            console.error('Error updating points:', err.message);
            return res.status(500).json({ error: 'Failed to update points' });
          }
        });
      }
      db.get(
        'SELECT points, (SELECT GROUP_CONCAT(task_id) FROM user_tasks WHERE user_id = ?) AS completed_tasks FROM users WHERE id = ?',
        [user_id, user_id],
        (err, row) => {
          if (err) {
            console.error('Error fetching user:', err.message);
            return res.status(500).json({ error: 'Failed to fetch user' });
          }
          res.json({
            points: row.points,
            completed_tasks: row.completed_tasks ? row.completed_tasks.split(',').map(Number) : [],
          });
        }
      );
    }
  );
});

app.get('/api/users', (req, res) => {
  db.all(
    `SELECT u.*, (SELECT GROUP_CONCAT(task_id) FROM user_tasks WHERE user_id = u.id) AS completed_tasks
     FROM users u`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Error fetching users:', err.message);
        return res.status(500).json({ error: 'Failed to fetch users' });
      }
      res.json(
        rows.map((row) => ({
          ...row,
          completed_tasks: row.completed_tasks ? row.completed_tasks.split(',').map(Number) : [],
        }))
      );
    }
  );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));