import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, Row, Col, Modal } from 'react-bootstrap';
import { Wrench } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';
import Spinner from '../components/Spinner';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Maintenance() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialWpId = queryParams.get('id') || '';
  const { t } = useTranslation();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    waterpoint_id: initialWpId,
    technician: '',
    notes: '',
    cost: '',
    status: 'PENDING'
  });

  useEffect(() => {
    fetchLogs();
    if (initialWpId) setShowModal(true);
  }, [initialWpId]);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/maintenance');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load maintenance logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/maintenance', formData);
      toast.success('Maintenance record created successfully');
      setShowModal(false);
      fetchLogs();
    } catch (err) {
      toast.error('Failed to save maintenance record');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0 d-flex align-items-center gap-3">
          <Wrench color="#f59e0b" /> {t('pages.maintenance_title', 'Maintenance Hub')}
        </h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>{t('ui.schedule_repair', 'Schedule Repair')}</Button>
      </div>

      <Card className="glass-card">
        <Card.Body>
          <Table hover className="table-glass mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>{t('ui.headers.water_point', 'WATER POINT')}</th>
                <th>{t('ui.headers.technician', 'TECHNICIAN')}</th>
                <th>{t('ui.headers.status', 'STATUS')}</th>
                <th>{t('ui.headers.cost', 'COST')}</th>
                <th>{t('ui.headers.completed_at', 'COMPLETED AT')}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td className="fw-bold">{log.waterpoint_id}</td>
                  <td>{log.technician}</td>
                  <td>
                    <Badge bg={log.status === 'COMPLETED' ? 'success' : 'warning'}>{log.status}</Badge>
                  </td>
                  <td>₹{log.cost}</td>
                  <td>{log.completed_at ? log.completed_at.split(' ')[0] : '—'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan="6" className="text-center py-4">{t('ui.no_records', 'No maintenance records found.')}</td></tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="glass-card border-0">
        <Modal.Header closeButton closeVariant="white" className="border-0">
          <Modal.Title>Schedule/Log Maintenance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Water Point ID</Form.Label>
              <Form.Control 
                className="form-glass"
                value={formData.waterpoint_id} 
                onChange={e => setFormData({...formData, waterpoint_id: e.target.value})} 
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Technician Name</Form.Label>
              <Form.Control 
                className="form-glass"
                value={formData.technician} 
                onChange={e => setFormData({...formData, technician: e.target.value})} 
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select className="form-glass" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="PENDING">Pending (Scheduled)</option>
                <option value="COMPLETED">Completed</option>
              </Form.Select>
            </Form.Group>
            {formData.status === 'COMPLETED' && (
              <Form.Group className="mb-3">
                <Form.Label>Repair Cost (₹)</Form.Label>
                <Form.Control 
                  type="number"
                  className="form-glass"
                  value={formData.cost} 
                  onChange={e => setFormData({...formData, cost: e.target.value})} 
                />
              </Form.Group>
            )}
            <Form.Group className="mb-4">
              <Form.Label>Repair Notes</Form.Label>
              <Form.Control 
                as="textarea"
                rows={3}
                className="form-glass"
                value={formData.notes} 
                onChange={e => setFormData({...formData, notes: e.target.value})} 
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100">Save Record</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Maintenance;
