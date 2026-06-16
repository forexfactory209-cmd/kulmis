import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClientActivity } from '../../services/adminService';

const ClientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getClientActivity(id);
      setData(res.data || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#10B981]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-slate-400 font-medium">Loading client details...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl text-white font-bold mb-2">Client Not Found</h2>
        <button onClick={() => navigate('/clients')} className="text-[#10B981] hover:underline cursor-pointer">Return to Clients</button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'IN_PROGRESS': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CANCELLED': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate(-1)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors mt-1 cursor-pointer">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-2xl font-bold text-purple-400 border border-purple-500/20">
              {data.firstName?.[0]}{data.lastName?.[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{data.firstName} {data.lastName}</h1>
              <p className="text-sm text-slate-400">{data.email}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${data.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {data.status || 'ACTIVE'}
                </span>
                <span className="text-xs text-slate-500">Member since {new Date(data.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {data.stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Projects', value: data.stats.totalProjects, icon: '📁' },
            { label: 'Active', value: data.stats.activeProjects, icon: '🔄' },
            { label: 'Completed', value: data.stats.completedProjects, icon: '✅' },
            { label: 'Total Spent', value: `$${data.stats.totalSpent?.toLocaleString()}`, icon: '💰' },
            { label: 'Reviews Given', value: data.stats.totalReviews, icon: '⭐' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">{s.icon} {s.label}</p>
              <p className="text-xl font-bold text-white mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-800">
        {['projects', 'transactions', 'reviews'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition-colors relative cursor-pointer ${
              activeTab === tab ? 'text-[#10B981]' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#10B981] rounded-t-full"></span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'projects' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950/50 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Budget</th>
                  <th className="px-6 py-4">Freelancer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Proposals</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {!data.projects || data.projects.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No projects found.</td></tr>
                ) : (
                  data.projects.map(p => {
                    const freelancer = p.proposals?.[0]?.freelancer?.user;
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{p.title}</div>
                          <div className="text-xs text-slate-500">{p.category}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">${p.budget}</td>
                        <td className="px-6 py-4">
                          {freelancer ? (
                            <span className="text-white text-xs">{freelancer.firstName} {freelancer.lastName}</span>
                          ) : (
                            <span className="text-slate-500 text-xs">Not assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(p.status)}`}>
                            {p.status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs">{p._count?.proposals || 0}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => navigate(`/projects/${p.id}`)} className="text-slate-400 hover:text-[#10B981] transition-colors p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer" title="View">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950/50 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {!data.transactions || data.transactions.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No transactions found.</td></tr>
                ) : (
                  data.transactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-300">{t.reference || t.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 font-semibold text-white">${Number(t.amount).toLocaleString()}</td>
                      <td className="px-6 py-4"><span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs">{t.type}</span></td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium ${t.status === 'COMPLETED' ? 'text-emerald-400' : t.status === 'PENDING' ? 'text-amber-400' : 'text-red-400'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">{new Date(t.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {!data.reviewsGiven || data.reviewsGiven.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">No reviews given.</div>
            ) : (
              data.reviewsGiven.map(r => (
                <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm text-white font-medium">Review for {r.reviewee?.firstName} {r.reviewee?.lastName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Project: {r.project?.title}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'text-amber-400' : 'text-slate-700'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-300">{r.comment || 'No comment provided.'}</p>
                  <p className="text-xs text-slate-500 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetailPage;
