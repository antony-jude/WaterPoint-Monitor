import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';
import Spinner from '../components/Spinner';

function SettingsPage() {
  const [settings, setSettings] = useState({
    low_flow_threshold: '',
    not_working_threshold: '',
    sim_interval: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data) setSettings(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load settings');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/settings', settings);
      toast.success('System settings updated');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="fade-in max-w-lg mx-auto">
      <h2 className="fw-bold mb-4 d-flex align-items-center gap-3">
        <SettingsIcon color="#a855f7" /> Admin Settings
      </h2>
      <Card className="glass-card">
        <Card.Body className="p-4">
          <Alert variant="info" className="bg-primary bg-opacity-10 border-primary text-primary border-opacity-25">
            Changes to these thresholds will affect how faults are automatically detected in real-time.
          </Alert>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="text-secondary">Low Flow Threshold (Value)</Form.Label>
              <Form.Control 
                type="number" 
                className="form-glass"
                value={settings.low_flow_threshold}
                onChange={e => setSettings({...settings, low_flow_threshold: e.target.value})}
                required
              />
              <Form.Text className="text-muted">Readings below this value are marked as LOW FLOW.</Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label className="text-secondary">Not Working Threshold (Value)</Form.Label>
              <Form.Control 
                type="number" 
                className="form-glass"
                value={settings.not_working_threshold}
                onChange={e => setSettings({...settings, not_working_threshold: e.target.value})}
                required
              />
              <Form.Text className="text-muted">Readings below this value are marked as NOT WORKING.</Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="text-secondary">Simulation Interval (ms)</Form.Label>
              <Form.Control 
                type="number" 
                className="form-glass"
                value={settings.sim_interval}
                onChange={e => setSettings({...settings, sim_interval: e.target.value})}
                required
                min="1000"
              />
              <Form.Text className="text-muted">Frequency of generated readings during Live Simulation.</Form.Text>
            </Form.Group>

            <Button type="submit" variant="primary" disabled={saving} className="w-100 d-flex align-items-center justify-content-center gap-2 py-2">
              <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default SettingsPage;
