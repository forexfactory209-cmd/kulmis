import React, { useState } from 'react';

const SupportPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [ticket, setTicket] = useState({ subject: '', message: '' });
  const [tickets, setTickets] = useState<{id: string, subject: string, status: string, date: string}[]>([]);

  const handleOpenTicket = () => {
    if (!ticket.subject || !ticket.message) return alert('Please fill in all fields');
    const newTicket = {
      id: `TKT-${Math.floor(Math.random() * 10000)}`,
      subject: ticket.subject,
      status: 'Open',
      date: new Date().toLocaleDateString()
    };
    setTickets([newTicket, ...tickets]);
    setShowModal(false);
    setTicket({ subject: '', message: '' });
    alert('Ticket opened successfully! Our support team will get back to you soon.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24, maxWidth: 800, margin: '0 auto', width: '100%' }}>
      <div>
        <h1 style={{ color: '#0F172A', fontSize: 24, fontWeight: 700 }}>Support & Help Center</h1>
        <p style={{ color: '#64748B', marginTop: 4 }}>Get assistance, view FAQs, and contact our team.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Contact Support</h3>
          <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.5 }}>Our team is available 24/7 to help you with any platform issues or questions.</p>
          <button onClick={() => setShowModal(true)} style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14, marginTop: 'auto', alignSelf: 'flex-start' }}>Open a Ticket</button>
        </div>
        
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Knowledge Base</h3>
          <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.5 }}>Browse our detailed guides and tutorials to get the most out of the platform.</p>
          <button onClick={() => alert('Opening Knowledge Base...')} style={{ background: '#10B981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14, marginTop: 'auto', alignSelf: 'flex-start' }}>Browse Articles</button>
        </div>
      </div>

      {tickets.length > 0 && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>Your Tickets</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tickets.map(t => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 14 }}>{t.subject}</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{t.id} • {t.date}</div>
                </div>
                <span style={{ background: '#EFF6FF', color: '#3B82F6', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>Frequently Asked Questions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { q: 'How do I add a new payment method?', a: 'You can add a new payment method by navigating to the Billing section and clicking on "Update Payment Method".' },
            { q: 'How are disputes resolved?', a: 'Disputes are reviewed by our moderation team within 48 hours. Both parties will be asked to provide evidence before a final decision is made.' },
            { q: 'Can I change my subscription plan?', a: 'Yes, you can upgrade or downgrade your plan at any time from the Company Settings page.' },
          ].map((faq, i) => (
            <div key={i} style={{ borderBottom: i === 2 ? 'none' : '1px solid #E2E8F0', paddingBottom: i === 2 ? 0 : 16 }}>
              <h4 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>{faq.q}</h4>
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.5 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 16, width: 400 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Open a Ticket</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Subject</label>
                <input 
                  type="text" 
                  value={ticket.subject} 
                  onChange={e => setTicket({ ...ticket, subject: e.target.value })} 
                  placeholder="Brief description of the issue" 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8 }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Message</label>
                <textarea 
                  value={ticket.message} 
                  onChange={e => setTicket({ ...ticket, message: e.target.value })} 
                  rows={4} 
                  placeholder="Provide more details..." 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8 }} 
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleOpenTicket} style={{ padding: '8px 16px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Submit Ticket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPage;
