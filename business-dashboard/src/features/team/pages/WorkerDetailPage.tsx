import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../lib/axios';

const WorkerDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [workerData, setWorkerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      apiClient.get(`/team/${id}`).then(res => {
        if (res.data.success) {
          setWorkerData(res.data.data);
        }
      }).catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const tabs = ['Overview', 'Attendance', 'Payroll', 'Tasks', 'Performance', 'Files', 'Notes', 'Timeline'];

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading worker details...</div>;
  }

  if (!workerData || !workerData.worker) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Worker not found</div>;
  }

  const worker = workerData.worker;
  const recentActivity = workerData.recentActivity || [];
  const attendances = workerData.attendances || [];
  const payrollData = workerData.payroll || { contracts: [], payrolls: [] };
  const tasks = workerData.tasks || [];
  const files = workerData.files || [];
  const performance = workerData.performance || { completedProjects: 0, activeProjects: 0, tasksCompleted: 0, rating: 0 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button 
          onClick={() => navigate('/team')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Team
        </button>
      </div>

      {/* Top Header Card */}
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 80, height: 80, borderRadius: 40, backgroundImage: `url(${worker.avatarUrl || 'https://i.pravatar.cc/150?u=' + worker.id})`, backgroundSize: 'cover', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {!worker.avatarUrl && <span style={{ fontSize: 24, fontWeight: 700, color: '#475569' }}>{worker.firstName?.charAt(0)}</span>}
              </div>
              <div style={{ position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, background: '#10B981', borderRadius: '50%', border: '2px solid #FFFFFF' }} title="Online" />
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
                {worker.firstName} {worker.lastName}
              </h2>
              <p style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>{worker.role || 'Team Member'}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                <span style={{ fontSize: 12, color: '#475569', background: '#F1F5F9', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>Active</span>
              </div>
            </div>
          </div>
          
          <div style={{ height: 60, width: 1, background: '#E2E8F0' }} />
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Attendance</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'baseline', gap: 4 }}>
              95% <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Rate</span>
            </div>
          </div>
          
          <div style={{ height: 60, width: 1, background: '#E2E8F0' }} />
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Tasks Completed</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>{performance.tasksCompleted}</div>
          </div>
          
          <div style={{ height: 60, width: 1, background: '#E2E8F0' }} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Projects</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>{performance.completedProjects + performance.activeProjects}</div>
          </div>

          <div style={{ height: 60, width: 1, background: '#E2E8F0' }} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Rating</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 4 }}>
              {performance.rating} <svg width="20" height="20" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area with Tabs */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        {/* Tabs Header */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '0 8px', overflowX: 'auto' }} className="custom-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: activeTab === tab ? 600 : 500,
                color: activeTab === tab ? '#10B981' : '#64748B',
                borderBottom: activeTab === tab ? '2px solid #10B981' : '2px solid transparent',
                transition: 'all 0.2s', whiteSpace: 'nowrap'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: 32, flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
          {activeTab === 'Overview' && (
            <div style={{ display: 'flex', gap: 40 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <h3 style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8 }}>Department</h3>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>Video Editing</div>
                </div>
                <div>
                  <h3 style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8 }}>Reports To</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 12, backgroundImage: `url(https://i.pravatar.cc/150?u=10)`, backgroundSize: 'cover' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>You</span>
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8 }}>Email</h3>
                  <div style={{ fontSize: 14, color: '#0F172A' }}>{worker.email}</div>
                </div>
                <div>
                  <h3 style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8 }}>Phone</h3>
                  <div style={{ fontSize: 14, color: '#0F172A' }}>+252 63 123 4567</div>
                </div>
                <div>
                  <h3 style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8 }}>Location</h3>
                  <div style={{ fontSize: 14, color: '#0F172A' }}>Hargeisa, Somaliland</div>
                </div>
              </div>

              <div style={{ width: 1, background: '#E2E8F0' }} />

              <div style={{ flex: 3 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>Recent Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {recentActivity.length > 0 ? recentActivity.map((act: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 16, background: `${act.bg}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={act.bg} strokeWidth="2"><path d={act.icon} strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', borderBottom: i === recentActivity.length - 1 ? 'none' : '1px solid #E2E8F0', paddingBottom: i === recentActivity.length - 1 ? 0 : 20 }}>
                        <div style={{ fontSize: 14, color: '#0F172A', fontWeight: 500 }}>{act.title}</div>
                        <div style={{ fontSize: 13, color: '#94A3B8' }}>{act.time}</div>
                      </div>
                    </div>
                  )) : (
                    <div style={{ color: '#94A3B8', fontSize: 14 }}>No recent activity found.</div>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'Attendance' && (
            <div>
              <h3 style={{ marginTop: 0, color: '#0F172A', marginBottom: 24 }}>Attendance Log</h3>
              {attendances.length > 0 ? (
                <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#F8FAFC' }}>
                      <tr>
                        <th style={{ padding: '16px 24px', color: '#64748B', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>Date</th>
                        <th style={{ padding: '16px 24px', color: '#64748B', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendances.map((att: any) => (
                        <tr key={att.id}>
                          <td style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', color: '#0F172A' }}>{new Date(att.date).toLocaleDateString()}</td>
                          <td style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0' }}>
                            <span style={{ padding: '4px 12px', background: att.status === 'PRESENT' ? '#D1FAE5' : '#FEE2E2', color: att.status === 'PRESENT' ? '#065F46' : '#991B1B', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{att.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ color: '#94A3B8' }}>No attendance records found.</div>
              )}
            </div>
          )}

          {activeTab === 'Payroll' && (
            <div>
              <h3 style={{ marginTop: 0, color: '#0F172A', marginBottom: 24 }}>Contracts & Payroll</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {payrollData.contracts.length > 0 ? payrollData.contracts.map((contract: any) => (
                  <div key={contract.id} style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h4 style={{ margin: 0, color: '#0F172A' }}>{contract.employmentType} Contract</h4>
                      <span style={{ padding: '4px 12px', background: contract.status === 'ACTIVE' ? '#D1FAE5' : '#F1F5F9', color: contract.status === 'ACTIVE' ? '#065F46' : '#475569', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{contract.status}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                      <div>
                        <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Salary / Rate</div>
                        <div style={{ fontSize: 18, color: '#0F172A', fontWeight: 700 }}>${contract.monthlySalary}/mo</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Start Date</div>
                        <div style={{ fontSize: 16, color: '#0F172A' }}>{new Date(contract.startDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Schedule</div>
                        <div style={{ fontSize: 16, color: '#0F172A' }}>{Array.isArray(contract.workingDays) ? contract.workingDays.join(', ') : contract.workingDays || 'N/A'} ({contract.workingHours} hrs/day)</div>
                      </div>
                    </div>
                    
                    <h5 style={{ margin: '0 0 12px 0', color: '#0F172A' }}>Recent Payrolls</h5>
                    {contract.payrolls && contract.payrolls.length > 0 ? (
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                        <thead style={{ background: '#F8FAFC' }}>
                          <tr>
                            <th style={{ padding: '12px', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>Period</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>Amount</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contract.payrolls.map((p: any) => (
                            <tr key={p.id}>
                              <td style={{ padding: '12px', borderBottom: '1px solid #E2E8F0' }}>{new Date(p.periodStart).toLocaleDateString()} - {new Date(p.periodEnd).toLocaleDateString()}</td>
                              <td style={{ padding: '12px', borderBottom: '1px solid #E2E8F0', fontWeight: 600 }}>${p.amount}</td>
                              <td style={{ padding: '12px', borderBottom: '1px solid #E2E8F0' }}>{p.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ color: '#94A3B8', fontSize: 14 }}>No payroll records for this contract.</div>
                    )}
                  </div>
                )) : (
                  <div style={{ color: '#94A3B8' }}>No contracts found for this worker.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Tasks' && (
            <div>
              <h3 style={{ marginTop: 0, color: '#0F172A', marginBottom: 24 }}>Assigned Projects & Milestones</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {tasks.length > 0 ? tasks.map((proj: any) => (
                  <div key={proj.id} style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h4 style={{ margin: 0, color: '#0F172A', fontSize: 18 }}>{proj.title}</h4>
                      <span style={{ padding: '4px 12px', background: proj.status === 'COMPLETED' ? '#D1FAE5' : '#FEF3C7', color: proj.status === 'COMPLETED' ? '#065F46' : '#92400E', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{proj.status}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {proj.progressSteps && proj.progressSteps.length > 0 ? proj.progressSteps.map((step: any) => (
                        <div key={step.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                          <div style={{ color: '#0F172A', fontWeight: 500 }}>{step.name}</div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: step.status === 'COMPLETED' ? '#10B981' : '#64748B' }}>{step.status}</div>
                        </div>
                      )) : (
                        <div style={{ color: '#94A3B8', fontSize: 14 }}>No milestones in this project.</div>
                      )}
                    </div>
                  </div>
                )) : (
                  <div style={{ color: '#94A3B8' }}>No projects assigned yet.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Performance' && (
            <div>
              <h3 style={{ marginTop: 0, color: '#0F172A', marginBottom: 24 }}>Performance Analytics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                <div style={{ background: '#F8FAFC', padding: 24, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 14, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Projects Completed</div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: '#0F172A' }}>{performance.completedProjects}</div>
                </div>
                <div style={{ background: '#F8FAFC', padding: 24, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 14, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Tasks Completed</div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: '#0F172A' }}>{performance.tasksCompleted}</div>
                </div>
                <div style={{ background: '#F8FAFC', padding: 24, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 14, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Average Rating</div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {performance.rating} <svg width="24" height="24" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Files' && (
            <div>
              <h3 style={{ marginTop: 0, color: '#0F172A', marginBottom: 24 }}>Uploaded Files</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {files.length > 0 ? files.map((file: any) => (
                  <div key={file.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, border: '1px solid #E2E8F0', borderRadius: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>{file.name}</div>
                        <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{new Date(file.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <a href={file.url} target="_blank" rel="noreferrer" style={{ padding: '8px 16px', background: '#F1F5F9', color: '#0F172A', textDecoration: 'none', borderRadius: 6, fontWeight: 500, fontSize: 14 }}>
                      Download
                    </a>
                  </div>
                )) : (
                  <div style={{ color: '#94A3B8' }}>No files uploaded yet.</div>
                )}
              </div>
            </div>
          )}

          {['Notes', 'Timeline'].includes(activeTab) && (
            <div style={{ color: '#64748B', textAlign: 'center', padding: 40 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" style={{ marginBottom: 16 }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <div>{activeTab} feature is coming soon!</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerDetailPage;
