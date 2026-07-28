const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all maintenance logs
router.get('/', (req, res) => {
    db.all('SELECT * FROM maintenance_logs ORDER BY completed_at DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Assign technician / add maintenance log
router.post('/', (req, res) => {
    const { waterpoint_id, technician, notes, cost, status } = req.body;
    const completed_at = status === 'COMPLETED' ? new Date().toISOString() : null;

    db.run(`
        INSERT INTO maintenance_logs (waterpoint_id, technician, notes, cost, completed_at, status)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [waterpoint_id, technician, notes, cost || 0, completed_at, status || 'PENDING'], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        // If completed, maybe update the water point status back to WORKING
        if (status === 'COMPLETED') {
            db.run(`UPDATE water_points SET status = 'WORKING' WHERE id = ?`, [waterpoint_id]);
            db.run(`INSERT INTO audit_logs (action, details) VALUES ('REPAIR_COMPLETED', 'Waterpoint ${waterpoint_id} repaired by ${technician}')`);
        }

        res.status(201).json({ id: this.lastID, message: 'Maintenance logged' });
    });
});

module.exports = router;
