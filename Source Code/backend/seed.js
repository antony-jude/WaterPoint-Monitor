const db = require('./database');

const generateMockData = () => {
    const realLocations = [
        { name: "Gerugambakkam", lat: 13.0136, lng: 80.1424 },
        { name: "Kolapakkam", lat: 13.0101, lng: 80.1492 },
        { name: "Kovur", lat: 13.0211, lng: 80.1582 },
        { name: "Manimangalam", lat: 12.9114, lng: 80.0402 },
        { name: "Pannur", lat: 13.0106, lng: 79.8517 },
        { name: "Irungattukottai", lat: 12.9984, lng: 79.9765 },
        { name: "Malaipattu", lat: 12.9328, lng: 80.0163 },
        { name: "Ezhichur", lat: 12.8315, lng: 79.9723 },
        { name: "Karasangal", lat: 12.8988, lng: 80.0883 },
        { name: "Ariyaperumbakkam", lat: 12.8465, lng: 79.7483 },
        { name: "Minjur", lat: 13.2691, lng: 80.2637 },
        { name: "Sholavaram", lat: 13.2289, lng: 80.1455 },
        { name: "Pakkam", lat: 13.1497, lng: 80.0494 },
        { name: "Poondi", lat: 13.1895, lng: 79.8601 },
        { name: "Aranvoyal", lat: 13.0975, lng: 79.9575 },
        { name: "Ikkadu", lat: 13.1165, lng: 79.9073 },
        { name: "Mappedu", lat: 13.0234, lng: 79.8242 },
        { name: "Putlur", lat: 13.1118, lng: 79.9405 },
        { name: "Sevvapet", lat: 13.1251, lng: 79.9678 },
        { name: "Thamaaraipakkam", lat: 13.2033, lng: 79.9912 },
        { name: "Gowriwakkam", lat: 12.9210, lng: 80.1443 },
        { name: "Agaramthen", lat: 12.8715, lng: 80.1554 },
        { name: "Polivakkam", lat: 13.0722, lng: 79.9292 },
        { name: "Keelakattalai", lat: 12.9556, lng: 80.1869 },
        { name: "Vandalur", lat: 12.8912, lng: 80.0811 },
        { name: "Mudichur", lat: 12.9152, lng: 80.0914 },
        { name: "Ottiyambakkam", lat: 12.8665, lng: 80.2001 },
        { name: "Moolacheri", lat: 12.8471, lng: 80.1884 },
        { name: "Pudur", lat: 12.9056, lng: 80.1141 },
        { name: "Kumizhi", lat: 12.8094, lng: 80.1189 }
    ];
    const waterPoints = [];
    const readings = [];

    // 1. Generate 30 distinct water points assigned to real locations
    for (let i = 1; i <= realLocations.length; i++) {
        const location = realLocations[i - 1];
        const id = `WP${String(i).padStart(3, '0')}`;
        
        // Exact real coordinates
        const lat = location.lat;
        const lng = location.lng;
        const village = location.name;
        
        const installed_at = new Date();
        installed_at.setMonth(installed_at.getMonth() - Math.floor(Math.random() * 24)); // Up to 2 years ago
        
        waterPoints.push({
            id,
            village,
            lat,
            lng,
            installed_at: installed_at.toISOString().replace('T', ' ').substring(0, 19),
            total_usage: 0,
            uptime_percentage: 100.0,
            status: 'WORKING'
        });
    }

    // 2. Generate 150 readings across these 30 points
    for (let i = 1; i <= 150; i++) {
        const pointIndex = Math.floor(Math.random() * waterPoints.length);
        const wp = waterPoints[pointIndex];
        
        const isFaulty = Math.random() > 0.85; // 15% faulty
        const isLowFlow = !isFaulty && Math.random() > 0.75; // ~20% low flow
        
        let flow_value, usage_count, status, priority, fault_reason;
        
        if (isFaulty) {
            flow_value = Math.floor(Math.random() * 200); 
            usage_count = 0; 
            status = 'NOT_WORKING';
            priority = 'CRITICAL';
            fault_reason = flow_value === 0 ? 'Sensor reading zero (Dead)' : 'Extremely low flow / blockage';
            wp.status = 'NOT_WORKING';
        } else if (isLowFlow) {
            flow_value = Math.floor(Math.random() * 800) + 200;
            usage_count = Math.floor(Math.random() * 5) + 1;
            status = 'LOW_FLOW';
            priority = 'MEDIUM';
            fault_reason = 'Flow below operational threshold';
            if (wp.status !== 'NOT_WORKING') wp.status = 'LOW_FLOW';
        } else {
            flow_value = Math.floor(Math.random() * 3096) + 1000;
            usage_count = Math.floor(Math.random() * 40) + 10;
            status = 'WORKING';
            priority = 'NORMAL';
            fault_reason = null;
        }
        
        wp.total_usage += usage_count;
        
        const reading_id = `R${String(i).padStart(4, '0')}`;
        
        // Random date within the last 30 days
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        date.setHours(date.getHours() - Math.floor(Math.random() * 24));
        const recorded_at = date.toISOString().replace('T', ' ').substring(0, 19);

        readings.push({
            reading_id,
            waterpoint_id: wp.id,
            habitation: wp.village,
            flow_ok: status !== 'NOT_WORKING',
            flow_value,
            usage_count,
            status,
            priority,
            fault_reason,
            recorded_at
        });
    }

    return { waterPoints, readings };
};

const seedDatabase = () => {
    const { waterPoints, readings } = generateMockData();
    
    db.serialize(() => {
        // We already drop table in database.js but let's clear here just in case if script run independently
        db.run('DELETE FROM water_readings');
        db.run('DELETE FROM water_points');
        db.run('DELETE FROM maintenance_logs');
        db.run('DELETE FROM audit_logs');

        // Insert Water Points
        const stmtWP = db.prepare(`
            INSERT INTO water_points (id, village, lat, lng, installed_at, total_usage, uptime_percentage, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        waterPoints.forEach(wp => {
            stmtWP.run([wp.id, wp.village, wp.lat, wp.lng, wp.installed_at, wp.total_usage, wp.uptime_percentage, wp.status]);
        });
        stmtWP.finalize();

        // Insert Readings
        const stmtRead = db.prepare(`
            INSERT INTO water_readings (reading_id, waterpoint_id, habitation, flow_ok, flow_value, usage_count, status, priority, fault_reason, recorded_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        readings.forEach(reading => {
            stmtRead.run([
                reading.reading_id,
                reading.waterpoint_id,
                reading.habitation,
                reading.flow_ok,
                reading.flow_value,
                reading.usage_count,
                reading.status,
                reading.priority,
                reading.fault_reason,
                reading.recorded_at
            ]);
        });
        stmtRead.finalize();
        
        // Add an audit log entry
        db.run(`INSERT INTO audit_logs (action, details) VALUES ('SYSTEM_SEED', 'Database seeded with 150 records and 30 water points.')`);

        console.log('Successfully seeded database with 30 water points and 150 mock readings.');
    });
};

// Run the seeder after a short delay to ensure DB table is created
setTimeout(seedDatabase, 1500);
