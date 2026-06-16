import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminUser, setAdminUser] = useState({ firstName: 'Admin', lastName: 'User', email: 'admin@somlance.com', avatarUrl: '' });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setAdminUser(JSON.parse(userStr));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuSections = [
    {
      title: 'OVERVIEW',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z' },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        { path: '/freelancers', label: 'Freelancers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { path: '/businesses', label: 'Businesses', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
        { path: '/clients', label: 'Clients', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { path: '/projects', label: 'Projects', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
        { path: '/payments', label: 'Payments', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { path: '/disputes', label: 'Disputes', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
        { path: '/jobs-monitoring', label: 'Jobs Monitoring', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
        { path: '/reviews', label: 'Reviews', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { path: '/categories', label: 'Categories', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z' },
        { path: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
      ],
    },
  ];

  const renderNavItems = () => {
    return menuSections.map((section, idx) => (
      <div key={idx} className="mb-6">
        <h4 className={`px-4 text-xs font-semibold text-slate-500 tracking-wider mb-2 transition-all ${!isSidebarOpen && 'hidden md:hidden'}`}>
          {section.title}
        </h4>
        <ul className="space-y-1">
          {section.items.map((item, itemIdx) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={itemIdx}>
                <Link
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl mx-2 font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-[#10B981] text-white shadow-lg shadow-emerald-500/15'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <svg
                    className={`h-5 w-5 ${isSidebarOpen ? 'mr-3' : 'mr-0 md:mx-auto'}`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  <span className={`${!isSidebarOpen && 'md:hidden'} transition-all`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans">
      
      {/* 1. Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-slate-900 border-r border-slate-800 shrink-0 transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="h-8 w-8 bg-[#10B981] rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/25">S</span>
            <span className={`text-xl font-bold tracking-tight text-white transition-opacity ${!isSidebarOpen && 'opacity-0 w-0 overflow-hidden'}`}>
              Som<span className="text-[#10B981]">lance</span>
            </span>
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto custom-scrollbar">
          {renderNavItems()}
        </nav>

        {/* Sidebar Footer (User details & Logout) */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            <img
              src={adminUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'}
              alt="Avatar"
              className="h-10 w-10 rounded-full border border-slate-700 object-cover"
            />
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{adminUser.firstName} {adminUser.lastName}</p>
                <p className="text-xs text-slate-500 truncate">{adminUser.email}</p>
              </div>
            )}
            {isSidebarOpen && (
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
          {!isSidebarOpen && (
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex justify-center text-slate-400 hover:text-red-400 py-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </aside>

      {/* 2. Mobile Drawer Navigation */}
      <div className={`md:hidden fixed inset-0 z-50 flex ${isMobileMenuOpen ? 'visible' : 'pointer-events-none invisible'}`}>
        {/* Backdrop overlay */}
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        
        {/* Side Panel */}
        <aside
          className={`relative w-72 max-w-xs bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="h-8 w-8 bg-[#10B981] rounded-lg flex items-center justify-center text-white font-black text-xl">S</span>
              <span className="text-xl font-bold tracking-tight text-white">
                Som<span className="text-[#10B981]">lance</span>
              </span>
            </Link>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 py-6 overflow-y-auto">
            {renderNavItems()}
          </nav>

          <div className="p-4 border-t border-slate-800 flex items-center gap-3">
            <img
              src={adminUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'}
              alt="Avatar"
              className="h-10 w-10 rounded-full border border-slate-700 object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{adminUser.firstName} {adminUser.lastName}</p>
              <p className="text-xs text-slate-500 truncate">{adminUser.email}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </aside>
      </div>

      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            {/* Hamburger button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Sidebar toggle button (desktop) */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:block text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </button>

            {/* Search Input */}
            <div className="hidden sm:flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 w-64 md:w-80">
              <svg className="h-4 w-4 text-slate-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search anything..."
                className="bg-transparent text-sm text-slate-300 focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Date picker display */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>

            {/* User Profile Info Dropdown Header */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm font-semibold text-slate-200">{adminUser.firstName} {adminUser.lastName}</span>
              <img
                src={adminUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'}
                alt="Profile"
                className="h-9 w-9 rounded-full object-cover border border-slate-700"
              />
            </div>
          </div>
        </header>

        {/* Dynamic Inner Panel View Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-slate-950">
          <div className="max-w-7xl mx-auto w-full animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
