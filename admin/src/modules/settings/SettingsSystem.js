import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const SettingsSystem = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [settings, setSettings] = useState({
    platformName: 'Somlance',
    supportEmail: 'support@somlance.com',
    defaultCurrency: 'USD',
    commissionRate: 15,
    maintenanceMode: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/settings');
      if (res.data.data) {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/admin/settings', settings);
      showSuccess('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const updateField = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'payments', label: 'Payments', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  ];

  const renderFieldGroup = (label, children) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-300">{label}</label>
      {children}
    </div>
  );

  const inputClass = "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#10B981]/50 focus:border-[#10B981] transition-colors placeholder-slate-600";

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderFieldGroup('Platform Name',
          <input
            type="text"
            value={settings.platformName}
            onChange={(e) => updateField('platformName', e.target.value)}
            className={inputClass}
            placeholder="Somlance"
          />
        )}
        {renderFieldGroup('Support Email',
          <input
            type="email"
            value={settings.supportEmail}
            onChange={(e) => updateField('supportEmail', e.target.value)}
            className={inputClass}
            placeholder="support@somlance.com"
          />
        )}
      </div>

      {/* Maintenance Mode Toggle */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
              settings.maintenanceMode ? 'bg-amber-500/10' : 'bg-emerald-500/10'
            }`}>
              <svg className={`h-6 w-6 ${settings.maintenanceMode ? 'text-amber-400' : 'text-emerald-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Maintenance Mode</h4>
              <p className="text-xs text-slate-500 mt-0.5">When enabled, the platform will be temporarily inaccessible to users.</p>
            </div>
          </div>
          <button
            onClick={() => updateField('maintenanceMode', !settings.maintenanceMode)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 cursor-pointer ${
              settings.maintenanceMode ? 'bg-amber-500' : 'bg-slate-700'
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
              settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      {/* Platform Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Version', value: 'v1.0.0', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
          { label: 'Environment', value: 'Production', icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2' },
          { label: 'Uptime', value: '99.97%', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
        ].map((item, i) => (
          <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{item.label}</p>
              <p className="text-sm font-bold text-white">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPaymentsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderFieldGroup('Default Currency',
          <select
            value={settings.defaultCurrency}
            onChange={(e) => updateField('defaultCurrency', e.target.value)}
            className={inputClass}
          >
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British Pound</option>
            <option value="CAD">CAD — Canadian Dollar</option>
            <option value="AUD">AUD — Australian Dollar</option>
          </select>
        )}
        {renderFieldGroup('Platform Commission Rate (%)',
          <div className="relative">
            <input
              type="number"
              value={settings.commissionRate}
              onChange={(e) => updateField('commissionRate', parseFloat(e.target.value) || 0)}
              className={inputClass}
              min="0"
              max="100"
              step="0.5"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">%</span>
          </div>
        )}
      </div>

      {/* Commission Visual Preview */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-white mb-4">Commission Breakdown Preview</h4>
        <div className="space-y-3">
          {(() => {
            const exampleAmounts = [100, 500, 1000, 5000];
            return exampleAmounts.map((amount, i) => {
              const commission = (amount * settings.commissionRate / 100).toFixed(2);
              const payout = (amount - parseFloat(commission)).toFixed(2);
              return (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                  <span className="text-sm text-slate-400">
                    ${amount.toLocaleString()} project
                  </span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-amber-400 font-semibold">
                      ${commission} fee
                    </span>
                    <span className="text-[#10B981] font-semibold">
                      ${payout} payout
                    </span>
                  </div>
                </div>
              );
            });
          })()}
        </div>

        {/* Visual Bar */}
        <div className="mt-4 flex items-center gap-2">
          <div
            className="h-3 rounded-l-full bg-amber-500/50 transition-all duration-500"
            style={{ width: `${settings.commissionRate}%` }}
          />
          <div
            className="h-3 rounded-r-full bg-[#10B981]/50 transition-all duration-500"
            style={{ width: `${100 - settings.commissionRate}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] mt-1 text-slate-500">
          <span>Platform Fee: {settings.commissionRate}%</span>
          <span>Freelancer Payout: {100 - settings.commissionRate}%</span>
        </div>
      </div>

      {/* Payment Methods Info */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-white mb-3">Escrow Payment System</h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          All client payments are held in escrow until project milestones are completed and approved.
          Funds are automatically released to freelancers upon project completion, minus the platform
          commission. In case of disputes, funds remain in escrow until a resolution is reached by the admin.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {['Escrow Protection', 'Automatic Payouts', 'Dispute Holds', 'Refund Support'].map((feature, i) => (
            <span key={i} className="text-[10px] font-semibold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-2.5 py-1 rounded-lg">
              ✓ {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      {/* Security Cards */}
      {[
        {
          title: 'Two-Factor Authentication',
          description: 'Require administrators to verify their identity with a second factor (SMS or authenticator app) when logging in.',
          status: true,
          statusLabel: 'Enforced',
          color: 'emerald'
        },
        {
          title: 'Session Management',
          description: 'Admin sessions expire after 24 hours of inactivity. Active sessions are tracked and can be revoked.',
          status: true,
          statusLabel: 'Active',
          color: 'emerald'
        },
        {
          title: 'IP Whitelisting',
          description: 'Restrict admin panel access to specific IP addresses. Currently disabled — all IPs can access.',
          status: false,
          statusLabel: 'Disabled',
          color: 'slate'
        },
        {
          title: 'Rate Limiting',
          description: 'API rate limiting is enforced to prevent abuse. Maximum 100 requests per minute per user.',
          status: true,
          statusLabel: 'Active',
          color: 'emerald'
        },
      ].map((card, i) => (
        <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-4 flex-1">
              <div className={`h-10 w-10 rounded-xl bg-${card.color}-500/10 flex items-center justify-center shrink-0 mt-0.5`}>
                <svg className={`h-5 w-5 text-${card.color}-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">{card.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{card.description}</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border shrink-0 self-start sm:self-center ${
              card.status
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
            }`}>
              {card.statusLabel}
            </span>
          </div>
        </div>
      ))}

      {/* Recent Login Activity */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-white mb-4">Recent Admin Login Activity</h4>
        <div className="space-y-3">
          {[
            { time: 'Today, 10:32 AM', ip: '192.168.1.42', browser: 'Chrome 126', status: 'success' },
            { time: 'Yesterday, 5:17 PM', ip: '192.168.1.42', browser: 'Chrome 126', status: 'success' },
            { time: 'May 18, 2:01 PM', ip: '10.0.0.55', browser: 'Firefox 128', status: 'success' },
            { time: 'May 17, 11:49 AM', ip: '203.0.113.12', browser: 'Safari 17', status: 'failed' },
          ].map((entry, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${entry.status === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <div>
                  <p className="text-xs text-slate-300 font-medium">{entry.time}</p>
                  <p className="text-[10px] text-slate-500">{entry.browser} • {entry.ip}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                entry.status === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {entry.status === 'success' ? 'Success' : 'Failed'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Platform Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Configure system preferences, payment parameters, and security policies.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-[#10B981] hover:bg-emerald-600 px-6 py-2.5 rounded-xl text-white font-semibold text-sm cursor-pointer transition-all shadow-lg shadow-emerald-500/15 disabled:opacity-50 shrink-0 self-start sm:self-center"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : 'Save Changes'}
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {successMsg}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1.5 flex gap-1 shadow-xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#10B981] text-white shadow-lg shadow-emerald-500/15'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 shadow-xl">
          <div className="flex flex-col items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-[#10B981] mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-slate-500 text-xs">Loading settings...</span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl animate-fade-in">
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'payments' && renderPaymentsTab()}
          {activeTab === 'security' && renderSecurityTab()}
        </div>
      )}
    </div>
  );
};

export default SettingsSystem;
