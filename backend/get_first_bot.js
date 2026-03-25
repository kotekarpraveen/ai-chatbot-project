import pool from './db.js';
async function run() {
    try {
        const res = await pool.query('SELECT id FROM chatbots LIMIT 1');
        console.log('CHABOT_ID_FOUND:', res.rows[0]?.id);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
