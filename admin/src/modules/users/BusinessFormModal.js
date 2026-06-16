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
    companyName: '',
    website: '',
    bio: ''
  }
};

const BusinessFormModal = ({ client, onClose, onSave }) => {
  const isEditing = !!client;
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (client) {
      const p = client.businessProfile || {};
      setForm({
        email: client.email || '',
        password: '',
        firstName: client.firstName || '',
        lastName: client.lastName || '',
        avatarUrl: client.avatarUrl || '',
        isVerified: client.isVerified || false,
        profile: {
          companyName: p.companyName || '',
          website: p.website || '',
          bio: p.bio || ''
        }
      });
    }
  }, [client]);

  const updateField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const updateProfile = (key, val) => setForm(prev => ({ ...prev, profile: { ...prev.profile, [key]: val } }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);
      
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateField('avatarUrl', res.data.data.url);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isEditing && (!form.email || !form.password)) {
      setError('Email and password are required for new businesses.');
      return;
    }
    if (!form.firstName || !form.lastName) {
      setError('Contact first name and last name are required.');
      return;
    }
    if (!form.profile.companyName) {
      setError('Company name is required.');
      return;
    }
    
    try {
      setSaving(true);
      await onSave(form, isEditing ? client.id : null);
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
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit Business Account' : 'Add New Business Account'}</h2>
            <p className="text-xs text-slate-500 mt-1">{isEditing ? 'Update business credentials and company info.' : 'Create login credentials for a new Business.'}</p>
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
                <label className={labelCls}>Login Email</label>
                <input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="business@example.com" className={inputCls} disabled={isEditing} />
                {isEditing && <p className="text-[10px] text-slate-600 mt-1">Email cannot be changed after creation.</p>}
              </div>
              <div>
                <label className={labelCls}>{isEditing ? 'New Password (leave blank to keep)' : 'Password'}</label>
                <input type="password" value={form.password} onChange={e => updateField('password', e.target.value)} placeholder={isEditing ? '••••••••' : 'Set a secure password'} className={inputCls} />
              </div>
            </div>
          </div>

          {/* Section 2: Company Information */}
          <div>
            <h3 className={sectionTitle}>
              <svg className="h-4 w-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              Business Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Company Name</label>
                <input type="text" value={form.profile.companyName} onChange={e => updateProfile('companyName', e.target.value)} placeholder="Acme Corp" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Website URL</label>
                <input type="url" value={form.profile.website} onChange={e => updateProfile('website', e.target.value)} placeholder="https://acme.com" className={inputCls} />
              </div>
            </div>
            <div className="mt-4">
              <label className={labelCls}>Company Logo</label>
              <div className="flex items-center gap-4">
                {form.avatarUrl ? (
                  <div className="relative group">
                    <img src={form.avatarUrl} alt="Logo" className="h-16 w-16 object-cover rounded-full border-2 border-slate-700" />
                    <button type="button" onClick={() => updateField('avatarUrl', '')} className="absolute -top-1 -right-1 bg-slate-800 border border-slate-600 text-red-400 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white cursor-pointer shadow-lg" title="Remove Logo">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
                <div className="flex-1">
                  <label>
                    <span className="sr-only">Choose logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#10B981]/10 file:text-[#10B981] hover:file:bg-[#10B981]/20 cursor-pointer"
                    />
                  </label>
                  {uploadingImage && <p className="text-xs text-amber-500 animate-pulse mt-1">Uploading...</p>}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className={labelCls}>Company Bio</label>
              <textarea value={form.profile.bio} onChange={e => updateProfile('bio', e.target.value)} placeholder="About the company..." rows={3} className={inputCls + " resize-none"} />
            </div>
          </div>

          {/* Section 3: Primary Contact */}
          <div>
            <h3 className={sectionTitle}>
              <svg className="h-4 w-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Primary Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Contact First Name</label>
                <input type="text" value={form.firstName} onChange={e => updateField('firstName', e.target.value)} placeholder="Jane" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Contact Last Name</label>
                <input type="text" value={form.lastName} onChange={e => updateField('lastName', e.target.value)} placeholder="Doe" className={inputCls} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button type="button" onClick={() => updateField('isVerified', !form.isVerified)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isVerified ? 'bg-[#10B981]' : 'bg-slate-700'}`}>
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-lg transform transition-transform ${form.isVerified ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm text-slate-300">Mark Account as Verified</span>
            </div>
          </div>

        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-900/80">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-semibold text-sm hover:bg-slate-800 hover:text-white transition-colors cursor-pointer">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-6 py-2.5 rounded-xl bg-[#10B981] text-white font-semibold text-sm hover:bg-emerald-600 transition-colors cursor-pointer shadow-lg shadow-emerald-500/15 disabled:opacity-50">
            {saving ? 'Saving...' : (isEditing ? 'Update Business' : 'Create Business')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessFormModal;
