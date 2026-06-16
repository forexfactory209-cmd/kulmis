import React from 'react';

const ClientDetailModal = ({ client, onClose }) => {
  if (!client) return null;

  const profile = client.clientProfile || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <img
              src={client.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80'}
              alt="Avatar"
              className="h-16 w-16 rounded-full border-2 border-[#10B981] object-cover shadow-lg"
            />
            <div>
              <h2 className="text-2xl font-bold text-white">{client.firstName} {client.lastName}</h2>
              <p className="text-sm text-slate-400 font-medium">{profile.companyName || 'Individual Client'} • {client.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">

          {/* Account Info */}
          <section>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Account Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Status</p>
                <p className={`text-sm font-bold mt-1 ${client.status === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'}`}>{client.status}</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Verified</p>
                <p className={`text-sm font-bold mt-1 ${client.isVerified ? 'text-emerald-400' : 'text-slate-500'}`}>{client.isVerified ? 'Yes' : 'No'}</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Role</p>
                <p className="text-sm font-bold mt-1 text-blue-400">{client.role}</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Joined</p>
                <p className="text-sm font-bold mt-1 text-slate-300">{new Date(client.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </section>

          {/* Company Profile */}
          <section>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Company Profile</h3>
            <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Company Name</p>
                  <p className="text-sm text-white font-semibold mt-1">{profile.companyName || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Website</p>
                  {profile.website ? (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-[#10B981] hover:underline font-medium mt-1 inline-block">{profile.website}</a>
                  ) : (
                    <p className="text-sm text-slate-500 mt-1">Not provided</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Bio / Company Description</p>
                <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{profile.bio || 'No company bio provided.'}</p>
              </div>
            </div>
          </section>

          {/* Contact Details */}
          <section>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Contact Details</h3>
            <div className="bg-slate-950 rounded-xl p-5 border border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Email</p>
                    <p className="text-sm text-white">{client.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Full Name</p>
                    <p className="text-sm text-white">{client.firstName} {client.lastName}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default ClientDetailModal;
