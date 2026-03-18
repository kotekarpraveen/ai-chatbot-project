import pool from './db.js';

async function fixUniqueConstraint() {
    try {
        console.log("Checking for duplicate subscriptions...");
        const duplicates = await pool.query(`
            SELECT organization_id, count(*) 
            FROM subscriptions 
            GROUP BY organization_id 
            HAVING count(*) > 1
        `);

        if (duplicates.rows.length > 0) {
            console.log("Cleaning up duplicate subscriptions...");
            for (const row of duplicates.rows) {
                await pool.query(`
                    DELETE FROM subscriptions 
                    WHERE organization_id = $1 
                    AND id NOT IN (
                        SELECT id FROM subscriptions 
                        WHERE organization_id = $1 
                        ORDER BY created_at DESC 
                        LIMIT 1
                    )
                `, [row.organization_id]);
            }
        }

        console.log("Adding UNIQUE constraint to organization_id...");
        await pool.query("ALTER TABLE subscriptions ADD CONSTRAINT unique_organization_id UNIQUE (organization_id)");
        console.log("Constraint added successfully.");
    } catch (error) {
        if (error.code === '42P16') {
            console.log("Constraint already exists.");
        } else {
            console.error("Error applying constraint:", error);
        }
    } finally {
        process.exit();
    }
}

fixUniqueConstraint();
