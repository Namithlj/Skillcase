const db = require('../src/config/db');
(async ()=>{
  try{
    const q = `SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('users','videos','likes','bookmarks','comments') ORDER BY table_name, ordinal_position;`;
    const { rows } = await db.query(q);
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  }catch(err){
    console.error('inspect error:', err.message || err);
    process.exit(1);
  }
})();
