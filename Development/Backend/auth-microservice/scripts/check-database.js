require('dotenv').config();
const { pool } = require('../src/config/database');

(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ DB Connected:', res.rows[0]);
    await pool.end();
  } catch (err) {
    console.error('❌ DB Error:', err);
  }
})();