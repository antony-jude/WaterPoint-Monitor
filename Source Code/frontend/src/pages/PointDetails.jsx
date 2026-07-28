import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Card, Badge, Table } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import { Activity, Wrench, Clock, Droplets, MapPin, AlertCircle } from 'lucide-react';
import api from '../api';
import Spinner from '../components/Spinner';

function PointDetails() {
  const { id } = useParams();
  const [point, setPoint] = useState(null);
  const [readings, setReadings] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Live update
    return () => clearInterval(interval);
  }, [id]);

  const fetchData = async () => {
    try {
      const [wpRes, readRes, maintRes] = await Promise.all([
        api.get(`/waterpoints/${id}`),
        api.get(`/readings?search=${id}&limit=50`),
        api.get(`/maintenance`) // Fetch all and filter, or we could make a specific endpoint
      ]);
      setPoint(wpRes.data);
      // Readings are already sorted by time DESC, we reverse for chart
      setReadings(readRes.data.data.reverse());
      setMaintenance(maintRes.data.filter(m => m.waterpoint_id === id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (!point) return <div className="alert alert-danger">Water point not found</div>;

  const chartData = {
    labels: readings.map(r => r.recorded_at.split(' ')[1]), // Time only
    datasets: [
      {
        label: 'Flow Value',
        data: readings.map(r => r.flow_value),
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3b82f6',
        tension: 0.4,
      }
    ]
  };

  const lastMaintenance = maintenance.length > 0 ? maintenance[0].completed_at : 'Never';
  const lastReading = readings.length > 0 ? readings[readings.length - 1] : null;

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <Droplets color="#3b82f6" /> {point.id}
          </h2>
          <p className="text-secondary mb-0 d-flex align-items-center gap-1">
            <MapPin size={16} /> {point.village}
          </p>
        </div>
        <Badge bg={point.status === 'WORKING' ? 'success' : point.status === 'LOW_FLOW' ? 'warning' : 'danger'} className="fs-5 px-3 py-2">
          {point.status.replace('_', ' ')}
        </Badge>
      </div>

      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="glass-card h-100">
            <Card.Body>
              <h6 className="text-secondary mb-3 d-flex align-items-center gap-2"><Activity size={16} /> Total Usage</h6>
              <h3 className="fw-bold mb-0">{point.total_usage}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="glass-card h-100">
            <Card.Body>
              <h6 className="text-secondary mb-3 d-flex align-items-center gap-2"><Clock size={16} /> Uptime</h6>
              <h3 className="fw-bold text-success mb-0">{point.uptime_percentage.toFixed(1)}%</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="glass-card h-100">
            <Card.Body>
              <h6 className="text-secondary mb-3 d-flex align-items-center gap-2"><Wrench size={16} /> Last Maintenance</h6>
              <h5 className="fw-bold mb-0">{lastMaintenance ? lastMaintenance.split(' ')[0] : 'Never'}</h5>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="glass-card h-100">
            <Card.Body>
              <h6 className="text-secondary mb-3 d-flex align-items-center gap-2"><AlertCircle size={16} /> Last Reading Flow</h6>
              <h3 className="fw-bold mb-0">{lastReading ? lastReading.flow_value : 0}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col md={8}>
          <Card className="glass-card h-100">
            <Card.Body>
              <Card.Title className="mb-4">Flow History (Last 50 Readings)</Card.Title>
              <div style={{ height: '300px' }}>
                <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="glass-card h-100">
            <Card.Body className="overflow-auto" style={{ maxHeight: '400px' }}>
              <Card.Title className="mb-4 d-flex justify-content-between">
                <span>Timeline</span>
                <Link to={`/maintenance?id=${point.id}`} className="btn btn-sm btn-outline-primary">Schedule Repair</Link>
              </Card.Title>
              
              <div className="timeline ps-3 border-start border-primary border-2">
                <div className="mb-4 position-relative">
                  <div className="position-absolute bg-primary rounded-circle" style={{ width: '12px', height: '12px', left: '-23px', top: '5px' }}></div>
                  <h6 className="mb-1">Installed</h6>
                  <p className="small text-secondary mb-0">{point.installed_at}</p>
                </div>
                
                {maintenance.map(m => (
                  <div key={m.id} className="mb-4 position-relative">
                    <div className="position-absolute bg-warning rounded-circle" style={{ width: '12px', height: '12px', left: '-23px', top: '5px' }}></div>
                    <h6 className="mb-1">Maintenance: {m.status}</h6>
                    <p className="small text-secondary mb-0">{m.completed_at || 'Pending'} - {m.technician}</p>
                  </div>
                ))}

                {lastReading && (
                  <div className="position-relative">
                    <div className="position-absolute bg-success rounded-circle" style={{ width: '12px', height: '12px', left: '-23px', top: '5px' }}></div>
                    <h6 className="mb-1">Latest Reading</h6>
                    <p className="small text-secondary mb-0">{lastReading.recorded_at} - Flow: {lastReading.flow_value}</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default PointDetails;
