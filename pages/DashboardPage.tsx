import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { MessageSquare, Users, TrendingUp, Bot, Instagram, CheckCircle, Clock } from 'lucide-react';

interface DashboardData {
  conversations: number;
  ai_active: number;
  telegram: number;
  instagram: number;
  leads: number;
  need_to_call: number;
}

const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
  <div className="card" style={{ padding: '1.5rem' }}>
    <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
          {title}
        </p>
        <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
          {value}
        </h3>
        {subtitle && (
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
            {subtitle}
          </p>
        )}
      </div>
      <div style={{
        padding: '0.75rem',
        borderRadius: '0.75rem',
        backgroundColor: `${color}20`,
        color: color
      }}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const { user, businessId } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData>({
    conversations: 0,
    ai_active: 0,
    telegram: 0,
    instagram: 0,
    leads: 0,
    need_to_call: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [businessId]);

  const fetchDashboardData = async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch conversations
      const conversationsRes = await apiClient.get('/chat/conversations', {
        params: { business_id: businessId }
      });
      const conversations = conversationsRes.data.conversations || [];

      // Fetch leads
      const leadsRes = await apiClient.get('/leads', {
        params: { business_id: businessId }
      });
      const leads = leadsRes.data.leads || [];
      const leadStats = leadsRes.data.stats || {};

      setData({
        conversations: conversations.length,
        ai_active: conversations.filter((c: any) => c.ai_enabled).length,
        telegram: conversations.filter((c: any) => c.channel === 'telegram').length,
        instagram: conversations.filter((c: any) => c.channel === 'instagram').length,
        leads: leads.length,
        need_to_call: leadStats.need_to_call || 0,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  if (!businessId && user?.role !== 'admin') {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <Users size={64} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto 1rem', opacity: 0.5 }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          No Business Assigned
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          Please contact your administrator to assign you to a business.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Welcome back, {user?.username}! 👋
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <StatCard
          title="Total Conversations"
          value={data.conversations}
          icon={MessageSquare}
          color="var(--color-primary)"
          subtitle="Active chats"
        />
        <StatCard
          title="AI Active"
          value={data.ai_active}
          icon={Bot}
          color="var(--color-info)"
          subtitle={`${data.conversations - data.ai_active} manual`}
        />
        <StatCard
          title="Total Leads"
          value={data.leads}
          icon={TrendingUp}
          color="var(--color-success)"
          subtitle="All time"
        />
        <StatCard
          title="Need to Call"
          value={data.need_to_call}
          icon={Clock}
          color="var(--color-danger)"
          subtitle="Urgent leads"
        />
      </div>

      {/* Channels & Quick Actions Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Channel Distribution */}
        <div className="card">
          <h2 className="card-title">Channel Distribution</h2>
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              backgroundColor: 'var(--color-bg-tertiary)',
              borderRadius: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  padding: '0.5rem',
                  backgroundColor: 'rgba(0, 136, 204, 0.1)',
                  borderRadius: '0.5rem',
                  color: '#0088cc'
                }}>
                  <MessageSquare size={20} />
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Telegram</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Instant messaging</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {data.telegram}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                  conversations
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              backgroundColor: 'var(--color-bg-tertiary)',
              borderRadius: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  padding: '0.5rem',
                  backgroundColor: 'rgba(228, 64, 95, 0.1)',
                  borderRadius: '0.5rem',
                  color: '#E4405F'
                }}>
                  <Instagram size={20} />
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Instagram</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Direct messages</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {data.instagram}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                  conversations
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="card-title">Quick Actions</h2>
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => navigate('/chat')}
              className="btn"
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                padding: '1rem',
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)'
              }}
            >
              <MessageSquare size={20} />
              <span style={{ flex: 1, textAlign: 'left' }}>View Conversations</span>
              <span className="badge badge-primary">{data.conversations}</span>
            </button>

            <button
              onClick={() => navigate('/leads')}
              className="btn"
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                padding: '1rem',
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)'
              }}
            >
              <TrendingUp size={20} />
              <span style={{ flex: 1, textAlign: 'left' }}>Manage Leads</span>
              <span className="badge badge-danger">{data.need_to_call}</span>
            </button>

            {(user?.role === 'owner' || user?.role === 'admin') && (
              <button
                onClick={() => navigate('/bot-config')}
                className="btn"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '1rem',
                  backgroundColor: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <Bot size={20} />
                <span style={{ flex: 1, textAlign: 'left' }}>Bot Configuration</span>
              </button>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <h2 className="card-title">System Status</h2>
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />
              <div>
                <p style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>AI Service</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                  {data.ai_active} conversations running
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />
              <div>
                <p style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>Telegram Bot</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                  {data.telegram} active chats
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />
              <div>
                <p style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>Instagram</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                  {data.instagram} active chats
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
