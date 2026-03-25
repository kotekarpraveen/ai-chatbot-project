import pool from './db.js';
async function run() {
    try {
        const res = await pool.query('SELECT id FROM chatbots LIMIT 1');
        if (res.rows[0]) {
            process.stdout.write('ID:' + res.rows[0].id + '\n');
        } else {
            process.stdout.write('NO_BOT_FOUND\n');
        }
        process.exit(0);
    } catch (err) {
        process.stdout.write('ERROR:' + err.message + '\n');
        process.exit(1);
    }
}
run();
