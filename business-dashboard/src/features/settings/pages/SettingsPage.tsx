import React, { useState, useEffect } from 'react';
import ImageUploader from '../../../components/ImageUploader';
import { useAuthStore } from '../../../store/useAuthStore';
import { apiClient } from '../../../lib/axios';

const SettingsPage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [uploadMessage, setUploadMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    industry: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        companyName: '',
        industry: '',
      });
      // Fetch business profile info
      fetchBusinessProfile();
    }
  }, [user]);

  const fetchBusinessProfile = async () => {
    try {
      const res = await apiClient.get('/users/me');
      if (res.data.success) {
        const data = res.data.data;
        setForm(prev => ({
          ...prev,
          firstName: data.firstName || prev.firstName,
          lastName: data.lastName || prev.lastName,
          email: data.email || prev.email,
          companyName: data.businessProfile?.companyName || data.clientProfile?.companyName || '',
          industry: data.businessProfile?.industry || '',
        }));
      }
    } catch {}
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.put('/users/me', {
        firstName: form.firstName,
        lastName: form.lastName,
      });
      if (user) {
        setUser({ ...user, firstName: form.firstName, lastName: form.lastName });
      }
      setUploadMessage({ text: 'Settings saved successfully!', type: 'success' });
      setTimeout(() => setUploadMessage(null), 3000);
    } catch (err) {
      setUploadMessage({ text: 'Failed to save settings.', type: 'error' });
      setTimeout(() => setUploadMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24, maxWidth: 800, margin: '0 auto', width: '100%' }}>
      <div>
        <h1 style={{ color: '#0F172A', fontSize: 24, fontWeight: 700 }}>Company Settings</h1>
        <p style={{ color: '#64748B', marginTop: 4 }}>Manage your business profile, preferences, and security.</p>
      </div>

      {/* Upload notification */}
      {uploadMessage && (
        <div style={{
          padding: '12px 16px', borderRadius: 10,
          background: uploadMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          color: uploadMessage.type === 'success' ? '#065F46' : '#991B1B',
          fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {uploadMessage.type === 'success' ? '✓' : '✕'} {uploadMessage.text}
        </div>
      )}

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Company Profile</h3>

          <div style={{ display: 'flex', gap: 24, marginBottom: 24, alignItems: 'center' }}>
            <ImageUploader
              currentImage={user?.avatarUrl || undefined}
              uploadEndpoint="/upload/profile"
              shape="circle"
              size={100}
              label="Company Logo"
              onUploadSuccess={(url) => {
                setUploadMessage({ text: 'Logo uploaded successfully!', type: 'success' });
                setTimeout(() => setUploadMessage(null), 3000);
              }}
              onUploadError={(err) => {
                setUploadMessage({ text: err, type: 'error' });
                setTimeout(() => setUploadMessage(null), 5000);
              }}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
              <p style={{ fontSize: 14, color: '#475569', fontWeight: 600 }}>Upload your company logo</p>
              <p style={{ fontSize: 12, color: '#94A3B8' }}>Recommended size: 400x400px. Max file size: 5MB. Supported: JPEG, PNG, WebP.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>First Name</label>
              <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} style={{ width: '100%', padding: '10px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Last Name</label>
              <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} style={{ width: '100%', padding: '10px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Company Name</label>
              <input type="text" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} style={{ width: '100%', padding: '10px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Industry</label>
              <input type="text" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} style={{ width: '100%', padding: '10px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Email</label>
              <input type="email" value={form.email} disabled style={{ width: '100%', padding: '10px 12px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', color: '#94A3B8' }} />
            </div>
          </div>
        </div>

        <div style={{ padding: '24px', background: '#F8FAFC' }}>
          <button onClick={handleSave} disabled={saving} style={{ background: saving ? '#94A3B8' : '#10B981', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 8, fontWeight: 600, cursor: saving ? 'default' : 'pointer', fontSize: 14 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Security Section */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Security</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #E2E8F0' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Password</div>
              <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>Last changed: Never</div>
            </div>
            <button style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: 8, color: '#0F172A', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Change Password</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Two-Factor Authentication</div>
              <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>Add an extra layer of security to your account.</div>
            </div>
            <button style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: 8, color: '#0F172A', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Enable</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
