import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { 
  Activity, LayoutDashboard, List, AlertTriangle, 
  Map as MapIcon, Settings as SettingsIcon, ShieldAlert, FileText, Wrench, Globe
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import api from './api';

// Pages
import Dashboard from './pages/Dashboard';
import ReadingsList from './pages/ReadingsList';
import AddReading from './pages/AddReading';
import Alerts from './pages/Alerts';
import MapView from './pages/MapView';
import PointDetails from './pages/PointDetails';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import SettingsPage from './pages/Settings';
import AuditLogs from './pages/AuditLogs';
import Monitor from './pages/Monitor';

function Navigation() {
  const location = useLocation();
  const [simRunning, setSimRunning] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    api.get('/simulate/status').then(res => setSimRunning(res.data.running)).catch(() => {});
  }, []);

  const toggleSimulation = async () => {
    try {
      if (simRunning) {
        await api.post('/simulate/stop');
      } else {
        await api.post('/simulate/start');
      }
      setSimRunning(!simRunning);
    } catch (err) {
      console.error(err);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Navbar expand="lg" className="navbar-glass mb-4" variant="dark" sticky="top">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 me-4 text-white">
          <Activity color="#ffffff" />
          <span className="fw-bold">Water Point Monitor</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto gap-1">
            <Nav.Link as={Link} to="/" className={location.pathname === '/' ? 'active' : ''}>
              <LayoutDashboard size={18} className="me-1" /> {t('nav.dashboard')}
            </Nav.Link>
            <Nav.Link as={Link} to="/map" className={location.pathname === '/map' ? 'active' : ''}>
              <MapIcon size={18} className="me-1" /> {t('nav.map')}
            </Nav.Link>
            <Nav.Link as={Link} to="/readings" className={location.pathname === '/readings' ? 'active' : ''}>
              <List size={18} className="me-1" /> {t('nav.data')}
            </Nav.Link>
            <Nav.Link as={Link} to="/alerts" className={location.pathname === '/alerts' ? 'active' : ''}>
              <AlertTriangle size={18} className="me-1" /> {t('nav.alerts')}
            </Nav.Link>
            <Nav.Link as={Link} to="/maintenance" className={location.pathname === '/maintenance' ? 'active' : ''}>
              <Wrench size={18} className="me-1" /> {t('nav.maintenance')}
            </Nav.Link>
            <Nav.Link as={Link} to="/reports" className={location.pathname === '/reports' ? 'active' : ''}>
              <FileText size={18} className="me-1" /> {t('nav.reports')}
            </Nav.Link>
            <Nav.Link as={Link} to="/monitor" className={location.pathname === '/monitor' ? 'active' : ''}>
              <Activity size={18} className="me-1" /> {t('nav.monitor')}
            </Nav.Link>
          </Nav>
          <Nav className="align-items-center gap-3">
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-light" size="sm" id="dropdown-basic" className="d-flex align-items-center gap-2">
                <Globe size={16} /> {i18n.language.toUpperCase()}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => changeLanguage('en')}>English</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('hi')}>हिन्दी (Hindi)</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('ta')}>தமிழ் (Tamil)</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('te')}>తెలుగు (Telugu)</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('ml')}>മലയാളം (Malayalam)</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('kn')}>ಕನ್ನಡ (Kannada)</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Button 
              variant={simRunning ? "light" : "outline-light"} 
              size="sm"
              onClick={toggleSimulation}
              className="fw-bold px-3 text-dark"
            >
              {simRunning ? t('nav.stop_sim') : t('nav.start_sim')}
            </Button>
            <Nav.Link as={Link} to="/settings" className={location.pathname === '/settings' ? 'active text-white' : 'text-white'}>
              <SettingsIcon size={18} />
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container fade-in">
        <Navigation />
        <Container fluid className="px-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/point/:id" element={<PointDetails />} />
            <Route path="/readings" element={<ReadingsList />} />
            <Route path="/add-reading" element={<AddReading />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/monitor" element={<Monitor />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/audit" element={<AuditLogs />} />
          </Routes>
        </Container>
        <ToastContainer theme="light" position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;
