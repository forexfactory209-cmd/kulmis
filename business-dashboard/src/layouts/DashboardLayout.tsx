import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { connectSocket } from '../lib/socket';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Dashboard', path: '/', icon: 'dashboard' },
  { label: 'Discover Talent', path: '/discover', icon: 'search' },
  { label: 'Saved Talent', path: '/saved-talent', icon: 'bookmark' },
  { label: 'Invitations', path: '/invitations', icon: 'mail' },
  { label: 'My Team', path: '/team', icon: 'team' },
  { label: 'Projects', path: '/projects', icon: 'projects' },
  { label: 'Tasks', path: '/tasks', icon: 'tasks' },
  { label: 'Attendance', path: '/attendance', icon: 'attendance' },
  { label: 'Payroll', path: '/payroll', icon: 'payroll' },
  { label: 'Contracts', path: '/contracts', icon: 'contracts' },
  { label: 'Messages', path: '/messages', icon: 'messages' },
  { label: 'Files', path: '/files', icon: 'folder' },
  { label: 'Disputes', path: '/disputes', icon: 'disputes' },
  { label: 'Reports', path: '/reports', icon: 'reports' },
  { label: 'Analytics', path: '/analytics', icon: 'chart' },
  { label: 'Notifications', path: '/notifications', icon: 'bell' },
  { label: 'Company Settings', path: '/settings', icon: 'settings' },
  { label: 'Billing', path: '/billing', icon: 'credit-card' },
  { label: 'Support', path: '/support', icon: 'help' },
];

const NavIcon = ({ icon, active }: { icon: string; active: boolean }): React.ReactElement | null => {
  const color = active ? '#10B981' : '#64748B'; // Emerald 500 when active, Slate 500 otherwise
  const icons: Record<string, React.ReactElement> = {
    dashboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    search: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
    bookmark: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>,
    mail: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    team: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    projects: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
    tasks: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
    payroll: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    attendance: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    contracts: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    messages: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    folder: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
    disputes: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    reports: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    chart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    bell: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    settings: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    'credit-card': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    help: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  };
  return icons[icon] || null;
};

const DashboardLayout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    loading: notifLoading,
    hasMore,
    page: notifPage,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    incrementUnread,
  } = useNotificationStore();

  useEffect(() => {
    if (!user?.id) return;
    
    // Only fetch if we haven't loaded them yet
    if (notifications.length === 0 && !notifLoading) {
      fetchNotifications(1);
      fetchUnreadCount();
    }

    const socket = connectSocket(user.id);
    const handleNewNotif = (notif: any) => {
      addNotification(notif);
      incrementUnread();
    };

    socket.on('new_notification', handleNewNotif);
    return () => {
      socket.off('new_notification', handleNewNotif);
    };
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const sidebarWidth = collapsed ? 72 : 260;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F8FAFC' }}>
      {/* Sidebar - Light Theme */}
      <aside style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        height: '100vh',
        background: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        overflow: 'hidden',
        zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 0' : '20px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: 68,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {!collapsed && (
              <span style={{ fontWeight: 800, fontSize: 18, color: '#0F172A', letterSpacing: '-0.02em' }}>Kulmis</span>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 4 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 19l-7-7 7-7M18 19l-7-7 7-7"/></svg>
            </button>
          )}
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              style={{ position: 'absolute', right: -12, top: 24, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '50%', width: 24, height: 24, display: 'none', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 5l7 7-7 7M6 5l7 7-7 7"/></svg>
            </button>
          )}
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }} className="custom-scrollbar">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: collapsed ? '12px 0' : '10px 16px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 10,
                  border: 'none',
                  background: active ? '#ECFDF5' : 'transparent', // emerald-50
                  color: active ? '#10B981' : '#475569',
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  marginBottom: 2,
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = '#F8FAFC';
                    e.currentTarget.style.color = '#0F172A';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#475569';
                  }
                }}
                title={collapsed ? item.label : undefined}
              >
                {active && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3,
                    height: 20,
                    borderRadius: '0 3px 3px 0',
                    background: '#10B981',
                  }} />
                )}
                <NavIcon icon={item.icon} active={active} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User profile at bottom */}
        <div style={{
          padding: collapsed ? '16px 8px' : '16px 20px',
          borderTop: '1px solid #E2E8F0',
          background: '#F8FAFC',
        }}>
          {!collapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                fontSize: 14,
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {user?.firstName?.charAt(0)?.toUpperCase() || 'B'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.companyName || `${user?.firstName || ''} ${user?.lastName || ''}`}
                </div>
                <div style={{ fontSize: 11, color: '#64748B' }}>Business</div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 4 }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              title="Logout"
              style={{ width: '100%', display: 'flex', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 8 }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar - Light Theme */}
        <header style={{
          height: 68,
          minHeight: 68,
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          background: '#FFFFFF',
          zIndex: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', padding: 4 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
            )}
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>
              {navItems.find((n) => n.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Search bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              borderRadius: 10,
              padding: '8px 14px',
              minWidth: 240,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input
                type="text"
                placeholder="Search anything..."
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#0F172A',
                  fontSize: 13,
                  fontFamily: 'Inter, sans-serif',
                  width: '100%',
                }}
              />
              <kbd style={{
                fontSize: 10,
                color: '#64748B',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 4,
                padding: '2px 6px',
                fontFamily: 'monospace',
              }}>⌘K</kbd>
            </div>
            {/* Notifications */}
            <div style={{ position: 'relative' }} ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
                  color: '#64748B', display: 'flex', padding: 6,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 0, right: -2, background: '#EF4444', color: '#FFFFFF',
                    fontSize: 10, fontWeight: 700, padding: '2px 5px', borderRadius: 10, border: '2px solid #FFFFFF'
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div style={{
                  position: 'absolute', top: 40, right: 0, width: 340, background: '#FFFFFF',
                  border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  zIndex: 100, overflow: 'hidden', display: 'flex', flexDirection: 'column'
                }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={() => markAllAsRead()} style={{ background: 'none', border: 'none', color: '#10B981', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: 360, overflowY: 'auto' }} className="custom-scrollbar">
                    {notifications.length > 0 ? (
                      <>
                        {notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => {
                              if (!notif.isRead) markAsRead(notif.id);
                              if (notif.type.startsWith('MESSAGE|')) {
                                navigate(`/messages?convo=${notif.type.split('|')[1]}`);
                                setShowNotifications(false);
                              } else if (notif.type.startsWith('PROJECT|')) {
                                navigate(`/projects/${notif.type.split('|')[1]}`);
                                setShowNotifications(false);
                              }
                            }}
                            style={{ 
                              padding: '16px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: 12, 
                              background: notif.isRead ? '#FFFFFF' : '#F8FAFC', cursor: 'pointer', transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
                            onMouseLeave={(e) => e.currentTarget.style.background = notif.isRead ? '#FFFFFF' : '#F8FAFC'}
                          >
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: notif.isRead ? 'transparent' : '#10B981', marginTop: 6, flexShrink: 0 }} />
                            <div>
                              <p style={{ fontSize: 13, color: '#0F172A', fontWeight: notif.isRead ? 500 : 600, margin: 0 }}>{notif.title}</p>
                              <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{notif.content}</p>
                              <span style={{ fontSize: 11, color: '#94A3B8', marginTop: 6, display: 'block' }}>{new Date(notif.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                        {hasMore && (
                          <button 
                            onClick={() => fetchNotifications(notifPage + 1)}
                            disabled={notifLoading}
                            style={{ width: '100%', padding: '12px', background: '#F8FAFC', border: 'none', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                          >
                            {notifLoading ? 'Loading...' : 'Load More'}
                          </button>
                        )}
                      </>
                    ) : (
                      <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                        No notifications yet
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '12px', borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
                    <button onClick={() => { setShowNotifications(false); navigate('/notifications'); }} style={{ background: 'none', border: 'none', color: '#10B981', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 32, background: '#F8FAFC' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
