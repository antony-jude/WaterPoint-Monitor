import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../api';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import Spinner from '../components/Spinner';
import { useTranslation } from 'react-i18next';

// Fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons based on status
const createIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const icons = {
  WORKING: createIcon('green'),
  LOW_FLOW: createIcon('orange'),
  NOT_WORKING: createIcon('red')
};

// Component to recenter map
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

function MapView() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // Poll for updates if simulation is running, or just use a standard refresh interval
  useEffect(() => {
    fetchPoints();
    const interval = setInterval(fetchPoints, 5000); // refresh every 5s for live simulation
    return () => clearInterval(interval);
  }, []);

  const fetchPoints = async () => {
    try {
      const res = await api.get('/waterpoints');
      setPoints(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  // Default center based on dummy data logic (Chennai, Tamil Nadu)
  const defaultCenter = [13.0827, 80.2707];

  return (
    <div className="fade-in h-100">
      <h2 className="mb-4 fw-bold">{t('pages.map_title', 'Interactive Village Map')}</h2>
      <Card className="glass-card" style={{ height: 'calc(100vh - 150px)' }}>
        <Card.Body className="p-0 position-relative h-100 rounded overflow-hidden">
          <MapContainer 
            center={defaultCenter} 
            zoom={10} 
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {points.map(wp => (
              <Marker 
                key={wp.id} 
                position={[wp.lat, wp.lng]}
                icon={icons[wp.status] || icons.WORKING}
              >
                <Popup className="custom-popup">
                  <div className="text-center p-2">
                    <h6 className="fw-bold mb-1">{wp.id}</h6>
                    <p className="text-muted small mb-2">{t(`villages.${wp.village}`, wp.village)}</p>
                    <div className="mb-3">
                      <span className={`badge bg-${wp.status === 'WORKING' ? 'success' : wp.status === 'LOW_FLOW' ? 'warning' : 'danger'}`}>
                        {t(`common.${wp.status.toLowerCase()}`, wp.status.replace('_', ' '))}
                      </span>
                    </div>
                    <Link to={`/point/${wp.id}`} className="btn btn-sm btn-primary w-100 d-flex justify-content-center align-items-center gap-2">
                      <Activity size={14} /> {t('ui.view_details', 'View Details')}
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Card.Body>
      </Card>
    </div>
  );
}

export default MapView;
