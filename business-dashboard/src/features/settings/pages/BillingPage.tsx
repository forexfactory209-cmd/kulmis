import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/axios';

const BillingPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [amount, setAmount] = useState('');
  const [funding, setFunding] = useState(false);

  useEffect(() => {
    fetchBillingSummary();
  }, []);

  const fetchBillingSummary = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/billing/summary');
      if (res.data.success) {
        setBalance(res.data.data.balance || 0);
        setTotalPaid(res.data.data.totalPaid || 0);
        setPendingAmount(res.data.data.pendingAmount || 0);
        setInvoices(res.data.data.billingHistory || []);
      }
    } catch (err) {
      console.error('Failed to fetch billing summary', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return alert('Enter a valid amount');
    try {
      setFunding(true);
      const res = await apiClient.post('/billing/add-funds', { amount: Number(amount) });
      if (res.data.success) {
        setBalance(res.data.data.balance);
        setShowAddFunds(false);
        setAmount('');
        alert(`Successfully added $${amount} to your wallet.`);
      }
    } catch (err) {
      console.error('Failed to add funds', err);
      alert('Failed to add funds. Please try again.');
    } finally {
      setFunding(false);
    }
  };

  const handleDownload = (id: string) => {
    alert(`Downloading receipt for ${id} (Simulated)`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24, maxWidth: 800, margin: '0 auto', width: '100%' }}>
      <div>
        <h1 style={{ color: '#0F172A', fontSize: 24, fontWeight: 700 }}>Billing & Payments</h1>
        <p style={{ color: '#64748B', marginTop: 4 }}>Manage your wallet balance and billing history.</p>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Wallet Balance</h3>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', marginTop: 8 }}>${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <button onClick={() => setShowAddFunds(true)} style={{ background: '#10B981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13, transition: 'background 0.2s' }}>Add Funds</button>
          </div>
          <p style={{ fontSize: 13, color: '#64748B' }}>This balance covers your pending payrolls (${pendingAmount.toLocaleString()}) and active contracts.</p>
        </div>
        
        <div style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Total Paid to Date</h3>
            <button style={{ background: 'transparent', color: '#10B981', border: 'none', fontWeight: 600, cursor: 'default', fontSize: 13 }}></button>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', marginTop: 8 }}>${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 12 }}>Total amount paid across all completed milestones and payrolls.</p>
        </div>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', flex: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Billing History</h3>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div style={{ width: 40, height: 40, border: '4px solid #E2E8F0', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Invoice</th>
                <th style={{ padding: '16px 16px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '16px 16px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Worker</th>
                <th style={{ padding: '16px 16px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Amount</th>
                <th style={{ padding: '16px 16px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length > 0 ? invoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '16px 24px', color: '#0F172A', fontWeight: 600, fontSize: 14 }}>INV-{inv.id.substring(0, 8).toUpperCase()}</td>
                  <td style={{ padding: '16px 16px', color: '#64748B', fontSize: 14 }}>{new Date(inv.periodEnd).toLocaleDateString()}</td>
                  <td style={{ padding: '16px 16px', color: '#0F172A', fontSize: 14 }}>{inv.contract?.worker?.firstName} {inv.contract?.worker?.lastName}</td>
                  <td style={{ padding: '16px 16px', color: '#0F172A', fontWeight: 600, fontSize: 14 }}>${inv.totalAmount.toLocaleString()}</td>
                  <td style={{ padding: '16px 16px' }}>
                    <span style={{ 
                      background: inv.status === 'PAID' ? '#ECFDF5' : '#FFFBEB', 
                      color: inv.status === 'PAID' ? '#10B981' : '#F59E0B', 
                      padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 
                    }}>{inv.status}</span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button onClick={() => handleDownload(inv.id)} style={{ background: 'transparent', border: '1px solid #E2E8F0', color: '#0F172A', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Download</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No billing history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showAddFunds && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 16, width: 400 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Add Funds to Wallet</h3>
            <p style={{ fontSize: 14, color: '#64748B', marginBottom: 16 }}>These funds will be stored securely and used to automatically process active payrolls and milestones.</p>
            <input 
              type="number" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              placeholder="Amount in USD" 
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8, marginBottom: 20 }} 
            />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button disabled={funding} onClick={() => setShowAddFunds(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
              <button disabled={funding} onClick={handleAddFunds} style={{ padding: '8px 16px', background: '#10B981', color: 'white', border: 'none', borderRadius: 8, cursor: funding ? 'not-allowed' : 'pointer', opacity: funding ? 0.7 : 1 }}>
                {funding ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default BillingPage;
