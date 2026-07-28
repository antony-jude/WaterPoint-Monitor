import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Form, Row, Col, Pagination, Button } from 'react-bootstrap';
import { FaSearch, FaFilter } from 'react-icons/fa';
import api from '../api';
import Spinner from '../components/Spinner';
import { useTranslation } from 'react-i18next';

function ReadingsList() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const { t } = useTranslation();
  
  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchReadings();
  }, [page, statusFilter, debouncedSearch]);

  const fetchReadings = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        status: statusFilter,
        search: debouncedSearch
      };
      
      // Clean up empty params
      Object.keys(params).forEach(key => !params[key] && delete params[key]);

      const response = await api.get('/readings', { params });
      setReadings(response.data.data);
      setTotalRecords(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching readings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'WORKING':
        return <Badge className="badge-custom badge-working">{t('common.working', 'WORKING').toUpperCase()}</Badge>;
      case 'LOW_FLOW':
        return <Badge className="badge-custom badge-low-flow">{t('common.low_flow', 'LOW FLOW').toUpperCase()}</Badge>;
      case 'NOT_WORKING':
        return <Badge className="badge-custom badge-not-working">{t('common.not_working', 'NOT WORKING').toUpperCase()}</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Generate pagination items
  let items = [];
  for (let number = 1; number <= totalPages; number++) {
    items.push(
      <Pagination.Item key={number} active={number === page} onClick={() => handlePageChange(number)}>
        {number}
      </Pagination.Item>
    );
  }

  return (
    <div className="fade-in">
      <h2 className="mb-4 fw-bold">{t('pages.data_title', 'Water Readings')}</h2>
      
      <Card className="glass-card mb-4">
        <Card.Body>
          <Row className="mb-3 g-3">
            <Col md={5}>
              <div className="position-relative">
                <FaSearch className="position-absolute top-50 translate-middle-y text-secondary ms-3" />
                <Form.Control
                  type="text"
                  placeholder={t('ui.search_placeholder', 'Search by ID, Water Point, Village...')}
                  className="form-glass ps-5"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Col>
            <Col md={4}>
              <div className="position-relative">
                <FaFilter className="position-absolute top-50 translate-middle-y text-secondary ms-3" />
                <Form.Select 
                  className="form-glass ps-5"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">{t('ui.all_statuses', 'All Statuses')}</option>
                  <option value="WORKING">{t('common.working', 'Working')}</option>
                  <option value="LOW_FLOW">{t('common.low_flow', 'Low Flow')}</option>
                  <option value="NOT_WORKING">{t('common.not_working', 'Not Working')}</option>
                </Form.Select>
              </div>
            </Col>
            <Col md={3} className="d-flex align-items-center justify-content-end text-secondary">
              {t('ui.total_records', 'Total Records')}: <span className="fw-bold text-primary ms-2">{totalRecords}</span>
            </Col>
          </Row>

          {loading ? (
            <Spinner />
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="table-glass mb-0">
                  <thead>
                    <tr>
                      <th>{t('ui.headers.reading_id', 'READING ID')}</th>
                      <th>{t('ui.headers.water_point', 'WATER POINT')}</th>
                      <th>{t('ui.headers.village', 'VILLAGE')}</th>
                      <th>{t('ui.headers.flow_value', 'FLOW VALUE')}</th>
                      <th>{t('ui.headers.usage', 'USAGE')}</th>
                      <th>{t('ui.headers.status', 'STATUS')}</th>
                      <th>{t('ui.headers.recorded_time', 'RECORDED TIME')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readings.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center text-secondary py-4">No records found matching criteria</td>
                      </tr>
                    ) : (
                      readings.map((reading) => (
                        <tr key={reading.id}>
                          <td>{reading.reading_id}</td>
                          <td className="fw-bold">{reading.waterpoint_id}</td>
                          <td>{t(`villages.${reading.habitation}`, reading.habitation)}</td>
                          <td>{reading.flow_value}</td>
                          <td>{reading.usage_count}</td>
                          <td>{getStatusBadge(reading.status)}</td>
                          <td className="text-secondary">{reading.recorded_at}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
              
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination className="pagination-glass mb-0">
                    <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 1} />
                    {items}
                    <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default ReadingsList;
