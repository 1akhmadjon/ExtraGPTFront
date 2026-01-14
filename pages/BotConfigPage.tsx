import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import {
  BotConfig,
  BusinessSettings,
  InstagramStatus,
  GlobalBotStatus
} from '../types';
import {
  Bot,
  MessageSquare,
  Instagram,
  Save,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Bell,
  Clock,
  Play
} from 'lucide-react';

const BotConfigPage = () => {
  const { businessId } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'telegram' | 'instagram' | 'settings' | 'reports'>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Bot Config
  const [botConfig, setBotConfig] = useState<BotConfig | null>(null);
  const [botName, setBotName] = useState('');
  const [prompt, setPrompt] = useState('');

  // Telegram
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramSetup, setTelegramSetup] = useState(false);

  // Instagram
  const [instagramStatus, setInstagramStatus] = useState<InstagramStatus | null>(null);
  const [instagramBusinessId, setInstagramBusinessId] = useState('');

  // Settings
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [aiPauseFrom, setAiPauseFrom] = useState('');
  const [aiPauseTo, setAiPauseTo] = useState('');
  const [followupTemplate, setFollowupTemplate] = useState('');
  const [dailyReportTime, setDailyReportTime] = useState('21:00');

  // Global Bot Status
  const [globalBotStatus, setGlobalBotStatus] = useState<GlobalBotStatus | null>(null);

  useEffect(() => {
    if (businessId) {
      fetchAllData();
    }
  }, [businessId]);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchBotConfig(),
        fetchSettings(),
        fetchInstagramStatus(),
        fetchGlobalBotStatus()
      ]);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBotConfig = async () => {
    try {
      const { data } = await apiClient.get(`/bot/config`, {
        params: { business_id: businessId }
      });
      setBotConfig(data);
      setBotName(data.bot_name || '');
      setPrompt(data.prompt || '');
      setTelegramSetup(data.telegram_webhook_set || false);
    } catch (error) {
      console.error('Failed to fetch bot config', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await apiClient.get(`/bot-settings`, {
        params: { business_id: businessId }
      });
      setSettings(data);
      setAiPauseFrom(data.ai_pause_from || '');
      setAiPauseTo(data.ai_pause_to || '');
      setFollowupTemplate(data.followup_template || '');
      setDailyReportTime(data.daily_report_time || '21:00');
    } catch (error) {
      console.error('Failed to fetch settings', error);
    }
  };

  const fetchInstagramStatus = async () => {
    try {
      const { data } = await apiClient.get(`/instagram/status`, {
        params: { business_id: businessId }
      });
      setInstagramStatus(data);
    } catch (error) {
      console.error('Failed to fetch Instagram status', error);
    }
  };

  const fetchGlobalBotStatus = async () => {
    try {
      const { data } = await apiClient.get(`/global-bot/status`, {
        params: { business_id: businessId }
      });
      setGlobalBotStatus(data);
      if (data.report_time) {
        setDailyReportTime(data.report_time);
      }
    } catch (error) {
      console.error('Failed to fetch global bot status', error);
    }
  };

  const saveBotConfig = async () => {
    setSaving(true);
    try {
      await apiClient.put('/bot/config', {
        business_id: businessId,
        bot_name: botName,
        prompt: prompt
      });
      alert('✅ Bot configuration saved successfully!');
      await fetchBotConfig();
    } catch (error) {
      console.error('Failed to save bot config', error);
      alert('❌ Failed to save bot configuration');
    } finally {
      setSaving(false);
    }
  };

  const setupTelegram = async () => {
    if (!telegramToken.trim()) {
      alert('Please enter Telegram bot token');
      return;
    }

    setSaving(true);
    try {
      const { data } = await apiClient.get(`/telegram/login`, {
        params: {
          business_id: businessId,
          bot_token: telegramToken
        }
      });

      alert(`✅ Telegram bot connected successfully!\nBot: @${data.bot_info?.username}`);
      setTelegramToken('');
      await fetchBotConfig();
    } catch (error: any) {
      console.error('Failed to setup Telegram', error);
      alert(`❌ ${error.response?.data?.detail || 'Failed to setup Telegram bot'}`);
    } finally {
      setSaving(false);
    }
  };

  const connectInstagram = () => {
    window.location.href = `${apiClient.defaults.baseURL}/instagram/login?business_id=${businessId}`;
  };

  const updateInstagramBusinessId = async () => {
    if (!instagramBusinessId.trim()) {
      alert('Please enter Instagram Business ID');
      return;
    }

    setSaving(true);
    try {
      await apiClient.patch('/instagram/update-id', {
        business_id: businessId,
        instagram_business_id: instagramBusinessId
      });

      alert('✅ Instagram Business ID updated successfully!');
      await fetchInstagramStatus();
      setInstagramBusinessId('');
    } catch (error) {
      console.error('Failed to update Instagram ID', error);
      alert('❌ Failed to update Instagram Business ID');
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await apiClient.put('/bot-settings', {
        business_id: businessId,
        ai_pause_from: aiPauseFrom || null,
        ai_pause_to: aiPauseTo || null,
        followup_template: followupTemplate || null
      });

      alert('✅ Settings saved successfully!');
      await fetchSettings();
    } catch (error) {
      console.error('Failed to save settings', error);
      alert('❌ Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateReportTime = async () => {
    setSaving(true);
    try {
      await apiClient.patch('/global-bot/report-time', {
        business_id: businessId,
        report_time: dailyReportTime
      });

      alert('✅ Report time updated successfully!');
      await fetchGlobalBotStatus();
    } catch (error) {
      console.error('Failed to update report time', error);
      alert('❌ Failed to update report time');
    } finally {
      setSaving(false);
    }
  };

  const sendTestReport = async () => {
    setSaving(true);
    try {
      await apiClient.post(`/global-bot/test-report?business_id=${businessId}`);
      alert('✅ Test report sent! Check your Telegram.');
    } catch (error: any) {
      console.error('Failed to send test report', error);
      alert(`❌ ${error.response?.data?.detail || 'Failed to send test report'}`);
    } finally {
      setSaving(false);
    }
  };

  if (!businessId) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          No business assigned to your account.
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
            Loading configuration...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Bot Configuration
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Configure your AI assistant, connect platforms, and manage settings
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '2px solid var(--color-border)',
        overflowX: 'auto'
      }}>
        {[
          { key: 'general', label: 'General', icon: Bot },
          { key: 'telegram', label: 'Telegram', icon: MessageSquare },
          { key: 'instagram', label: 'Instagram', icon: Instagram },
          { key: 'settings', label: 'Settings', icon: Clock },
          { key: 'reports', label: 'Reports', icon: Bell }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: 'none',
              color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              borderBottom: activeTab === tab.key ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom: '-2px',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="card">
            <h2 className="card-title">AI Assistant Configuration</h2>
            <p className="card-description">
              Customize your AI assistant's personality and behavior
            </p>

            <div style={{ marginTop: '2rem' }}>
              <div className="form-group">
                <label className="form-label">Bot Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Pizza Assistant"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">AI System Prompt</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe your AI assistant's personality, knowledge, and behavior..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={10}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.5rem' }}>
                  This prompt defines how your AI assistant will behave and respond to customers.
                </p>
              </div>

              <button
                onClick={saveBotConfig}
                disabled={saving}
                className="btn btn-primary"
              >
                <Save size={18} />
                <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Telegram Tab */}
        {activeTab === 'telegram' && (
          <div className="card">
            <h2 className="card-title">Telegram Bot Setup</h2>
            <p className="card-description">
              Connect your Telegram bot to receive and respond to messages
            </p>

            {telegramSetup ? (
              <div className="alert alert-success" style={{ marginTop: '2rem' }}>
                <CheckCircle size={18} />
                <span>✅ Telegram bot is connected and webhook is set!</span>
              </div>
            ) : (
              <div style={{ marginTop: '2rem' }}>
                <div className="alert alert-info">
                  <AlertCircle size={18} />
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>How to setup:</p>
                    <ol style={{ marginLeft: '1.25rem', fontSize: '0.875rem' }}>
                      <li>Open Telegram and search for @BotFather</li>
                      <li>Send <code>/newbot</code> and follow instructions</li>
                      <li>Copy the bot token provided</li>
                      <li>Paste it below and click Connect</li>
                    </ol>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Bot Token</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="6234567890:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw"
                    value={telegramToken}
                    onChange={(e) => setTelegramToken(e.target.value)}
                  />
                </div>

                <button
                  onClick={setupTelegram}
                  disabled={saving || !telegramToken.trim()}
                  className="btn btn-primary"
                >
                  <MessageSquare size={18} />
                  <span>{saving ? 'Connecting...' : 'Connect Telegram Bot'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Instagram Tab */}
        {activeTab === 'instagram' && (
          <div className="card">
            <h2 className="card-title">Instagram Integration</h2>
            <p className="card-description">
              Connect your Instagram Business account to receive direct messages
            </p>

            <div style={{ marginTop: '2rem' }}>
              {!instagramStatus?.has_access_token ? (
                <div>
                  <div className="alert alert-info">
                    <AlertCircle size={18} />
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Step 1: Connect Instagram Account</p>
                      <p style={{ fontSize: '0.875rem' }}>
                        Click the button below to connect your Instagram Business account via Facebook OAuth.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={connectInstagram}
                    className="btn btn-primary"
                    style={{ marginTop: '1rem' }}
                  >
                    <Instagram size={18} />
                    <span>Connect Instagram Account</span>
                    <ExternalLink size={16} />
                  </button>
                </div>
              ) : !instagramStatus?.has_business_id ? (
                <div>
                  <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                    <CheckCircle size={18} />
                    <span>✅ Instagram access token configured!</span>
                  </div>

                  <div className="alert alert-info">
                    <AlertCircle size={18} />
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Step 2: Add Business Account ID</p>
                      <ol style={{ marginLeft: '1.25rem', fontSize: '0.875rem' }}>
                        <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>developers.facebook.com</a></li>
                        <li>Select your app → Messenger → Instagram Settings</li>
                        <li>Copy your "Instagram Business Account ID"</li>
                        <li>Paste it below</li>
                      </ol>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Instagram Business Account ID</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="17841401441234567"
                      value={instagramBusinessId}
                      onChange={(e) => setInstagramBusinessId(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={updateInstagramBusinessId}
                    disabled={saving || !instagramBusinessId.trim()}
                    className="btn btn-primary"
                  >
                    <Save size={18} />
                    <span>{saving ? 'Saving...' : 'Save Business ID'}</span>
                  </button>
                </div>
              ) : (
                <div>
                  <div className="alert alert-success">
                    <CheckCircle size={18} />
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>✅ Instagram fully configured!</p>
                      <p style={{ fontSize: '0.875rem' }}>Business ID: {instagramStatus.instagram_business_id}</p>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: '0.5rem' }}>
                    <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Webhook Configuration</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                      Make sure webhook is configured in Meta Developer Console:
                    </p>
                    <code style={{
                      display: 'block',
                      padding: '0.5rem',
                      backgroundColor: 'var(--color-card)',
                      borderRadius: '0.25rem',
                      fontSize: '0.8125rem',
                      fontFamily: 'monospace'
                    }}>
                      {window.location.origin}/instagram/webhook
                    </code>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="card">
            <h2 className="card-title">Business Settings</h2>
            <p className="card-description">
              Configure AI pause hours and follow-up messages
            </p>

            <div style={{ marginTop: '2rem' }}>
              <div className="form-group">
                <label className="form-label">AI Pause Hours</label>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                  AI won't respond during these hours (useful for off-hours)
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>From</label>
                    <input
                      type="time"
                      className="form-input"
                      value={aiPauseFrom}
                      onChange={(e) => setAiPauseFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>To</label>
                    <input
                      type="time"
                      className="form-input"
                      value={aiPauseTo}
                      onChange={(e) => setAiPauseTo(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Follow-up Message Template</label>
                <textarea
                  className="form-textarea"
                  placeholder="e.g., Hello! Are you still interested in our services?"
                  value={followupTemplate}
                  onChange={(e) => setFollowupTemplate(e.target.value)}
                  rows={4}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.5rem' }}>
                  This message will be sent automatically to inactive customers
                </p>
              </div>

              <button
                onClick={saveSettings}
                disabled={saving}
                className="btn btn-primary"
              >
                <Save size={18} />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="card">
            <h2 className="card-title">Daily Lead Reports</h2>
            <p className="card-description">
              Receive daily lead statistics via Telegram
            </p>

            <div style={{ marginTop: '2rem' }}>
              {!globalBotStatus?.registered ? (
                <div className="alert alert-info">
                  <AlertCircle size={18} />
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>How to Register:</p>
                    <ol style={{ marginLeft: '1.25rem', fontSize: '0.875rem' }}>
                      <li>Open Telegram and search for the global bot</li>
                      <li>Send <code>/start</code></li>
                      <li>Send your registered phone number</li>
                      <li>Wait for confirmation</li>
                      <li>Refresh this page to see status</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="alert alert-success" style={{ marginBottom: '2rem' }}>
                    <CheckCircle size={18} />
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>✅ Bot Registered!</p>
                      <p style={{ fontSize: '0.875rem' }}>Chat ID: {globalBotStatus.telegram_chat_id}</p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Daily Report Time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={dailyReportTime}
                      onChange={(e) => setDailyReportTime(e.target.value)}
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.5rem' }}>
                      Choose when you want to receive daily lead reports (24-hour format)
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={updateReportTime}
                      disabled={saving}
                      className="btn btn-primary"
                    >
                      <Save size={18} />
                      <span>{saving ? 'Saving...' : 'Save Report Time'}</span>
                    </button>

                    <button
                      onClick={sendTestReport}
                      disabled={saving}
                      className="btn btn-secondary"
                    >
                      <Play size={18} />
                      <span>{saving ? 'Sending...' : 'Send Test Report'}</span>
                    </button>
                  </div>

                  <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    backgroundColor: 'var(--color-bg-tertiary)',
                    borderRadius: '0.5rem'
                  }}>
                    <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>What's Included:</p>
                    <ul style={{ marginLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                      <li>All leads from last 24 hours</li>
                      <li>Lead status (need to call, contacted, etc.)</li>
                      <li>Full contact information</li>
                      <li>Lead topics and notes</li>
                      <li>Channel source (Telegram/Instagram)</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BotConfigPage;
