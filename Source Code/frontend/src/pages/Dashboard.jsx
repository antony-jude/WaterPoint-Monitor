import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import api from '../api';
import Spinner from '../components/Spinner';
import { Activity, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

function Dashboard() {
  const [data, setData] = useState(null);
  const [advData, setAdvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [basicRes, advRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/analytics/advanced-dashboard')
      ]);
      setData(basicRes.data);
      setAdvData(advRes.data);
      setError(false);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) return <Spinner />;
  if (error && !data) {
    return (
      <div className="fade-in text-center py-5">
        <AlertTriangle size={48} className="text-danger mb-3" />
        <h4 className="text-dark fw-bold">Failed to load dashboard data</h4>
        <p className="text-secondary">Please check your backend connection or try again later.</p>
      </div>
    );
  }
  if (!data || !advData) return null;

  const { summary, recentReadings, chartData } = data;
  const { topFailingVillages, mostActivePoint, todayUptime } = advData;

  // Monochrome Pie Chart Data
  const pieChartData = {
    labels: [t('common.working'), t('common.low_flow'), t('common.not_working')],
    datasets: [{
      data: [summary.working, summary.lowFlow, summary.notWorking],
      backgroundColor: ['#ffffff', '#cccccc', '#000000'],
      borderColor: ['#000000', '#000000', '#000000'],
      borderWidth: 1,
    }],
  };
  const pieChartOptions = { plugins: { legend: { labels: { color: '#000000' } } } };

  // Monochrome Line Chart Data
  const usageByDate = {};
  chartData.all.forEach(reading => {
    const date = reading.recorded_at.split(' ')[0];
    usageByDate[date] = (usageByDate[date] || 0) + reading.usage_count;
  });
  const sortedDates = Object.keys(usageByDate).sort().slice(-14); // Last 14 days
  
  const lineChartData = {
    labels: sortedDates,
    datasets: [{
      label: t('dashboard.usage_trend'),
      data: sortedDates.map(date => usageByDate[date]),
      fill: true,
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      borderColor: '#000000',
      tension: 0, // Sharp lines for classic look
    }],
  };
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#000000' } } },
    scales: { 
      y: { ticks: { color: '#555555' }, grid: { color: '#eeeeee' } },
      x: { ticks: { color: '#555555' }, grid: { display: false } }
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL': return <Badge bg="dark" text="light">{t('common.priority')} - {t('data.critical', 'CRITICAL')}</Badge>;
      case 'HIGH': return <Badge bg="secondary" text="light">{t('data.high', 'HIGH')}</Badge>;
      case 'MEDIUM': return <Badge bg="light" text="dark" className="border border-dark">{t('data.medium', 'MEDIUM')}</Badge>;
      default: return <Badge bg="light" text="dark" className="border border-secondary">{t('data.normal', 'NORMAL')}</Badge>;
    }
  };

  return (
    <div className="fade-in">
      <h2 className="mb-4 fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>{t('dashboard.title')}</h2>
      
      {/* Top Advanced Widgets */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="glass-card h-100 text-center" style={{ borderTop: '4px solid #0f172a' }}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center py-4">
              <div className="icon-wrapper bg-dark bg-opacity-10 text-dark">
                <Activity size={24}/>
              </div>
              <h6 className="metric-label mb-2">{t('dashboard.total_points')}</h6>
              <div className="metric-value text-dark">{summary.totalWaterPoints}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="glass-card h-100 text-center" style={{ borderTop: '4px solid #16a34a' }}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center py-4">
              <div className="icon-wrapper bg-success bg-opacity-10 text-success">
                <ShieldCheck size={24}/>
              </div>
              <h6 className="metric-label mb-2">{t('dashboard.system_uptime')}</h6>
              <div className="metric-value text-dark">{todayUptime.toFixed(1)}%</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="glass-card h-100 text-center" style={{ borderTop: '4px solid #2563eb' }}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center py-4">
              <div className="icon-wrapper bg-primary bg-opacity-10 text-primary">
                <Zap size={24}/>
              </div>
              <h6 className="metric-label mb-2">{t('dashboard.most_active')}</h6>
              {mostActivePoint ? (
                <>
                  <Link to={`/point/${mostActivePoint.id}`} className="text-decoration-none text-dark">
                    <div className="metric-value" style={{ fontSize: '1.75rem' }}>{mostActivePoint.id}</div>
                  </Link>
                  <small className="text-muted fw-bold mt-1">{t(`villages.${mostActivePoint.village}`, mostActivePoint.village)}</small>
                </>
              ) : <div className="metric-value">-</div>}
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="glass-card h-100 text-center" style={{ borderTop: '4px solid #dc2626' }}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center py-4">
              <div className="icon-wrapper bg-danger bg-opacity-10 text-danger">
                <AlertTriangle size={24}/>
              </div>
              <h6 className="metric-label mb-2">{t('dashboard.critical_faults')}</h6>
              <div className="metric-value text-danger">{summary.notWorking}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts & Top Failures */}
      <Row className="g-4 mb-4">
        <Col md={6}>
          <Card className="glass-card h-100">
            <Card.Body>
              <Card.Title className="text-dark mb-4 fw-bold">{t('dashboard.usage_trend')}</Card.Title>
              <div style={{ height: '280px' }}>
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="glass-card h-100">
            <Card.Body>
              <Card.Title className="text-dark mb-4 fw-bold">{t('dashboard.status_dist')}</Card.Title>
              <div style={{ height: '250px' }} className="d-flex align-items-center justify-content-center">
                <Pie data={pieChartData} options={pieChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="glass-card h-100">
            <Card.Body>
              <Card.Title className="text-dark mb-4 fw-bold">{t('dashboard.top_problems')}</Card.Title>
              <div className="d-flex flex-column gap-3">
                {topFailingVillages.map((v, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center border-bottom pb-2">
                    <span className="fw-bold">{t(`villages.${v.habitation}`, v.habitation)}</span>
                    <Badge bg="dark" pill>{v.failures} {t('dashboard.faults')}</Badge>
                  </div>
                ))}
                {topFailingVillages.length === 0 && (
                  <div className="text-center text-dark mt-4">
                    <ShieldCheck size={40} className="mb-2 opacity-50" />
                    <p>{t('dashboard.no_failing')}</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity Table */}
      <Card className="glass-card mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Card.Title className="text-dark mb-0 fw-bold">{t('dashboard.live_activity')}</Card.Title>
            <Link to="/monitor" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
              <Activity size={14} /> {t('dashboard.full_monitor')}
            </Link>
          </div>
          <div className="table-responsive">
            <Table hover className="table-glass mb-0">
              <thead>
                <tr>
                  <th>{t('common.time')}</th>
                  <th>{t('common.water_point')}</th>
                  <th>{t('common.village')}</th>
                  <th>{t('common.flow')}</th>
                  <th>{t('common.priority')}</th>
                  <th>{t('common.fault_reason')}</th>
                </tr>
              </thead>
              <tbody>
                {recentReadings.slice(0, 8).map((r) => (
                  <tr key={r.id}>
                    <td className="text-secondary">{r.recorded_at.split(' ')[1]}</td>
                    <td className="fw-bold">
                      <Link to={`/point/${r.waterpoint_id}`} className="text-dark text-decoration-none border-bottom border-dark">
                        {r.waterpoint_id}
                      </Link>
                    </td>
                    <td>{t(`villages.${r.habitation}`, r.habitation)}</td>
                    <td>{r.flow_value}</td>
                    <td>{getPriorityBadge(r.priority)}</td>
                    <td className="small text-muted">{r.fault_reason ? t(`faults.${r.fault_reason}`, r.fault_reason) : '-'}</td>
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

export default Dashboard;
