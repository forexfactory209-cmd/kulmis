import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ClientDetailModal from './BusinessDetailModal';
import ClientFormModal from './BusinessFormModal';

const BusinessManagement = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [detailBusiness, setDetailBusiness] = useState(null);
  const [formBusiness, setFormBusiness] = useState(undefined); // undefined=closed, null=add, object=edit
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users', {
        params: {
          role: 'CLIENT',
          profileType: 'BUSINESS',
          status: statusFilter || undefined,
          search: search || undefined
        }
      });
      setBusinesses(res.data.data);
    } catch (err) {
      console.error('Error fetching businesses:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBusinesses();
  };

  const toggleVerification = async (userId, currentVerified) => {
    try {
      setActionLoading(userId);
      const nextVal = !currentVerified;
      await api.put(`/admin/users/${userId}/verify`, { isVerified: nextVal });
      setBusinesses(prev => prev.map(c => c.id === userId ? { ...c, isVerified: nextVal } : c));
      showSuccess(`Business verification updated successfully!`);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const updateStatus = async (userId, currentStatus) => {
    try {
      setActionLoading(userId);
      const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      await api.put(`/admin/users/${userId}/status`, { status: nextStatus });
      setBusinesses(prev => prev.map(c => c.id === userId ? { ...c, status: nextStatus } : c));
      showSuccess(`Business status updated to ${nextStatus}!`);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveBusiness = async (formData, editId) => {
    if (editId) {
      const res = await api.put(`/admin/users/business/${editId}`, formData);
      setBusinesses(prev => prev.map(c => c.id === editId ? res.data.data : c));
      showSuccess('Business account updated successfully!');
    } else {
      const res = await api.post('/admin/users/business', formData);
      setBusinesses(prev => [res.data.data, ...prev]);
      showSuccess('Business account created successfully!');
    }
    setFormBusiness(undefined);
  };

  const handleDelete = async (userId) => {
    try {
      setActionLoading(userId);
      await api.delete(`/admin/users/${userId}`);
      setBusinesses(prev => prev.filter(c => c.id !== userId));
      setDeleteConfirm(null);
      showSuccess('Business account deleted successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Business Management</h1>
          <p className="text-slate-400 text-sm mt-1">Create business login credentials, review companies, and moderate client accounts.</p>
        </div>
        <button
          onClick={() => setFormBusiness(null)}
          className="bg-[#10B981] hover:bg-emerald-600 px-5 py-2.5 rounded-xl text-white font-semibold text-sm cursor-pointer transition-all shadow-lg shadow-emerald-500/15 flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Business
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm">
          {successMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, name or email..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#10B981]/50 focus:border-[#10B981]"
          />
          <button type="submit" className="bg-[#10B981] hover:bg-emerald-600 px-5 py-2.5 rounded-xl text-white font-semibold text-sm cursor-pointer transition-all">
            Search
          </button>
        </form>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Filter Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Clients Table List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <svg className="animate-spin h-8 w-8 text-[#10B981] mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-slate-500 text-xs">Loading business list...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider bg-slate-950/20">
                  <th className="py-4 px-6">Company / Primary Contact</th>
                  <th className="py-4 px-6">Website & Bio</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Verified</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {businesses.length > 0 ? (
                  businesses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/10 transition-colors cursor-pointer" onClick={() => setDetailBusiness(c)}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80'}
                            alt=""
                            className="h-10 w-10 rounded-full border border-slate-700 object-cover"
                          />
                          <div>
                            <p className="font-semibold text-white truncate max-w-[180px]">
                              {c.businessProfile?.companyName || `${c.firstName} ${c.lastName}`}
                            </p>
                            <p className="text-xs text-slate-500">{c.firstName} {c.lastName} ({c.email})</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {c.businessProfile?.website ? (
                          <span className="text-[#10B981] text-xs">{c.businessProfile.website}</span>
                        ) : (
                          <span className="text-slate-500 text-xs">-</span>
                        )}
                        <p className="text-xs text-slate-400 mt-1 max-w-[240px] truncate">
                          {c.businessProfile?.bio || 'No company bio.'}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.isVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-500'
                        }`}>
                          {c.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setDetailBusiness(c)}
                            className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-700 text-slate-400 font-semibold cursor-pointer hover:bg-slate-800 hover:text-white transition-colors"
                            title="Quick View"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          <button
                            onClick={() => navigate(`/businesses/${c.id}`)}
                            className="text-xs px-2.5 py-1.5 rounded-xl border border-blue-500/20 text-blue-400 font-semibold cursor-pointer hover:bg-blue-500/10 transition-colors"
                            title="Full Activity"
                          >
                            Activity
                          </button>
                          <button
                            onClick={() => setFormBusiness(c)}
                            className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-700 text-blue-400 font-semibold cursor-pointer hover:bg-blue-500/10 transition-colors"
                            title="Edit"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button
                            onClick={() => toggleVerification(c.id, c.isVerified)}
                            disabled={actionLoading === c.id}
                            className={`text-xs px-3 py-1.5 rounded-xl border border-slate-700 font-semibold cursor-pointer hover:bg-slate-800 transition-colors ${
                              c.isVerified ? 'text-slate-400' : 'text-[#10B981]'
                            }`}
                          >
                            {c.isVerified ? 'Unverify' : 'Verify'}
                          </button>
                          <button
                            onClick={() => updateStatus(c.id, c.status)}
                            disabled={actionLoading === c.id}
                            className={`text-xs px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition-colors ${
                              c.status === 'ACTIVE'
                                ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/10'
                                : 'bg-[#10B981]/15 text-[#10B981] hover:bg-[#10B981]/25 border border-[#10B981]/10'
                            }`}
                          >
                            {c.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(c)}
                            className="text-xs px-2.5 py-1.5 rounded-xl bg-red-500/10 text-red-400 font-semibold cursor-pointer hover:bg-red-500/20 transition-colors border border-red-500/10"
                            title="Delete"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-500 text-sm">No businesses found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Client Detail Modal */}
      {detailBusiness && (
        <ClientDetailModal client={detailBusiness} onClose={() => setDetailBusiness(null)} />
      )}

      {/* Add/Edit Form Modal */}
      {formBusiness !== undefined && (
        <ClientFormModal
          client={formBusiness}
          onClose={() => setFormBusiness(undefined)}
          onSave={handleSaveBusiness}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Business</h3>
                <p className="text-xs text-slate-500">{deleteConfirm.businessProfile?.companyName || `${deleteConfirm.firstName} ${deleteConfirm.lastName}`}</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-6">Are you sure you want to delete this business account? This action will soft-delete them from the platform. Their historical data will be preserved.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-semibold text-sm hover:bg-slate-800 hover:text-white transition-colors cursor-pointer">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm.id)} disabled={actionLoading === deleteConfirm.id} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors cursor-pointer shadow-lg shadow-red-500/15 disabled:opacity-50">
                {actionLoading === deleteConfirm.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessManagement;
