import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../lib/axios';

const statusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'IN_PROGRESS': return { bg: '#EFF6FF', text: '#3B82F6', label: 'IN PROGRESS' };
    case 'COMPLETED': return { bg: '#ECFDF5', text: '#10B981', label: 'COMPLETED' };
    case 'CANCELLED': return { bg: '#FEF2F2', text: '#EF4444', label: 'CANCELLED' };
    case 'OPEN': default: return { bg: '#F8FAFC', text: '#64748B', label: 'OPEN' };
  }
};

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [newProject, setNewProject] = useState({ title: '', description: '', budget: '', category: '', deadline: '', assignedWorkerId: '', documentUrl: '' });
  const [workers, setWorkers] = useState<any[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchWorkers();
  }, [search, statusFilter]);

  const fetchWorkers = async () => {
    try {
      const res = await apiClient.get('/contracts');
      if (res.data.success) {
        setWorkers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch workers', err);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await apiClient.get('/projects/my', { params });
      if (res.data.success) {
        setProjects(Array.isArray(res.data.data) ? res.data.data : res.data.data.projects || []);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      if (editingProject) {
        const res = await apiClient.put(`/projects/${editingProject.id}`, {
          ...newProject,
          budget: parseFloat(newProject.budget) || 0
        });
        if (res.data.success) {
          setProjects(projects.map(p => p.id === editingProject.id ? res.data.data : p));
          setIsModalOpen(false);
          setEditingProject(null);
          setNewProject({ title: '', description: '', budget: '', category: '', deadline: '', assignedWorkerId: '', documentUrl: '' });
        }
      } else {
        const res = await apiClient.post('/projects', {
          ...newProject,
          budget: parseFloat(newProject.budget) || 0
        });
        if (res.data.success) {
          setProjects([res.data.data, ...projects]);
          setIsModalOpen(false);
          setNewProject({ title: '', description: '', budget: '', category: '', deadline: '', assignedWorkerId: '', documentUrl: '' });
        }
      }
    } catch (err) {
      console.error('Failed to save project', err);
      alert('Failed to save project.');
    }
  };

  const openEditModal = (project: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
    setNewProject({
      title: project.title || '',
      description: project.description || '',
      budget: project.budget ? project.budget.toString() : '',
      category: project.category || '',
      deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
      assignedWorkerId: project.proposals?.[0]?.freelancerId || '',
      documentUrl: ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to completely delete this project?')) return;
    try {
      const res = await apiClient.delete(`/projects/${id}`);
      if (res.data.success) {
        setProjects(projects.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete project', err);
      alert('Failed to delete project.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingDoc(true);
      const formData = new FormData();
      formData.append('image', file); // Use image key since upload endpoint expects 'image'

      const res = await apiClient.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setNewProject({ ...newProject, documentUrl: res.data.data.url });
      }
    } catch (err) {
      console.error('Failed to upload document', err);
      alert('Failed to upload document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#0F172A', fontSize: 24, fontWeight: 700 }}>Projects</h1>
          <p style={{ color: '#64748B', marginTop: 4 }}>Manage and track all active projects and deliverables.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 12, top: 10, color: '#94A3B8' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 240, padding: '8px 12px 8px 36px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13 }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#0F172A', cursor: 'pointer' }}
          >
            <option value="">All Status</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="OPEN">Open</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <button style={{
            background: '#10B981', color: 'white', border: 'none', padding: '8px 16px',
            borderRadius: 8, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(16,185,129,0.2)'
          }} onClick={() => { setEditingProject(null); setNewProject({ title: '', description: '', budget: '', category: '', deadline: '', assignedWorkerId: '', documentUrl: '' }); setIsModalOpen(true); }}>+ New Project</button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <div style={{ width: 40, height: 40, border: '4px solid #E2E8F0', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24, overflowY: 'auto', paddingBottom: 40 }} className="custom-scrollbar">
          {projects.map((project) => {
            const sc = statusColor(project.status);
            const progressSteps = project.progressSteps || [];
            const completed = progressSteps.filter((s: any) => s.status === 'COMPLETED').length;
            const progress = progressSteps.length > 0 ? Math.round((completed / progressSteps.length) * 100) : (project.status === 'COMPLETED' ? 100 : 0);

            return (
              <div key={project.id} style={{
                background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 20,
                cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onClick={() => navigate(`/projects/${project.id}`)}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ color: '#0F172A', fontSize: 18, fontWeight: 700 }}>{project.title}</h3>
                    <div style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>{project.category || 'Uncategorized'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button 
                      style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', padding: 4 }} 
                      onClick={(e) => openEditModal(project, e)}
                      title="Edit Project"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                    <button 
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 4 }} 
                      onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}
                      title="Delete Project"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, alignItems: 'center' }}>
                    <span style={{ background: sc.bg, color: sc.text, padding: '4px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                      {sc.label}
                    </span>
                    <span style={{ color: '#0F172A', fontWeight: 700 }}>{progress}%</span>
                  </div>
                  <div style={{ height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? '#10B981' : '#3B82F6', borderRadius: 3, transition: 'width 0.3s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Deadline</div>
                    <div style={{ fontSize: 13, color: '#0F172A', fontWeight: 600, marginTop: 2 }}>
                      {project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Budget</div>
                    <div style={{ fontSize: 13, color: '#0F172A', fontWeight: 600, marginTop: 2 }}>${Number(project.budget).toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex' }}>
                    {project.client && (
                      <div style={{
                        width: 32, height: 32, borderRadius: 16, border: '2px solid #FFFFFF',
                        backgroundColor: '#E2E8F0', backgroundImage: project.client.avatarUrl ? `url(${project.client.avatarUrl})` : undefined,
                        backgroundSize: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#475569', fontWeight: 700, fontSize: 12
                      }} title={project.client.firstName}>
                        {!project.client.avatarUrl && project.client.firstName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <button style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer', fontSize: 13, fontWeight: 600 }} onClick={(e) => { e.stopPropagation(); navigate(`/projects/${project.id}`); }}>
                    View Project &rarr;
                  </button>
                </div>
              </div>
            );
          })}
          {projects.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60, color: '#64748B' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" style={{ marginBottom: 16 }}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#475569' }}>No projects yet</p>
              <p style={{ fontSize: 14 }}>Create your first project to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Project Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setIsModalOpen(false)}>
          <div style={{
            background: '#FFFFFF', padding: 24, borderRadius: 16, width: '100%', maxWidth: 500,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Project Title</label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="e.g. Website Redesign"
                  style={{ width: '100%', padding: '10px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14 }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Detailed project requirements..."
                  rows={4}
                  style={{ width: '100%', padding: '10px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14 }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Category</label>
                  <select
                    value={newProject.category}
                    onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14 }}
                  >
                    <option value="">Select Category</option>
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Budget ($)</label>
                  <input
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                    placeholder="e.g. 5000"
                    style={{ width: '100%', padding: '10px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14 }}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Deadline</label>
                <input
                  type="date"
                  value={newProject.deadline}
                  onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Assign Worker (Optional)</label>
                <select
                  value={newProject.assignedWorkerId}
                  onChange={(e) => setNewProject({ ...newProject, assignedWorkerId: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14 }}
                >
                  <option value="">-- No one assigned --</option>
                  {workers.map((contract: any) => (
                    <option key={contract.worker.id} value={contract.worker.id}>
                      {contract.worker.firstName} {contract.worker.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Roles Document / Attachment (Optional)</label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  style={{ width: '100%', padding: '10px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14 }}
                />
                {uploadingDoc && <span style={{ fontSize: 12, color: '#3B82F6' }}>Uploading...</span>}
                {newProject.documentUrl && !uploadingDoc && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#10B981' }}>Document uploaded successfully</div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setIsModalOpen(false)} style={{
                padding: '8px 16px', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: 8,
                color: '#475569', fontWeight: 600, fontSize: 14, cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={handleCreateProject} style={{
                padding: '8px 16px', background: '#10B981', border: 'none', borderRadius: 8,
                color: '#FFFFFF', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 4px rgba(16,185,129,0.2)'
              }}>{editingProject ? 'Save Changes' : 'Create Project'}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ProjectsPage;
