import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { DashboardStats } from '../types';
import { MessageSquare, Users, AlertCircle, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Mocking endpoint as it's not explicitly in standard CRUD but implied
        // In a real app, this would be GET /dashboard/stats or similar
        // We will simulate it here or use available endpoints to count
        
        // Simulating API call delay and data
        // const { data } = await apiClient.get('/dashboard/stats');
        // setStats(data);
        
        // Mock data for display purposes
        setTimeout(() => {
          setStats({
            total_conversations: 124,
            unread_messages: 5,
            leads_this_week: 12,
            active_businesses: user?.role === 'admin' ? 3 : undefined
          });
          setLoading(false);
        }, 500);

      } catch (error) {
        console.error("Failed to fetch stats", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.username}!</h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your business today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Conversations" 
          value={stats?.total_conversations || 0} 
          icon={MessageSquare} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Unread Messages" 
          value={stats?.unread_messages || 0} 
          icon={AlertCircle} 
          color="bg-warning" 
        />
        <StatCard 
          title="Leads This Week" 
          value={stats?.leads_this_week || 0} 
          icon={TrendingUp} 
          color="bg-success" 
        />
        {user?.role === 'admin' && (
           <StatCard 
           title="Active Businesses" 
           value={stats?.active_businesses || 0} 
           icon={Users} 
           color="bg-purple-500" 
         />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Placeholder for Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-gray-600">New lead generated from Instagram conversation.</span>
                <span className="text-gray-400 text-xs ml-auto">2h ago</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 text-left transition-colors">
              <span className="block font-medium text-gray-900">View Unread</span>
              <span className="text-xs text-gray-500">Check pending messages</span>
            </button>
            <button className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 text-left transition-colors">
              <span className="block font-medium text-gray-900">Bot Settings</span>
              <span className="text-xs text-gray-500">Configure AI responses</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
