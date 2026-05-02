import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, MoreHorizontal, Rocket, Clock, CheckCircle2,
  AlertCircle, Loader2, Code2, Globe, Zap, BarChart3, Layers,
  GitBranch, Trash2, ExternalLink
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Project, ProjectStatus } from '../types';

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; icon: React.ElementType }> = {
  idle: { label: 'Idle', color: 'text-gray-400', icon: Clock },
  generating: { label: 'Generating', color: 'text-cyan-400', icon: Loader2 },
  error: { label: 'Error', color: 'text-red-400', icon: AlertCircle },
  ready: { label: 'Ready', color: 'text-emerald-400', icon: CheckCircle2 },
  deployed: { label: 'Deployed', color: 'text-blue-400', icon: Rocket },
};

const STACK_COLORS: Record<string, string> = {
  react: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  nextjs: 'bg-white/5 text-gray-300 border-white/10',
  vue: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  svelte: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
  vanilla: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
  node: 'bg-green-500/10 text-green-300 border-green-500/20',
  python: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  fullstack: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchProjects();
  }, [user]);

  async function fetchProjects() {
    setLoading(true);
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', user!.id)
      .order('updated_at', { ascending: false });
    setProjects(data || []);
    setLoading(false);
  }

  async function deleteProject(id: string) {
    await supabase.from('projects').delete().eq('id', id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setActiveMenu(null);
  }

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: projects.length,
    deployed: projects.filter((p) => p.status === 'deployed').length,
    generating: projects.filter((p) => p.status === 'generating').length,
  };

  return (
    <div className="min-h-full bg-[#0A0F1E] p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          Good morning, {profile?.full_name?.split(' ')[0] || 'Developer'}
        </h1>
        <p className="text-gray-500">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/3 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
              <Layers size={18} className="text-cyan-400" />
            </div>
            <span className="text-3xl font-bold text-white">{stats.total}</span>
          </div>
          <div className="text-sm text-gray-400">Total Projects</div>
        </div>
        <div className="bg-white/3 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Globe size={18} className="text-blue-400" />
            </div>
            <span className="text-3xl font-bold text-white">{stats.deployed}</span>
          </div>
          <div className="text-sm text-gray-400">Deployed</div>
        </div>
        <div className="bg-white/3 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-emerald-400" />
            </div>
            <span className="text-3xl font-bold text-white">{stats.generating}</span>
          </div>
          <div className="text-sm text-gray-400">In Progress</div>
        </div>
      </div>

      {/* Projects */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-semibold text-white">Your Projects</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 transition-colors"
            />
          </div>
          <Link
            to="/project/new"
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-[#0A0F1E] font-semibold px-4 py-2.5 rounded-xl text-sm transition-all whitespace-nowrap hover:shadow-[0_0_15px_rgba(0,212,255,0.3)]"
          >
            <Plus size={16} />
            New Project
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/3 border border-white/5 rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-white/5 rounded mb-3 w-3/4" />
              <div className="h-3 bg-white/5 rounded mb-5 w-full" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-white/3 rounded-2xl flex items-center justify-center mb-4">
            <Code2 size={28} className="text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {search ? 'No matching projects' : 'No projects yet'}
          </h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm">
            {search
              ? 'Try adjusting your search term.'
              : 'Create your first project and let AI agents build it for you.'}
          </p>
          {!search && (
            <Link
              to="/project/new"
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-[#0A0F1E] font-semibold px-5 py-3 rounded-xl text-sm transition-all"
            >
              <Plus size={16} />
              Create your first project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => {
            const statusConfig = STATUS_CONFIG[project.status];
            const StatusIcon = statusConfig.icon;
            return (
              <div
                key={project.id}
                className="group relative bg-white/3 backdrop-blur border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all hover:-translate-y-0.5"
              >
                {/* Menu */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setActiveMenu(activeMenu === project.id ? null : project.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-colors"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {activeMenu === project.id && (
                    <div className="absolute right-0 top-9 bg-[#1a2235] border border-white/10 rounded-xl shadow-xl z-20 min-w-[140px] overflow-hidden">
                      <Link
                        to={`/project/${project.id}`}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <Code2 size={14} /> Open Builder
                      </Link>
                      {project.deployed_url && (
                        <a
                          href={project.deployed_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <ExternalLink size={14} /> View Live
                        </a>
                      )}
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>

                <Link to={`/project/${project.id}`} className="block">
                  {/* Status badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`flex items-center gap-1.5 text-xs ${statusConfig.color}`}>
                      <StatusIcon size={12} className={project.status === 'generating' ? 'animate-spin' : ''} />
                      {statusConfig.label}
                    </div>
                    <div className={`ml-auto text-xs px-2 py-0.5 rounded-md border ${STACK_COLORS[project.stack] || 'bg-white/5 text-gray-400 border-white/10'}`}>
                      {project.stack}
                    </div>
                  </div>

                  <h3 className="font-semibold text-white mb-1.5 pr-8 truncate">{project.name}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">{project.description || 'No description'}</p>

                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {timeAgo(project.updated_at)}
                    </span>
                    {project.deployed_url && (
                      <span className="flex items-center gap-1 text-blue-400">
                        <Globe size={11} />
                        Live
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Close menus on outside click */}
      {activeMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
      )}
    </div>
  );
}
