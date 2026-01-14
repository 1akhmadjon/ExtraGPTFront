import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { User, Business, CreateUserRequest, CreateBusinessRequest } from '../types';
import { Users, Building, Plus, Trash2, ShieldAlert, X, Save } from 'lucide-react';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'businesses'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create User Form
  const [newUser, setNewUser] = useState<CreateUserRequest>({
    username: '',
    phone: '',
    password: '',
    role: 'operator'
  });

  // Create Business Form
  const [newBusiness, setNewBusiness] = useState<CreateBusinessRequest>({
    name: '',
    owner_id: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, businessesRes] = await Promise.all([
        apiClient.get('/admin/users'),
        apiClient.get('/admin/businesses')
      ]);

      setUsers(usersRes.data.users || []);
      setBusinesses(businessesRes.data.businesses || []);
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (!newUser.username.trim() || !newUser.phone.trim() || !newUser.password.trim()) {
      alert('Please fill all fields');
      return;
    }

    try {
      await apiClient.post('/admin/users', newUser);
      alert('✅ User created successfully!');
      setShowCreateModal(false);
      setNewUser({ username: '', phone: '', password: '', role: 'operator' });
      await fetchData();
    } catch (error: any) {
      console.error('Failed to create user', error);
      alert(`❌ ${error.response?.data?.detail || 'Failed to create user'}`);
    }
  };

  const createBusiness = async () => {
    if (!newBusiness.name.trim() || !newBusiness.owner_id) {
      alert('Please fill all fields');
      return;
    }

    try {
      await apiClient.post('/admin/businesses', newBusiness);
      alert('✅ Business created successfully!');
      setShowCreateModal(false);
      setNewBusiness({ name: '', owner_id: 0 });
      await fetchData();
    } catch (error: any) {
      console.error('Failed to create business', error);
      alert(`❌ ${error.response?.data?.detail || 'Failed to create business'}`);
    }
  };

  const owners = users.filter(u => u.role === 'owner');

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
            Loading admin data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldAlert size={32} style={{ color: 'var(--color-primary)' }} />
            Admin Panel
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Manage users, businesses, and system configuration
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Create {activeTab === 'users' ? 'User' : 'Business'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('users')}
          className="btn"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: activeTab === 'users' ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
            color: activeTab === 'users' ? 'white' : 'var(--color-text-primary)'
          }}
        >
          <Users size={18} />
          <span>Users ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('businesses')}
          className="btn"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: activeTab === 'businesses' ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
            color: activeTab === 'businesses' ? 'white' : 'var(--color-text-primary)'
          }}
        >
          <Building size={18} />
          <span>Businesses ({businesses.length})</span>
        </button>
      </div>

      {/* Content */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {activeTab === 'users' ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>#{user.id}</td>
                    <td style={{ fontWeight: 600 }}>{user.username}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{user.phone}</td>
                    <td>
                      <span className="badge" style={{
                        backgroundColor:
                          user.role === 'admin' ? 'rgba(147, 51, 234, 0.1)' :
                          user.role === 'owner' ? 'rgba(59, 130, 246, 0.1)' :
                          'rgba(107, 114, 128, 0.1)',
                        color:
                          user.role === 'admin' ? '#9333ea' :
                          user.role === 'owner' ? '#3b82f6' :
                          '#6b7280'
                      }}>
                        {user.role === 'admin' && <ShieldAlert size={12} />}
                        <span style={{ textTransform: 'capitalize', marginLeft: '0.25rem' }}>{user.role}</span>
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Business Name</th>
                  <th>Owner</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((business) => (
                  <tr key={business.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>#{business.id}</td>
                    <td style={{ fontWeight: 600 }}>{business.name}</td>
                    <td>
                      {business.owner ? (
                        <div>
                          <div style={{ fontWeight: 500 }}>{business.owner.username}</div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
                            {business.owner.phone}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-tertiary)' }}>N/A</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>
                      {new Date(business.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem'
        }} onClick={() => setShowCreateModal(false)}>
          <div
            className="card"
            style={{
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className="card-title" style={{ margin: 0 }}>
                Create {activeTab === 'users' ? 'New User' : 'New Business'}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-tertiary)',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                <X size={24} />
              </button>
            </div>

            {activeTab === 'users' ? (
              <div>
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="john_doe"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="998901234567"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select
                    className="form-select"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                  >
                    <option value="operator">Operator</option>
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <button
                  onClick={createUser}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <Save size={18} />
                  <span>Create User</span>
                </button>
              </div>
            ) : (
              <div>
                <div className="form-group">
                  <label className="form-label">Business Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Pizza Restaurant"
                    value={newBusiness.name}
                    onChange={(e) => setNewBusiness({ ...newBusiness, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Owner *</label>
                  <select
                    className="form-select"
                    value={newBusiness.owner_id}
                    onChange={(e) => setNewBusiness({ ...newBusiness, owner_id: parseInt(e.target.value) })}
                  >
                    <option value={0}>Select owner...</option>
                    {owners.map(owner => (
                      <option key={owner.id} value={owner.id}>
                        {owner.username} ({owner.phone})
                      </option>
                    ))}
                  </select>
                  {owners.length === 0 && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: '0.5rem' }}>
                      ⚠️ No owners available. Create an owner user first.
                    </p>
                  )}
                </div>

                <button
                  onClick={createBusiness}
                  disabled={owners.length === 0}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <Save size={18} />
                  <span>Create Business</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
