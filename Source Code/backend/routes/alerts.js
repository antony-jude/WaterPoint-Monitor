const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/alerts
router.get('/', (req, res) => {
    const query = `
        SELECT * FROM water_readings 
        WHERE status = 'NOT_WORKING' 
           OR status = 'LOW_FLOW'
           OR flow_value < 200 
           OR flow_ok = 0 
           OR priority IN ('HIGH', 'CRITICAL')
        ORDER BY recorded_at DESC
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        const alerts = rows.map(row => {
            return {
                ...row,
                priority: row.priority || 'HIGH'
            };
        });
        res.json(alerts);
    });
});

module.exports = router;
