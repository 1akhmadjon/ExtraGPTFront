import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User as UserIcon, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/');
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Invalid username or password';
      setError(typeof message === 'string' ? message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      backgroundColor: 'var(--color-bg-secondary)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '28rem',
        backgroundColor: 'var(--color-card)',
        borderRadius: '1rem',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
        border: '1px solid var(--color-border)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'white',
            marginBottom: '0.5rem'
          }}>
            EXTRAGPT
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '0.875rem'
          }}>
            AI-Powered Customer Communication Platform
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          padding: '2rem'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: '0.5rem'
            }}>
              Welcome Back
            </h2>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)'
            }}>
              Sign in to your account to continue
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Username Field */}
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-tertiary)',
                pointerEvents: 'none'
              }}>
                <UserIcon size={18} />
              </div>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-tertiary)',
                pointerEvents: 'none'
              }}>
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              marginTop: '0.5rem'
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div className="loading-spinner" />
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          padding: '1.5rem 2rem',
          backgroundColor: 'var(--color-bg-tertiary)',
          borderTop: '1px solid var(--color-border)',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-tertiary)'
          }}>
            © 2026 EXTRAGPT. Multi-tenant AI CRM Platform.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
