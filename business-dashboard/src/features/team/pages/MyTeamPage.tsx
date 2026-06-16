import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../lib/axios';

const MyTeamPage: React.FC = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalMembers: 0, activeToday: 0, onLeave: 0, totalCost: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTeam();
    fetchStats();
  }, [search]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/team', { params: { search } });
      if (res.data.success) {
        setTeam(res.data.data.team);
      }
    } catch (err) {
      console.error('Failed to fetch team', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await apiClient.get('/team/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const statCards = [
    { title: 'Active Workers', value: String(stats.totalMembers), icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75', color: '#10B981' },
    { title: 'Active Today', value: String(stats.activeToday), icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', color: '#F59E0B' },
    { title: 'Total Team Cost', value: `$${stats.totalCost.toLocaleString()}`, suffix: '/month', icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6', color: '#3B82F6' },
    { title: 'On Leave', value: String(stats.onLeave), icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: '#8B5CF6' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#0F172A', fontSize: 24, fontWeight: 700 }}>My Team</h1>
          <p style={{ color: '#64748B', marginTop: 4 }}>Manage your active workforce, performance, and payroll.</p>
        </div>
        <button style={{
          background: '#10B981', color: 'white', border: 'none', padding: '10px 20px',
          borderRadius: 8, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(16,185,129,0.2)'
        }}>+ Invite Worker</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
        {statCards.map((card, i) => (
          <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={card.color} strokeWidth="2"><path d={card.icon} /></svg>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: 13, fontWeight: 600, textTransform: 'uppercase' }}>{card.title}</div>
              <div style={{ color: '#0F172A', fontSize: 24, fontWeight: 800 }}>
                {card.value}
                {card.suffix && <span style={{ fontSize: 14, color: '#94A3B8', fontWeight: 500, marginLeft: 4 }}>{card.suffix}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Team Members</h3>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 12, top: 10, color: '#94A3B8' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              type="text"
              placeholder="Search team..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 240, padding: '8px 12px 8px 36px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13 }}
            />
          </div>
        </div>

        <div style={{ overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div style={{ width: 40, height: 40, border: '4px solid #E2E8F0', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: '#F8FAFC' }}>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Worker</th>
                  <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Role</th>
                  <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Department</th>
                  <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Salary</th>
                  <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Attendance</th>
                  <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {team.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #E2E8F0', cursor: 'pointer' }} onClick={() => navigate(`/team/${row.id}`)} onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E2E8F0', backgroundImage: row.member.avatar ? `url(${row.member.avatar})` : undefined, backgroundSize: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontWeight: 700, fontSize: 14 }}>
                          {!row.member.avatar && row.member.name?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ color: '#0F172A', fontWeight: 700, fontSize: 14 }}>{row.member.name}</div>
                          <div style={{ color: '#64748B', fontSize: 13 }}>{row.member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#475569', fontSize: 13 }}>{row.role}</td>
                    <td style={{ padding: '16px 24px', color: '#475569', fontSize: 13 }}>{row.department}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ color: row.status === 'Active' ? '#10B981' : '#F59E0B', fontSize: 12, fontWeight: 700, background: row.status === 'Active' ? '#ECFDF5' : '#FEF3C7', padding: '4px 10px', borderRadius: 12 }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#0F172A', fontSize: 13, fontWeight: 600 }}>{row.salary}</td>
                    <td style={{ padding: '16px 24px', color: '#475569', fontSize: 13 }}>{row.attendance}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button style={{ background: 'transparent', border: '1px solid #E2E8F0', color: '#0F172A', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }} onClick={(e) => { e.stopPropagation(); navigate(`/team/${row.id}`); }}>Manage</button>
                    </td>
                  </tr>
                ))}
                {team.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
                      No team members found. Invite workers to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default MyTeamPage;
