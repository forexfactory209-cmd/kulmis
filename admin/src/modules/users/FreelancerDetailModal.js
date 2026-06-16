import React, { useState } from 'react';

const PortfolioPopup = ({ portfolio, onClose }) => {
  if (!portfolio) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in">
        {portfolio.imageUrl && (
          <div className="w-full h-64 bg-slate-950 overflow-hidden">
            <img src={portfolio.imageUrl} alt={portfolio.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">{portfolio.title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {portfolio.description && (
            <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{portfolio.description}</p>
          )}
          {portfolio.link && (
            <a
              href={portfolio.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 font-semibold text-sm transition-colors border border-[#10B981]/20"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Visit Project
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const FreelancerDetailModal = ({ freelancer, onClose }) => {
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);

  if (!freelancer) return null;

  const profile = freelancer.freelancerProfile || {};

  let socialLinks = {};
  let portfolioLink = profile.portfolioUrl;
  let hasSocials = false;

  if (profile.portfolioUrl && profile.portfolioUrl.trim().startsWith('{')) {
    try {
      socialLinks = JSON.parse(profile.portfolioUrl);
      portfolioLink = socialLinks.portfolioWebsite || socialLinks.portfolioUrl || '';
      hasSocials = Object.values(socialLinks).some(val => val && typeof val === 'string' && val.length > 0);
    } catch (e) {
      // Not JSON, just a regular string
    }
  } else if (profile.portfolioUrl) {
    hasSocials = true;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <img
              src={freelancer.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80'}
              alt="Avatar"
              className="h-16 w-16 rounded-full border-2 border-[#10B981] object-cover shadow-lg"
            />
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {freelancer.firstName} {freelancer.lastName}
                {freelancer.isVerified && (
                  <svg className="h-6 w-6 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </h2>
              <p className="text-sm text-slate-400 font-medium">{profile.title || 'Freelancer'} • {freelancer.email}</p>
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
          
          {/* Bio & Basic Info */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Biography</h3>
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {profile.bio || 'No biography provided.'}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex flex-col gap-3">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Hourly Rate</p>
                  <p className="text-lg font-bold text-emerald-400">${profile.hourlyRate || '0.00'}/hr</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Availability</p>
                  <p className="text-sm text-slate-300">{profile.availability || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Verification Status</p>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {freelancer.isVerified ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Verified
                      </span>
                    ) : (
                      <span className="text-slate-500">Unverified</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Skills */}
          <section>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((s, idx) => (
                  <span key={idx} className="bg-slate-800 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700">
                    {s.name}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500 italic">No skills listed.</p>
              )}
            </div>
          </section>

          {/* Certificates & Diplomas */}
          <section>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Certificates & Diplomas</h3>
            {profile.certificates && profile.certificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.certificates.map((cert, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                    {cert.imageUrl ? (
                      <div className="h-28 w-full bg-slate-900 overflow-hidden">
                        <img src={cert.imageUrl} alt={cert.name} className="w-full h-full object-cover" />
                      </div>
                    ) : null}
                    <div className="p-4 flex gap-4 items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{cert.name}</p>
                        <p className="text-xs text-slate-400">{cert.issuingOrg}</p>
                        {cert.issueDate && <p className="text-[10px] text-slate-500 mt-1">Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No certificates or diplomas provided.</p>
            )}
          </section>

          {/* Portfolio Projects - Overlapping Cards */}
          <section>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Portfolio Projects</h3>
            {profile.portfolios && profile.portfolios.length > 0 ? (
              <div className="relative flex items-start pb-4 overflow-x-auto custom-scrollbar" style={{ minHeight: '240px' }}>
                {profile.portfolios.map((port, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPortfolio(port)}
                    className="flex-shrink-0 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl cursor-pointer hover:scale-105 hover:z-30 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300"
                    style={{
                      width: '220px',
                      marginLeft: idx === 0 ? '0' : '-30px',
                      zIndex: idx + 1,
                      transform: `rotate(${idx % 2 === 0 ? -1.5 : 1.5}deg)`,
                    }}
                  >
                    <div className="h-32 w-full bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                      {port.imageUrl ? (
                        <img src={port.imageUrl} alt={port.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="h-10 w-10 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-white text-xs truncate">{port.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{port.description || 'No description'}</p>
                      <p className="text-[10px] text-[#10B981] font-semibold mt-2">Click to view &rarr;</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No portfolio projects showcased.</p>
            )}
          </section>

          {/* Social Links */}
          <section>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Links & Socials</h3>
            <div className="flex flex-wrap gap-3">
              {portfolioLink ? (
                <a
                  href={portfolioLink.startsWith('http') ? portfolioLink : `https://${portfolioLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 font-semibold text-sm transition-colors border border-[#10B981]/20"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Portfolio Website
                </a>
              ) : null}
              {Object.entries(socialLinks).map(([key, value]) => {
                if (!value || key === 'portfolioWebsite' || key === 'portfolioUrl') return null;
                const url = String(value).startsWith('http') ? value : `https://${value}`;
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white font-semibold text-sm transition-colors border border-slate-700 capitalize"
                  >
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    {key}
                  </a>
                );
              })}
              {freelancer.email && (
                <a
                  href={`mailto:${freelancer.email}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 font-semibold text-sm transition-colors border border-blue-500/20"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </a>
              )}
            </div>
            {!hasSocials && !freelancer.email && (
              <p className="text-xs text-slate-600 mt-2 italic">No external links provided.</p>
            )}
          </section>

        </div>
      </div>

      {/* Portfolio Detail Popup */}
      {selectedPortfolio && (
        <PortfolioPopup portfolio={selectedPortfolio} onClose={() => setSelectedPortfolio(null)} />
      )}
    </div>
  );
};

export default FreelancerDetailModal;
