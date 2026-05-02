import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Zap, LayoutDashboard, FolderOpen, Settings, Key,
  Users, ChevronLeft, ChevronRight, Plus, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: FolderOpen, label: 'Projects', href: '/projects' },
];

const SETTINGS_ITEMS: NavItem[] = [
  { icon: Settings, label: 'Settings', href: '/settings' },
  { icon: Key, label: 'API Keys', href: '/settings/api-keys' },
  { icon: Users, label: 'Team', href: '/settings/team' },
];

export default function Sidebar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

  return (
    <aside
      className={`relative flex flex-col bg-[#0d1424] border-r border-white/5 transition-all duration-300 shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? 'justify-center px-4' : 'gap-2 px-5'} h-16 border-b border-white/5`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shrink-0">
          <Zap size={15} className="text-white" />
        </div>
        {!collapsed && <span className="font-bold text-white tracking-tight">DevForge AI</span>}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-[#0d1424] border border-white/10 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* New Project */}
      <div className={`px-3 py-4 ${collapsed ? 'flex justify-center' : ''}`}>
        <Link
          to="/project/new"
          className={`flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/20 text-cyan-300 rounded-xl transition-all ${
            collapsed ? 'w-10 h-10 justify-center' : 'px-3 py-2.5 text-sm font-medium'
          }`}
        >
          <Plus size={16} className="shrink-0" />
          {!collapsed && <span>New Project</span>}
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 space-y-1">
        <div className={`text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 ${collapsed ? 'hidden' : 'px-2'}`}>
          Workspace
        </div>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex items-center ${collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2.5'} rounded-xl text-sm transition-all ${
              isActive(item.href)
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/4'
            }`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={17} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && item.badge && (
              <span className="ml-auto text-xs bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-md">{item.badge}</span>
            )}
          </Link>
        ))}

        <div className={`text-xs font-semibold text-gray-600 uppercase tracking-wider mt-6 mb-2 ${collapsed ? 'hidden' : 'px-2'}`}>
          Account
        </div>
        {SETTINGS_ITEMS.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex items-center ${collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2.5'} rounded-xl text-sm transition-all ${
              isActive(item.href)
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/4'
            }`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={17} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* User profile */}
      <div className="p-3 border-t border-white/5">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-2 py-2'}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{profile?.full_name || 'User'}</div>
              <div className="text-xs text-gray-500">Free plan</div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={signOut}
              className="text-gray-600 hover:text-gray-300 transition-colors"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
