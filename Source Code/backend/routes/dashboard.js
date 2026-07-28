const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/dashboard
router.get('/', (req, res) => {
    db.all('SELECT * FROM water_readings ORDER BY recorded_at DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        let working = 0;
        let lowFlow = 0;
        let notWorking = 0;
        
        const latestReadingsMap = new Map();
        const sortedAsc = [...rows].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
        
        sortedAsc.forEach(row => {
            latestReadingsMap.set(row.waterpoint_id, row);
        });
        
        const latestReadings = Array.from(latestReadingsMap.values());
        const totalUnique = latestReadings.length;
        
        latestReadings.forEach(row => {
            if (row.status === 'WORKING') working++;
            else if (row.status === 'LOW_FLOW') lowFlow++;
            else if (row.status === 'NOT_WORKING') notWorking++;
        });
        
        res.json({
            summary: {
                totalWaterPoints: totalUnique,
                working,
                lowFlow,
                notWorking
            },
            recentReadings: rows.slice(0, 5),
            chartData: {
                all: rows
            }
        });
    });
});

module.exports = router;
