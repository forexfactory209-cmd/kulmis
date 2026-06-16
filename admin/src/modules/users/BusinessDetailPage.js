import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const BusinessDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/users/business/${id}/activity`);
        setData(res.data.data);
      } catch (err) {
        console.error('Error fetching business activity:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <svg className="animate-spin h-8 w-8 text-[#10B981] mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-slate-500 text-sm">Loading business activity...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-32 text-slate-500">
        <p className="text-lg font-semibold">Business not found</p>
        <button onClick={() => navigate('/businesses')} className="mt-4 text-[#10B981] hover:underline text-sm cursor-pointer">← Back to Businesses</button>
      </div>
    );
  }

  const { user, businessProfile, stats, contracts, projects, recentAttendance, workers } = data;

  const statCards = [
    { label: 'Total Spend', value: `$${stats.totalSpend.toLocaleString()}`, color: '#10B981', bg: 'bg-emerald-500/10' },
    { label: 'Active Contracts', value: stats.activeContracts, color: '#3B82F6', bg: 'bg-blue-500/10' },
    { label: 'Total Workers', value: stats.totalWorkers, color: '#8B5CF6', bg: 'bg-purple-500/10' },
    { label: 'Paid Payrolls', value: stats.paidPayrolls, color: '#F59E0B', bg: 'bg-amber-500/10' },
    { label: 'Pending Payrolls', value: stats.pendingPayrolls, color: '#EF4444', bg: 'bg-red-500/10' },
    { label: 'Total Contracts', value: stats.totalContracts, color: '#06B6D4', bg: 'bg-cyan-500/10' },
  ];

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'workers', label: `Workers (${workers?.length || 0})` },
    { key: 'contracts', label: `Contracts (${contracts.length})` },
    { key: 'projects', label: `Projects (${projects.length})` },
    { key: 'attendance', label: `Attendance (${recentAttendance.length})` },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/businesses')} className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex items-center gap-4 flex-1">
          <img
            src={user.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80'}
            alt=""
            className="h-16 w-16 rounded-2xl border-2 border-[#10B981] object-cover shadow-lg"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">{businessProfile.companyName || `${user.firstName} ${user.lastName}`}</h1>
            <p className="text-sm text-slate-400">{user.email} • {businessProfile.industry || 'No industry'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {user.status}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user.isVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-500'}`}>
                {user.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
              </span>
              <span className="text-[10px] text-slate-500">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold mt-2" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="flex border-b border-slate-800">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3.5 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'text-[#10B981] border-b-2 border-[#10B981] bg-slate-800/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Company Info */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Company Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Company Name</p>
                    <p className="text-white font-semibold mt-1">{businessProfile.companyName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Industry</p>
                    <p className="text-white font-semibold mt-1">{businessProfile.industry || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Contact Name</p>
                    <p className="text-white font-semibold mt-1">{user.firstName} {user.lastName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Email</p>
                    <p className="text-white font-semibold mt-1">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Quick Summary */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Financial Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-sm text-slate-400">Total Spend</span>
                    <span className="text-sm font-bold text-emerald-400">${stats.totalSpend.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-sm text-slate-400">Active Contracts</span>
                    <span className="text-sm font-bold text-blue-400">{stats.activeContracts}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-sm text-slate-400">Total Workers Hired</span>
                    <span className="text-sm font-bold text-purple-400">{stats.totalWorkers}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-sm text-slate-400">Paid Payrolls</span>
                    <span className="text-sm font-bold text-amber-400">{stats.paidPayrolls}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-400">Pending Payrolls</span>
                    <span className="text-sm font-bold text-red-400">{stats.pendingPayrolls}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Workers Tab */}
          {activeTab === 'workers' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Worker</th>
                    <th className="py-3 px-4">Total Earned</th>
                    <th className="py-3 px-4 text-center">Active Jobs</th>
                    <th className="py-3 px-4 text-center">Completed Jobs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {workers && workers.length > 0 ? workers.map(w => (
                    <tr key={w.id} className="hover:bg-slate-800/10 transition-colors cursor-pointer" onClick={() => navigate(`/freelancers/${w.id}`)}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={w.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=50&h=50&q=80'} alt="" className="h-8 w-8 rounded-full object-cover border border-slate-700" />
                          <div>
                            <p className="text-white font-semibold text-sm">{w.firstName} {w.lastName}</p>
                            <p className="text-[10px] text-slate-500">{w.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-semibold">${w.totalEarned.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center text-blue-400">{w.activeJobs}</td>
                      <td className="py-3 px-4 text-center text-slate-300">{w.completedJobs}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="text-center py-8 text-slate-500 text-sm">No workers found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Contracts Tab */}
          {activeTab === 'contracts' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Worker</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Monthly Salary</th>
                    <th className="py-3 px-4">Platform Fee</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Start Date</th>
                    <th className="py-3 px-4 text-center">Payrolls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {contracts.length > 0 ? contracts.map(c => (
                    <tr key={c.id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={c.worker.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=50&h=50&q=80'} alt="" className="h-8 w-8 rounded-full object-cover border border-slate-700" />
                          <div>
                            <p className="text-white font-semibold text-sm">{c.worker.firstName} {c.worker.lastName}</p>
                            <p className="text-[10px] text-slate-500">{c.worker.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{c.employmentType}</td>
                      <td className="py-3 px-4 text-emerald-400 font-semibold">${c.monthlySalary.toLocaleString()}</td>
                      <td className="py-3 px-4 text-amber-400">${c.platformFee.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : c.status === 'PENDING_ADMIN_REVIEW' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-sm">{new Date(c.startDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-center text-slate-300">{c.payrollCount}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" className="text-center py-8 text-slate-500 text-sm">No contracts found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Budget</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Proposals</th>
                    <th className="py-3 px-4">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {projects.length > 0 ? projects.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/10 transition-colors cursor-pointer" onClick={() => navigate(`/projects/${p.id}`)}>
                      <td className="py-3 px-4 text-white font-semibold">{p.title}</td>
                      <td className="py-3 px-4 text-slate-300">{p.category || 'N/A'}</td>
                      <td className="py-3 px-4 text-emerald-400 font-semibold">${Number(p.budget).toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                          p.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400' :
                          p.status === 'OPEN' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-slate-500/10 text-slate-400'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{p.proposals?.length || 0}</td>
                      <td className="py-3 px-4 text-slate-400 text-sm">{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" className="text-center py-8 text-slate-500 text-sm">No projects found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Worker</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Clock In</th>
                    <th className="py-3 px-4">Clock Out</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Leave Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {recentAttendance.length > 0 ? recentAttendance.map(a => (
                    <tr key={a.id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-3 px-4 text-white font-semibold">{a.worker.firstName} {a.worker.lastName}</td>
                      <td className="py-3 px-4 text-slate-300">{new Date(a.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-slate-300">{a.clockIn ? new Date(a.clockIn).toLocaleTimeString() : '-'}</td>
                      <td className="py-3 px-4 text-slate-300">{a.clockOut ? new Date(a.clockOut).toLocaleTimeString() : '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          a.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400' :
                          a.status === 'LATE' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-sm">{a.leaveReason || '-'}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" className="text-center py-8 text-slate-500 text-sm">No attendance records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessDetailPage;
