import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, chartsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/charts')
        ]);
        
        setStats(statsRes.data.data);
        setCharts(chartsRes.data.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <svg className="animate-spin h-10 w-10 text-[#10B981] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-slate-400 text-sm">Loading dashboard analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center">
        <p className="font-semibold">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-[#10B981] text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors">
          Retry Loading
        </button>
      </div>
    );
  }

  const { stats: metricStats, recentProjects, recentTransactions } = stats;
  const { earningsOverview, topCategories } = charts;

  // Format currency helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  // Cards definitions
  const statCards = [
    { label: 'Total Users', value: metricStats.totalUsers.toLocaleString(), trend: '+18.4%', up: true, subtitle: 'vs last month' },
    { label: 'Freelancers', value: metricStats.totalFreelancers.toLocaleString(), trend: '+18.7%', up: true, subtitle: 'vs last month' },
    { label: 'Clients', value: metricStats.totalClients.toLocaleString(), trend: '+21.3%', up: true, subtitle: 'vs last month' },
    { label: 'Total Earnings', value: formatCurrency(metricStats.totalEarnings), trend: '+24.8%', up: true, subtitle: 'vs last month' },
    { label: 'Completed Projects', value: metricStats.completedProjects.toLocaleString(), trend: '+15.2%', up: true, subtitle: 'vs last month' },
    { label: 'Pending Disputes', value: metricStats.pendingDisputes.toString(), trend: '-8.6%', up: false, subtitle: 'vs last month' },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Dashboard Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time summary of the Somlance platform growth and operations.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-[#10B981] hover:bg-emerald-600 text-white font-semibold rounded-xl px-4 py-2.5 text-sm shadow-lg shadow-emerald-500/10 cursor-pointer transition-all">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Export Report</span>
        </button>
      </div>

      {/* Grid Cards metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all duration-200 shadow-xl shadow-slate-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">{card.label}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                card.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {card.trend}
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-white">{card.value}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">{card.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Visual Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Earnings Overview Line graph */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl shadow-slate-950/20">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Earnings Overview</h3>
              <p className="text-xs text-slate-500">Gross revenue generated through platform fees and escrow payments.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className="h-2 w-2 rounded-full bg-[#10B981]"></span>
                <span>This Month</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-slate-700"></span>
                <span>Last Month</span>
              </div>
            </div>
          </div>
          
          {/* Responsive custom SVG Line graph */}
          <div className="h-64 w-full relative mt-4">
            {earningsOverview && earningsOverview.length > 0 ? (
              <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid horizontal helper lines */}
                <line x1="0" y1="20" x2="100" y2="20" stroke="#334155" strokeWidth="0.1" strokeDasharray="1" />
                <line x1="0" y1="40" x2="100" y2="40" stroke="#334155" strokeWidth="0.1" strokeDasharray="1" />
                <line x1="0" y1="60" x2="100" y2="60" stroke="#334155" strokeWidth="0.1" strokeDasharray="1" />
                <line x1="0" y1="80" x2="100" y2="80" stroke="#334155" strokeWidth="0.1" strokeDasharray="1" />
                
                {/* Area Fill */}
                <path
                  d={`M 0 100 L 0 70 L 20 50 L 40 65 L 60 40 L 80 30 L 100 15 L 100 100 Z`}
                  fill="url(#earningsGradient)"
                />
                {/* Line Path */}
                <path
                  d="M 0 70 L 20 50 L 40 65 L 60 40 L 80 30 L 100 15"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                
                {/* Last Month dotted line */}
                <path
                  d="M 0 85 L 20 70 L 40 75 L 60 55 L 80 48 L 100 32"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="1"
                  strokeDasharray="2"
                />
              </svg>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs">No graph data.</div>
            )}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-slate-500 px-1 pt-2">
              <span>May 1</span>
              <span>May 8</span>
              <span>May 15</span>
              <span>May 22</span>
              <span>May 31</span>
            </div>
          </div>
        </div>

        {/* Transactions Status Donut */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl shadow-slate-950/20">
          <h3 className="text-base font-bold text-white mb-1">Transactions</h3>
          <p className="text-xs text-slate-500 mb-6">Aggregate success and execution rate of all marketplace transactions.</p>
          
          <div className="flex flex-col items-center justify-center gap-6 mt-4">
            <div className="relative h-40 w-40 flex items-center justify-center">
              <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="#1e293b" strokeWidth="2.5" />
                <circle
                  cx="18" cy="18" r="15.91" fill="none"
                  stroke="#10B981" strokeWidth="2.8"
                  strokeDasharray="74 100" strokeDashoffset="0"
                />
                <circle
                  cx="18" cy="18" r="15.91" fill="none"
                  stroke="#F59E0B" strokeWidth="2.8"
                  strokeDasharray="20 100" strokeDashoffset="-74"
                />
                <circle
                  cx="18" cy="18" r="15.91" fill="none"
                  stroke="#EF4444" strokeWidth="2.8"
                  strokeDasharray="6 100" strokeDashoffset="-94"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-white">2,540</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Total</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-950/30 p-2 rounded-xl border border-slate-850">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Completed</span>
                <span className="font-bold text-emerald-400 mt-1 block">1,880</span>
                <span className="text-[9px] text-slate-600 block">(74%)</span>
              </div>
              <div className="bg-slate-950/30 p-2 rounded-xl border border-slate-850">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">In Progress</span>
                <span className="font-bold text-amber-500 mt-1 block">520</span>
                <span className="text-[9px] text-slate-600 block">(20%)</span>
              </div>
              <div className="bg-slate-950/30 p-2 rounded-xl border border-slate-850">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cancelled</span>
                <span className="font-bold text-red-500 mt-1 block">140</span>
                <span className="text-[9px] text-slate-600 block">(6%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Projects Table list */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl shadow-slate-950/20">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Recent Projects</h3>
              <p className="text-xs text-slate-500">Latest active jobs posted by clients.</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pr-2">Project</th>
                  <th className="pb-3 px-2">Client</th>
                  <th className="pb-3 px-2">Amount</th>
                  <th className="pb-3 px-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {recentProjects.length > 0 ? (
                  recentProjects.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-3.5 pr-2 font-medium text-white max-w-[200px] truncate">{p.title}</td>
                      <td className="py-3.5 px-2 text-slate-400">{p.client?.firstName} {p.client?.lastName}</td>
                      <td className="py-3.5 px-2 font-semibold text-slate-200">{formatCurrency(p.budget)}</td>
                      <td className="py-3.5 px-2 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                          p.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-slate-500 text-xs">No recent projects found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Categories & Latest Transactions column */}
        <div className="space-y-6">
          
          {/* Top Categories */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl shadow-slate-950/20">
            <h3 className="text-base font-bold text-white mb-4">Top Categories</h3>
            <div className="space-y-4">
              {topCategories.map((c, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{c.name}</span>
                    <span className="text-slate-400">{c.count} projects ({c.percentage}%)</span>
                  </div>
                  {/* Progress Indicator */}
                  <div className="h-2 w-full bg-slate-850 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#10B981] rounded-full transition-all duration-300"
                      style={{ width: `${c.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Latest Transactions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl shadow-slate-950/20">
            <h3 className="text-base font-bold text-white mb-4">Latest Transactions</h3>
            <div className="space-y-4">
              {recentTransactions.map((tx, idx) => {
                const isDeposit = tx.type === 'DEPOSIT';
                return (
                  <div key={idx} className="flex justify-between items-center gap-3 border-b border-slate-800/30 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black ${
                        isDeposit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {isDeposit ? 'D' : 'W'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          {isDeposit ? 'Escrow Deposit' : 'Freelancer Withdrawal'}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          From {tx.user?.firstName} {tx.user?.lastName}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${
                      isDeposit ? 'text-emerald-400' : 'text-slate-200'
                    }`}>
                      {isDeposit ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
