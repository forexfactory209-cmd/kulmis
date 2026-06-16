import React, { useEffect, useState } from 'react';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { useNavigate } from 'react-router-dom';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    page,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    // Only fetch if not already loaded by the layout
    if (notifications.length === 0 && !loading && hasMore) {
      fetchNotifications(1);
      fetchUnreadCount();
    }
    setInitialLoaded(true);
  }, []);

  const getIcon = (type: string) => {
    if (type.startsWith('MESSAGE')) return { icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z', color: '#3B82F6', bg: '#EFF6FF' };
    if (type.includes('PAYMENT') || type.includes('PAID')) return { icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: '#10B981', bg: '#ECFDF5' };
    if (type.includes('INVITE') || type.includes('APPLICATION')) return { icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: '#8B5CF6', bg: '#F5F3FF' };
    if (type.includes('SUBMIT') || type.includes('REVIEW')) return { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: '#F59E0B', bg: '#FFFBEB' };
    if (type.includes('DISPUTE') || type.includes('ALERT')) return { icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: '#EF4444', bg: '#FEF2F2' };
    return { icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: '#3B82F6', bg: '#EFF6FF' };
  };

  const handleNotifClick = (notif: any) => {
    if (!notif.isRead) markAsRead(notif.id);
    if (notif.type.startsWith('MESSAGE|')) {
      navigate(`/messages?convo=${notif.type.split('|')[1]}`);
    } else if (notif.type.startsWith('PROJECT|')) {
      navigate(`/projects/${notif.type.split('|')[1]}`);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24, maxWidth: 800, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#0F172A', fontSize: 24, fontWeight: 700 }}>Notifications</h1>
          <p style={{ color: '#64748B', marginTop: 4 }}>Stay updated on project activities, payments, and team alerts.</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={() => markAllAsRead()} 
            style={{ background: 'transparent', color: '#10B981', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
          >
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, overflowY: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', flex: 1 }}>
        {loading && !initialLoaded ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div style={{ width: 40, height: 40, border: '4px solid #E2E8F0', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8' }}>
            <svg style={{ margin: '0 auto 16px' }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            <p style={{ fontSize: 16, fontWeight: 600 }}>No notifications yet</p>
            <p style={{ fontSize: 14, marginTop: 4 }}>You'll see updates about your projects, messages, and team here.</p>
          </div>
        ) : (
          <>
            {notifications.map((n) => {
              const styleInfo = getIcon(n.type);
              return (
                <div 
                  key={n.id} 
                  onClick={() => handleNotifClick(n)}
                  style={{ 
                    display: 'flex', gap: 16, padding: '20px 24px', borderBottom: '1px solid #E2E8F0', 
                    background: n.isRead ? '#FFFFFF' : '#F8FAFC', cursor: 'pointer', transition: 'background 0.2s' 
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = n.isRead ? '#FFFFFF' : '#F8FAFC'}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 20, background: styleInfo.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={styleInfo.color} strokeWidth="2"><path d={styleInfo.icon} strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: 15, fontWeight: n.isRead ? 500 : 700, color: '#0F172A', marginBottom: 4 }}>{n.title}</h4>
                      <span style={{ fontSize: 12, color: '#94A3B8', flexShrink: 0, marginLeft: 12 }}>{timeAgo(n.createdAt)}</span>
                    </div>
                    <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.5 }}>{n.content}</p>
                  </div>
                  {!n.isRead && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', marginTop: 8, flexShrink: 0 }} />
                  )}
                </div>
              );
            })}
            {hasMore && (
              <button 
                onClick={() => fetchNotifications(page + 1)}
                disabled={loading}
                style={{ 
                  width: '100%', padding: '16px', background: '#F8FAFC', border: 'none', 
                  color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', 
                  transition: 'background 0.2s' 
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#F8FAFC'}
              >
                {loading ? 'Loading...' : 'Load More Notifications'}
              </button>
            )}
          </>
        )}
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default NotificationsPage;
