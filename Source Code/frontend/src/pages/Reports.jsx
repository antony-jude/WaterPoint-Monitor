import React, { useState } from 'react';
import { Card, Button, Row, Col, Form } from 'react-bootstrap';
import { FileText, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import api from '../api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

function Reports() {
  const [reportType, setReportType] = useState('daily');
  const [generating, setGenerating] = useState(false);
  const { t } = useTranslation();

  const generatePDF = async () => {
    try {
      setGenerating(true);
      // Fetch some data for the report (e.g., all readings or analytics)
      const res = await api.get('/readings?limit=100');
      const readings = res.data.data;
      
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('Village Water Point - System Report', 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Report Type: ${reportType.toUpperCase()}`, 14, 30);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36);
      
      // Table
      const tableColumn = ["ID", "Water Point", "Village", "Status", "Flow", "Time"];
      const tableRows = [];

      readings.forEach(r => {
        const rowData = [
          r.reading_id,
          r.waterpoint_id,
          r.habitation,
          r.status,
          r.flow_value.toString(),
          r.recorded_at
        ];
        tableRows.push(rowData);
      });

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [59, 130, 246] }
      });
      
      doc.save(`WaterPoint_Report_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF Report downloaded successfully!');
      
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const generateCSV = async () => {
    try {
      setGenerating(true);
      const res = await api.get('/readings?limit=500'); // get more for CSV
      const readings = res.data.data;
      
      if (readings.length === 0) {
        toast.warning('No data to export');
        return;
      }
      
      // Create CSV
      const headers = Object.keys(readings[0]).join(',');
      const rows = readings.map(r => Object.values(r).map(val => `"${val}"`).join(','));
      const csv = [headers, ...rows].join('\n');
      
      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `WaterPoint_DataExport_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success('CSV Exported successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export CSV');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fade-in max-w-lg mx-auto">
      <h2 className="fw-bold mb-4 d-flex align-items-center gap-3">
        <FileText color="#8b5cf6" /> {t('pages.reports_title', 'System Reports')}
      </h2>
      <Card className="glass-card">
        <Card.Body className="p-4">
          <Form.Group className="mb-4">
            <Form.Label className="text-secondary">{t('ui.select_report', 'Select Report Type')}</Form.Label>
            <Form.Select className="form-glass" value={reportType} onChange={e => setReportType(e.target.value)}>
              <option value="daily">{t('ui.daily_report', 'Daily Report')}</option>
              <option value="weekly">Weekly Report</option>
              <option value="monthly">Monthly Report</option>
              <option value="faults">Fault Report</option>
              <option value="maintenance">Maintenance Report</option>
            </Form.Select>
          </Form.Group>
          
          <Row className="g-3">
            <Col sm={6}>
              <Button 
                variant="primary" 
                className="w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                onClick={generatePDF}
                disabled={generating}
              >
                <Download size={18} /> {t('ui.export_pdf', 'Export as PDF')}
              </Button>
            </Col>
            <Col sm={6}>
              <Button 
                variant="outline-primary" 
                className="w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                onClick={generateCSV}
                disabled={generating}
              >
                <Download size={18} /> {t('ui.export_csv', 'Export as CSV')}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Reports;
