import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { FaSave, FaMagic } from 'react-icons/fa';
import api from '../api';

function AddReading() {
  const [formData, setFormData] = useState({
    reading_id: '',
    waterpoint_id: '',
    habitation: '',
    flow_value: '',
    usage_count: '',
    recorded_at: new Date().toISOString().slice(0, 16) // Default to current time for datetime-local
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateRandomID = () => {
    setFormData(prev => ({
      ...prev,
      reading_id: `R${Math.floor(1000 + Math.random() * 9000)}`,
      waterpoint_id: `WP${String(Math.floor(Math.random() * 15) + 1).padStart(3, '0')}`
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!formData.reading_id || !formData.waterpoint_id || !formData.habitation || formData.flow_value === '' || formData.usage_count === '' || !formData.recorded_at) {
      setError('All fields are required.');
      return;
    }
    
    const flow = parseInt(formData.flow_value);
    const usage = parseInt(formData.usage_count);
    
    if (flow < 0 || flow > 4095) {
      setError('Flow Value must be between 0 and 4095.');
      return;
    }
    
    if (usage < 0) {
      setError('Usage Count cannot be negative.');
      return;
    }

    try {
      setLoading(true);
      
      // Formatting date for backend (needs space instead of T if sqlite datetime, but backend uses toISOString)
      // We will send exactly what backend expects
      const payload = {
        ...formData,
        flow_value: flow,
        usage_count: usage,
        recorded_at: formData.recorded_at.replace('T', ' ') + ':00'
      };

      const res = await api.post('/readings', payload);
      setSuccess('Reading saved successfully! Status automatically calculated.');
      
      // Reset form
      setFormData({
        reading_id: '',
        waterpoint_id: '',
        habitation: '',
        flow_value: '',
        usage_count: '',
        recorded_at: new Date().toISOString().slice(0, 16)
      });
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save reading.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in max-w-lg mx-auto">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <h2 className="mb-4 fw-bold text-center">Add New Reading</h2>
          
          <Card className="glass-card">
            <Card.Body className="p-4">
              {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}
              {success && <Alert variant="success" className="border-0 shadow-sm">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Col>
                    <Form.Group>
                      <Form.Label className="text-secondary">Reading ID</Form.Label>
                      <Form.Control
                        type="text"
                        name="reading_id"
                        value={formData.reading_id}
                        onChange={handleChange}
                        className="form-glass"
                        placeholder="e.g. R1023"
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label className="text-secondary">Water Point ID</Form.Label>
                      <Form.Control
                        type="text"
                        name="waterpoint_id"
                        value={formData.waterpoint_id}
                        onChange={handleChange}
                        className="form-glass"
                        placeholder="e.g. WP001"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label className="text-secondary">Habitation (Village)</Form.Label>
                  <Form.Control
                    type="text"
                    name="habitation"
                    value={formData.habitation}
                    onChange={handleChange}
                    className="form-glass"
                    placeholder="e.g. Village A"
                  />
                </Form.Group>
                
                <Row className="mb-3">
                  <Col>
                    <Form.Group>
                      <Form.Label className="text-secondary">Flow Value (0-4095)</Form.Label>
                      <Form.Control
                        type="number"
                        name="flow_value"
                        value={formData.flow_value}
                        onChange={handleChange}
                        className="form-glass"
                        min="0"
                        max="4095"
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label className="text-secondary">Usage Count</Form.Label>
                      <Form.Control
                        type="number"
                        name="usage_count"
                        value={formData.usage_count}
                        onChange={handleChange}
                        className="form-glass"
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-4">
                  <Form.Label className="text-secondary">Recorded Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="recorded_at"
                    value={formData.recorded_at}
                    onChange={handleChange}
                    className="form-glass"
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-between">
                  <Button variant="outline-secondary" type="button" onClick={generateRandomID} className="d-flex align-items-center">
                    <FaMagic className="me-2" /> Generate IDs
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading} className="d-flex align-items-center px-4">
                    {loading ? 'Saving...' : <><FaSave className="me-2" /> Save Reading</>}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AddReading;
