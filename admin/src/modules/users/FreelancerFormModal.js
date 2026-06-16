import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const emptyForm = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  avatarUrl: '',
  isVerified: false,
  profile: {
    title: '',
    bio: '',
    hourlyRate: '',
    availability: 'Full-time',
    portfolioUrl: '',
    skills: [],
    portfolios: [],
    certificates: []
  }
};

const FreelancerFormModal = ({ freelancer, onClose, onSave }) => {
  const isEditing = !!freelancer;
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [availableSkills, setAvailableSkills] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(null);

  // Fetch available skills
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await api.get('/admin/skills');
        setAvailableSkills(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch skills:', err);
      }
    };
    fetchSkills();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (freelancer) {
      const p = freelancer.freelancerProfile || {};
      setForm({
        email: freelancer.email || '',
        password: '',
        firstName: freelancer.firstName || '',
        lastName: freelancer.lastName || '',
        avatarUrl: freelancer.avatarUrl || '',
        isVerified: freelancer.isVerified || false,
        profile: {
          title: p.title || '',
          bio: p.bio || '',
          hourlyRate: p.hourlyRate || '',
          availability: p.availability || 'Full-time',
          portfolioUrl: p.portfolioUrl || '',
          skills: p.skills ? p.skills.map(s => s.name) : [],
          portfolios: p.portfolios ? p.portfolios.map(port => ({
            title: port.title || '',
            description: port.description || '',
            link: port.link || '',
            imageUrl: port.imageUrl || ''
          })) : [],
          certificates: p.certificates ? p.certificates.map(c => ({
            name: c.name || '',
            issuingOrg: c.issuingOrg || '',
            issueDate: c.issueDate ? c.issueDate.split('T')[0] : '',
            imageUrl: c.imageUrl || ''
          })) : []
        }
      });
    }
  }, [freelancer]);

  const updateField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const updateProfile = (key, val) => setForm(prev => ({ ...prev, profile: { ...prev.profile, [key]: val } }));

  // --- Skills ---
  const [skillInput, setSkillInput] = useState('');
  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.profile.skills.includes(s)) {
      updateProfile('skills', [...form.profile.skills, s]);
    }
    setSkillInput('');
  };
  const removeSkill = (idx) => {
    updateProfile('skills', form.profile.skills.filter((_, i) => i !== idx));
  };

  const handleImageUpload = async (e, callback, loadingId) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setUploadingImage(loadingId);
      const formData = new FormData();
      formData.append('image', file);
      
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      callback(res.data.data.url);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(null);
    }
  };

  // --- Portfolios ---
  const addPortfolio = () => {
    updateProfile('portfolios', [...form.profile.portfolios, { title: '', description: '', link: '', imageUrl: '' }]);
  };
  const updatePortfolio = (idx, key, val) => {
    const list = [...form.profile.portfolios];
    list[idx] = { ...list[idx], [key]: val };
    updateProfile('portfolios', list);
  };
  const removePortfolio = (idx) => {
    updateProfile('portfolios', form.profile.portfolios.filter((_, i) => i !== idx));
  };

  // --- Certificates ---
  const addCertificate = () => {
    updateProfile('certificates', [...form.profile.certificates, { name: '', issuingOrg: '', issueDate: '', imageUrl: '' }]);
  };
  const updateCertificate = (idx, key, val) => {
    const list = [...form.profile.certificates];
    list[idx] = { ...list[idx], [key]: val };
    updateProfile('certificates', list);
  };
  const removeCertificate = (idx) => {
    updateProfile('certificates', form.profile.certificates.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isEditing && (!form.email || !form.password)) {
      setError('Email and password are required for new freelancers.');
      return;
    }
    if (!form.firstName || !form.lastName) {
      setError('First name and last name are required.');
      return;
    }
    try {
      setSaving(true);
      await onSave(form, isEditing ? freelancer.id : null);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#10B981]/50 focus:border-[#10B981] transition-colors";
  const labelCls = "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5";
  const sectionTitle = "text-sm font-bold text-white mb-3 flex items-center gap-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit Freelancer' : 'Add New Freelancer'}</h2>
            <p className="text-xs text-slate-500 mt-1">{isEditing ? 'Update credentials, profile info, and portfolio.' : 'Create credentials and build a complete profile.'}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Section 1: Login Credentials */}
          <div>
            <h3 className={sectionTitle}>
              <svg className="h-4 w-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              Login Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Email Address</label>
                <input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="worker@example.com" className={inputCls} disabled={isEditing} />
                {isEditing && <p className="text-[10px] text-slate-600 mt-1">Email cannot be changed after creation.</p>}
              </div>
              <div>
                <label className={labelCls}>{isEditing ? 'New Password (leave blank to keep)' : 'Password'}</label>
                <input type="password" value={form.password} onChange={e => updateField('password', e.target.value)} placeholder={isEditing ? '••••••••' : 'Set a secure password'} className={inputCls} />
              </div>
            </div>
          </div>

          {/* Section 2: Personal Information */}
          <div>
            <h3 className={sectionTitle}>
              <svg className="h-4 w-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>First Name</label>
                <input type="text" value={form.firstName} onChange={e => updateField('firstName', e.target.value)} placeholder="Jane" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Last Name</label>
                <input type="text" value={form.lastName} onChange={e => updateField('lastName', e.target.value)} placeholder="Doe" className={inputCls} />
              </div>
            </div>
            <div className="mt-4">
              <label className={labelCls}>Profile Picture</label>
              <div className="flex items-center gap-4">
                {form.avatarUrl ? (
                  <div className="relative group">
                    <img src={form.avatarUrl} alt="Avatar" className="h-16 w-16 object-cover rounded-full border-2 border-slate-700" />
                    <button type="button" onClick={() => updateField('avatarUrl', '')} className="absolute -top-1 -right-1 bg-slate-800 border border-slate-600 text-red-400 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white cursor-pointer shadow-lg" title="Remove Image">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                )}
                <div className="flex-1">
                  <label>
                    <span className="sr-only">Choose profile picture</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, (url) => updateField('avatarUrl', url), 'avatar')}
                      className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#10B981]/10 file:text-[#10B981] hover:file:bg-[#10B981]/20 cursor-pointer"
                    />
                  </label>
                  {uploadingImage === 'avatar' && <p className="text-xs text-amber-500 animate-pulse mt-1">Uploading...</p>}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button type="button" onClick={() => updateField('isVerified', !form.isVerified)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isVerified ? 'bg-[#10B981]' : 'bg-slate-700'}`}>
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-lg transform transition-transform ${form.isVerified ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm text-slate-300">Mark as Verified</span>
            </div>
          </div>

          {/* Section 3: Professional Profile */}
          <div>
            <h3 className={sectionTitle}>
              <svg className="h-4 w-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Professional Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Professional Title</label>
                <input type="text" value={form.profile.title} onChange={e => updateProfile('title', e.target.value)} placeholder="Full-Stack Developer" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Hourly Rate ($)</label>
                  <input type="number" value={form.profile.hourlyRate} onChange={e => updateProfile('hourlyRate', e.target.value)} placeholder="50" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Availability</label>
                  <select value={form.profile.availability} onChange={e => updateProfile('availability', e.target.value)} className={inputCls}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className={labelCls}>Bio</label>
              <textarea value={form.profile.bio} onChange={e => updateProfile('bio', e.target.value)} placeholder="A brief biography about the freelancer's experience..." rows={4} className={inputCls + " resize-none"} />
            </div>
            <div className="mt-4">
              <label className={labelCls}>Portfolio URL</label>
              <input type="url" value={form.profile.portfolioUrl} onChange={e => updateProfile('portfolioUrl', e.target.value)} placeholder="https://portfolio.example.com" className={inputCls} />
            </div>
          </div>

          {/* Section 4: Skills */}
          <div>
            <h3 className={sectionTitle}>
              <svg className="h-4 w-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              Skills
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                list="skills-list"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                placeholder="Type a skill and press Enter..."
                className={inputCls}
              />
              <datalist id="skills-list">
                {availableSkills.map((sk) => (
                  <option key={sk.id} value={sk.name} />
                ))}
              </datalist>
              <button type="button" onClick={addSkill} className="bg-[#10B981] hover:bg-emerald-600 px-4 py-2.5 rounded-xl text-white font-semibold text-sm cursor-pointer transition-all flex-shrink-0">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.profile.skills.map((s, idx) => (
                <span key={idx} className="bg-slate-800 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5">
                  {s}
                  <button type="button" onClick={() => removeSkill(idx)} className="text-slate-500 hover:text-red-400 cursor-pointer">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Section 5: Certificates */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className={sectionTitle + " mb-0"}>
                <svg className="h-4 w-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                Certificates & Diplomas
              </h3>
              <button type="button" onClick={addCertificate} className="text-xs px-3 py-1.5 rounded-xl bg-blue-500/15 text-blue-400 font-semibold hover:bg-blue-500/25 transition-colors border border-blue-500/10 cursor-pointer">+ Add Certificate</button>
            </div>
            <div className="space-y-3">
              {form.profile.certificates.map((cert, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className={labelCls}>Certificate Name</label>
                      <input type="text" value={cert.name} onChange={e => updateCertificate(idx, 'name', e.target.value)} placeholder="AWS Certified" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Issuing Organization</label>
                      <input type="text" value={cert.issuingOrg} onChange={e => updateCertificate(idx, 'issuingOrg', e.target.value)} placeholder="Amazon Web Services" className={inputCls} />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className={labelCls}>Issue Date</label>
                        <input type="date" value={cert.issueDate} onChange={e => updateCertificate(idx, 'issueDate', e.target.value)} className={inputCls} />
                      </div>
                      <div className="flex items-end">
                        <button type="button" onClick={() => removeCertificate(idx)} className="p-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className={labelCls}>Certificate Image</label>
                    <div className="flex items-center gap-3">
                      {cert.imageUrl && (
                        <div className="relative group">
                          <img src={cert.imageUrl} alt="Certificate" className="h-12 w-12 object-cover rounded-lg border border-slate-700" />
                          <button type="button" onClick={() => updateCertificate(idx, 'imageUrl', null)} className="absolute -top-2 -right-2 bg-slate-800 border border-slate-600 text-red-400 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white cursor-pointer shadow-lg" title="Remove Image">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      )}
                      <label className="flex-1">
                        <span className="sr-only">Choose image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, (url) => updateCertificate(idx, 'imageUrl', url), `cert-${idx}`)}
                          className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#10B981]/10 file:text-[#10B981] hover:file:bg-[#10B981]/20 cursor-pointer"
                        />
                      </label>
                      {uploadingImage === `cert-${idx}` && <span className="text-xs text-amber-500 animate-pulse">Uploading...</span>}
                    </div>
                  </div>
                </div>
              ))}
              {form.profile.certificates.length === 0 && (
                <p className="text-xs text-slate-600 text-center py-4">No certificates added. Click "Add Certificate" above.</p>
              )}
            </div>
          </div>

          {/* Section 6: Portfolio Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className={sectionTitle + " mb-0"}>
                <svg className="h-4 w-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Portfolio Projects
              </h3>
              <button type="button" onClick={addPortfolio} className="text-xs px-3 py-1.5 rounded-xl bg-purple-500/15 text-purple-400 font-semibold hover:bg-purple-500/25 transition-colors border border-purple-500/10 cursor-pointer">+ Add Project</button>
            </div>
            <div className="space-y-3">
              {form.profile.portfolios.map((port, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Project Title</label>
                      <input type="text" value={port.title} onChange={e => updatePortfolio(idx, 'title', e.target.value)} placeholder="My Awesome Project" className={inputCls} />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className={labelCls}>Project Link</label>
                        <input type="url" value={port.link} onChange={e => updatePortfolio(idx, 'link', e.target.value)} placeholder="https://project.example.com" className={inputCls} />
                      </div>
                      <div className="flex items-end">
                        <button type="button" onClick={() => removePortfolio(idx)} className="p-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className={labelCls}>Description</label>
                    <textarea value={port.description} onChange={e => updatePortfolio(idx, 'description', e.target.value)} placeholder="Brief project description..." rows={2} className={inputCls + " resize-none"} />
                  </div>
                  <div className="mt-3">
                    <label className={labelCls}>Project Image</label>
                    <div className="flex items-center gap-3">
                      {port.imageUrl && (
                        <div className="relative group">
                          <img src={port.imageUrl} alt="Portfolio" className="h-12 w-16 object-cover rounded-lg border border-slate-700" />
                          <button type="button" onClick={() => updatePortfolio(idx, 'imageUrl', null)} className="absolute -top-2 -right-2 bg-slate-800 border border-slate-600 text-red-400 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white cursor-pointer shadow-lg" title="Remove Image">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      )}
                      <label className="flex-1">
                        <span className="sr-only">Choose image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, (url) => updatePortfolio(idx, 'imageUrl', url), `port-${idx}`)}
                          className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-500/10 file:text-purple-400 hover:file:bg-purple-500/20 cursor-pointer"
                        />
                      </label>
                      {uploadingImage === `port-${idx}` && <span className="text-xs text-amber-500 animate-pulse">Uploading...</span>}
                    </div>
                  </div>
                </div>
              ))}
              {form.profile.portfolios.length === 0 && (
                <p className="text-xs text-slate-600 text-center py-4">No portfolio projects added. Click "Add Project" above.</p>
              )}
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-900/80">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-semibold text-sm hover:bg-slate-800 hover:text-white transition-colors cursor-pointer">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-6 py-2.5 rounded-xl bg-[#10B981] text-white font-semibold text-sm hover:bg-emerald-600 transition-colors cursor-pointer shadow-lg shadow-emerald-500/15 disabled:opacity-50">
            {saving ? 'Saving...' : (isEditing ? 'Update Freelancer' : 'Create Freelancer')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreelancerFormModal;
