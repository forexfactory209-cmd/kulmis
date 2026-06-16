import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/axios';

const PayrollPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('May 2024');
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState<any>(null);

  const monthsList = [
    'January 2024', 'February 2024', 'March 2024', 'April 2024', 
    'May 2024', 'June 2024', 'July 2024', 'August 2024', 
    'September 2024', 'October 2024', 'November 2024', 'December 2024'
  ];

  useEffect(() => {
    fetchPayrolls();
  }, [selectedMonth]);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/payroll');
      if (res.data.success) {
        setPayrolls(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch payrolls', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunPayroll = async () => {
    try {
      setLoading(true);
      const res = await apiClient.post('/payroll/run', { month: selectedMonth });
      if (res.data.success) {
        fetchPayrolls();
      }
    } catch (err) {
      console.error('Failed to run payroll', err);
      alert('Failed to run payroll.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (id: string) => {
    try {
      const res = await apiClient.put(`/payroll/${id}/pay`);
      if (res.data.success) {
        setPayrolls(payrolls.map(p => p.id === id ? res.data.data : p));
      }
    } catch (err) {
      console.error('Failed to mark as paid', err);
      alert('Failed to process payment.');
    }
  };

  const totalPayroll = payrolls.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const totalBonuses = payrolls.reduce((sum, p) => sum + (p.bonuses || 0), 0);
  const paidWorkers = payrolls.filter(p => p.status === 'PAID').length;
  const pendingPayments = payrolls.filter(p => p.status === 'UNPAID').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#0F172A', fontSize: 24, fontWeight: 700 }}>Payroll</h1>
          <p style={{ color: '#64748B', marginTop: 4 }}>Manage salaries, bonuses, deductions, and payment status.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: '8px 12px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#0F172A', cursor: 'pointer' }}
          >
            {monthsList.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: 8, color: '#0F172A', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Download Report</button>
          <button onClick={handleRunPayroll} style={{ background: '#10B981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Run Payroll</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        {[
          { label: 'Total Payroll', value: `$${totalPayroll.toLocaleString()}`, color: '#3B82F6', icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
          { label: 'Paid Workers', value: paidWorkers.toString(), color: '#10B981', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Pending Payments', value: pendingPayments.toString(), color: '#F59E0B', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Total Bonuses', value: `$${totalBonuses.toLocaleString()}`, color: '#8B5CF6', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
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

      {/* Payroll Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', flex: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflowY: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: '#F8FAFC' }}>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Worker</th>
                <th style={{ padding: '16px 16px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Base Salary</th>
                <th style={{ padding: '16px 16px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Bonus</th>
                <th style={{ padding: '16px 16px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Deductions</th>
                <th style={{ padding: '16px 16px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Net Pay</th>
                <th style={{ padding: '16px 16px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
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
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
                    No payroll data found.
                  </td>
                </tr>
              ) : payrolls.map((w, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#E2E8F0', backgroundImage: w.contract?.worker?.avatarUrl ? `url(${w.contract.worker.avatarUrl})` : undefined, backgroundSize: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#475569' }}>
                        {!w.contract?.worker?.avatarUrl && w.contract?.worker?.firstName?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ color: '#0F172A', fontWeight: 600, fontSize: 14 }}>{w.contract?.worker?.firstName} {w.contract?.worker?.lastName}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 16px', textAlign: 'right', color: '#0F172A', fontSize: 14 }}>${w.baseSalary}</td>
                  <td style={{ padding: '16px 16px', textAlign: 'right', color: '#10B981', fontSize: 14, fontWeight: 600 }}>{w.bonuses > 0 ? `+$${w.bonuses}` : '-'}</td>
                  <td style={{ padding: '16px 16px', textAlign: 'right', color: '#EF4444', fontSize: 14, fontWeight: 600 }}>{w.deductions > 0 ? `-$${w.deductions}` : '-'}</td>
                  <td style={{ padding: '16px 16px', textAlign: 'right', color: '#0F172A', fontSize: 14, fontWeight: 700 }}>${w.totalAmount}</td>
                  <td style={{ padding: '16px 16px', textAlign: 'center' }}>
                    <span style={{
                      color: w.status === 'PAID' ? '#10B981' : '#F59E0B',
                      background: w.status === 'PAID' ? '#ECFDF5' : '#FFFBEB',
                      padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700
                    }}>{w.status}</span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button 
                      onClick={() => w.status === 'UNPAID' ? handlePayNow(w.id) : setSelectedSlip(w)}
                      style={{ background: 'transparent', border: '1px solid #E2E8F0', color: '#0F172A', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                    >
                      {w.status === 'UNPAID' ? 'Pay Now' : 'View Slip'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Modal */}
      {selectedSlip && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#FFF', borderRadius: 16, width: 400, padding: 24, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, color: '#0F172A', fontSize: 18 }}>Pay Slip</h2>
              <button onClick={() => setSelectedSlip(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748B' }}>&times;</button>
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: '#64748B', fontSize: 12, textTransform: 'uppercase', fontWeight: 600 }}>Worker</div>
              <div style={{ color: '#0F172A', fontSize: 16, fontWeight: 600 }}>{selectedSlip.contract?.worker?.firstName} {selectedSlip.contract?.worker?.lastName}</div>
              <div style={{ color: '#64748B', fontSize: 14 }}>{selectedMonth}</div>
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '16px 0', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: '#475569' }}>Base Salary</span>
                <span style={{ color: '#0F172A', fontWeight: 600 }}>${selectedSlip.baseSalary}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: '#475569' }}>Bonuses</span>
                <span style={{ color: '#10B981', fontWeight: 600 }}>+${selectedSlip.bonuses}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Deductions</span>
                <span style={{ color: '#EF4444', fontWeight: 600 }}>-${selectedSlip.deductions}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <span style={{ color: '#0F172A', fontSize: 16, fontWeight: 700 }}>Total Net Pay</span>
              <span style={{ color: '#0F172A', fontSize: 24, fontWeight: 800 }}>${selectedSlip.totalAmount}</span>
            </div>

            <button 
              onClick={() => {
                alert('Downloading slip PDF...');
                setSelectedSlip(null);
              }}
              style={{ width: '100%', background: '#3B82F6', color: '#FFF', padding: '12px', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
            >
              Download PDF
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default PayrollPage;
