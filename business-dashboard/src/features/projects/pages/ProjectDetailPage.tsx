import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../lib/axios';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [newComment, setNewComment] = useState('');
  const [newDiscussion, setNewDiscussion] = useState('');
  const [revisionFeedback, setRevisionFeedback] = useState<{ [key: string]: string }>({});
  const [expandedSteps, setExpandedSteps] = useState<{ [key: string]: boolean }>({});

  const tabs = ['Overview', 'Tasks', 'Files', 'Activity', 'Revisions'];

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/projects/${id}`);
      if (res.data.success) {
        setProject(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch project', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFundEscrow = async () => {
    try {
      setLoading(true);
      const res = await apiClient.post(`/projects/${id}/fund-escrow`);
      if (res.data.success) {
        alert('Escrow funded successfully');
        fetchProject();
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to fund escrow');
    } finally {
      setLoading(false);
    }
  };

  const handlePostDiscussion = async () => {
    if (!newDiscussion.trim()) return;
    try {
      const res = await apiClient.post(`/projects/${id}/discussions`, { content: newDiscussion });
      if (res.data.success) {
        setNewDiscussion('');
        fetchProject();
      }
    } catch (err) {
      console.error('Failed to post discussion', err);
    }
  };

  const handleRequestRevision = async (stepId: string) => {
    const content = revisionFeedback[stepId];
    if (!content?.trim()) {
      alert('Please enter revision instructions');
      return;
    }
    try {
      const res = await apiClient.post(`/projects/${id}/steps/${stepId}/revisions`, { content });
      if (res.data.success) {
        setRevisionFeedback({ ...revisionFeedback, [stepId]: '' });
        alert('Revision requested');
        fetchProject();
      }
    } catch (err) {
      console.error('Failed to request revision', err);
    }
  };

  const handleApproveMilestone = async (stepId: string) => {
    if (!window.confirm('Are you sure you want to approve this milestone? Associated funds may be released.')) return;
    try {
      const res = await apiClient.put(`/progress/projects/${id}/steps/${stepId}/approve`);
      if (res.data.success) {
        alert('Milestone approved successfully!');
        fetchProject();
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to approve milestone');
    }
  };

  if (loading && !project) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div style={{ width: 40, height: 40, border: '4px solid #E2E8F0', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!project) {
    return <div>Project not found.</div>;
  }

  const freelancerInvitation = project.invitations?.find((inv: any) => inv.status === 'ACCEPTED');
  const isProjectBased = freelancerInvitation?.jobType === 'PROJECT_BASED' || (!freelancerInvitation && project.budget > 0);
  const isEscrowFunded = project.escrow?.status === 'HELD';
  const showFundButton = isProjectBased && !isEscrowFunded && freelancerInvitation;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%', overflowY: 'auto' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button 
          onClick={() => navigate('/projects')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Projects
        </button>
      </div>

      {/* Header Card */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>{project.title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 13, color: '#64748B' }}>{project.category || 'General'}</span>
                <span style={{ width: 4, height: 4, borderRadius: 2, background: '#CBD5E1' }} />
                <span style={{ fontSize: 13, color: '#3B82F6', fontWeight: 600, background: '#EFF6FF', padding: '2px 8px', borderRadius: 12 }}>{project.status}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}>
          {showFundButton && (
            <button 
              onClick={handleFundEscrow}
              style={{ padding: '10px 20px', background: '#D97706', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
            >
              Fund Escrow (${project.budget})
            </button>
          )}

          <div>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Progress</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 120, height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${project.progress || 0}%`, height: '100%', background: '#10B981', borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#10B981' }}>{project.progress || 0}%</span>
            </div>
          </div>

          {freelancerInvitation && (
            <div>
              <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Freelancer</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 16, border: '2px solid #FFFFFF',
                  backgroundColor: '#E2E8F0',
                  backgroundImage: freelancerInvitation.freelancer?.avatarUrl ? `url(${freelancerInvitation.freelancer.avatarUrl})` : undefined,
                  backgroundSize: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700
                }}>
                  {!freelancerInvitation.freelancer?.avatarUrl && freelancerInvitation.freelancer?.firstName?.charAt(0)}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{freelancerInvitation.freelancer?.firstName}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', gap: 24, flex: 1, minHeight: 600 }}>
        
        {/* Left Col - Info */}
        <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 16, marginTop: 0 }}>Project Summary</h3>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
              {project.description || 'No description provided.'}
            </p>
            
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Budget</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>${Number(project.budget || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Right Col - Tabs */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          
          <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '0 8px' }}>
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

          <div style={{ padding: 32, flex: 1, overflowY: 'auto' }}>
            {activeTab === 'Overview' && (
              <div>
                <h3 style={{ marginTop: 0, color: '#0F172A' }}>Overview</h3>
                <p style={{ color: '#475569' }}>Welcome to the project dashboard. Use the tabs above to manage tasks, discuss with the freelancer, and track activity.</p>
              </div>
            )}

            {activeTab === 'Tasks' && (
              <div>
                <h3 style={{ marginTop: 0, color: '#0F172A', marginBottom: 24 }}>Milestone Tasks</h3>
                {project.progressSteps?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {project.progressSteps.map((step: any) => {
                      const isExpanded = expandedSteps[step.id];
                      const latestRevision = step.revisions && step.revisions.length > 0 ? step.revisions[step.revisions.length - 1] : null;
                      
                      return (
                      <div key={step.id} style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 20, cursor: 'pointer' }} onClick={() => setExpandedSteps(prev => ({ ...prev, [step.id]: !prev[step.id] }))}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <h4 style={{ margin: 0, fontSize: 16, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}><polyline points="9 18 15 12 9 6"></polyline></svg>
                            {step.name}
                          </h4>
                          <span style={{ 
                            fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 12,
                            background: step.status === 'COMPLETED' ? '#D1FAE5' : step.status === 'IN_PROGRESS' ? '#FEF3C7' : '#F1F5F9',
                            color: step.status === 'COMPLETED' ? '#065F46' : step.status === 'IN_PROGRESS' ? '#92400E' : '#475569'
                          }}>
                            {step.status}
                          </span>
                        </div>
                        
                        {/* Always show latest info */}
                        {step.submissionMsg && !isExpanded && (
                          <div style={{ marginTop: 8, fontSize: 14, color: '#475569', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            <span style={{ fontWeight: 600 }}>Latest Submission:</span> {step.submissionMsg}
                            {step.submissionUrl && (
                              <a href={step.submissionUrl} target="_blank" rel="noreferrer" style={{ marginLeft: 8, color: '#3B82F6', textDecoration: 'none', fontWeight: 500 }}>
                                (View Link/File)
                              </a>
                            )}
                          </div>
                        )}
                        {latestRevision && !isExpanded && (
                          <div style={{ marginTop: 8, fontSize: 14, color: step.status === 'IN_PROGRESS' ? '#DC2626' : '#64748B', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            <span style={{ fontWeight: 600 }}>{step.status === 'IN_PROGRESS' ? 'Active Revision:' : 'Past Revision Feedback:'}</span> "{latestRevision.content}"
                          </div>
                        )}

                        {isExpanded && (
                          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed #E2E8F0' }} onClick={(e) => e.stopPropagation()}>
                            {step.submissionMsg && (
                              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0', marginBottom: 12 }}>
                                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginBottom: 4 }}>Submission Message:</div>
                                <div style={{ fontSize: 14, color: '#0F172A', whiteSpace: 'pre-wrap' }}>{step.submissionMsg}</div>
                                {step.submissionUrl && (
                                  <a href={step.submissionUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#3B82F6', fontSize: 14, fontWeight: 500, textDecoration: 'none', marginTop: 8 }}>
                                    Open Submitted Link/File
                                  </a>
                                )}
                              </div>
                            )}

                            {step.revisions && step.revisions.length > 0 && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                                {(() => {
                                  const rev = step.revisions[step.revisions.length - 1];
                                  return (
                                    <div key={rev.id} style={{ padding: 12, border: '1px solid #FECACA', background: '#FEF2F2', borderRadius: 8 }}>
                                      <div style={{ fontSize: 12, fontWeight: 600, color: '#DC2626', marginBottom: 4 }}>
                                        {step.status === 'IN_PROGRESS' ? 'Active Revision Request' : 'Past Revision Request'}
                                      </div>
                                      <div style={{ fontSize: 14, color: '#7F1D1D', whiteSpace: 'pre-wrap' }}>"{rev.content}"</div>
                                      <div style={{ fontSize: 11, color: '#991B1B', marginTop: 4 }}>{new Date(rev.createdAt).toLocaleString()}</div>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}

                            {step.status === 'IN_REVIEW' && (
                              <div style={{ marginTop: 16 }}>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginTop: 8 }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, color: '#64748B', marginBottom: 8 }}>Request Revision</div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                      <input 
                                        type="text"
                                        placeholder="Explain what needs to be changed..."
                                        value={revisionFeedback[step.id] || ''}
                                        onChange={(e) => setRevisionFeedback({...revisionFeedback, [step.id]: e.target.value})}
                                        style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #E2E8F0' }}
                                      />
                                      <button 
                                        onClick={() => handleRequestRevision(step.id)}
                                        style={{ padding: '8px 16px', background: '#EF4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                      >
                                        Post Revision
                                      </button>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => handleApproveMilestone(step.id)}
                                    style={{ padding: '8px 24px', height: 38, background: '#10B981', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}
                                  >
                                    Approve Milestone
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )})}

                    {/* Removed duplicated logic since everything was condensed above */}
                  </div>
                ) : (
                  <div style={{ color: '#94A3B8' }}>No milestones created yet. Freelancer needs to start the project.</div>
                )}
              </div>
            )}

            {activeTab === 'Files' && (
              <div>
                <h3 style={{ marginTop: 0, color: '#0F172A', marginBottom: 24 }}>Project Files</h3>
                {project.files?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {project.files.map((file: any) => {
                      const isExternalLink = file.fileUrl?.startsWith('http') && !file.fileUrl?.includes('s3.amazonaws.com');
                      return (
                        <div key={file.id} style={{ display: 'flex', alignItems: 'center', padding: 16, border: '1px solid #E2E8F0', borderRadius: 8, gap: 16 }}>
                          {isExternalLink ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                          ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          )}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: '#0F172A' }}>{file.name}</div>
                            <div style={{ fontSize: 12, color: '#64748B' }}>
                              {isExternalLink ? 'Submitted Link' : 'Uploaded File'} by {file.uploader?.firstName} on {new Date(file.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <a href={file.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#10B981', textDecoration: 'none', fontWeight: 600 }}>
                            {isExternalLink ? 'Open Link' : 'Download'}
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ color: '#94A3B8' }}>No files uploaded yet.</div>
                )}
              </div>
            )}

            {/* Discussions tab removed completely */}

            {activeTab === 'Activity' && (
              <div>
                <h3 style={{ marginTop: 0, color: '#0F172A', marginBottom: 24 }}>Project Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {project.activities?.map((act: any) => (
                    <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: '#10B981', marginTop: 6 }} />
                      <div>
                        <div style={{ color: '#0F172A', fontWeight: 600 }}>{act.content}</div>
                        {act.description && (
                          <div style={{ color: '#475569', fontSize: 14, marginTop: 4, whiteSpace: 'pre-wrap' }}>{act.description}</div>
                        )}
                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>{new Date(act.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Revisions' && (
              <div>
                <h3 style={{ marginTop: 0, color: '#0F172A', marginBottom: 24 }}>Revisions History</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {project.progressSteps?.flatMap((step: any) => step.revisions?.map((rev: any) => (
                    <div key={rev.id} style={{ padding: 16, border: '1px solid #FECACA', background: '#FEF2F2', borderRadius: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#DC2626', marginBottom: 8 }}>Revision for: {step.name}</div>
                      <div style={{ color: '#7F1D1D' }}>"{rev.content}"</div>
                      <div style={{ fontSize: 12, color: '#991B1B', marginTop: 8 }}>By {rev.author?.firstName} on {new Date(rev.createdAt).toLocaleString()}</div>
                    </div>
                  )))}
                  {project.progressSteps?.every((step: any) => !step.revisions?.length) && (
                    <div style={{ color: '#94A3B8' }}>No revisions requested.</div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
