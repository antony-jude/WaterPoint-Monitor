import React, { useState, useEffect } from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import { Activity } from 'lucide-react';
import api from '../api';
import { useTranslation } from 'react-i18next';

function Monitor() {
  const [liveReadings, setLiveReadings] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    fetchLatest();
    const interval = setInterval(fetchLatest, 3000); // Poll very frequently for live view
    return () => clearInterval(interval);
  }, []);

  const fetchLatest = async () => {
    try {
      const res = await api.get('/readings?limit=20');
      setLiveReadings(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fade-in">
      <h2 className="mb-4 fw-bold d-flex align-items-center gap-3">
        <Activity color="#10b981" /> {t('pages.monitor_title')}
      </h2>
      <Card className="glass-card">
        <Card.Body>
          <div className="table-responsive">
            <Table className="table-glass mb-0" style={{ fontFamily: 'monospace' }}>
              <thead>
                <tr>
                  <th>{t('ui.headers.time')}</th>
                  <th>{t('ui.headers.node_id')}</th>
                  <th>{t('ui.headers.flow')}</th>
                  <th>{t('ui.headers.usage')}</th>
                  <th>{t('ui.headers.json_payload')}</th>
                </tr>
              </thead>
              <tbody>
                {liveReadings.map((r, i) => (
                  <tr key={i} className={i === 0 ? 'bg-success bg-opacity-10' : ''}>
                    <td>{r.recorded_at.split(' ')[1]}</td>
                    <td className="fw-bold">{r.waterpoint_id}</td>
                    <td>{r.flow_value}</td>
                    <td>{r.usage_count}</td>
                    <td style={{ fontSize: '0.85em', color: '#10b981' }}>
                      {`{"reading_id":"${r.reading_id}","waterpoint_id":"${r.waterpoint_id}","habitation":"${r.habitation}","flow_value":${r.flow_value},"usage_count":${r.usage_count},"recorded_at":"${r.recorded_at}"}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Monitor;
