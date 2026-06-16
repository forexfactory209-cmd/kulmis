import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategoryDetail } from '../../services/adminService';

const CategoryDetailPage = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Projects');

  const tabs = ['Projects', 'Freelancers', 'Clients'];

  useEffect(() => {
    if (name) fetchData();
  }, [name]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getCategoryDetail(name);
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <svg className="animate-spin h-8 w-8 text-[#10B981]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-slate-400 py-20">Category not found.</div>;
  }

  const { stats, projects, freelancers, clients } = data;

  const statCards = [
    { label: 'Total Projects', value: stats.totalProjects, icon: '📁', color: 'from-blue-500/20 to-blue-600/10', textColor: 'text-blue-400' },
    { label: 'Active Projects', value: stats.activeProjects, icon: '🚀', color: 'from-emerald-500/20 to-emerald-600/10', textColor: 'text-emerald-400' },
    { label: 'Completed', value: stats.completedProjects, icon: '✅', color: 'from-purple-500/20 to-purple-600/10', textColor: 'text-purple-400' },
    { label: 'Freelancers', value: stats.totalFreelancers, icon: '👤', color: 'from-amber-500/20 to-amber-600/10', textColor: 'text-amber-400' },
    { label: 'Clients', value: stats.totalClients, icon: '🏢', color: 'from-pink-500/20 to-pink-600/10', textColor: 'text-pink-400' },
    { label: 'Total Budget', value: `$${stats.totalBudget.toLocaleString()}`, icon: '💰', color: 'from-cyan-500/20 to-cyan-600/10', textColor: 'text-cyan-400' },
  ];

  const getStatusBadge = (status) => {
    const map = {
      IN_PROGRESS: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400' },
      COMPLETED: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400' },
      PENDING: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400' },
      OPEN: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400' },
      CLOSED: { bg: 'bg-slate-500/10 border-slate-500/20', text: 'text-slate-400' },
      ACTIVE: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400' },
    };
    const s = map[status] || map.PENDING;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${s.bg} ${s.text}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${s.text.replace('text-', 'bg-')}`}></span>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/categories')} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                <span className="text-emerald-400 font-bold text-lg">{data.name?.[0]?.toUpperCase()}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{data.name}</h1>
                <p className="text-sm text-slate-400 mt-0.5">Category overview and analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className={`bg-gradient-to-br ${card.color} border border-slate-800 rounded-2xl p-5`}>
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className={`text-2xl font-bold ${card.textColor}`}>{card.value}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-800 px-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3.5 text-sm font-medium transition-all border-b-2 cursor-pointer ${
                activeTab === tab
                  ? 'text-[#10B981] border-[#10B981]'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              {tab} ({tab === 'Projects' ? projects.length : tab === 'Freelancers' ? freelancers.length : clients.length})
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Projects Tab */}
          {activeTab === 'Projects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.length > 0 ? projects.map(proj => (
                <div
                  key={proj.id}
                  onClick={() => navigate(`/projects/${proj.id}`)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-white font-semibold group-hover:text-[#10B981] transition-colors text-sm">{proj.title}</h4>
                    {getStatusBadge(proj.status)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <span>Budget: <span className="text-emerald-400 font-semibold">${Number(proj.budget).toLocaleString()}</span></span>
                    <span className="text-slate-700">•</span>
                    <span>{new Date(proj.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-3">
                    <div className="flex items-center gap-2">
                      {proj.client?.avatarUrl ? (
                        <img src={proj.client.avatarUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                          {proj.client?.firstName?.[0] || '?'}
                        </div>
                      )}
                      <span className="text-xs text-slate-400">{proj.client?.firstName} {proj.client?.lastName}</span>
                    </div>
                    {proj.freelancer && (
                      <div className="flex items-center gap-2">
                        {proj.freelancer.avatarUrl ? (
                          <img src={proj.freelancer.avatarUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-400">
                            {proj.freelancer.firstName?.[0]}
                          </div>
                        )}
                        <span className="text-xs text-slate-400">{proj.freelancer.firstName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="col-span-3 text-center text-slate-500 py-8">No projects in this category.</div>
              )}
            </div>
          )}

          {/* Freelancers Tab */}
          {activeTab === 'Freelancers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {freelancers.length > 0 ? freelancers.map(f => (
                <div
                  key={f.id}
                  onClick={() => navigate(`/freelancers/${f.id}`)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all cursor-pointer group flex items-center gap-4"
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0">
                    {f.avatarUrl ? (
                      <img src={f.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <span className="text-emerald-400 font-bold text-lg">{f.firstName?.[0]}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold group-hover:text-[#10B981] transition-colors">{f.firstName} {f.lastName}</h4>
                    <p className="text-xs text-slate-500 mt-1">Freelancer</p>
                  </div>
                  <svg className="h-4 w-4 text-slate-600 ml-auto group-hover:text-slate-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </div>
              )) : (
                <div className="col-span-3 text-center text-slate-500 py-8">No freelancers working in this category.</div>
              )}
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === 'Clients' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.length > 0 ? clients.map(c => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/clients/${c.id}`)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all cursor-pointer group flex items-center gap-4"
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    {c.avatarUrl ? (
                      <img src={c.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <span className="text-blue-400 font-bold text-lg">{c.firstName?.[0]}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold group-hover:text-[#10B981] transition-colors">{c.firstName} {c.lastName}</h4>
                    <p className="text-xs text-slate-500 mt-1">Client</p>
                  </div>
                  <svg className="h-4 w-4 text-slate-600 ml-auto group-hover:text-slate-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </div>
              )) : (
                <div className="col-span-3 text-center text-slate-500 py-8">No clients with projects in this category.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailPage;
