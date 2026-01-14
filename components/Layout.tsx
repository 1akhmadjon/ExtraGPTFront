import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Settings,
  Bot,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Moon,
  Sun
} from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label, active }: any) => (
  <Link
    to={to}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      transition: 'all 0.2s',
      backgroundColor: active ? 'var(--color-primary)' : 'transparent',
      color: active ? 'white' : 'var(--color-text-secondary)',
      fontWeight: 500,
      textDecoration: 'none'
    }}
    onMouseEnter={(e: any) => {
      if (!active) {
        e.currentTarget.style.backgroundColor = 'var(--color-hover)';
      }
    }}
    onMouseLeave={(e: any) => {
      if (!active) {
        e.currentTarget.style.backgroundColor = 'transparent';
      }
    }}
  >
    <Icon size={20} />
    <span>{label}</span>
  </Link>
);

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--color-bg-secondary)', overflow: 'hidden' }}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 20
          }}
          onClick={toggleSidebar}
          className="lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '16rem',
          backgroundColor: 'var(--color-sidebar)',
          borderRight: '1px solid var(--color-border)',
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.2s',
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column'
        }}
        className="lg:translate-x-0"
      >
        {/* Logo */}
        <div style={{
          height: '4rem',
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--color-border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--color-primary)'
          }}>
            EXTRAGPT
          </span>
          <button
            onClick={toggleSidebar}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-tertiary)',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
            className="lg:hidden"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <SidebarItem
              to="/"
              icon={LayoutDashboard}
              label="Dashboard"
              active={location.pathname === '/'}
            />
            <SidebarItem
              to="/chat"
              icon={MessageSquare}
              label="Conversations"
              active={location.pathname === '/chat'}
            />
            <SidebarItem
              to="/leads"
              icon={Users}
              label="Leads"
              active={location.pathname.startsWith('/leads')}
            />

            {(user?.role === 'owner' || user?.role === 'admin') && (
              <SidebarItem
                to="/bot-config"
                icon={Bot}
                label="Bot Config"
                active={location.pathname === '/bot-config'}
              />
            )}

            {user?.role === 'admin' && (
              <SidebarItem
                to="/admin"
                icon={ShieldAlert}
                label="Admin Panel"
                active={location.pathname === '/admin'}
              />
            )}

            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-light)' }}>
              <SidebarItem
                to="/profile"
                icon={Settings}
                label="Settings"
                active={location.pathname === '/profile'}
              />
            </div>
          </div>
        </nav>

        {/* User Info & Theme Toggle */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg-primary)'
        }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--color-bg-tertiary)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e: any) => {
              e.currentTarget.style.backgroundColor = 'var(--color-hover)';
            }}
            onMouseLeave={(e: any) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
            }}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>

          {/* User Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)'
              }}>
                {user?.username}
              </span>
              <span style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-tertiary)',
                textTransform: 'capitalize'
              }}>
                {user?.role}
              </span>
            </div>
            <button
              onClick={logout}
              style={{
                padding: '0.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '9999px',
                color: 'var(--color-text-tertiary)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e: any) => {
                e.currentTarget.style.backgroundColor = 'var(--color-danger-light)';
                e.currentTarget.style.color = 'var(--color-danger)';
              }}
              onMouseLeave={(e: any) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-tertiary)';
              }}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        marginLeft: 0
      }} className="lg:ml-64">
        {/* Mobile Header */}
        <header style={{
          height: '4rem',
          padding: '0 1rem',
          backgroundColor: 'var(--color-bg-primary)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }} className="lg:hidden">
          <button
            onClick={toggleSidebar}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <Menu size={24} />
          </button>
          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
            EXTRAGPT
          </span>
          <button
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
          </button>
        </header>

        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem'
        }} className="md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
