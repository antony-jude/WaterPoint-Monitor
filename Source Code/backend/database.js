const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Vercel serverless functions are read-only except for /tmp
let dbPath = path.resolve(__dirname, 'database.sqlite');
if (process.env.VERCEL) {
    dbPath = path.join('/tmp', 'database.sqlite');
    // Copy the initial database if it doesn't exist in /tmp
    const initialDbPath = path.resolve(__dirname, 'database.sqlite');
    if (!fs.existsSync(dbPath) && fs.existsSync(initialDbPath)) {
        fs.copyFileSync(initialDbPath, dbPath);
    }
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        db.serialize(() => {
            // 1. water_points
            db.run(`
                CREATE TABLE IF NOT EXISTS water_points (
                    id TEXT PRIMARY KEY,
                    village TEXT NOT NULL,
                    lat REAL NOT NULL,
                    lng REAL NOT NULL,
                    installed_at DATETIME NOT NULL,
                    total_usage INTEGER DEFAULT 0,
                    uptime_percentage REAL DEFAULT 100.0,
                    status TEXT DEFAULT 'WORKING'
                )
            `);

            // 2. water_readings (updated)
            db.run(`
                CREATE TABLE IF NOT EXISTS water_readings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    reading_id TEXT NOT NULL,
                    waterpoint_id TEXT NOT NULL,
                    habitation TEXT NOT NULL,
                    flow_ok BOOLEAN NOT NULL,
                    flow_value INTEGER NOT NULL,
                    usage_count INTEGER NOT NULL,
                    status TEXT NOT NULL,
                    priority TEXT DEFAULT 'NORMAL',
                    fault_reason TEXT,
                    recorded_at DATETIME NOT NULL
                )
            `);

            // 3. maintenance_logs
            db.run(`
                CREATE TABLE IF NOT EXISTS maintenance_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    waterpoint_id TEXT NOT NULL,
                    technician TEXT NOT NULL,
                    notes TEXT,
                    cost REAL DEFAULT 0.0,
                    completed_at DATETIME,
                    status TEXT DEFAULT 'PENDING'
                )
            `);

            // 4. audit_logs
            db.run(`
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    action TEXT NOT NULL,
                    details TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // 5. settings
            db.run(`
                CREATE TABLE IF NOT EXISTS settings (
                    id INTEGER PRIMARY KEY CHECK (id = 1),
                    low_flow_threshold INTEGER DEFAULT 200,
                    not_working_threshold INTEGER DEFAULT 100,
                    sim_interval INTEGER DEFAULT 5000
                )
            `, (err) => {
                if (!err) {
                    // Insert default settings if not exist
                    db.run(`INSERT OR IGNORE INTO settings (id, low_flow_threshold, not_working_threshold, sim_interval) VALUES (1, 1000, 200, 5000)`);
                }
            });

            console.log('All tables initialized.');
        });
    }
});

module.exports = db;
