const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const db = require('../config/db');

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const id = randomUUID();
    const insert = 'INSERT INTO app_users (id, username, email, password_hash) VALUES ($1,$2,$3,$4) RETURNING id, username, email, created_at';
    const { rows } = await db.query(insert, [id, username, email, hashed]);
    const user = rows[0];
    if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'JWT_SECRET not configured on server' });
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'User already exists' });
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { rows } = await db.query('SELECT id, username, email, password_hash FROM app_users WHERE email=$1', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'JWT_SECRET not configured on server' });
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT id, username, email, created_at FROM app_users WHERE id=$1', [req.user.id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, me };
