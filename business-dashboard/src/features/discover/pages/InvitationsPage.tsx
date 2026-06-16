import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../lib/axios';

const InvitationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, [statusFilter]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/invitations/client', {
        params: { status: statusFilter }
      });
      if (res.data.success) {
        setInvitations(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch invitations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetract = async (id: string) => {
    if (!window.confirm('Are you sure you want to retract this invitation? The freelancer will no longer see it.')) return;
    try {
      setActionLoading(id);
      await apiClient.delete(`/invitations/${id}`);
      setInvitations(prev => prev.filter(inv => inv.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to retract invitation.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResend = async (inv: any) => {
    if (!window.confirm(`Re-send the invitation to ${inv.freelancer?.firstName} ${inv.freelancer?.lastName}?`)) return;
    try {
      setActionLoading(inv.id);
      // Retract the old one, then create a new one with same details
      await apiClient.delete(`/invitations/${inv.id}`);
      await apiClient.post('/invitations', {
        freelancerId: inv.freelancerId,
        projectId: inv.projectId || undefined,
        jobType: inv.jobType || undefined,
        paymentAmount: inv.paymentAmount || undefined,
        message: inv.message || undefined,
      });
      alert('Invitation re-sent successfully!');
      fetchInvitations();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to re-send invitation.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveWorker = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from your workspace? Their contract will be terminated and they will no longer see your business.`)) return;
    try {
      setActionLoading(id);
      await apiClient.delete(`/invitations/${id}/remove-worker`);
      setInvitations(prev => prev.filter(inv => inv.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to remove worker.');
    } finally {
      setActionLoading(null);
    }
  };

  const tabs = [
    { label: 'All', value: 'All' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Rejected', value: 'REJECTED' }
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return { color: '#10B981', bg: '#ECFDF5', label: 'ACCEPTED' };
      case 'PENDING': return { color: '#F59E0B', bg: '#FFFBEB', label: 'PENDING' };
      case 'REJECTED': return { color: '#EF4444', bg: '#FEF2F2', label: 'REJECTED' };
      default: return { color: '#94A3B8', bg: '#F8FAFC', label: status };
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#0F172A', fontSize: 24, fontWeight: 700 }}>Invitations</h1>
          <p style={{ color: '#64748B', marginTop: 4 }}>Track and manage your sent invitations to freelancers.</p>
        </div>
        
        <div style={{ display: 'flex', gap: 8 }}>
          {tabs.map((tab) => (
            <button key={tab.value} onClick={() => setStatusFilter(tab.value)} style={{
              background: statusFilter === tab.value ? '#10B981' : '#FFFFFF',
              border: statusFilter === tab.value ? 'none' : '1px solid #E2E8F0',
              color: statusFilter === tab.value ? '#FFFFFF' : '#475569',
              padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div style={{ width: 40, height: 40, border: '4px solid #E2E8F0', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Talent</th>
                <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Job Type</th>
                <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Amount</th>
                <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Project</th>
                <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Sent</th>
                <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((row, i) => {
                const sc = getStatusConfig(row.status);
                const isLoading = actionLoading === row.id;
                const fullName = `${row.freelancer?.firstName || ''} ${row.freelancer?.lastName || ''}`.trim();

                return (
                  <tr key={row.id || i} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 20, backgroundColor: '#E2E8F0',
                          backgroundImage: row.freelancer?.avatarUrl ? `url(${row.freelancer.avatarUrl})` : undefined,
                          backgroundSize: 'cover', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', color: '#475569', fontWeight: 700, fontSize: 14, flexShrink: 0
                        }}>
                          {!row.freelancer?.avatarUrl && row.freelancer?.firstName?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ color: '#0F172A', fontWeight: 700, fontSize: 14 }}>{fullName || 'Freelancer'}</div>
                          <div style={{ color: '#94A3B8', fontSize: 12 }}>{row.freelancer?.freelancerProfile?.title || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        background: row.jobType === 'MONTHLY_WORKER' ? '#EFF6FF' : '#F0FDF4',
                        color: row.jobType === 'MONTHLY_WORKER' ? '#3B82F6' : '#16A34A',
                        padding: '4px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600
                      }}>
                        {row.jobType === 'MONTHLY_WORKER' ? 'Monthly Retainer' : 'Project Based'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#0F172A', fontWeight: 700, fontSize: 14 }}>
                      {row.paymentAmount ? `$${Number(row.paymentAmount).toLocaleString()}` : '—'}
                    </td>
                    <td style={{ padding: '16px 24px', color: '#475569', fontSize: 13 }}>{row.project?.title || 'General'}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        color: sc.color, fontSize: 12, fontWeight: 700,
                        background: sc.bg, padding: '5px 12px', borderRadius: 12
                      }}>
                        {sc.label}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#475569', fontSize: 13 }}>
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                        {/* View Profile — always available */}
                        <button
                          onClick={() => navigate(`/discover/${row.freelancer?.id}`)}
                          style={{
                            background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#0F172A',
                            padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600
                          }}
                        >
                          Profile
                        </button>

                        {/* PENDING or REJECTED: Retract + Re-send */}
                        {(row.status === 'PENDING' || row.status === 'REJECTED') && (
                          <>
                            <button
                              onClick={() => handleResend(row)}
                              disabled={isLoading}
                              style={{
                                background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#3B82F6',
                                padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                                opacity: isLoading ? 0.5 : 1
                              }}
                            >
                              {isLoading ? '...' : 'Re-send'}
                            </button>
                            <button
                              onClick={() => handleRetract(row.id)}
                              disabled={isLoading}
                              style={{
                                background: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444',
                                padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                                opacity: isLoading ? 0.5 : 1
                              }}
                            >
                              {isLoading ? '...' : 'Retract'}
                            </button>
                          </>
                        )}

                        {/* ACCEPTED: Remove Worker */}
                        {row.status === 'ACCEPTED' && (
                          <button
                            onClick={() => handleRemoveWorker(row.id, fullName)}
                            disabled={isLoading}
                            style={{
                              background: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444',
                              padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                              opacity: isLoading ? 0.5 : 1
                            }}
                          >
                            {isLoading ? 'Removing...' : '🗑 Remove Worker'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {invitations.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 60, textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: '#94A3B8' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span style={{ fontWeight: 600, fontSize: 15, color: '#475569' }}>No invitations found</span>
                      <span style={{ fontSize: 14 }}>Discover talent and send invitations to get started.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default InvitationsPage;
