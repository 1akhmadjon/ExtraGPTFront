import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { BotConfig } from '../types';
import { Settings, Save, Instagram, MessageCircle, Globe } from 'lucide-react';

const BotConfigPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'settings' | 'telegram' | 'instagram' | 'global'>('settings');
  const [config, setConfig] = useState<BotConfig>({
    bot_name: '',
    ai_prompt: '',
    pause_start_hour: 0,
    pause_end_hour: 7
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch initial config
  useEffect(() => {
    if(!user?.business_id) return;
    apiClient.get(`/bot/config?business_id=${user.business_id}`)
      .then(res => setConfig(res.data))
      .catch(console.error);
  }, [user]);

  const handleSaveSettings = async () => {
    setLoading(true);
    setSuccessMsg('');
    try {
      await apiClient.put('/bot/config', config);
      setSuccessMsg('Settings saved successfully!');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Bot Configuration</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-4 text-sm font-medium flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'settings' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings size={18} />
            <span>General Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('telegram')}
            className={`px-6 py-4 text-sm font-medium flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'telegram' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageCircle size={18} />
            <span>Telegram</span>
          </button>
          <button
            onClick={() => setActiveTab('instagram')}
            className={`px-6 py-4 text-sm font-medium flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'instagram' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Instagram size={18} />
            <span>Instagram</span>
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={`px-6 py-4 text-sm font-medium flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'global' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Globe size={18} />
            <span>Global Bot</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center">
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bot Name</label>
                <input
                  type="text"
                  value={config.bot_name}
                  onChange={e => setConfig({...config, bot_name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="My Assistant Bot"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">AI System Prompt</label>
                <p className="text-xs text-gray-500 mb-2">Instructions for how the AI should behave.</p>
                <textarea
                  rows={8}
                  value={config.ai_prompt}
                  onChange={e => setConfig({...config, ai_prompt: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono text-sm"
                  placeholder="You are a helpful assistant..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pause Start Hour (0-23)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={config.pause_start_hour}
                    onChange={e => setConfig({...config, pause_start_hour: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pause End Hour (0-23)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={config.pause_end_hour}
                    onChange={e => setConfig({...config, pause_end_hour: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="flex items-center px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  <Save size={18} className="mr-2" />
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'telegram' && (
            <div className="max-w-xl">
               <h3 className="text-lg font-medium text-gray-900 mb-4">Telegram Configuration</h3>
               <div className="space-y-4">
                 <input 
                   type="text" 
                   placeholder="Enter Bot Token (from @BotFather)" 
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                 />
                 <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">Set Webhook</button>
               </div>
            </div>
          )}
          
          {activeTab === 'instagram' && (
             <div className="max-w-xl text-center py-8">
               <Instagram size={48} className="mx-auto text-pink-600 mb-4" />
               <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Instagram Business</h3>
               <p className="text-gray-500 mb-6">Link your Facebook page to enable Instagram Direct integration.</p>
               <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium">Log in with Facebook</button>
             </div>
          )}

          {activeTab === 'global' && (
            <div className="max-w-xl">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Global Reporting Bot</h3>
              <p className="text-gray-500 mb-4">Register with the global bot to receive daily summaries.</p>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-mono text-sm mb-2">Bot Username: @ExtraGlobalBot</p>
                <button className="text-primary text-sm font-medium">Check Registration Status</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BotConfigPage;
