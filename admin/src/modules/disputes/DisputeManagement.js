import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DisputeDetailModal from './DisputeDetailModal';

const DisputeManagement = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolution, setResolution] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/disputes');
      setDisputes(res.data.data);
    } catch (err) {
      console.error('Error fetching disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateDisputeStatus = async (id, status, resolutionText) => {
    try {
      setActionLoading(id);
      await api.put(`/admin/disputes/${id}`, {
        status,
        resolution: resolutionText || null
      });
      setDisputes(prev =>
        prev.map(d => d.id === id ? { ...d, status, resolution: resolutionText || d.resolution } : d)
      );
      showSuccess(`Dispute ${status === 'RESOLVED' ? 'resolved' : 'updated'} successfully!`);
      setSelectedDispute(null);
      setResolution('');
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

  const getStatusBadge = (status) => {
    const map = {
      PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      UNDER_REVIEW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
    return map[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const filteredDisputes = filterStatus
    ? disputes.filter(d => d.status === filterStatus)
    : disputes;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Dispute Management</h1>
        <p className="text-slate-400 text-sm mt-1">Review, investigate, and resolve project disputes between clients and freelancers.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {successMsg}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Pending', count: disputes.filter(d => d.status === 'PENDING').length, color: 'amber', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Under Review', count: disputes.filter(d => d.status === 'UNDER_REVIEW').length, color: 'blue', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
          { label: 'Resolved', count: disputes.filter(d => d.status === 'RESOLVED').length, color: 'emerald', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{s.label}</p>
                <p className="text-3xl font-black text-white mt-1">{s.count}</p>
              </div>
              <div className={`h-12 w-12 rounded-xl bg-${s.color}-500/10 flex items-center justify-center`}>
                <svg className={`h-6 w-6 text-${s.color}-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-semibold text-slate-300">Filter by Status</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'PENDING', 'UNDER_REVIEW', 'RESOLVED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`text-xs px-4 py-2 rounded-xl font-semibold cursor-pointer transition-all ${
                filterStatus === status
                  ? 'bg-[#10B981] text-white shadow-lg shadow-emerald-500/15'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              {status === '' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Disputes List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <svg className="animate-spin h-8 w-8 text-[#10B981] mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-slate-500 text-xs">Loading disputes...</span>
          </div>
        ) : filteredDisputes.length === 0 ? (
          <div className="text-center py-16">
            <svg className="h-12 w-12 text-slate-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-500 text-sm">No disputes found.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider bg-slate-950/20">
                    <th className="py-4 px-6">Dispute ID</th>
                    <th className="py-4 px-6">Project</th>
                    <th className="py-4 px-6">Initiated By</th>
                    <th className="py-4 px-6">Reason</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-center">Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {filteredDisputes.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-800/10 transition-colors cursor-pointer" onClick={() => setSelectedDispute(d)}>
                      <td className="py-4 px-6">
                        <span className="text-xs font-mono text-slate-500">#{d.id.slice(0, 8)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-white text-sm truncate max-w-[200px]">
                            {d.project?.title || 'Unknown Project'}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Client: {d.project?.client?.firstName} {d.project?.client?.lastName}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#10B981] to-teal-600 flex items-center justify-center text-[10px] text-white font-bold">
                            {d.initiator?.firstName?.[0]}{d.initiator?.lastName?.[0]}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-200">{d.initiator?.firstName} {d.initiator?.lastName}</p>
                            <p className="text-[10px] text-slate-500">{d.initiator?.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-xs text-slate-400 max-w-[200px] truncate">{d.reason}</p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(d.status)}`}>
                          {d.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="text-xs text-slate-500">
                          {new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedDispute(d)}
                            className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-700 text-slate-400 font-semibold cursor-pointer hover:bg-slate-800 hover:text-white transition-colors"
                            title="View Details"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          {d.status === 'PENDING' && (
                            <button
                              onClick={() => updateDisputeStatus(d.id, 'UNDER_REVIEW')}
                              disabled={actionLoading === d.id}
                              className="text-xs px-3 py-1.5 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400 font-semibold cursor-pointer hover:bg-blue-500/20 transition-colors"
                            >
                              Review
                            </button>
                          )}
                          {d.status === 'RESOLVED' && (
                            <span className="text-xs text-slate-600 italic">Closed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="lg:hidden divide-y divide-slate-800/40">
              {filteredDisputes.map((d) => (
                <div key={d.id} className="p-4 space-y-3 cursor-pointer" onClick={() => setSelectedDispute(d)}>
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">
                        {d.project?.title || 'Unknown Project'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">#{d.id.slice(0, 8)}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${getStatusBadge(d.status)}`}>
                      {d.status?.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Initiated By</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-[#10B981] to-teal-600 flex items-center justify-center text-[8px] text-white font-bold">
                          {d.initiator?.firstName?.[0]}{d.initiator?.lastName?.[0]}
                        </div>
                        <span className="text-slate-300">{d.initiator?.firstName} {d.initiator?.lastName}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Date</p>
                      <p className="text-slate-300 mt-1">
                        {new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Reason</p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{d.reason}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                    {d.status === 'PENDING' && (
                      <button
                        onClick={() => updateDisputeStatus(d.id, 'UNDER_REVIEW')}
                        disabled={actionLoading === d.id}
                        className="flex-1 text-xs px-3 py-2 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400 font-semibold cursor-pointer hover:bg-blue-500/20 transition-colors"
                      >
                        Start Review
                      </button>
                    )}
                    {d.status === 'RESOLVED' && (
                      <span className="text-xs text-slate-600 italic py-2">This dispute has been closed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Detail & Resolution Modal */}
      <DisputeDetailModal
        dispute={selectedDispute}
        onClose={() => { setSelectedDispute(null); setResolution(''); }}
        onResolve={updateDisputeStatus}
        actionLoading={actionLoading}
        resolution={resolution}
        setResolution={setResolution}
      />
    </div>
  );
};

export default DisputeManagement;
