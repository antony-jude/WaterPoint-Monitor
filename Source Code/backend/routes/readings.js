const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/readings
router.get('/', (req, res) => {
    const { status, priority, search, page = 1, limit = 10, village } = req.query;
    
    let query = 'SELECT * FROM water_readings WHERE 1=1';
    const params = [];
    
    if (status) {
        query += ' AND status = ?';
        params.push(status);
    }
    if (priority) {
        query += ' AND priority = ?';
        params.push(priority);
    }
    if (village) {
        query += ' AND habitation = ?';
        params.push(village);
    }
    if (search) {
        query += ' AND (waterpoint_id LIKE ? OR habitation LIKE ? OR reading_id LIKE ?)';
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
    }
    
    query += ' ORDER BY recorded_at DESC';
    
    db.get(`SELECT COUNT(*) as count FROM (${query})`, params, (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const total = row.count;
        const offset = (page - 1) * limit;
        
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);
        
        db.all(query, params, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({
                data: rows,
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            });
        });
    });
});

// POST /api/readings (With Advanced Fault Detection and ESP32 Wokwi support)
router.post('/', (req, res) => {
    let { reading_id, waterpoint_id, habitation, flow_value, usage_count, status, priority, flow_ok, recorded_at } = req.body;

    // 1. Validate required fields
    if (!waterpoint_id || typeof waterpoint_id !== 'string' || waterpoint_id.trim() === '') {
        return res.status(400).json({ error: 'waterpoint_id is required and must be a non-empty string' });
    }

    const numericFlow = Number(flow_value);
    if (flow_value === undefined || flow_value === null || isNaN(numericFlow)) {
        return res.status(400).json({ error: 'flow_value is required and must be a valid number' });
    }
    flow_value = numericFlow;

    // Auto-generate reading_id if missing
    if (!reading_id) {
        reading_id = `READ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    // Default usage_count if missing
    const numericUsage = Number(usage_count);
    usage_count = (usage_count !== undefined && !isNaN(numericUsage)) ? numericUsage : 0;

    // Parse & format recorded_at
    let formattedRecordedAt;
    if (recorded_at) {
        if (typeof recorded_at === 'number' || !isNaN(Number(recorded_at))) {
            const ts = Number(recorded_at);
            const dateMs = ts < 1e11 ? ts * 1000 : ts;
            formattedRecordedAt = new Date(dateMs).toISOString().replace('T', ' ').substring(0, 19);
        } else if (typeof recorded_at === 'string') {
            const parsedDate = new Date(recorded_at);
            if (!isNaN(parsedDate.getTime())) {
                formattedRecordedAt = parsedDate.toISOString().replace('T', ' ').substring(0, 19);
            } else {
                formattedRecordedAt = recorded_at;
            }
        } else {
            formattedRecordedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
        }
    } else {
        formattedRecordedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    }

    // 2. Fetch existing water point to resolve missing habitation and upsert
    db.get('SELECT * FROM water_points WHERE id = ?', [waterpoint_id], (err, existingWp) => {
        if (!habitation) {
            habitation = existingWp ? existingWp.village : 'Thiruvallur';
        }

        // Fetch settings and last reading for fault detection
        db.get('SELECT * FROM settings WHERE id = 1', [], (err, settings) => {
            const LOW_FLOW_THRESH = settings ? settings.low_flow_threshold : 1000;
            const NOT_WORKING_THRESH = settings ? settings.not_working_threshold : 200;

            db.get('SELECT * FROM water_readings WHERE waterpoint_id = ? ORDER BY recorded_at DESC LIMIT 1', [waterpoint_id], (err, lastReading) => {

                let computedStatus = status || 'WORKING';
                let computedPriority = priority || 'NORMAL';
                let computedFlowOk = flow_ok !== undefined ? Boolean(flow_ok) : true;
                let fault_reason = req.body.fault_reason || null;

                // Fault Detection Rules
                if (flow_value < 0 || flow_value > 4095) {
                    computedStatus = 'NOT_WORKING';
                    computedPriority = 'CRITICAL';
                    computedFlowOk = false;
                    fault_reason = 'Impossible reading (out of bounds)';
                } else if (lastReading && flow_value === lastReading.flow_value && usage_count === 0 && lastReading.usage_count === 0 && flow_value > 0) {
                    computedStatus = 'NOT_WORKING';
                    computedPriority = 'HIGH';
                    computedFlowOk = false;
                    fault_reason = 'Sensor stuck at same value';
                } else if (lastReading && Math.abs(flow_value - lastReading.flow_value) > 2000) {
                    computedStatus = 'LOW_FLOW';
                    computedPriority = 'MEDIUM';
                    fault_reason = 'Sudden spike/drop in flow detected';
                } else if (flow_value < NOT_WORKING_THRESH) {
                    computedStatus = 'NOT_WORKING';
                    computedPriority = flow_value === 0 ? 'CRITICAL' : 'HIGH';
                    computedFlowOk = false;
                    fault_reason = flow_value === 0 ? 'Zero flow detected' : 'Extremely low flow';
                } else if (flow_value < LOW_FLOW_THRESH) {
                    computedStatus = 'LOW_FLOW';
                    computedPriority = 'MEDIUM';
                    computedFlowOk = true;
                    fault_reason = 'Flow below operational threshold';
                }

                if (status && flow_value >= LOW_FLOW_THRESH) {
                    computedStatus = status;
                }
                if (priority && flow_value >= LOW_FLOW_THRESH) {
                    computedPriority = priority;
                }
                if (flow_ok !== undefined && flow_value >= LOW_FLOW_THRESH) {
                    computedFlowOk = Boolean(flow_ok);
                }

                // Insert Reading
                const insertQuery = `
                    INSERT INTO water_readings (reading_id, waterpoint_id, habitation, flow_ok, flow_value, usage_count, status, priority, fault_reason, recorded_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                db.run(insertQuery, [reading_id, waterpoint_id, habitation, computedFlowOk, flow_value, usage_count, computedStatus, computedPriority, fault_reason, formattedRecordedAt], function(err) {
                    if (err) return res.status(500).json({ error: err.message });

                    const lastID = this.lastID;

                    // Update or Insert into water_points table
                    if (existingWp) {
                        db.run(
                            `UPDATE water_points SET total_usage = total_usage + ?, status = ? WHERE id = ?`,
                            [usage_count, computedStatus, waterpoint_id]
                        );
                    } else {
                        db.run(
                            `INSERT INTO water_points (id, village, lat, lng, installed_at, total_usage, uptime_percentage, status)
                             VALUES (?, ?, 13.1165, 79.9073, CURRENT_TIMESTAMP, ?, 100.0, ?)`,
                            [waterpoint_id, habitation, usage_count, computedStatus]
                        );
                    }

                    // Return HTTP 200 on success
                    res.status(200).json({
                        success: true,
                        id: lastID,
                        message: 'Reading saved successfully',
                        reading_id,
                        waterpoint_id,
                        habitation,
                        flow_value,
                        status: computedStatus,
                        priority: computedPriority,
                        flow_ok: computedFlowOk,
                        recorded_at: formattedRecordedAt
                    });
                });
            });
        });
    });
});

module.exports = router;
