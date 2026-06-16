import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../lib/axios';

const DiscoverTalentPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20 });
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedFreelancerId, setSelectedFreelancerId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [inviteJobType, setInviteJobType] = useState('PROJECT_BASED');
  const [invitePayment, setInvitePayment] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  
  // Filter states
  const [selectedSkill, setSelectedSkill] = useState('All Skills');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedExperience, setSelectedExperience] = useState('All Experience');
  const [selectedAvailability, setSelectedAvailability] = useState('All Availability');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');

  const navigate = useNavigate();
  
  // Mock filters (can be fetched from API later)
  const filters = {
    skills: ['All Skills', 'React', 'Node.js', 'Figma', 'Python'],
    category: ['All Categories', 'Development', 'Design', 'Marketing'],
    experience: ['All Experience', 'Entry Level', 'Intermediate', 'Expert'],
    availability: ['All Availability', 'Full-time', 'Part-time', 'Hourly'],
    location: ['All Locations', 'Remote', 'US', 'Europe', 'Africa']
  };

  useEffect(() => {
    fetchFreelancers();
  }, [searchTerm, selectedSkill, selectedCategory, selectedExperience, selectedAvailability, selectedLocation, minSalary, maxSalary, pagination.page]);

  const fetchFreelancers = async () => {
    try {
      const [freelancersRes, savedRes] = await Promise.all([
        apiClient.get('/freelancers', {
          params: { 
            search: searchTerm, 
            page: pagination.page, 
            limit: pagination.limit,
            skills: selectedSkill !== 'All Skills' ? selectedSkill : undefined,
            category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
            experience: selectedExperience !== 'All Experience' ? selectedExperience : undefined,
            availability: selectedAvailability !== 'All Availability' ? selectedAvailability : undefined,
            location: selectedLocation !== 'All Locations' ? selectedLocation : undefined,
            minRate: minSalary ? minSalary : undefined,
            maxRate: maxSalary ? maxSalary : undefined
          }
        }),
        apiClient.get('/freelancers/saved/list')
      ]);
      
      if (freelancersRes.data.success) {
        setFreelancers(freelancersRes.data.data.freelancers);
        setPagination(freelancersRes.data.data.pagination);
      }
      
      if (savedRes.data.success) {
        const ids = new Set<string>(savedRes.data.data.map((f: any) => f.user.id));
        setSavedIds(ids);
      }
    } catch (err) {
      console.error('Failed to fetch freelancers', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const isSaved = savedIds.has(id);
    try {
      if (isSaved) {
        await apiClient.delete(`/freelancers/${id}/save`);
        setSavedIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        await apiClient.post(`/freelancers/${id}/save`);
        setSavedIds(prev => new Set(prev).add(id));
      }
    } catch (err) {
      console.error('Failed to toggle save freelancer', err);
    }
  };

  const openInviteModal = async (e: React.MouseEvent, freelancerId: string) => {
    e.stopPropagation();
    setSelectedFreelancerId(freelancerId);
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
    if (!selectedFreelancerId) return;
    try {
      await apiClient.post('/invitations', {
        freelancerId: selectedFreelancerId,
        projectId: selectedProjectId || undefined,
        jobType: inviteJobType,
        paymentAmount: invitePayment ? parseFloat(invitePayment) : undefined,
        message: inviteMessage
      });
      alert('Invitation sent successfully!');
      setInviteModalOpen(false);
      setSelectedFreelancerId(null);
      setInviteJobType('PROJECT_BASED');
      setInvitePayment('');
      setInviteMessage('');
    } catch (err) {
      console.error('Failed to send invite', err);
      alert('Failed to send invitation.');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedSkill('All Skills');
    setSelectedCategory('All Categories');
    setSelectedExperience('All Experience');
    setSelectedAvailability('All Availability');
    setSelectedLocation('All Locations');
    setMinSalary('');
    setMaxSalary('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#0F172A', fontSize: 24, fontWeight: 800 }}>Discover Talent</h1>
          <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>Find and hire the best freelancers for your projects.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/saved-talent')} style={{
            background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: 8,
            color: '#0F172A', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
            Saved Talent
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, flex: 1, overflow: 'hidden' }}>
        {/* Left Filter Sidebar */}
        <div style={{
          width: 280, flexShrink: 0, background: '#FFFFFF', border: '1px solid #E2E8F0',
          borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 20,
          overflowY: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>Search</h3>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: 12, top: 10, color: '#94A3B8' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input
                type="text"
                placeholder="Job title or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px 8px 36px', background: '#F8FAFC',
                  border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#0F172A'
                }}
              />
            </div>
          </div>

          <div style={{ height: 1, background: '#E2E8F0' }} />

          {Object.entries(filters).map(([key, options], idx) => {
            let value = '';
            let setValue: any = () => {};
            if (key === 'skills') { value = selectedSkill; setValue = setSelectedSkill; }
            if (key === 'category') { value = selectedCategory; setValue = setSelectedCategory; }
            if (key === 'experience') { value = selectedExperience; setValue = setSelectedExperience; }
            if (key === 'availability') { value = selectedAvailability; setValue = setSelectedAvailability; }
            if (key === 'location') { value = selectedLocation; setValue = setSelectedLocation; }

            return (
              <div key={idx}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 12 }}>
                  {key}
                </h3>
                <select 
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', background: '#F8FAFC',
                    border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#0F172A',
                    appearance: 'none', cursor: 'pointer'
                  }}
                >
                  {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            );
          })}

          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 12 }}>Salary Range</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="number" placeholder="Min" value={minSalary} onChange={e => setMinSalary(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13 }} />
              <span style={{ color: '#94A3B8' }}>-</span>
              <input type="number" placeholder="Max" value={maxSalary} onChange={e => setMaxSalary(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13 }} />
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 20 }}>
            <button 
              onClick={handleClearFilters}
              style={{
              width: '100%', padding: '10px', background: '#F1F5F9', border: '1px solid #E2E8F0',
              borderRadius: 8, color: '#0F172A', fontWeight: 600, fontSize: 13, cursor: 'pointer'
            }}>Clear Filters</button>
          </div>
        </div>

        {/* Main Grid Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: '#64748B', fontSize: 14 }}>Showing <strong style={{ color: '#0F172A' }}>{pagination.total}</strong> results</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#64748B', fontSize: 13 }}>Sort by:</span>
              <select style={{ border: 'none', background: 'transparent', fontWeight: 600, color: '#0F172A', fontSize: 13, cursor: 'pointer' }}>
                <option>Relevance</option>
                <option>Highest Rated</option>
                <option>Lowest Rate</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <div style={{ width: 40, height: 40, border: '4px solid #E2E8F0', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, overflowY: 'auto', paddingRight: 4, paddingBottom: 40 }} className="custom-scrollbar">
              {freelancers.map((freelancer) => (
                <div key={freelancer.id} style={{
                  background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16,
                  padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  textAlign: 'center', transition: 'box-shadow 0.2s, transform 0.2s',
                  cursor: 'pointer', position: 'relative',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
                onClick={() => navigate(`/discover/${freelancer.id}`)}
                >
                  <button onClick={(e) => toggleSave(e, freelancer.userId)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: savedIds.has(freelancer.userId) ? '#EF4444' : '#94A3B8', cursor: 'pointer', transition: 'color 0.2s' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={savedIds.has(freelancer.userId) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                  </button>
                  
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: 80, height: 80, borderRadius: 40, backgroundColor: '#E2E8F0', marginBottom: 16,
                      backgroundImage: `url(${freelancer.user.avatarUrl || 'https://via.placeholder.com/150'})`, backgroundSize: 'cover', backgroundPosition: 'center'
                    }} />
                    <div style={{
                      position: 'absolute', bottom: 16, right: 0, width: 14, height: 14,
                      background: freelancer.user.status === 'ACTIVE' ? '#10B981' : '#94A3B8', borderRadius: '50%', border: '2px solid #FFFFFF'
                    }} title={freelancer.user.status} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <h3 style={{ color: '#0F172A', fontSize: 16, fontWeight: 700 }}>{freelancer.user.firstName} {freelancer.user.lastName}</h3>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#10B981" stroke="#10B981"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  
                  <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>{freelancer.title || 'Freelancer'}</p>
                  
                  <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {freelancer.skills?.slice(0, 3).map((s: any) => (
                      <span key={s.id} style={{ background: '#F1F5F9', color: '#475569', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{s.name}</span>
                    ))}
                    {freelancer.skills?.length > 3 && (
                      <span style={{ background: '#F1F5F9', color: '#475569', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>+{freelancer.skills.length - 3}</span>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', gap: 12, marginTop: 20, paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Rate</div>
                      <div style={{ fontSize: 14, color: '#0F172A', fontWeight: 700 }}>${freelancer.hourlyRate}/hr</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Rating</div>
                      <div style={{ fontSize: 14, color: '#0F172A', fontWeight: 700 }}>New</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, width: '100%', marginTop: 20 }}>
                    <button style={{
                      flex: 1, padding: '8px 0', background: 'transparent', border: '1px solid #E2E8F0',
                      color: '#0F172A', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer'
                    }} onClick={(e) => { e.stopPropagation(); navigate(`/discover/${freelancer.id}`); }}>Profile</button>
                    <button style={{
                      flex: 1, padding: '8px 0', background: '#10B981', border: 'none',
                      color: '#FFFFFF', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(16,185,129,0.2)'
                    }} onClick={(e) => openInviteModal(e, freelancer.userId)}>Invite</button>
                  </div>
                </div>
              ))}
              {freelancers.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#64748B' }}>
                  No freelancers found matching your criteria.
                </div>
              )}
            </div>
          )}
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

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default DiscoverTalentPage;
