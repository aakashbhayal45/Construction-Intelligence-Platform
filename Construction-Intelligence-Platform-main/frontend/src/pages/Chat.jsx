import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { MessageSquare, Send, RotateCcw, Bot, User, Copy, Check, Sparkles, BookOpen } from 'lucide-react';
import { assistantAPI } from '../api/client';

const STARTER_PROMPTS = [
  'What is the minimum concrete cover for slabs per IS 456?',
  'What are the permissible crack widths as per IS 456:2000?',
  'What are the seismic zone factors and ductile detailing per IS 1893?',
  'What is the standard stripping time for slab and beam formwork?',
];

function formatChatContent(content) {
  // Basic markdown formatting: bold, headers, list bullets
  const lines = content.split('\n');
  return lines.map((line, idx) => {
    // Header check
    if (line.startsWith('### ')) {
      return <h3 key={idx} style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', margin: '0.6rem 0 0.3rem' }}>{line.replace('### ', '')}</h3>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={idx} style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.8rem 0 0.4rem' }}>{line.replace('## ', '')}</h2>;
    }
    // Bullet check
    if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
      return (
        <div key={idx} style={{ display: 'flex', gap: '0.4rem', margin: '0.2rem 0' }}>
          <span style={{ color: 'var(--primary)', flexShrink: 0 }}>•</span>
          <span>{parseBold(line.trim().substring(2))}</span>
        </div>
      );
    }
    // Numbered list
    const numMatch = line.trim().match(/^([0-9]+)\.\s(.*)/);
    if (numMatch) {
      return (
        <div key={idx} style={{ display: 'flex', gap: '0.4rem', margin: '0.2rem 0' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 600, flexShrink: 0 }}>{numMatch[1]}.</span>
          <span>{parseBold(numMatch[2])}</span>
        </div>
      );
    }
    // Regular line
    return <div key={idx} style={{ minHeight: line === '' ? '0.6rem' : 'auto' }}>{parseBold(line)}</div>;
  });
}

function parseBold(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hello! I'm your Construction Knowledge Assistant. I can help with:\n\n• Indian building codes (IS 456, IS 875, IS 1893, NBC 2016)\n• Construction materials, concrete mix design & methods\n• Structural engineering and crack diagnostics\n• Site safety standards & OSHA/IS 14489 protocols\n• Cost estimation & BOQ guidance\n\nWhat would you like to explore today?",
      references: ['IS 456:2000', 'NBC 2016', 'IS 1893:2016'],
      follow_up_questions: [
        'What is the minimum concrete cover for slabs?',
        'What are permissible crack widths per IS 456?',
        'What are seismic zone criteria in India?',
      ],
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const copyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const sendMessage = async (text = input) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await assistantAPI.chat({ message: text, history });
      const data = res.data;
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        references: data.references || [],
        follow_up_questions: data.follow_up_questions || [],
      }]);
    } catch (err) {
      toast.error(err.message);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Encountered an issue connecting to the AI assistant. Please try again.',
        references: [],
        follow_up_questions: [],
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared. How can I assist you with construction codes or engineering methods?",
      references: [],
      follow_up_questions: STARTER_PROMPTS.slice(0, 3),
    }]);
  };

  return (
    <div className="page-container fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)' }}>
      <div className="page-header" style={{ marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h1 className="page-title">💬 Construction Knowledge Assistant</h1>
            <p className="page-subtitle">Expert AI advisor on Indian building standards (IS 456, NBC 2016, IS 1893), concrete technology, and execution best practices.</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={clearChat} id="clear-chat-btn">
            <RotateCcw size={14} /> Clear Chat
          </button>
        </div>
      </div>

      {/* Starter Suggestion Pills */}
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
        {STARTER_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => sendMessage(prompt)}
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '999px',
              padding: '0.3rem 0.75rem',
              fontSize: '0.75rem',
              color: 'var(--primary)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            <Sparkles size={11} style={{ display: 'inline', marginRight: '0.3rem' }} />
            {prompt}
          </button>
        ))}
      </div>

      <div className="card chat-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Messages */}
        <div className="chat-messages" style={{ flex: 1, overflowY: 'auto' }}>
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              <div className={`chat-avatar ${msg.role === 'user' ? 'user-avatar' : 'bot-avatar'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div style={{ flex: 1, maxWidth: '85%' }}>
                <div className="chat-bubble" style={
                  msg.role === 'user'
                    ? { background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.25)', color: 'var(--text-primary)' }
                    : { background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }
                }>
                  <div style={{ lineHeight: 1.7 }}>
                    {formatChatContent(msg.content)}
                  </div>

                  {/* References & Copy Bar */}
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {msg.references?.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {msg.references.map((r, j) => (
                          <span key={j} style={{ fontSize: '0.7rem', background: 'rgba(245,158,11,0.12)', color: 'var(--primary)', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid rgba(245,158,11,0.25)' }}>
                            <BookOpen size={10} style={{ display: 'inline', marginRight: '0.2rem' }} />
                            {r}
                          </span>
                        ))}
                      </div>
                    ) : <div />}

                    <button
                      type="button"
                      onClick={() => copyText(msg.content, i)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: copiedIdx === i ? '#4ade80' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                      title="Copy response"
                    >
                      {copiedIdx === i ? <Check size={12} /> : <Copy size={12} />}
                      {copiedIdx === i ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Follow-ups */}
                {msg.follow_up_questions?.length > 0 && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {msg.follow_up_questions.map((q, j) => (
                      <button
                        key={j}
                        onClick={() => sendMessage(q)}
                        style={{
                          background: 'rgba(245,158,11,0.08)',
                          border: '1px solid rgba(245,158,11,0.2)',
                          borderRadius: '999px',
                          padding: '0.3rem 0.75rem',
                          fontSize: '0.75rem',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontFamily: 'inherit',
                        }}
                      >
                        ↳ {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-message assistant">
              <div className="chat-avatar bot-avatar"><Bot size={16} /></div>
              <div className="chat-bubble" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '6px', padding: '6px' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: 'var(--primary)',
                      animation: `pulse-text 1s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <input
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask about IS 456, concrete cover, NBC 2016, rebar detailing, curing times..."
            disabled={loading}
            id="chat-input"
          />
          <button
            className="btn btn-primary"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            id="send-chat-btn"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
