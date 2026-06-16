import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../lib/axios';

const TalentProfileDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Invite Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [inviteJobType, setInviteJobType] = useState('PROJECT_BASED');
  const [invitePayment, setInvitePayment] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');

  const tabs = ['Overview', 'Portfolio', 'Work History', 'Reviews', 'Documents', 'Activity Timeline'];

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/freelancers/${id}`);
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch freelancer profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = async () => {
    if (!profile) return;
    try {
      const res = await apiClient.post('/messages/conversations/create', { participantId: profile.userId });
      if (res.data.success) {
        navigate(`/messages?convo=${res.data.data.id}`);
      }
    } catch (err) {
      console.error('Failed to create conversation', err);
    }
  };

  const openInviteModal = async () => {
    setInviteModalOpen(true);
    try {
      const res = await apiClient.get('/projects/my');
      if (res.data.success) {
        setProjects(res.data.data.projects || []);
      }
    } catch (err) {
      console.error('Failed to fetch projects for invite modal', err);
    }
  };

  const handleSendInvite = async () => {
    if (!profile) return;
    try {
      await apiClient.post('/invitations', {
        freelancerId: profile.userId,
        projectId: selectedProjectId || undefined,
        jobType: inviteJobType,
        paymentAmount: invitePayment ? parseFloat(invitePayment) : undefined,
        message: inviteMessage
      });
      alert('Invitation sent successfully!');
      setInviteModalOpen(false);
      setInviteJobType('PROJECT_BASED');
      setInvitePayment('');
      setInviteMessage('');
    } catch (err) {
      console.error('Failed to send invite', err);
      alert('Failed to send invitation.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div style={{ width: 40, height: 40, border: '4px solid #E2E8F0', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!profile) {
    return <div>Freelancer profile not found.</div>;
  }

  const { user, title, bio, hourlyRate, availability, portfolioUrl, skills, portfolios, certificates } = profile;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Discover
        </button>
      </div>

      <div style={{ display: 'flex', gap: 24, flex: 1, overflow: 'hidden' }}>
        {/* Left Column - Profile Info */}
        <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' }} className="custom-scrollbar">
          
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#E2E8F0', backgroundImage: `url(${user.avatarUrl || 'https://via.placeholder.com/150'})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: 16 }} />
              <div style={{ position: 'absolute', bottom: 20, right: 0, width: 18, height: 18, background: user.status === 'ACTIVE' ? '#10B981' : '#94A3B8', borderRadius: '50%', border: '3px solid #FFFFFF' }} title={user.status} />
            </div>
            
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
              {user.firstName} {user.lastName}
              {user.isVerified && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#10B981" stroke="#10B981"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              )}
            </h2>
            <p style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>{title || 'Freelancer'}</p>
            
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <span style={{ background: '#ECFDF5', color: '#10B981', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{availability || 'Available'}</span>
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569', fontSize: 13 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Remote
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569', fontSize: 13 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                English
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, width: '100%', marginTop: 24 }}>
              <button onClick={handleMessageClick} style={{ flex: 1, padding: '10px 0', background: 'transparent', border: '1px solid #E2E8F0', color: '#0F172A', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Message
              </button>
              <button onClick={openInviteModal} style={{ flex: 1, padding: '10px 0', background: '#10B981', border: 'none', color: '#FFFFFF', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 4px rgba(16,185,129,0.2)' }}>
                Hire Now
              </button>
            </div>
          </div>
          
        </div>

        {/* Center & Right Column Combined in Flex */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' }} className="custom-scrollbar">
          
          {/* Top Stats Banner */}
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Hourly Rate</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#10B981', marginTop: 4 }}>${hourlyRate || 0}<span style={{ fontSize: 14, color: '#94A3B8', fontWeight: 500 }}>/hr</span></div>
              </div>
              <div style={{ height: 40, width: 1, background: '#E2E8F0' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#0F172A' }}>{profile.stats?.jobsCompleted || 0}</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Jobs Completed</div>
              </div>
              <div style={{ height: 40, width: 1, background: '#E2E8F0' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#0F172A' }}>{profile.stats?.successRate || 100}%</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Success Rate</div>
              </div>
              <div style={{ height: 40, width: 1, background: '#E2E8F0' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {profile.stats?.rating || 5.0} <svg width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Rating</div>
              </div>
            </div>
          </div>

          {/* Main Content Area with Tabs */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            
            {/* Tabs Header */}
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
                    transition: 'all 0.2s'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: 32, flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
              {activeTab === 'Overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>About</h3>
                    <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {bio || 'No bio provided.'}
                    </p>
                  </div>

                  {portfolioUrl && (
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>Social Media</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                        {(() => {
                          try {
                            const socials = JSON.parse(portfolioUrl);
                            const activeSocials = Object.entries(socials).filter(([_, url]) => url);
                            
                            if (activeSocials.length === 0) return <span style={{ color: '#94A3B8', fontSize: 14 }}>No links provided</span>;
                            
                            return activeSocials.map(([platform, url]) => (
                              <a 
                                key={platform} 
                                href={url as string} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ 
                                  display: 'flex', alignItems: 'center', gap: 6, 
                                  padding: '8px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', 
                                  borderRadius: 8, fontSize: 13, color: '#3B82F6', textDecoration: 'none', 
                                  textTransform: 'capitalize', fontWeight: 600
                                }}
                              >
                                {platform}
                              </a>
                            ));
                          } catch {
                            // Fallback if it's just a raw URL
                            return (
                              <a href={portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: '#3B82F6', textDecoration: 'none' }}>
                                {portfolioUrl}
                              </a>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>Skills</h3>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {skills && skills.length > 0 ? skills.map((skill: any) => (
                        <span key={skill.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
                          {skill.name}
                        </span>
                      )) : (
                        <span style={{ fontSize: 14, color: '#94A3B8' }}>No skills listed.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'Portfolio' && (
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>Portfolio Projects</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    {portfolios && portfolios.length > 0 ? portfolios.map((p: any) => (
                      <div key={p.id} style={{ border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
                        {p.imageUrl && (
                          <div style={{ width: '100%', height: 160, backgroundImage: `url(${p.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                        )}
                        <div style={{ padding: 16 }}>
                          <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{p.title}</h4>
                          {p.description && <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{p.description}</p>}
                          {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: '#3B82F6', textDecoration: 'none', fontWeight: 600 }}>View Project →</a>}
                        </div>
                      </div>
                    )) : (
                      <div style={{ gridColumn: '1 / -1', color: '#94A3B8', fontSize: 14 }}>No portfolio items added.</div>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'Documents' && (
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>Certificates</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {certificates && certificates.length > 0 ? certificates.map((c: any) => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, border: '1px solid #E2E8F0', borderRadius: 12 }}>
                        {c.imageUrl && (
                          <img src={c.imageUrl} alt={c.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                        )}
                        <div>
                          <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{c.name}</h4>
                          <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{c.issuingOrg}</p>
                          {c.issueDate && <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>Issued: {new Date(c.issueDate).toLocaleDateString()}</p>}
                        </div>
                      </div>
                    )) : (
                      <div style={{ color: '#94A3B8', fontSize: 14 }}>No certificates added.</div>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'Work History' && (
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>Completed Projects</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {profile.workHistory && profile.workHistory.length > 0 ? profile.workHistory.map((project: any) => (
                      <div key={project.id} style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 20, background: '#FFFFFF' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{project.title}</h4>
                            <p style={{ fontSize: 14, color: '#64748B' }}>Client: {project.client?.businessProfile?.companyName || 'Business'}</p>
                          </div>
                          <span style={{ background: '#ECFDF5', color: '#10B981', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                            Completed
                          </span>
                        </div>
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #F1F5F9', display: 'flex', gap: 24 }}>
                          <div>
                            <span style={{ display: 'block', fontSize: 12, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Budget</span>
                            <span style={{ fontSize: 14, color: '#0F172A', fontWeight: 600 }}>${project.budget || 0}</span>
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: 12, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Completed On</span>
                            <span style={{ fontSize: 14, color: '#0F172A', fontWeight: 600 }}>
                              {new Date(project.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div style={{ color: '#94A3B8', fontSize: 14 }}>No completed projects yet.</div>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'Activity Timeline' && (
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>Recent Activities</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingLeft: 12, borderLeft: '2px solid #E2E8F0' }}>
                    {profile.workHistory && profile.workHistory.flatMap((p: any) => p.progressSteps || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10).map((step: any) => (
                      <div key={step.id} style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: -19, top: 0, width: 12, height: 12, borderRadius: '50%', background: '#10B981', border: '2px solid #FFFFFF' }} />
                        <h4 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{step.title}</h4>
                        <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{step.description}</p>
                        <span style={{ fontSize: 11, color: '#94A3B8', marginTop: 6, display: 'block' }}>{new Date(step.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                    {(!profile.workHistory || profile.workHistory.flatMap((p: any) => p.progressSteps || []).length === 0) && (
                      <div style={{ color: '#94A3B8', fontSize: 14, paddingLeft: 8 }}>No recent activities found.</div>
                    )}
                  </div>
                </div>
              )}
              {!['Overview', 'Portfolio', 'Documents', 'Work History', 'Activity Timeline'].includes(activeTab) && (
                <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>
                  <svg style={{ margin: '0 auto 16px' }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                  <p>{activeTab} module will be populated shortly.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setInviteModalOpen(false)}>
          <div style={{
            background: '#FFFFFF', padding: 24, borderRadius: 16, width: '100%', maxWidth: 400,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Invite to Project</h2>
            <p style={{ fontSize: 14, color: '#64748B', marginBottom: 20 }}>Select a project to invite this freelancer to, or send a general invitation.</p>
            
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8,
                fontSize: 14, color: '#0F172A', marginBottom: 16
              }}
            >
              <option value="">General Invitation (No specific project)</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>

            <select
              value={inviteJobType}
              onChange={(e) => setInviteJobType(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8,
                fontSize: 14, color: '#0F172A', marginBottom: 16
              }}
            >
              <option value="PROJECT_BASED">Project Based</option>
              <option value="MONTHLY_WORKER">Monthly Retainer / Worker</option>
            </select>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Payment Amount ($)</label>
              <input
                type="number"
                placeholder={inviteJobType === 'MONTHLY_WORKER' ? 'Monthly Salary' : 'Fixed Project Amount'}
                value={invitePayment}
                onChange={(e) => setInvitePayment(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14 }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Personal Message</label>
              <textarea
                placeholder="Hi, I'd like to invite you..."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setInviteModalOpen(false)} style={{
                padding: '8px 16px', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: 8,
                color: '#475569', fontWeight: 600, fontSize: 14, cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={handleSendInvite} style={{
                padding: '8px 16px', background: '#10B981', border: 'none', borderRadius: 8,
                color: '#FFFFFF', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 4px rgba(16,185,129,0.2)'
              }}>Send Invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TalentProfileDetailPage;
