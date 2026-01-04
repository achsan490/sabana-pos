require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { Client } = require('pg');

// Try different env var names common in Vercel/Supabase
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
    console.error('Error: No DATABASE_URL found in .env.local');
    process.exit(1);
}

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        await client.connect();
        console.log('Connected to database.');

        const sql = fs.readFileSync('scripts/schema.sql', 'utf8');
        console.log('Read schema.sql.');

        // Split by semicolons to run statements individually (optional, but postgres driver usually handles multiple statements)
        // But for better error reporting, we can try running it as one block or splitting.
        // Let's run as one block first.
        await client.query(sql);
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
