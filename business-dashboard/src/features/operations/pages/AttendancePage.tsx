import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/axios';

const AttendancePage: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState('May 6 - May 12, 2024');
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendances();
  }, [selectedWeek]);

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/attendance');
      if (res.data.success) {
        setAttendances(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch attendances', err);
    } finally {
      setLoading(false);
    }
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const statusColors: Record<string, { bg: string; color: string; label: string }> = {
    present: { bg: '#ECFDF5', color: '#10B981', label: '✓' },
    absent: { bg: '#FEF2F2', color: '#EF4444', label: '✕' },
    late: { bg: '#FFFBEB', color: '#F59E0B', label: '⏱' },
    off: { bg: '#F8FAFC', color: '#CBD5E1', label: '—' },
  };

  // Group by worker
  const workersMap = new Map();
  attendances.forEach(att => {
    if (!workersMap.has(att.workerId)) {
      workersMap.set(att.workerId, {
        name: `${att.worker.firstName} ${att.worker.lastName}`,
        dept: 'Worker',
        avatarUrl: att.worker.avatarUrl,
        records: [],
      });
    }
    workersMap.get(att.workerId).records.push(att);
  });

  const workers = Array.from(workersMap.values()).map(w => {
    // Fill 7 days based on the records (this is a simplified mock mapping based on data we have)
    // In a real app we'd map exact dates to the exact day of the week
    const weekStatuses = ['off', 'off', 'off', 'off', 'off', 'off', 'off'];
    let presentCount = 0;
    
    // Just map available records into the week slots sequentially for demo purposes
    w.records.slice(0, 7).forEach((r: any, idx: number) => {
      const s = r.status.toLowerCase();
      if (s === 'present' || s === 'late') presentCount++;
      weekStatuses[idx] = s;
    });

    return {
      ...w,
      attendance: weekStatuses,
      hours: `${presentCount * 8}h`,
      rate: `${Math.round((presentCount / 5) * 100)}%`
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#0F172A', fontSize: 24, fontWeight: 700 }}>Attendance</h1>
          <p style={{ color: '#64748B', marginTop: 4 }}>Track check-ins, working hours, and attendance rates.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', color: '#475569' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', minWidth: 180, textAlign: 'center' }}>{selectedWeek}</span>
          <button style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', color: '#475569' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button style={{ background: '#10B981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13, marginLeft: 12 }}>Export CSV</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        {[
          { label: 'Total Records', value: attendances.length.toString(), color: '#10B981', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Late Arrivals', value: attendances.filter(a => a.status === 'LATE').length.toString(), color: '#F59E0B', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Absences', value: attendances.filter(a => a.status === 'ABSENT').length.toString(), color: '#EF4444', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Workers Tracked', value: workers.length.toString(), color: '#3B82F6', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        ].map((stat, i) => (
          <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stat.color} strokeWidth="2"><path d={stat.icon} /></svg>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>{stat.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A' }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: '#F8FAFC' }}>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Worker</th>
                {days.map(d => (
                  <th key={d} style={{ padding: '16px 12px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', textAlign: 'center' }}>{d}</th>
                ))}
                <th style={{ padding: '16px 16px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', textAlign: 'center' }}>Hours</th>
                <th style={{ padding: '16px 16px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', textAlign: 'center' }}>Rate</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ padding: 40, textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #E2E8F0', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  </td>
                </tr>
              ) : workers.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
                    No attendance records found for this week.
                  </td>
                </tr>
              ) : workers.map((w, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #E2E8F0' }} onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#E2E8F0', backgroundImage: w.avatarUrl ? `url(${w.avatarUrl})` : undefined, backgroundSize: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#475569' }}>
                        {!w.avatarUrl && w.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ color: '#0F172A', fontWeight: 600, fontSize: 14 }}>{w.name}</div>
                        <div style={{ color: '#94A3B8', fontSize: 12 }}>{w.dept}</div>
                      </div>
                    </div>
                  </td>
                  {w.attendance.map((status: string, j: number) => {
                    const s = statusColors[status] || statusColors['off'];
                    return (
                      <td key={j} style={{ padding: '16px 12px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', width: 32, height: 32, borderRadius: 8, background: s.bg, color: s.color, alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                          {s.label}
                        </span>
                      </td>
                    );
                  })}
                  <td style={{ padding: '16px 16px', textAlign: 'center', color: '#0F172A', fontWeight: 600, fontSize: 14 }}>{w.hours}</td>
                  <td style={{ padding: '16px 16px', textAlign: 'center' }}>
                    <span style={{ color: parseInt(w.rate) >= 90 ? '#10B981' : parseInt(w.rate) >= 80 ? '#F59E0B' : '#EF4444', fontWeight: 700, fontSize: 14 }}>{w.rate}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div style={{ padding: '12px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: 24 }}>
          {Object.entries(statusColors).map(([key, val]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 20, height: 20, borderRadius: 4, background: val.bg, color: val.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{val.label}</span>
              <span style={{ fontSize: 12, color: '#64748B', textTransform: 'capitalize' }}>{key}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AttendancePage;
