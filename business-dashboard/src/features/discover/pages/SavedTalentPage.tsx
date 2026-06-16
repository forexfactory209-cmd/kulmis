import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../lib/axios';

const SavedTalentPage: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/freelancers/saved/list');
      if (res.data.success) {
        setFavorites(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch saved talent:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (freelancerId: string) => {
    try {
      await apiClient.delete(`/freelancers/${freelancerId}/save`);
      setFavorites(favorites.filter(f => f.user.id !== freelancerId));
    } catch (err) {
      console.error('Failed to unsave freelancer', err);
    }
  };

  const filteredFavorites = favorites.filter(f => 
    f.user?.firstName?.toLowerCase().includes(search.toLowerCase()) || 
    f.user?.lastName?.toLowerCase().includes(search.toLowerCase()) || 
    f.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#0F172A', fontSize: 24, fontWeight: 700 }}>Saved Talent</h1>
          <p style={{ color: '#64748B', marginTop: 4 }}>Freelancers you've bookmarked for future projects.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 12, top: 10, color: '#94A3B8' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              type="text"
              placeholder="Search saved talent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: 240, padding: '8px 12px 8px 36px', background: '#FFFFFF',
                border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#0F172A'
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div style={{ width: 40, height: 40, border: '4px solid #E2E8F0', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: '#F8FAFC' }}>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Talent</th>
                  <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Skills</th>
                  <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Salary Expectation</th>
                  <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFavorites.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #E2E8F0', cursor: 'pointer' }} onClick={() => navigate(`/discover/${row.user?.id}`)} onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E2E8F0', backgroundImage: row.user?.avatarUrl ? `url(${row.user.avatarUrl})` : undefined, backgroundSize: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontWeight: 700, fontSize: 14 }}>
                          {!row.user?.avatarUrl && row.user?.firstName?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ color: '#0F172A', fontWeight: 700, fontSize: 14 }}>{row.user?.firstName} {row.user?.lastName}</div>
                          <div style={{ color: '#64748B', fontSize: 13 }}>{row.title}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#475569', fontSize: 13 }}>
                      {row.skills?.slice(0, 3).map((s: any) => s.name).join(', ') || 'No skills listed'}
                    </td>
                    <td style={{ padding: '16px 24px', color: '#475569', fontSize: 13 }}>
                      {row.hourlyRate ? `$${row.hourlyRate}/hr` : 'Negotiable'}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#0F172A', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600, marginRight: 8 }} onClick={(e) => { e.stopPropagation(); navigate(`/discover/${row.user?.id}?invite=true`); }}>Invite</button>
                      <button style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 6 }} onClick={(e) => { e.stopPropagation(); handleUnsave(row.user.id); }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredFavorites.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
                      {search ? 'No saved talent matches your search.' : 'You have not saved any talent yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default SavedTalentPage;
