import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/client';
import { Conversation, Message, ConversationsResponse, MessagesResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { Send, Bot, User, Search, Instagram, MessageCircle, MoreVertical, Loader } from 'lucide-react';

const ChatPage = () => {
  const { businessId } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Poll conversations list
  useEffect(() => {
    const fetchConversations = async () => {
      if (!businessId) return;

      try {
        const { data } = await apiClient.get<ConversationsResponse>('/chat/conversations', {
          params: { business_id: businessId }
        });
        setConversations(data.conversations || []);
      } catch (error) {
        console.error('Error fetching conversations', error);
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [businessId]);

  // Poll messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchHistory = async () => {
      try {
        const { data } = await apiClient.get<MessagesResponse>(`/chat/history/${selectedConversation.id}`);
        setMessages(data.messages || []);
        if (loadingMessages) setLoadingMessages(false);
      } catch (error) {
        console.error('Error fetching history', error);
      }
    };

    setLoadingMessages(true);
    fetchHistory();
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, [selectedConversation]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await apiClient.post('/chat/send-message', {
        conversation_id: selectedConversation.id,
        text: newMessage,
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const toggleAI = async () => {
    if (!selectedConversation) return;

    try {
      const { data } = await apiClient.patch('/chat/toggle-ai', {
        conversation_id: selectedConversation.id,
        ai_enabled: !selectedConversation.ai_enabled
      });

      setSelectedConversation({ ...selectedConversation, ai_enabled: data.ai_enabled });
      setConversations(conversations.map(c =>
        c.id === selectedConversation.id ? { ...c, ai_enabled: data.ai_enabled } : c
      ));
    } catch (error) {
      console.error('Failed to toggle AI', error);
    }
  };

  const filteredConversations = conversations.filter(c =>
    (c.client_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!businessId) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          No business assigned to your account. Please contact admin.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ height: 'calc(100vh - 8rem)', display: 'flex', padding: 0, overflow: 'hidden' }}>
      {/* Sidebar: Conversation List */}
      <div style={{
        width: '360px',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-tertiary)'
              }}
            />
            <input
              type="text"
              placeholder="Search conversations..."
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingConversations ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div className="loading-spinner" style={{ margin: '0 auto' }} />
              <p style={{ marginTop: '1rem', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
                Loading conversations...
              </p>
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid var(--color-border-light)',
                  cursor: 'pointer',
                  backgroundColor: selectedConversation?.id === conv.id ? 'var(--color-active)' : 'transparent',
                  borderLeft: selectedConversation?.id === conv.id ? '3px solid var(--color-primary)' : '3px solid transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e: any) => {
                  if (selectedConversation?.id !== conv.id) {
                    e.currentTarget.style.backgroundColor = 'var(--color-hover)';
                  }
                }}
                onMouseLeave={(e: any) => {
                  if (selectedConversation?.id !== conv.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                    <span style={{
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      fontSize: '0.875rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '200px'
                    }}>
                      {conv.client_name || 'Unknown User'}
                    </span>
                    {conv.channel === 'telegram' ? (
                      <MessageCircle size={14} style={{ color: '#0088cc', flexShrink: 0 }} />
                    ) : (
                      <Instagram size={14} style={{ color: '#E4405F', flexShrink: 0 }} />
                    )}
                  </div>
                  {conv.last_message && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', flexShrink: 0 }}>
                      {new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                {conv.last_message && (
                  <p style={{
                    fontSize: '0.8125rem',
                    color: 'var(--color-text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '0.5rem'
                  }}>
                    {conv.last_message.text}
                  </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {conv.ai_enabled ? (
                    <span className="badge badge-primary">AI Active</span>
                  ) : (
                    <span className="badge" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>
                      Manual Mode
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <MessageCircle size={48} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--color-text-secondary)' }}>
                {searchTerm ? 'No conversations found' : 'No conversations yet'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Panel: Messages */}
      {selectedConversation ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{
            height: '4rem',
            borderBottom: '1px solid var(--color-border)',
            padding: '0 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-bg-primary)'
          }}>
            <div>
              <h2 style={{
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                fontSize: '1rem',
                marginBottom: '0.25rem'
              }}>
                {selectedConversation.client_name || 'Unknown User'}
              </h2>
              <span style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-tertiary)',
                textTransform: 'capitalize'
              }}>
                {selectedConversation.channel}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={toggleAI}
                className="btn"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.8125rem',
                  backgroundColor: selectedConversation.ai_enabled ? 'var(--color-info-light)' : 'var(--color-bg-tertiary)',
                  color: selectedConversation.ai_enabled ? 'var(--color-info)' : 'var(--color-text-secondary)'
                }}
              >
                {selectedConversation.ai_enabled ? 'AI Enabled' : 'AI Paused'}
              </button>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-tertiary)',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            backgroundColor: 'var(--color-bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {loadingMessages && messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Loader size={32} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.sender_type === 'client' ? 'flex-start' : 'flex-end'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '0.75rem 1rem',
                      borderRadius: '1rem',
                      backgroundColor:
                        msg.sender_type === 'client'
                          ? 'var(--color-card)'
                          : msg.sender_type === 'ai'
                          ? 'var(--color-info-light)'
                          : 'var(--color-primary)',
                      color:
                        msg.sender_type === 'operator'
                          ? 'white'
                          : 'var(--color-text-primary)',
                      boxShadow: 'var(--shadow-sm)',
                      border: msg.sender_type === 'client' ? '1px solid var(--color-border)' : 'none'
                    }}
                  >
                    <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                      {msg.text}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.75rem',
                      color: msg.sender_type === 'operator' ? 'rgba(255,255,255,0.8)' : 'var(--color-text-tertiary)'
                    }}>
                      {msg.sender_type === 'ai' && <Bot size={12} />}
                      {msg.sender_type === 'operator' && <User size={12} />}
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-primary)'
          }}>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="btn btn-primary"
                style={{ padding: '0.625rem 1.25rem' }}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-tertiary)',
          backgroundColor: 'var(--color-bg-secondary)'
        }}>
          <MessageCircle size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p style={{ fontSize: '1.125rem' }}>Select a conversation to start chatting</p>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
