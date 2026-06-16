import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const StaffingManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/staffing/admin');
      setContracts(res.data.data);
    } catch (err) {
      console.error('Error fetching contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  const approveContract = async (id) => {
    try {
      setActionLoading(id);
      await api.put(`/admin/staffing/admin/${id}/approve`);
      setContracts(prev =>
        prev.map(c => c.id === id ? { ...c, status: 'PENDING_FREELANCER_APPROVAL' } : c)
      );
    } catch (err) {
      console.error('Error approving contract:', err);
      alert(err.response?.data?.error?.message || 'Failed to approve contract');
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const getStatusBadge = (status) => {
    const map = {
      PENDING_ADMIN_REVIEW: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      PENDING_FREELANCER_APPROVAL: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20'
    };
    return map[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Staffing Management</h1>
        <p className="text-slate-400 text-sm mt-1">Manage retainer contracts and review staffing requests from clients.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <svg className="animate-spin h-8 w-8 text-[#10B981] mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-slate-500 text-xs">Loading contracts...</span>
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-16">
            <svg className="h-12 w-12 text-slate-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-slate-500 text-sm">No staffing contracts found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider bg-slate-950/20">
                  <th className="py-4 px-6">Client</th>
                  <th className="py-4 px-6">Freelancer</th>
                  <th className="py-4 px-6 text-right">Client Rate</th>
                  <th className="py-4 px-6 text-right">Worker Rate</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {contracts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="py-4 px-6 font-semibold text-white">
                      {c.client?.firstName} {c.client?.lastName}
                    </td>
                    <td className="py-4 px-6">
                      {c.freelancer?.firstName} {c.freelancer?.lastName}
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-emerald-400">{formatCurrency(c.monthlyRate)}/mo</td>
                    <td className="py-4 px-6 text-right font-bold text-slate-300">{formatCurrency(c.workerRate)}/mo</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(c.status)}`}>
                        {c.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {c.status === 'PENDING_ADMIN_REVIEW' && (
                        <button
                          onClick={() => approveContract(c.id)}
                          disabled={actionLoading === c.id}
                          className="text-xs px-3 py-1.5 rounded-xl bg-blue-500/15 text-blue-400 font-semibold hover:bg-blue-500/25 transition-colors border border-blue-500/10"
                        >
                          {actionLoading === c.id ? 'Approving...' : 'Approve & Send'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffingManagement;
