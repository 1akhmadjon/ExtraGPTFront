import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Building, Plus, Trash2 } from 'lucide-react';

// Mock data for UI demonstration
const MOCK_USERS = [
  { id: 1, username: 'admin', role: 'admin', active: true },
  { id: 2, username: 'business_owner_1', role: 'owner', business: 'Tech Shop', active: true },
  { id: 3, username: 'operator_john', role: 'operator', business: 'Tech Shop', active: true },
];

const MOCK_BUSINESSES = [
  { id: 1, name: 'Tech Shop', owner: 'business_owner_1', active: true },
  { id: 2, name: 'Fashion Boutique', owner: 'owner_sara', active: false },
];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'businesses'>('users');
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <button className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700">
          <Plus size={18} className="mr-2" />
          Create New {activeTab === 'users' ? 'User' : 'Business'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-lg border border-gray-200 inline-flex">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
            activeTab === 'users' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Users size={16} className="mr-2" />
          Users
        </button>
        <button
          onClick={() => setActiveTab('businesses')}
          className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
            activeTab === 'businesses' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Building size={16} className="mr-2" />
          Businesses
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {activeTab === 'users' ? (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </>
              )}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activeTab === 'users' ? (
              MOCK_USERS.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'owner' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.business || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            ) : (
              MOCK_BUSINESSES.map(biz => (
                <tr key={biz.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{biz.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{biz.owner}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${biz.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {biz.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPage;
