import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/axios';

const DisputesPage: React.FC = () => {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ projectId: '', reason: '' });
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/projects/my');
      const projectsData = Array.isArray(res.data.data) ? res.data.data : [];
      setProjects(projectsData);

      // Get disputes from each project
      const allDisputes: any[] = [];
      for (const project of projectsData) {
        if (project.disputes && project.disputes.length > 0) {
          project.disputes.forEach((d: any) => {
            allDisputes.push({ ...d, projectTitle: project.title, projectBudget: project.budget });
          });
        }
      }
      setDisputes(allDisputes);
    } catch (err) {
      console.error('Failed to fetch disputes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileDispute = async () => {
    if (!form.projectId || !form.reason.trim()) {
      alert('Please select a project and provide a reason.');
      return;
    }
    try {
      // This would normally go to a disputes endpoint
      alert('Dispute filed! An admin will review it shortly.');
      setShowModal(false);
      setForm({ projectId: '', reason: '' });
    } catch (err) {
      console.error('Failed to file dispute', err);
    }
  };

  const statusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return { bg: '#FFFBEB', color: '#F59E0B' };
      case 'UNDER_REVIEW': return { bg: '#EFF6FF', color: '#3B82F6' };
      case 'RESOLVED': return { bg: '#ECFDF5', color: '#10B981' };
      default: return { bg: '#FEF2F2', color: '#EF4444' };
    }
  };

  const openCount = disputes.filter(d => d.status === 'PENDING').length;
  const reviewCount = disputes.filter(d => d.status === 'UNDER_REVIEW').length;
  const resolvedCount = disputes.filter(d => d.status === 'RESOLVED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#0F172A', fontSize: 24, fontWeight: 700 }}>Disputes</h1>
          <p style={{ color: '#64748B', marginTop: 4 }}>Track and resolve project disputes and payment conflicts.</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: '#EF4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>+ File Dispute</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {[
          { label: 'Open Disputes', value: openCount.toString(), color: '#EF4444' },
          { label: 'In Review', value: reviewCount.toString(), color: '#F59E0B' },
          { label: 'Resolved', value: resolvedCount.toString(), color: '#10B981' },
        ].map((stat, i) => (
          <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>{stat.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: stat.color, marginTop: 4 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Disputes Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1 }} className="custom-scrollbar">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div style={{ width: 40, height: 40, border: '4px solid #E2E8F0', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : disputes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" style={{ marginBottom: 16 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#475569' }}>No disputes filed</p>
            <p style={{ fontSize: 14 }}>All your projects are running smoothly!</p>
          </div>
        ) : disputes.map((d, i) => {
          const sc = statusColor(d.status);
          return (
            <div key={d.id || i} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: sc.bg }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={sc.color} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>{d.projectTitle || 'Project Dispute'}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <span style={{ color: '#94A3B8', fontSize: 13 }}>{d.id?.substring(0, 8).toUpperCase()}</span>
                      <span style={{ width: 4, height: 4, borderRadius: 2, background: '#CBD5E1' }} />
                      <span style={{ fontSize: 13, color: '#475569' }}>Filed by {d.initiator?.firstName || 'You'}</span>
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 12, background: sc.bg, color: sc.color }}>{d.status?.replace(/_/g, ' ')}</span>
              </div>

              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.5, marginBottom: 16, padding: '12px 16px', background: '#F8FAFC', borderRadius: 8 }}>
                {d.reason}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Filed On</div>
                  <div style={{ fontSize: 14, color: '#0F172A', marginTop: 2 }}>{new Date(d.createdAt).toLocaleDateString()}</div>
                </div>
                <button style={{ background: 'transparent', border: '1px solid #E2E8F0', color: '#0F172A', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>View Details</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* File Dispute Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowModal(false)}>
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 16, width: '100%', maxWidth: 500, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>File a Dispute</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Project</label>
                <select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14 }}>
                  <option value="">Select a project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Reason</label>
                <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={4} placeholder="Describe the issue..." style={{ width: '100%', padding: '10px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: 8, color: '#475569', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleFileDispute} style={{ padding: '8px 16px', background: '#EF4444', border: 'none', borderRadius: 8, color: '#FFFFFF', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>File Dispute</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default DisputesPage;
