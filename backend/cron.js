import cron from 'node-cron';
import pool from './db.js';

// Feature 2: Monthly reset & Cleanup
// Run at 00:00 on the 1st day of every month
cron.schedule('0 0 1 * *', async () => {
    console.log("[CRON] Running monthly usage reset...");
    try {
        // We use month-based tracking, so we don't strictly need to delete,
        // but we can clear data older than 6 months to keep DB clean and fast.
        const cleanupDate = new Date();
        cleanupDate.setMonth(cleanupDate.getMonth() - 6);
        const monthString = cleanupDate.toISOString().slice(0, 7);

        const result = await pool.query(
            "DELETE FROM usage_tracking WHERE month < $1",
            [monthString]
        );
        console.log(`[CRON] Cleanup complete. Deleted ${result.rowCount} old usage records.`);
    } catch (err) {
        console.error("[CRON ERROR] Usage reset failed:", err);
    }
});

console.log("[CRON] Scheduled jobs initialized.");
