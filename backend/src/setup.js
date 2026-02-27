const fs = require('fs');
const path = require('path');
const db = require('./config/db');

async function runSchemaIfNeeded() {
  try {
    const schemaPath = path.join(__dirname, '..', 'model', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.warn('schema.sql not found at', schemaPath);
      return;
    }
    const sql = fs.readFileSync(schemaPath, 'utf8');
    // Execute file statement-by-statement to improve error reporting
    const statements = sql
      .split(/;\s*\n/) // split on semicolon followed by newline (keeps multiline statements intact)
      .map(s => s.trim())
      .filter(Boolean);

    for (const stmt of statements) {
      try {
        await db.pool.query(stmt);
      } catch (err) {
        console.warn('Schema statement failed (continuing):', (stmt.length > 120 ? stmt.slice(0, 120) + '...' : stmt));
        console.warn(' ->', err.message || err);
      }
    }
    console.log('Database schema apply attempted (some statements may have failed).');
  } catch (err) {
    console.error('Error applying schema:', err.message || err);
    // Do not crash; let server start so evaluator can still view static files
  }
}

function checkUploadsPresence(expectedFiles = []) {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.warn('⚠️ uploads folder not found at', uploadsDir);
    return;
  }
  const files = fs.readdirSync(uploadsDir).filter(f => /\.(mp4|webm|mov)$/i.test(f));
  if (!files.length) {
    console.warn('⚠️ Please download videos and place them in uploads folder.');
  } else {
    console.log(`Found ${files.length} uploaded video(s):`, files.join(', '));
  }

  // Optional: check for specific expected filenames
  expectedFiles.forEach(fn => {
    const found = files.find(f => f === fn);
    if (!found) console.warn(`⚠️ Expected upload not found: ${fn}`);
  });
}

async function init(options = {}) {
  console.log('Running startup setup...');
  // Check DB connectivity first
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set. Skipping schema apply and DB checks. Set DATABASE_URL in .env to enable full features.');
  } else {
    try {
      // quick ping
      await db.pool.query('SELECT 1');
      await runSchemaIfNeeded();
    } catch (err) {
      console.warn('Database connection failed (will continue without DB):', err.message || err);
    }
  }

  checkUploadsPresence(options.expectedFiles || []);
}

module.exports = { init };
