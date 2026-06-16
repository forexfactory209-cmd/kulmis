import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/axios';

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/reports');
      if (res.data.success) {
        setReports(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (type: string = 'Finance') => {
    try {
      setGenerating(true);
      const res = await apiClient.post('/reports/generate', { type });
      if (res.data.success) {
        setReports([res.data.data, ...reports]);
      }
    } catch (err) {
      console.error('Failed to generate report', err);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (e: React.MouseEvent, report: any) => {
    e.stopPropagation(); // prevent modal from opening
    alert(`Downloading ${report.title} (${report.size})...\n(Simulated download)`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // prevent modal from opening
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    try {
      setDeletingId(id);
      const res = await apiClient.delete(`/reports/${id}`);
      if (res.data.success) {
        setReports(reports.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete report', err);
      alert('Failed to delete report');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#0F172A', fontSize: 24, fontWeight: 700 }}>Reports</h1>
          <p style={{ color: '#64748B', marginTop: 4 }}>Generate and download comprehensive business reports.</p>
        </div>
        <button 
          onClick={() => handleGenerateReport('Finance')}
          disabled={generating}
          style={{ background: '#10B981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: generating ? 'not-allowed' : 'pointer', fontSize: 13, opacity: generating ? 0.7 : 1 }}
        >
          {generating ? 'Generating...' : 'Generate New Report'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {['Finance', 'HR', 'Operations'].map((type, i) => (
          <div 
            key={i} 
            onClick={() => handleGenerateReport(type)}
            style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: generating ? 'not-allowed' : 'pointer', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: generating ? 0.7 : 1 }}
            onMouseEnter={(e) => { if (!generating) e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={(e) => { if (!generating) e.currentTarget.style.transform = 'translateY(0)' }}
          >
             <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"/></svg>
             </div>
             <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>{type} Reports</div>
             <div style={{ fontSize: 13, color: '#94A3B8' }}>Generate a new {type.toLowerCase()} report</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', flex: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Recent Reports</h3>
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40, flex: 1, alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, border: '4px solid #E2E8F0', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : reports.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, flex: 1, color: '#94A3B8' }}>
            <svg style={{ margin: '0 auto 16px' }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"/></svg>
            <p style={{ fontSize: 16, fontWeight: 600 }}>No reports generated yet</p>
            <p style={{ fontSize: 14, marginTop: 4 }}>Click one of the categories above to generate a new report.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Report Name</th>
                  <th style={{ padding: '16px 16px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Type</th>
                  <th style={{ padding: '16px 16px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Date Generated</th>
                  <th style={{ padding: '16px 16px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Size</th>
                  <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r, i) => (
                  <tr 
                    key={r.id || i} 
                    onClick={() => setSelectedReport(r)}
                    style={{ borderBottom: '1px solid #E2E8F0', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px 24px', color: '#0F172A', fontWeight: 600, fontSize: 14 }}>{r.title}</td>
                    <td style={{ padding: '16px 16px' }}><span style={{ background: '#F1F5F9', color: '#475569', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{r.type}</span></td>
                    <td style={{ padding: '16px 16px', color: '#64748B', fontSize: 13 }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '16px 16px', color: '#64748B', fontSize: 13 }}>{r.size}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button 
                        onClick={(e) => handleDownload(e, r)}
                        style={{ background: 'transparent', border: '1px solid #E2E8F0', color: '#0F172A', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        Download
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, r.id)}
                        disabled={deletingId === r.id}
                        style={{ background: 'transparent', border: '1px solid #EF4444', color: '#EF4444', padding: '6px 12px', borderRadius: 6, cursor: deletingId === r.id ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, opacity: deletingId === r.id ? 0.5 : 1, transition: 'background 0.2s' }}
                        onMouseEnter={(e) => { if (deletingId !== r.id) { e.currentTarget.style.background = '#FEF2F2'; } }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        {deletingId === r.id ? '...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedReport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedReport(null)}>
          <div style={{ background: '#FFFFFF', padding: 32, borderRadius: 16, width: 500, maxWidth: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A' }}>{selectedReport.title}</h2>
                <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center' }}>
                  <span style={{ background: '#F1F5F9', color: '#475569', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{selectedReport.type}</span>
                  <span style={{ color: '#64748B', fontSize: 13 }}>{new Date(selectedReport.createdAt).toLocaleDateString()}</span>
                  <span style={{ color: '#64748B', fontSize: 13 }}>•</span>
                  <span style={{ color: '#64748B', fontSize: 13 }}>{selectedReport.size}</span>
                </div>
              </div>
              <button onClick={() => setSelectedReport(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            
            <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, marginBottom: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>Report Metadata</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontSize: 13 }}>Report ID</span>
                  <span style={{ color: '#0F172A', fontSize: 13, fontWeight: 500 }}>{selectedReport.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontSize: 13 }}>Generated By</span>
                  <span style={{ color: '#0F172A', fontSize: 13, fontWeight: 500 }}>System Analytics</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontSize: 13 }}>Status</span>
                  <span style={{ color: '#10B981', fontSize: 13, fontWeight: 500 }}>Ready</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                onClick={(e) => { setSelectedReport(null); handleDelete(e, selectedReport.id); }}
                style={{ padding: '10px 16px', background: 'transparent', color: '#EF4444', border: '1px solid #EF4444', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
              >
                Delete
              </button>
              <button 
                onClick={(e) => handleDownload(e, selectedReport)}
                style={{ padding: '10px 16px', background: '#10B981', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
              >
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ReportsPage;
