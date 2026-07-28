const express = require('express');
const router = express.Router();
const db = require('../database');
const axios = require('axios');

let simulationInterval = null;

router.post('/start', (req, res) => {
    if (simulationInterval) {
        return res.status(400).json({ error: 'Simulation is already running' });
    }

    db.get('SELECT sim_interval FROM settings WHERE id = 1', [], (err, row) => {
        const intervalTime = row ? row.sim_interval : 5000;
        
        simulationInterval = setInterval(async () => {
            // Fetch random water point
            db.get('SELECT * FROM water_points ORDER BY RANDOM() LIMIT 1', async (err, wp) => {
                if (err || !wp) return;
                
                const isFaulty = Math.random() > 0.9; 
                const isLowFlow = !isFaulty && Math.random() > 0.8; 
                
                let flow_value, usage_count;
                if (isFaulty) {
                    flow_value = Math.floor(Math.random() * 200); 
                    usage_count = 0; 
                } else if (isLowFlow) {
                    flow_value = Math.floor(Math.random() * 800) + 200;
                    usage_count = Math.floor(Math.random() * 5) + 1;
                } else {
                    flow_value = Math.floor(Math.random() * 3096) + 1000;
                    usage_count = Math.floor(Math.random() * 10) + 5;
                }

                const reading_id = `R${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
                
                // POST to local API to trigger fault detection and DB save
                try {
                    await axios.post('http://localhost:5000/api/readings', {
                        reading_id,
                        waterpoint_id: wp.id,
                        habitation: wp.village,
                        flow_value,
                        usage_count,
                        recorded_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
                    });
                } catch (e) {
                    console.error('Simulation post error:', e.message);
                }
            });
        }, intervalTime);

        db.run(`INSERT INTO audit_logs (action, details) VALUES ('SIMULATION_STARTED', 'Simulation started with interval ${intervalTime}ms')`);
        res.json({ message: 'Simulation started' });
    });
});

router.post('/stop', (req, res) => {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
        db.run(`INSERT INTO audit_logs (action, details) VALUES ('SIMULATION_STOPPED', 'Simulation stopped')`);
        res.json({ message: 'Simulation stopped' });
    } else {
        res.status(400).json({ error: 'Simulation is not running' });
    }
});

router.get('/status', (req, res) => {
    res.json({ running: !!simulationInterval });
});

module.exports = router;
