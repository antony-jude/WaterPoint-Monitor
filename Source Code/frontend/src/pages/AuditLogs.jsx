import React, { useState, useEffect } from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import { ShieldAlert } from 'lucide-react';
import api from '../api';
import Spinner from '../components/Spinner';

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/audit');
      setLogs(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="fade-in">
      <h2 className="fw-bold mb-4 d-flex align-items-center gap-3">
        <ShieldAlert color="#6366f1" /> System Audit Logs
      </h2>
      <Card className="glass-card">
        <Card.Body>
          <Table hover className="table-glass mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Action</th>
                <th>Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td><Badge bg="secondary">{log.action}</Badge></td>
                  <td>{log.details}</td>
                  <td className="text-secondary">{log.timestamp}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan="4" className="text-center py-4">No audit logs found.</td></tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}

export default AuditLogs;
