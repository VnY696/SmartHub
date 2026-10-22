import React, { useState, useRef, useEffect } from 'react';
import api from '../../api/client';
import { Bot, Send, X, Sparkles, User, MapPin, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! 👋 I am your SmartHub AI assistant. Ask me anything about local services, pricing, or how to book!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post('/chatbot/chat/', { message: userMsg });
      const data = res.data;

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply,
          recommended_services: data.recommended_services || [],
          recommended_categories: data.recommended_categories || [],
        },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I ran into an error connecting to the service. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setOpen(!open)}
        className="animate-glow"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'var(--accent-gradient)',
          border: 'none',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-glow)',
          zIndex: 150,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {open ? <X size={28} /> : <Bot size={28} />}
      </button>

      {/* Floating Chat Modal */}
      {open && (
        <div
          className="glass-panel animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: '380px',
            height: '520px',
            background: '#111827',
            zIndex: 150,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={20} />
              <div>
                <h4 style={{ fontSize: '1rem', color: '#fff' }}>SmartHub AI Assistant</h4>
                <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Online • Instant Help</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Container */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {m.role === 'assistant' && (
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={16} color="#fff" />
                  </div>
                )}

                <div style={{ maxWidth: '80%' }}>
                  <div
                    style={{
                      background: m.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                      border: m.role === 'user' ? 'none' : '1px solid var(--glass-border)',
                      padding: '10px 14px',
                      borderRadius: m.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      fontSize: '0.88rem',
                      whiteSpace: 'pre-line',
                      lineHeight: '1.5',
                    }}
                  >
                    {m.content}
                  </div>

                  {/* Inline Recommended Services Cards */}
                  {m.recommended_services && m.recommended_services.length > 0 && (
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Recommended Services:</span>
                      {m.recommended_services.map((svc) => (
                        <Link
                          key={svc.id}
                          to={`/services/${svc.id}`}
                          onClick={() => setOpen(false)}
                          style={{
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            display: 'block',
                            transition: '0.2s',
                          }}
                        >
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{svc.title}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            <span>${svc.price}</span>
                            <span><MapPin size={12} inline /> {svc.city}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={16} color="#fff" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                SmartHub AI is thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} style={{ padding: '12px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Ask about plumbers, pricing..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ fontSize: '0.85rem', padding: '10px' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '10px' }} disabled={loading}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
