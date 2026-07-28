const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/analytics/uptime
router.get('/uptime', (req, res) => {
    // Calculate global uptime %
    db.get('SELECT AVG(uptime_percentage) as global_uptime, SUM(total_usage) as total_system_usage FROM water_points', (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.get('SELECT COUNT(*) as failures FROM water_readings WHERE status = "NOT_WORKING"', (err, failRow) => {
            res.json({
                global_uptime: row.global_uptime || 100,
                total_system_usage: row.total_system_usage || 0,
                total_failures: failRow.failures || 0,
            });
        });
    });
});

// GET /api/analytics/advanced-dashboard
router.get('/advanced-dashboard', (req, res) => {
    const data = {};

    db.serialize(() => {
        // Top 5 villages with most failures
        db.all(`
            SELECT habitation, COUNT(*) as failures 
            FROM water_readings 
            WHERE status = 'NOT_WORKING' 
            GROUP BY habitation 
            ORDER BY failures DESC 
            LIMIT 5
        `, (err, rows) => {
            data.topFailingVillages = rows || [];
            
            // Most active water point
            db.get(`
                SELECT id, village, total_usage 
                FROM water_points 
                ORDER BY total_usage DESC 
                LIMIT 1
            `, (err, active) => {
                data.mostActivePoint = active || null;
                
                // Least used water point
                db.get(`
                    SELECT id, village, total_usage 
                    FROM water_points 
                    ORDER BY total_usage ASC 
                    LIMIT 1
                `, (err, least) => {
                    data.leastActivePoint = least || null;

                    // Today's uptime (simulated as global average for now)
                    db.get('SELECT AVG(uptime_percentage) as today_uptime FROM water_points', (err, up) => {
                        data.todayUptime = up ? up.today_uptime : 100;
                        
                        res.json(data);
                    });
                });
            });
        });
    });
});

module.exports = router;
