import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/axios';

const ContractsPage: React.FC = () => {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [newContract, setNewContract] = useState({
    workerId: '',
    employmentType: 'Full-time',
    monthlySalary: '',
    schedule: 'Mon-Fri, 9AM-5PM',
    startDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchContracts();
  }, [statusFilter]);

  const fetchFreelancers = async () => {
    try {
      const res = await apiClient.get('/team');
      if (res.data.success) {
        // Map team members back into freelancer objects for the dropdown
        const teamMembers = res.data.data.team.map((t: any) => ({
          id: t.id,
          user: {
            firstName: t.member.name.split(' ')[0],
            lastName: t.member.name.split(' ').slice(1).join(' ')
          },
          title: t.role
        }));
        setFreelancers(teamMembers);
      }
    } catch (err) {
      console.error('Failed to fetch team members', err);
    }
  };

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await apiClient.get('/contracts', { params });
      if (res.data.success) {
        setContracts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch contracts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContract = async () => {
    if (!newContract.workerId || !newContract.monthlySalary) {
      alert('Please fill out all required fields.');
      return;
    }
    try {
      const res = await apiClient.post('/contracts', newContract);
      if (res.data.success) {
        setContracts([res.data.data, ...contracts]);
        setIsModalOpen(false);
        setNewContract({
          workerId: '',
          employmentType: 'Full-time',
          monthlySalary: '',
          schedule: 'Mon-Fri, 9AM-5PM',
          startDate: new Date().toISOString().split('T')[0],
        });
      }
    } catch (err) {
      console.error('Failed to create contract', err);
      alert('Failed to create contract.');
    }
  };

  const calculateTotalValue = () => {
    return contracts.reduce((sum, c) => sum + (c.monthlySalary || 0), 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#0F172A', fontSize: 24, fontWeight: 700 }}>Contracts</h1>
          <p style={{ color: '#64748B', marginTop: 4 }}>View and manage all active, pending, and completed contracts.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#0F172A', cursor: 'pointer' }}
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_ADMIN_REVIEW">Pending Review</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button 
            onClick={() => {
              fetchFreelancers();
              setIsModalOpen(true);
            }} 
            style={{ background: '#10B981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
          >
            + New Contract
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        {[
          { label: 'Total Contracts', value: contracts.length.toString(), color: '#10B981' },
          { label: 'Active', value: contracts.filter(c => c.status === 'ACTIVE').length.toString(), color: '#3B82F6' },
          { label: 'Pending', value: contracts.filter(c => c.status === 'PENDING_ADMIN_REVIEW').length.toString(), color: '#F59E0B' },
          { label: 'Monthly Commitment', value: `$${calculateTotalValue().toLocaleString()}`, color: '#8B5CF6' },
        ].map((stat, i) => (
          <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>{stat.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, marginTop: 4 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Contracts Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', flex: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflowY: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: '#F8FAFC' }}>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Contract ID</th>
                <th style={{ padding: '16px 16px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Worker</th>
                <th style={{ padding: '16px 16px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Type</th>
                <th style={{ padding: '16px 16px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Value</th>
                <th style={{ padding: '16px 16px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Start Date</th>
                <th style={{ padding: '16px 16px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #E2E8F0', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  </td>
                </tr>
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
                    No contracts found.
                  </td>
                </tr>
              ) : contracts.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #E2E8F0' }} onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ color: '#0F172A', fontWeight: 700, fontSize: 14 }}>{c.id.substring(0, 8).toUpperCase()}</div>
                  </td>
                  <td style={{ padding: '16px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#E2E8F0', backgroundImage: c.worker?.avatarUrl ? `url(${c.worker.avatarUrl})` : undefined, backgroundSize: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#475569' }}>
                        {!c.worker?.avatarUrl && c.worker?.firstName?.charAt(0)}
                      </div>
                      <span style={{ fontSize: 13, color: '#475569' }}>{c.worker?.firstName} {c.worker?.lastName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 16px' }}>
                    <span style={{ background: '#F1F5F9', color: '#475569', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{c.employmentType}</span>
                  </td>
                  <td style={{ padding: '16px 16px', color: '#0F172A', fontWeight: 600, fontSize: 14 }}>${c.monthlySalary}/mo</td>
                  <td style={{ padding: '16px 16px', color: '#475569', fontSize: 13 }}>{new Date(c.startDate).toLocaleDateString()}</td>
                  <td style={{ padding: '16px 16px' }}>
                    <span style={{
                      color: c.status === 'ACTIVE' ? '#10B981' : c.status === 'PENDING_ADMIN_REVIEW' ? '#F59E0B' : '#94A3B8',
                      background: c.status === 'ACTIVE' ? '#ECFDF5' : c.status === 'PENDING_ADMIN_REVIEW' ? '#FFFBEB' : '#F8FAFC',
                      padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700
                    }}>{c.status.replace(/_/g, ' ')}</span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button style={{ background: 'transparent', border: '1px solid #E2E8F0', color: '#0F172A', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, marginRight: 8 }}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Contract Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setIsModalOpen(false)}>
          <div style={{ background: 'white', padding: 32, borderRadius: 16, width: '100%', maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>New Contract</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Worker</label>
                <select 
                  value={newContract.workerId} 
                  onChange={e => setNewContract({...newContract, workerId: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14 }}
                >
                  <option value="">Select a worker...</option>
                  {freelancers.map(f => (
                    <option key={f.userId} value={f.userId}>{f.user?.firstName} {f.user?.lastName}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Employment Type</label>
                  <select 
                    value={newContract.employmentType} 
                    onChange={e => setNewContract({...newContract, employmentType: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14 }}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contractor">Contractor</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Monthly Salary ($)</label>
                  <input 
                    type="number" 
                    value={newContract.monthlySalary} 
                    onChange={e => setNewContract({...newContract, monthlySalary: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14 }}
                    placeholder="e.g. 5000"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Schedule</label>
                  <input 
                    type="text" 
                    value={newContract.schedule} 
                    onChange={e => setNewContract({...newContract, schedule: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14 }}
                    placeholder="Mon-Fri, 9AM-5PM"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Start Date</label>
                  <input 
                    type="date" 
                    value={newContract.startDate} 
                    onChange={e => setNewContract({...newContract, startDate: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 16px', background: 'transparent', color: '#64748B', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleCreateContract} style={{ padding: '10px 24px', background: '#10B981', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Create Contract</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ContractsPage;
