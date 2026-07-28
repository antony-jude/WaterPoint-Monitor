const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
    db.get('SELECT * FROM settings WHERE id = 1', [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

router.put('/', (req, res) => {
    const { low_flow_threshold, not_working_threshold, sim_interval } = req.body;
    db.run(`
        UPDATE settings 
        SET low_flow_threshold = ?, not_working_threshold = ?, sim_interval = ? 
        WHERE id = 1
    `, [low_flow_threshold, not_working_threshold, sim_interval], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        db.run(`INSERT INTO audit_logs (action, details) VALUES ('SETTINGS_UPDATED', 'Admin updated system settings')`);
        res.json({ message: 'Settings updated' });
    });
});

module.exports = router;
