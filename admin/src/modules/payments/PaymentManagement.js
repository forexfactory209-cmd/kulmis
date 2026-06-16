import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const PaymentManagement = () => {
  const [data, setData] = useState({ transactions: [], escrows: [] });
  const [loading, setLoading] = useState(true);
  const [selectedEscrow, setSelectedEscrow] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [tab, setTab] = useState('escrows');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/transactions');
      setData(res.data.data);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const releaseEscrow = async (id) => {
    try {
      setActionLoading(id);
      await api.post(`/admin/escrow/${id}/release`);
      setData(prev => ({
        ...prev,
        escrows: prev.escrows.map(e => e.id === id ? { ...e, status: 'RELEASED' } : e)
      }));
      setSelectedEscrow(null);
    } catch (err) {
      console.error('Error releasing escrow:', err);
      alert(err.response?.data?.error?.message || 'Failed to release escrow');
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Summary cards
  const totalEscrowHeld = data.escrows.filter(e => e.status === 'HELD').reduce((s, e) => s + (e.amount || 0), 0);
  const totalReleased = data.escrows.filter(e => e.status === 'RELEASED').reduce((s, e) => s + (e.amount || 0), 0);
  const totalTransactions = data.transactions.reduce((s, t) => s + (t.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Payments & Escrow</h1>
        <p className="text-slate-400 text-sm mt-1">Audit escrow deposit holds, withdrawal allocations, and platform transaction ledger books.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <svg className="animate-spin h-10 w-10 text-[#10B981] mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-slate-500 text-sm">Synchronizing ledger records...</span>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Held in Escrow</p>
                  <p className="text-xl font-bold text-amber-400">{formatCurrency(totalEscrowHeld)}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">{data.escrows.filter(e => e.status === 'HELD').length} active holds</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Released</p>
                  <p className="text-xl font-bold text-emerald-400">{formatCurrency(totalReleased)}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">{data.escrows.filter(e => e.status === 'RELEASED').length} completed releases</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Transactions</p>
                  <p className="text-xl font-bold text-blue-400">{formatCurrency(totalTransactions)}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">{data.transactions.length} total entries</p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
            {['escrows', 'transactions'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  tab === t ? 'bg-[#10B981] text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {t === 'escrows' ? 'Escrow Deposits' : 'Transaction Ledger'}
              </button>
            ))}
          </div>

          {/* Escrow Table */}
          {tab === 'escrows' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider bg-slate-950/20">
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {data.escrows.length > 0 ? (
                      data.escrows.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-800/10 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-white max-w-[240px] truncate">{e.project?.title}</td>
                          <td className="py-3.5 px-4 text-slate-400">{e.project?.client?.firstName} {e.project?.client?.lastName}</td>
                          <td className="py-3.5 px-4 text-right font-bold text-emerald-400">{formatCurrency(e.amount)}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              e.status === 'HELD' ? 'bg-amber-500/10 text-amber-400' :
                              e.status === 'RELEASED' ? 'bg-emerald-500/10 text-emerald-400' :
                              'bg-red-500/10 text-red-400'
                            }`}>
                              {e.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right text-xs text-slate-500">{formatDate(e.createdAt)}</td>
                          <td className="py-3.5 px-4 text-right">
                            {e.status === 'HELD' && (
                              <button
                                onClick={() => setSelectedEscrow(e)}
                                className="text-[10px] font-semibold text-amber-500 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                              >
                                Release
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-slate-500 text-xs">No active escrows found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transaction Ledger Table */}
          {tab === 'transactions' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider bg-slate-950/20">
                      <th className="py-3 px-4">Reference</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {data.transactions.length > 0 ? (
                      data.transactions.map((tx) => {
                        const isDeposit = tx.type === 'DEPOSIT' || tx.type === 'PAYMENT';
                        return (
                          <tr
                            key={tx.id}
                            className="hover:bg-slate-800/10 transition-colors cursor-pointer"
                            onClick={() => setSelectedTx(tx)}
                          >
                            <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{tx.reference || tx.id.slice(0, 8).toUpperCase()}</td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-700">
                                  {tx.user?.firstName?.[0]}{tx.user?.lastName?.[0]}
                                </div>
                                <div>
                                  <p className="font-medium text-slate-200 text-xs">{tx.user?.firstName} {tx.user?.lastName}</p>
                                  <p className="text-[9px] text-slate-500 uppercase tracking-widest">{tx.user?.role}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-xs font-semibold">
                              <span className={`px-2 py-0.5 rounded ${
                                tx.type === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-400' :
                                tx.type === 'WITHDRAWAL' ? 'bg-blue-500/10 text-blue-400' :
                                tx.type === 'PAYMENT' ? 'bg-purple-500/10 text-purple-400' :
                                'bg-red-500/10 text-red-400'
                              }`}>
                                {tx.type}
                              </span>
                            </td>
                            <td className={`py-3.5 px-4 text-right font-bold ${isDeposit ? 'text-emerald-400' : 'text-slate-200'}`}>
                              {isDeposit ? '+' : '-'}{formatCurrency(tx.amount)}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                                tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                                'bg-red-500/10 text-red-400'
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right text-xs text-slate-500">{formatDate(tx.createdAt)}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-slate-500 text-xs">No transactions recorded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Manual Release Modal */}
      {selectedEscrow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedEscrow(null)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
            <button onClick={() => setSelectedEscrow(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Manual Escrow Release</h3>
                  <p className="text-xs text-slate-500 font-mono">#{selectedEscrow.id.slice(0, 8)}</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-5 space-y-3">
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Project</p>
                <p className="text-sm font-semibold text-white mt-0.5">{selectedEscrow.project?.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Client Depositor</p>
                  <p className="text-sm text-slate-300 mt-0.5">{selectedEscrow.project?.client?.firstName} {selectedEscrow.project?.client?.lastName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Amount</p>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5">{formatCurrency(selectedEscrow.amount)}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to manually release this escrow? This action will transfer the funds to the accepted freelancer immediately and cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setSelectedEscrow(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-semibold text-sm hover:bg-slate-800 hover:text-white transition-colors cursor-pointer">Cancel</button>
              <button
                onClick={() => releaseEscrow(selectedEscrow.id)}
                disabled={actionLoading === selectedEscrow.id}
                className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors cursor-pointer shadow-lg shadow-amber-500/15 disabled:opacity-50"
              >
                {actionLoading === selectedEscrow.id ? 'Releasing...' : 'Force Release'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedTx(null)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-fade-in">
            <button onClick={() => setSelectedTx(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                selectedTx.type === 'DEPOSIT' || selectedTx.type === 'PAYMENT'
                  ? 'bg-emerald-500/10' : 'bg-blue-500/10'
              }`}>
                <svg className={`h-6 w-6 ${
                  selectedTx.type === 'DEPOSIT' || selectedTx.type === 'PAYMENT'
                    ? 'text-emerald-400' : 'text-blue-400'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Transaction Details</h3>
                <p className="text-xs text-slate-500 font-mono">REF: {selectedTx.reference || selectedTx.id.slice(0, 12).toUpperCase()}</p>
              </div>
            </div>

            {/* Amount highlight */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 mb-5 text-center">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Transaction Amount</p>
              <p className={`text-3xl font-bold ${
                selectedTx.type === 'DEPOSIT' || selectedTx.type === 'PAYMENT' ? 'text-emerald-400' : 'text-blue-400'
              }`}>
                {selectedTx.type === 'DEPOSIT' || selectedTx.type === 'PAYMENT' ? '+' : '-'}{formatCurrency(selectedTx.amount)}
              </p>
            </div>

            {/* Details Grid */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Type</p>
                  <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded ${
                    selectedTx.type === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-400' :
                    selectedTx.type === 'WITHDRAWAL' ? 'bg-blue-500/10 text-blue-400' :
                    selectedTx.type === 'PAYMENT' ? 'bg-purple-500/10 text-purple-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>{selectedTx.type}</span>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Status</p>
                  <span className={`inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    selectedTx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                    selectedTx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>{selectedTx.status}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">User</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-700">
                    {selectedTx.user?.firstName?.[0]}{selectedTx.user?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{selectedTx.user?.firstName} {selectedTx.user?.lastName}</p>
                    <p className="text-[10px] text-slate-500">{selectedTx.user?.email} • {selectedTx.user?.role}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Created</p>
                  <p className="text-sm text-slate-300 mt-0.5">{formatDate(selectedTx.createdAt)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Updated</p>
                  <p className="text-sm text-slate-300 mt-0.5">{selectedTx.updatedAt ? formatDate(selectedTx.updatedAt) : '—'}</p>
                </div>
              </div>

              {selectedTx.description && (
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Description</p>
                  <p className="text-sm text-slate-300 mt-0.5">{selectedTx.description}</p>
                </div>
              )}

              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Transaction ID</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5 break-all">{selectedTx.id}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-semibold text-sm hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
