import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Row, Col } from 'react-bootstrap';
import { FaExclamationTriangle } from 'react-icons/fa';
import api from '../api';
import Spinner from '../components/Spinner';
import { useTranslation } from 'react-i18next';

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/alerts');
      setAlerts(response.data);
    } catch (err) {
      setError(t('ui.failed_fetch_alerts'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="fade-in">
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="fw-bold mb-0 text-danger d-flex align-items-center">
            <FaExclamationTriangle className="me-3" /> {t('pages.alerts_title', 'System Alerts')}
          </h2>
        </Col>
        <Col xs="auto">
          <Badge bg="danger" className="badge-custom px-3 py-2 fs-6">
            {alerts.length} {t('ui.critical_faults', 'Critical Faults')}
          </Badge>
        </Col>
      </Row>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <Card className="glass-card mb-4" style={{ borderTop: '4px solid #ef4444' }}>
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="table-glass mb-0">
              <thead>
                <tr>
                  <th>{t('ui.headers.water_point', 'WATER POINT')}</th>
                  <th>{t('ui.headers.village', 'VILLAGE')}</th>
                  <th>{t('ui.headers.status', 'STATUS')}</th>
                  <th>{t('ui.headers.time', 'TIME')}</th>
                  <th>{t('ui.headers.priority', 'PRIORITY')}</th>
                </tr>
              </thead>
              <tbody>
                {alerts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-success py-5">
                      <FaExclamationTriangle size={30} className="mb-3 opacity-50" />
                      <h5>{t('ui.no_critical_faults')}</h5>
                      <p className="text-secondary mb-0">{t('ui.all_systems_operational')}</p>
                    </td>
                  </tr>
                ) : (
                  alerts.map((alert) => (
                    <tr key={alert.id}>
                      <td className="fw-bold text-danger">{alert.waterpoint_id}</td>
                      <td>{t(`villages.${alert.habitation}`, alert.habitation)}</td>
                      <td>
                        <Badge className="badge-custom badge-not-working">{t(`common.${alert.status.toLowerCase()}`, alert.status)}</Badge>
                      </td>
                      <td className="text-secondary">{alert.recorded_at}</td>
                      <td>
                        <Badge bg="danger" className="badge-custom">{t(`data.${alert.priority.toLowerCase()}`, alert.priority)}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Alerts;
