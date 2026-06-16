import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/axios';

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  category?: string;
  dueDate?: string;
  assignee?: { id: string; firstName: string; lastName: string; avatarUrl?: string };
}

const COLUMNS = [
  { id: 'TODO', title: 'To Do', color: '#94A3B8' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: '#3B82F6' },
  { id: 'REVIEW', title: 'In Review', color: '#F59E0B' },
  { id: 'DONE', title: 'Done', color: '#10B981' },
];

const priorityStyle = (p: string) => {
  switch (p) {
    case 'CRITICAL': return { bg: '#FEF2F2', color: '#EF4444' };
    case 'HIGH': return { bg: '#FFFBEB', color: '#F59E0B' };
    case 'LOW': return { bg: '#F0FDF4', color: '#22C55E' };
    default: return { bg: '#F8FAFC', color: '#64748B' };
  }
};

const TasksKanbanPage: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTask, setEditTask] = useState<TaskItem | null>(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', category: '', dueDate: '', status: 'TODO' });
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [assigneeId, setAssigneeId] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchTeam();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/tasks');
      if (res.data.success) setTasks(res.data.data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeam = async () => {
    try {
      const res = await apiClient.get('/team');
      if (res.data.success) setTeamMembers(res.data.data.team || []);
    } catch {}
  };

  const handleCreate = async () => {
    try {
      const res = await apiClient.post('/tasks', { ...form, assigneeId: assigneeId || undefined });
      if (res.data.success) {
        setTasks([res.data.data, ...tasks]);
        closeModal();
      }
    } catch (err) {
      console.error('Failed to create task', err);
      alert('Failed to create task.');
    }
  };

  const handleUpdate = async () => {
    if (!editTask) return;
    try {
      const res = await apiClient.put(`/tasks/${editTask.id}`, { ...form, assigneeId: assigneeId || undefined });
      if (res.data.success) {
        setTasks(tasks.map(t => t.id === editTask.id ? res.data.data : t));
        closeModal();
      }
    } catch (err) {
      console.error('Failed to update task', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await apiClient.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  const moveTask = async (task: TaskItem, newStatus: string) => {
    try {
      const res = await apiClient.put(`/tasks/${task.id}`, { status: newStatus });
      if (res.data.success) {
        setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
      }
    } catch (err) {
      console.error('Failed to move task', err);
    }
  };

  const openEdit = (task: TaskItem) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      category: task.category || '',
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
      status: task.status,
    });
    setAssigneeId(task.assignee?.id || '');
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditTask(null);
    setForm({ title: '', description: '', priority: 'MEDIUM', category: '', dueDate: '', status: 'TODO' });
    setAssigneeId('');
  };

  const openAdd = (status: string) => {
    setForm({ title: '', description: '', priority: 'MEDIUM', category: '', dueDate: '', status });
    setAssigneeId('');
    setEditTask(null);
    setShowAddModal(true);
  };

  const filteredTasks = search
    ? tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.category?.toLowerCase().includes(search.toLowerCase()))
    : tasks;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#0F172A', fontSize: 24, fontWeight: 700 }}>Task Board</h1>
          <p style={{ color: '#64748B', marginTop: 4 }}>Manage tasks across all projects using Kanban methodology.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 12, top: 10, color: '#94A3B8' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input type="text" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 200, padding: '8px 12px 8px 36px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13 }} />
          </div>
          <button onClick={() => openAdd('TODO')} style={{
            background: '#10B981', color: 'white', border: 'none', padding: '8px 16px',
            borderRadius: 8, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(16,185,129,0.2)'
          }}>+ Add Task</button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <div style={{ width: 40, height: 40, border: '4px solid #E2E8F0', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 24, flex: 1, overflowX: 'auto', paddingBottom: 16 }} className="custom-scrollbar">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', background: '#F8FAFC', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 12, height: 12, borderRadius: 6, background: col.color }} />
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{col.title}</h3>
                    <span style={{ background: '#E2E8F0', color: '#475569', fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 12 }}>
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
                  {colTasks.map(task => {
                    const ps = priorityStyle(task.priority);
                    return (
                      <div key={task.id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                          {task.category && (
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#475569', background: '#F1F5F9', padding: '2px 8px', borderRadius: 4 }}>
                              {task.category}
                            </span>
                          )}
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, marginLeft: 'auto', background: ps.bg, color: ps.color }}>
                            {task.priority}
                          </span>
                        </div>
                        
                        <h4 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>{task.title}</h4>
                        {task.description && <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.4 }}>{task.description}</p>}
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTop: '1px solid #E2E8F0' }}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {/* Move buttons */}
                            {col.id !== 'TODO' && (
                              <button onClick={() => moveTask(task, COLUMNS[COLUMNS.findIndex(c => c.id === col.id) - 1].id)} title="Move left"
                                style={{ background: '#F1F5F9', border: 'none', padding: '4px 6px', borderRadius: 4, cursor: 'pointer', color: '#475569' }}>
                                ←
                              </button>
                            )}
                            {col.id !== 'DONE' && (
                              <button onClick={() => moveTask(task, COLUMNS[COLUMNS.findIndex(c => c.id === col.id) + 1].id)} title="Move right"
                                style={{ background: '#F1F5F9', border: 'none', padding: '4px 6px', borderRadius: 4, cursor: 'pointer', color: '#475569' }}>
                                →
                              </button>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => openEdit(task)} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', padding: 4 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button onClick={() => handleDelete(task.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 4 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                            </button>
                            {task.assignee && (
                              <div style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#E2E8F0', backgroundImage: task.assignee.avatarUrl ? `url(${task.assignee.avatarUrl})` : undefined, backgroundSize: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontWeight: 700, fontSize: 10 }} title={`${task.assignee.firstName} ${task.assignee.lastName}`}>
                                {!task.assignee.avatarUrl && task.assignee.firstName?.charAt(0)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <button onClick={() => openAdd(col.id)} style={{ marginTop: 12, width: '100%', padding: '8px', background: 'transparent', border: '1px dashed #CBD5E1', borderRadius: 8, color: '#64748B', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  + Add Task
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Task Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={closeModal}>
          <div style={{
            background: '#FFFFFF', padding: 24, borderRadius: 16, width: '100%', maxWidth: 500,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>
              {editTask ? 'Edit Task' : 'Create Task'}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Title</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title"
                  style={{ width: '100%', padding: '10px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Task description"
                  style={{ width: '100%', padding: '10px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14 }}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14 }}>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">In Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Category</label>
                  <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Development"
                    style={{ width: '100%', padding: '10px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14 }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Assignee</label>
                <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14 }}>
                  <option value="">Unassigned</option>
                  {teamMembers.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.member?.name || 'Unknown Member'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={{
                padding: '8px 16px', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: 8,
                color: '#475569', fontWeight: 600, fontSize: 14, cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={editTask ? handleUpdate : handleCreate} style={{
                padding: '8px 16px', background: '#10B981', border: 'none', borderRadius: 8,
                color: '#FFFFFF', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 4px rgba(16,185,129,0.2)'
              }}>{editTask ? 'Save Changes' : 'Create Task'}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default TasksKanbanPage;
