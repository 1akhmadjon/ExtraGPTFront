import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Lead } from '../types';
import { Filter, Phone, MessageSquare, ChevronDown } from 'lucide-react';

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  meeting: 'bg-purple-100 text-purple-800',
  closed: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
};

const LeadsPage = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      if (!user?.business_id) return;
      try {
        const { data } = await apiClient.get<Lead[]>('/leads', {
          params: { business_id: user.business_id }
        });
        setLeads(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch leads", error);
        setLoading(false);
      }
    };
    fetchLeads();
  }, [user]);

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      await apiClient.patch(`/leads/${id}/status`, { status: newStatus });
      setLeads(leads.map(lead => 
        lead.id === id ? { ...lead, status: newStatus as any } : lead
      ));
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const filteredLeads = filter === 'all' 
    ? leads 
    : leads.filter(l => l.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
          <p className="text-gray-500">Track and manage your potential customers</p>
        </div>
        <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          {['all', 'new', 'contacted', 'meeting', 'closed', 'lost'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                filter === status 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
           <div className="p-12 text-center text-gray-500">Loading leads...</div>
        ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{lead.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone size={14} className="mr-2" />
                        {lead.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MessageSquare size={14} className="mr-2" />
                        <span className="capitalize">{lead.channel}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 line-clamp-2">{lead.topic}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative inline-block text-left">
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className={`block w-full pl-3 pr-10 py-1.5 text-xs font-semibold rounded-full border-none appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${STATUS_COLORS[lead.status] || 'bg-gray-100'}`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="meeting">Meeting</option>
                        <option value="closed">Closed</option>
                        <option value="lost">Lost</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        <ChevronDown size={12} className="opacity-50" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary hover:text-indigo-900">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLeads.length === 0 && (
             <div className="p-12 text-center text-gray-400">No leads found.</div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default LeadsPage;
