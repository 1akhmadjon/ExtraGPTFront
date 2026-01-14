import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Settings, 
  Bot, 
  LogOut, 
  Menu, 
  X,
  ShieldAlert
} from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label, active }: any) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-primary text-white' 
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:transform-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
          <span className="text-2xl font-bold text-primary">EXTRAGPT</span>
          <button onClick={toggleSidebar} className="lg:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
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
          
          {user?.role === 'owner' && (
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

          <div className="pt-4 mt-4 border-t border-gray-100">
            <SidebarItem 
              to="/profile" 
              icon={Settings} 
              label="Settings" 
              active={location.pathname === '/profile'} 
            />
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-800">{user?.username}</span>
              <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
            </div>
            <button 
              onClick={logout} 
              className="p-2 text-gray-500 hover:text-danger hover:bg-red-50 rounded-full transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <button onClick={toggleSidebar} className="text-gray-500">
            <Menu size={24} />
          </button>
          <span className="font-bold text-gray-800">EXTRAGPT</span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
