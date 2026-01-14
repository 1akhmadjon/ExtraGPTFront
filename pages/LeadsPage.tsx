import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Lead, LeadStats, LeadsResponse, LeadStatus } from '../types';
import { Phone, MessageSquare, Instagram, TrendingUp, UserCheck, Users as UsersIcon, CheckCircle, XCircle } from 'lucide-react';

const STATUS_OPTIONS: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'need_to_call', label: 'Need to Call', color: 'var(--color-danger)' },
  { value: 'contacted', label: 'Contacted', color: 'var(--color-info)' },
  { value: 'continuing', label: 'Continuing', color: 'var(--color-warning)' },
  { value: 'finished', label: 'Finished', color: 'var(--color-success)' },
  { value: 'rejected', label: 'Rejected', color: 'var(--color-text-tertiary)' },
];

const LeadsPage = () => {
  const { businessId } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats>({
    need_to_call: 0,
    contacted: 0,
    continuing: 0,
    finished: 0,
    rejected: 0,
  });
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, [businessId, filter]);

  const fetchLeads = async () => {
    if (!businessId) return;

    try {
      const params: any = { business_id: businessId };
      if (filter !== 'all') {
        params.status = filter;
      }

      const { data } = await apiClient.get<LeadsResponse>('/leads', { params });
      setLeads(data.leads || []);
      setStats(data.stats || {
        need_to_call: 0,
        contacted: 0,
        continuing: 0,
        finished: 0,
        rejected: 0,
      });
    } catch (error) {
      console.error('Failed to fetch leads', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (leadId: number, newStatus: LeadStatus) => {
    try {
      await apiClient.patch(`/leads/${leadId}/status`, { status: newStatus });
      await fetchLeads();
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update lead status');
    }
  };

  const getStatusColor = (status: LeadStatus) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status);
    return statusOption?.color || 'var(--color-text-secondary)';
  };

  const getStatusLabel = (status: LeadStatus) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status);
    return statusOption?.label || status;
  };

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
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Leads Management
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Track and manage your potential customers
        </p>
      </div>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{
          padding: '1.25rem',
          borderLeft: '4px solid var(--color-danger)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                Need to Call
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {stats.need_to_call}
              </p>
            </div>
            <Phone size={32} style={{ color: 'var(--color-danger)', opacity: 0.3 }} />
          </div>
        </div>

        <div className="card" style={{
          padding: '1.25rem',
          borderLeft: '4px solid var(--color-info)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                Contacted
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {stats.contacted}
              </p>
            </div>
            <UserCheck size={32} style={{ color: 'var(--color-info)', opacity: 0.3 }} />
          </div>
        </div>

        <div className="card" style={{
          padding: '1.25rem',
          borderLeft: '4px solid var(--color-warning)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                Continuing
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {stats.continuing}
              </p>
            </div>
            <TrendingUp size={32} style={{ color: 'var(--color-warning)', opacity: 0.3 }} />
          </div>
        </div>

        <div className="card" style={{
          padding: '1.25rem',
          borderLeft: '4px solid var(--color-success)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                Finished
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {stats.finished}
              </p>
            </div>
            <CheckCircle size={32} style={{ color: 'var(--color-success)', opacity: 0.3 }} />
          </div>
        </div>

        <div className="card" style={{
          padding: '1.25rem',
          borderLeft: '4px solid var(--color-text-tertiary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                Rejected
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {stats.rejected}
              </p>
            </div>
            <XCircle size={32} style={{ color: 'var(--color-text-tertiary)', opacity: 0.3 }} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setFilter('all')}
          className="btn"
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            backgroundColor: filter === 'all' ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
            color: filter === 'all' ? 'white' : 'var(--color-text-primary)'
          }}
        >
          All Leads
        </button>
        {STATUS_OPTIONS.map(status => (
          <button
            key={status.value}
            onClick={() => setFilter(status.value)}
            className="btn"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              backgroundColor: filter === status.value ? status.color : 'var(--color-bg-tertiary)',
              color: filter === status.value ? 'white' : 'var(--color-text-primary)'
            }}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Leads Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div className="loading-spinner" style={{ margin: '0 auto' }} />
            <p style={{ marginTop: '1rem', color: 'var(--color-text-tertiary)' }}>
              Loading leads...
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Topic</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {leads.length > 0 ? (
                  leads.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <span className="badge" style={{
                          backgroundColor: lead.channel === 'telegram' ? 'rgba(0, 136, 204, 0.1)' : 'rgba(228, 64, 95, 0.1)',
                          color: lead.channel === 'telegram' ? '#0088cc' : '#E4405F'
                        }}>
                          {lead.channel === 'telegram' ? (
                            <MessageCircle size={14} />
                          ) : (
                            <Instagram size={14} />
                          )}
                          <span style={{ marginLeft: '0.25rem' }}>
                            {lead.channel === 'telegram' ? 'TG' : 'IG'}
                          </span>
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {lead.full_name || 'N/A'}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                        {lead.phone || 'N/A'}
                      </td>
                      <td style={{
                        maxWidth: '300px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {lead.topic || 'N/A'}
                      </td>
                      <td>
                        <select
                          value={lead.status}
                          onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                          className="form-select"
                          style={{
                            padding: '0.375rem 0.75rem',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: getStatusColor(lead.status),
                            border: `2px solid ${getStatusColor(lead.status)}`,
                            borderRadius: '0.375rem'
                          }}
                        >
                          {STATUS_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ fontSize: '0.8125rem' }}>
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                      <UsersIcon size={48} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto 1rem', opacity: 0.5 }} />
                      <p style={{ color: 'var(--color-text-secondary)' }}>
                        {filter === 'all' ? 'No leads yet' : `No ${getStatusLabel(filter as LeadStatus).toLowerCase()} leads`}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsPage;
