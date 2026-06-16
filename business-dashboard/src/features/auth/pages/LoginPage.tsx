import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/useAuthStore';
import { apiClient } from '../../../lib/axios';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    try {
      setLoading(true);
      const res = await apiClient.post('/auth/login', { email, password });
      const { user, accessToken } = res.data.data;
      if (user.role !== 'CLIENT') {
        setError('This portal is for business accounts only. Please contact your administrator.');
        return;
      }
      login(user, accessToken);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Background decoration */}
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />

      <div style={styles.container}>
        {/* Left branding panel */}
        <div style={styles.brandPanel}>
          <div style={styles.brandContent}>
            <div style={styles.logoMark}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="12" fill="#10B981" />
                <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 style={styles.brandTitle}>Kulmis</h1>
            <p style={styles.brandSubtitle}>Business Dashboard</p>
            <div style={styles.brandDivider} />
            <p style={styles.brandDesc}>
              Manage your team, discover talent, track projects, and grow your business — all in one powerful platform.
            </p>
            <div style={styles.features}>
              {['Discover Top Talent', 'Team Management', 'Payroll & Attendance', 'Project Tracking'].map((f, i) => (
                <div key={i} style={styles.featureItem}>
                  <div style={styles.featureDot} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right login form */}
        <div style={styles.formPanel}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div>
              <h2 style={styles.formTitle}>Welcome back</h2>
              <p style={styles.formSubtitle}>Sign in to your business account</p>
            </div>

            {error && (
              <div style={styles.errorBox}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                <span>{error}</span>
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  style={styles.input}
                  autoComplete="email"
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={styles.input}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? (
                <div style={styles.spinner} />
              ) : (
                <>
                  Sign In
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </>
              )}
            </button>

            <p style={styles.footer}>
              Don't have an account? <span style={styles.footerLink}>Contact your administrator</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0B0F19',
    position: 'relative',
    overflow: 'hidden',
  },
  bgOrb1: {
    position: 'absolute',
    top: '-20%',
    left: '-10%',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
    filter: 'blur(80px)',
  },
  bgOrb2: {
    position: 'absolute',
    bottom: '-20%',
    right: '-10%',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
    filter: 'blur(80px)',
  },
  container: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    maxWidth: 1000,
    minHeight: 580,
    margin: '20px',
    borderRadius: 20,
    overflow: 'hidden',
    border: '1px solid #1E293B',
    boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
    background: '#111827',
  },
  brandPanel: {
    flex: '1 1 45%',
    background: 'linear-gradient(135deg, #0D1117 0%, #111827 50%, #0B0F19 100%)',
    padding: 48,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    borderRight: '1px solid #1E293B',
  },
  brandContent: {},
  logoMark: { marginBottom: 20 },
  brandTitle: {
    fontSize: 32,
    fontWeight: 800,
    color: '#F8FAFC',
    letterSpacing: '-0.02em',
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: 500,
    color: '#10B981',
    marginTop: 4,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as any,
  },
  brandDivider: {
    width: 48,
    height: 3,
    background: 'linear-gradient(90deg, #10B981, transparent)',
    borderRadius: 2,
    margin: '20px 0',
  },
  brandDesc: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 1.7,
    marginBottom: 28,
  },
  features: {
    display: 'flex',
    flexDirection: 'column' as any,
    gap: 14,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 13,
    color: '#CBD5E1',
    fontWeight: 500,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#10B981',
    boxShadow: '0 0 8px rgba(16,185,129,0.4)',
  },
  formPanel: {
    flex: '1 1 55%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  form: {
    width: '100%',
    maxWidth: 380,
    display: 'flex',
    flexDirection: 'column' as any,
    gap: 24,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: '#F8FAFC',
    letterSpacing: '-0.01em',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    borderRadius: 12,
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.15)',
    color: '#EF4444',
    fontSize: 13,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as any,
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: '#94A3B8',
    textTransform: 'uppercase' as any,
    letterSpacing: '0.06em',
  },
  inputWrapper: {
    position: 'relative' as any,
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute' as any,
    left: 14,
    pointerEvents: 'none' as any,
  },
  input: {
    width: '100%',
    padding: '14px 14px 14px 42px',
    background: '#0D1117',
    border: '1px solid #1E293B',
    borderRadius: 12,
    color: '#F8FAFC',
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  eyeBtn: {
    position: 'absolute' as any,
    right: 12,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
  },
  submitBtn: {
    width: '100%',
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'all 0.2s',
    boxShadow: '0 4px 16px rgba(16,185,129,0.25)',
    marginTop: 4,
  },
  spinner: {
    width: 20,
    height: 20,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  footer: {
    textAlign: 'center' as any,
    fontSize: 13,
    color: '#64748B',
  },
  footerLink: {
    color: '#10B981',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default LoginPage;
