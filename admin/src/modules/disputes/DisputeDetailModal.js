import React from 'react';

const DisputeDetailModal = ({ dispute, onClose, onResolve, actionLoading, resolution, setResolution }) => {
  if (!dispute) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Dispute Details</h2>
              <p className="text-sm text-slate-400 font-mono">#{dispute.id.slice(0, 8)}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">

          {/* Status & Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Status</p>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border inline-block ${
                dispute.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                dispute.status === 'UNDER_REVIEW' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {dispute.status.replace('_', ' ')}
              </span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Date Initiated</p>
              <p className="text-sm font-semibold text-slate-300">
                {new Date(dispute.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">Project Information</p>
            <p className="text-base font-bold text-white mb-1">{dispute.project?.title || 'Unknown Project'}</p>
            <p className="text-xs text-slate-400">Project ID: <span className="font-mono">{dispute.projectId}</span></p>
          </div>

          {/* Involved Parties */}
          <section>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Involved Parties</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
                 <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center font-bold text-blue-400 text-sm">
                   {dispute.initiator?.firstName?.[0]}{dispute.initiator?.lastName?.[0]}
                 </div>
                 <div className="overflow-hidden">
                   <p className="text-[10px] text-slate-500 uppercase font-bold">Initiated By ({dispute.initiator?.role})</p>
                   <p className="font-semibold text-white text-sm truncate">{dispute.initiator?.firstName} {dispute.initiator?.lastName}</p>
                   <p className="text-xs text-slate-400 truncate">{dispute.initiator?.email}</p>
                 </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
                 <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center font-bold text-purple-400 text-sm">
                   {dispute.project?.client?.firstName?.[0]}{dispute.project?.client?.lastName?.[0]}
                 </div>
                 <div className="overflow-hidden">
                   <p className="text-[10px] text-slate-500 uppercase font-bold">Client</p>
                   <p className="font-semibold text-white text-sm truncate">{dispute.project?.client?.firstName} {dispute.project?.client?.lastName}</p>
                   <p className="text-xs text-slate-400 truncate">{dispute.project?.client?.email}</p>
                 </div>
              </div>
              {dispute.project?.proposals?.[0]?.freelancer?.user && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
                   <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-400 text-sm">
                     {dispute.project.proposals[0].freelancer.user.firstName?.[0]}{dispute.project.proposals[0].freelancer.user.lastName?.[0]}
                   </div>
                   <div className="overflow-hidden">
                     <p className="text-[10px] text-slate-500 uppercase font-bold">Freelancer</p>
                     <p className="font-semibold text-white text-sm truncate">{dispute.project.proposals[0].freelancer.user.firstName} {dispute.project.proposals[0].freelancer.user.lastName}</p>
                     <p className="text-xs text-slate-400 truncate">{dispute.project.proposals[0].freelancer.user.email}</p>
                   </div>
                </div>
              )}
            </div>
          </section>

          {/* Reason & Evidence */}
          <section>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Dispute Details</h3>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Reason / Complaint</p>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{dispute.reason}</p>
              </div>
              
              {dispute.resolution && (
                <div className="pt-4 border-t border-slate-800">
                  <p className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider mb-1">Admin Resolution Notes</p>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{dispute.resolution}</p>
                </div>
              )}
            </div>
          </section>

          {/* Resolution Input (Only if not resolved) */}
          {dispute.status !== 'RESOLVED' && (
            <section>
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Take Action</h3>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                <label className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">Resolution Notes</label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Describe how this dispute is being resolved..."
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#10B981]/50 focus:border-[#10B981] resize-none placeholder-slate-600 mb-4"
                />
                <button
                  onClick={() => onResolve(dispute.id, 'RESOLVED', resolution)}
                  disabled={actionLoading === dispute.id || !resolution.trim()}
                  className="w-full px-4 py-3 rounded-xl bg-[#10B981] text-white font-bold text-sm hover:bg-emerald-600 transition-colors cursor-pointer shadow-lg shadow-emerald-500/15 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {actionLoading === dispute.id ? 'Resolving...' : 'Resolve Dispute'}
                </button>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};

export default DisputeDetailModal;
