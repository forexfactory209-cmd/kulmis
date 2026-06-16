import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJobsMonitoring } from '../../services/adminService';

const JobsMonitoringPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getJobsMonitoring();
      setJobs(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'IN_PROGRESS': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CANCELLED': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Jobs Monitoring</h1>
          <p className="text-sm text-slate-400 mt-1">Monitor active projects, milestones, and progress.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search jobs..." 
                className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] w-64 transition-all"
              />
            </div>
            <select className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]">
              <option value="all">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Job Details</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Proposals</th>
                <th className="px-6 py-4">Budget</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-[#10B981]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading jobs...
                    </div>
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No jobs found.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white mb-1">{job.title}</div>
                      <div className="text-xs text-slate-500 line-clamp-1 max-w-xs">{job.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-700">
                          {job.client?.firstName?.[0]}{job.client?.lastName?.[0]}
                        </div>
                        <div>
                          <div className="font-medium text-white text-xs">{job.client?.firstName} {job.client?.lastName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        {job._count?.proposals || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      ${job.budget}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => navigate(`/projects/${job.id}`)} className="text-slate-400 hover:text-[#10B981] transition-colors p-1.5 rounded-lg hover:bg-slate-800" title="View details">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobsMonitoringPage;
