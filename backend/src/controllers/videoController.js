const db = require('../config/db');
const { randomUUID } = require('crypto');

const create = async (req, res, next) => {
  try {
    const { title, description, category, file_path, external_url } = req.body;
    // prefer external_url if provided (frontend converts Drive share links to direct urls)
    const finalPath = external_url && external_url.trim() ? external_url.trim() : file_path;
    if (!finalPath) return res.status(400).json({ error: 'file_path or external_url required' });
    const id = randomUUID();
    const insert = `INSERT INTO videos (id, title, description, category, file_path) VALUES ($1,$2,$3,$4,$5) RETURNING *`;
    const { rows } = await db.query(insert, [id, title, description || '', category || null, finalPath]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

const seed = async (req, res, next) => {
  const fs = require('fs');
  const path = require('path');
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
  const client = await db.pool.connect();
  try {
    const files = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).filter(f => /\.(mp4|webm|mov)$/i.test(f)) : [];
    await client.query('BEGIN');
    for (const f of files) {
      const file_path = `/uploads/${f}`;
      const title = f.replace(/\.[^.]+$/, '');
      const { rows: exists } = await client.query('SELECT id FROM videos WHERE file_path=$1', [file_path]);
      if (!exists.length) {
        const id = randomUUID();
        await client.query('INSERT INTO videos (id, title, description, category, file_path) VALUES ($1,$2,$3,$4,$5)', [id, title, '', null, file_path]);
      }
    }
    await client.query('COMMIT');
    const { rows } = await client.query('SELECT * FROM videos ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

const list = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM videos ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('DB error (list videos):', err.message || err);
    return res.status(503).json({ error: 'Database unavailable. Check server logs.' });
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM videos WHERE id=$1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

const like = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: exists } = await client.query('SELECT 1 FROM likes WHERE user_id=$1 AND video_id=$2', [req.user.id, req.params.id]);
    if (exists.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Already liked' });
    }
    await client.query('INSERT INTO likes (user_id, video_id) VALUES ($1,$2)', [req.user.id, req.params.id]);
    const { rows } = await client.query('UPDATE videos SET like_count = like_count + 1 WHERE id=$1 RETURNING like_count', [req.params.id]);
    await client.query('COMMIT');
    res.json({ like_count: rows[0].like_count });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

const comment = async (req, res, next) => {
  try {
    const { id } = req.params; // video id
    const { content } = req.body;
    const commentId = randomUUID();
    const insert = 'INSERT INTO comments (id, user_id, video_id, content) VALUES ($1,$2,$3,$4) RETURNING *';
    const { rows } = await db.query(insert, [commentId, req.user.id, id, content]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

const bookmark = async (req, res, next) => {
  try {
    const { rows: exists } = await db.query('SELECT 1 FROM bookmarks WHERE user_id=$1 AND video_id=$2', [req.user.id, req.params.id]);
    if (exists.length) return res.status(400).json({ error: 'Already bookmarked' });
    await db.query('INSERT INTO bookmarks (user_id, video_id) VALUES ($1,$2)', [req.user.id, req.params.id]);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
};

const getComments = async (req, res, next) => {
  try {
    // user_id is stored as text to remain compatible with external/legacy users table.
    // Join by casting the app user id to text.
    const { rows } = await db.query('SELECT c.*, u.username FROM comments c LEFT JOIN app_users u ON u.id::text = c.user_id WHERE video_id=$1 ORDER BY created_at DESC', [req.params.id]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

const seedTest = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    // pick a video
    const { rows: vids } = await client.query('SELECT id FROM videos ORDER BY created_at DESC LIMIT 1');
    if (!vids.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No videos to seed' });
    }
    const videoId = vids[0].id;

    // pick an app user, or create one
    let userId;
    const { rows: users } = await client.query('SELECT id FROM app_users LIMIT 1');
    if (users.length) {
      userId = users[0].id;
    } else {
      const { randomUUID } = require('crypto');
      userId = randomUUID();
      await client.query('INSERT INTO app_users (id, username, email, password_hash) VALUES ($1,$2,$3,$4)', [userId, 'seed_user', 'seed@example.com', 'seed']);
    }

    // insert a like if not exists
    const { rows: likeExists } = await client.query('SELECT 1 FROM likes WHERE user_id=$1 AND video_id=$2', [userId, videoId]);
    if (!likeExists.length) {
      await client.query('INSERT INTO likes (user_id, video_id) VALUES ($1,$2)', [userId, videoId]);
      await client.query('UPDATE videos SET like_count = like_count + 1 WHERE id=$1', [videoId]);
    }

    // insert a comment if not exists
    const { rows: commentExists } = await client.query('SELECT 1 FROM comments WHERE user_id=$1 AND video_id=$2', [userId, videoId]);
    if (!commentExists.length) {
      const { randomUUID } = require('crypto');
      const commentId = randomUUID();
      await client.query('INSERT INTO comments (id, user_id, video_id, content) VALUES ($1,$2,$3,$4)', [commentId, userId, videoId, 'Nice short — seeded comment for testing']);
    }

    await client.query('COMMIT');
    const { rows: video } = await client.query('SELECT * FROM videos WHERE id=$1', [videoId]);
    res.json({ ok: true, video: video[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

const getBookmarks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { rows } = await db.query('SELECT v.* FROM videos v JOIN bookmarks b ON b.video_id = v.id WHERE b.user_id = $1 ORDER BY v.created_at DESC', [userId]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

module.exports = { create, seed, list, getById, like, comment, bookmark, getComments, getBookmarks };
