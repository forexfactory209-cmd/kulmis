import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/axios';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const KPI_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];

const AnalyticsPage: React.FC = () => {
  const [kpis, setKpis] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number[]>(new Array(12).fill(0));
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/business/analytics');
      if (res.data.success) {
        setKpis(res.data.data.kpis || []);
        setMonthlyRevenue(res.data.data.monthlyRevenue || new Array(12).fill(0));
        setTopPerformers(res.data.data.topPerformers || []);
      }
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const maxRevenue = Math.max(...monthlyRevenue, 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#0F172A', fontSize: 24, fontWeight: 700 }}>Analytics</h1>
          <p style={{ color: '#64748B', marginTop: 4 }}>Business intelligence, KPIs, and performance metrics.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select style={{ padding: '8px 12px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#0F172A' }}>
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>Last 90 Days</option>
            <option>This Year</option>
          </select>
          <button style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: 8, color: '#0F172A', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Export</button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <div style={{ width: 40, height: 40, border: '4px solid #E2E8F0', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {kpis.map((kpi, i) => (
              <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>{kpi.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>{kpi.value}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: kpi.up ? '#10B981' : '#EF4444' }}>
                    {kpi.up ? '↑' : '↓'} {kpi.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, flex: 1, overflow: 'hidden' }}>
            {/* Revenue Chart */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 24 }}>Revenue Overview</h3>
              <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 12, paddingBottom: 24 }}>
                {monthlyRevenue.map((amount, i) => {
                  const height = maxRevenue > 0 ? Math.max((amount / maxRevenue) * 180, 10) : 10;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>{amount > 0 ? `$${amount}` : ''}</span>
                      <div style={{
                        width: '100%', height: `${height}px`, background: `linear-gradient(180deg, #10B981 0%, #10B98140 100%)`,
                        borderRadius: '6px 6px 0 0', transition: 'height 0.5s ease', minHeight: 10
                      }} />
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>{MONTHS[i]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Performers */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflowY: 'auto' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>Top Performers</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {topPerformers.length === 0 ? (
                  <div style={{ color: '#94A3B8', textAlign: 'center', padding: 20 }}>No team members yet.</div>
                ) : topPerformers.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 24, fontSize: 14, fontWeight: 700, color: i < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][i] : '#94A3B8', textAlign: 'center' }}>
                      {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
                    </span>
                    <div style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#E2E8F0', backgroundImage: p.avatarUrl ? `url(${p.avatarUrl})` : undefined, backgroundSize: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#475569' }}>
                      {!p.avatarUrl && p.name?.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: '#94A3B8' }}>{p.role}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 60, height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${p.score}%`, height: '100%', background: '#10B981', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{p.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AnalyticsPage;
