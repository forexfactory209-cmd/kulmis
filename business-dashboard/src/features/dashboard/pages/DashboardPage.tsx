import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/axios';

interface StatCard {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

interface Activity {
  title: string;
  desc: string;
  time: string;
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/business/dashboard/overview');
        if (res.data.success) {
          setStats(res.data.data.stats);
          setActivities(res.data.data.activities);
        }
      } catch (err) {
        console.error('Error fetching dashboard overview:', err);
        // Fallback to empty data
        setStats([
          { label: 'Total Spend', value: '$0', change: '0%', positive: true },
          { label: 'Active Projects', value: '0', change: '0', positive: true },
          { label: 'Team Members', value: '0', change: '0', positive: true },
          { label: 'Hours Tracked', value: '0h', change: '0%', positive: true },
        ]);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
        <div style={{
          width: 40, height: 40, border: '3px solid #E2E8F0', borderTop: '3px solid #10B981',
          borderRadius: '50%', animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ color: '#94A3B8', fontSize: 14, marginTop: 16 }}>Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
        {stats.map((stat, i) => (
          <div key={i} style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
          >
            <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {stat.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: stat.positive ? '#10B981' : '#EF4444',
                background: stat.positive ? '#ECFDF5' : '#FEF2F2',
                padding: '4px 8px',
                borderRadius: 20
              }}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Main Chart Area */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          padding: 24,
          minHeight: 400,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>Team Overview & Activity</h3>
          {/* Simple visual bar chart from stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 12 }}>
            {stats.map((stat, i) => {
              const numericVal = parseFloat(stat.value.replace(/[^0-9.]/g, '')) || 0;
              const maxVal = Math.max(...stats.map(s => parseFloat(s.value.replace(/[^0-9.]/g, '')) || 0), 1);
              const barWidth = Math.max(5, (numericVal / maxVal) * 100);
              const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>{stat.label}</span>
                    <span style={{ fontSize: 13, color: '#0F172A', fontWeight: 700 }}>{stat.value}</span>
                  </div>
                  <div style={{ height: 8, background: '#F1F5F9', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${barWidth}%`,
                      background: colors[i % colors.length],
                      borderRadius: 8,
                      transition: 'width 0.8s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activities.length > 0 ? activities.map((activity, i) => (
              <div key={i} style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', marginTop: 6, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{activity.title}</div>
                  <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{activity.desc}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>{activity.time}</div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: 13, padding: '20px 0' }}>
                No recent activity. Start by hiring freelancers or creating contracts.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
