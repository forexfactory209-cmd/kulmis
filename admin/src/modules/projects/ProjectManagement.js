import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ProjectManagement = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/projects', {
        params: {
          status: statusFilter || undefined,
          search: search || undefined
        }
      });
      setProjects(res.data.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const updateProjectStatus = async (projectId, nextStatus) => {
    try {
      setActionLoading(projectId);
      await api.put(`/admin/projects/${projectId}/status`, { status: nextStatus });
      
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: nextStatus } : p));
      showSuccess(`Project status updated to ${nextStatus} successfully!`);
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

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Project Management</h1>
        <p className="text-slate-400 text-sm mt-1">Audit and moderate active client project requirements, deadlines, budgets, and lifecycle states.</p>
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
            placeholder="Search by project title or description..."
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
            <option value="">All Projects</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Projects Table List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <svg className="animate-spin h-8 w-8 text-[#10B981] mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-slate-500 text-xs">Loading project list...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider bg-slate-950/20">
                  <th className="py-4 px-6">Project Title & Description</th>
                  <th className="py-4 px-6">Client Info</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Budget</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {projects.length > 0 ? (
                  projects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-semibold text-white max-w-[260px] truncate">{p.title}</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-[320px] truncate">{p.description}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-medium text-slate-200 text-xs">{p.client?.firstName} {p.client?.lastName}</p>
                        <p className="text-[10px] text-slate-500">{p.client?.email}</p>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400">
                        <span className="bg-slate-950 border border-slate-850 px-2 py-0.5 rounded-md font-semibold">
                          {p.category || 'Unassigned'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-200">{formatCurrency(p.budget)}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                          p.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400' :
                          p.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/projects/${p.id}`)}
                            className="text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition-colors"
                          >
                            View
                          </button>
                          {p.status !== 'CANCELLED' && p.status !== 'COMPLETED' && (
                            <>
                              <button
                                onClick={() => updateProjectStatus(p.id, 'COMPLETED')}
                                disabled={actionLoading === p.id}
                                className="text-xs bg-[#10B981]/15 text-[#10B981] hover:bg-[#10B981]/25 border border-[#10B981]/10 px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition-colors"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => updateProjectStatus(p.id, 'CANCELLED')}
                                disabled={actionLoading === p.id}
                                className="text-xs bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/10 px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-500 text-sm">No projects found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManagement;
