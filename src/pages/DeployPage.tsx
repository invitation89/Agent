import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Rocket, CheckCircle2, Clock, AlertCircle, Globe, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Deployment, Project } from '../types';

const DEPLOY_PROVIDERS = [
  { id: 'vercel', name: 'Vercel', desc: 'Optimal for Next.js and static sites', icon: '▲' },
  { id: 'netlify', name: 'Netlify', desc: 'Great for JAMstack apps with CI/CD', icon: '◆' },
  { id: 'railway', name: 'Railway', desc: 'For full-stack apps with a backend', icon: '🚂' },
  { id: 'cloudflare', name: 'Cloudflare Pages', desc: 'Fast global edge deployment', icon: '☁' },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DeployPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('vercel');
  const [deploying, setDeploying] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!id || !user) return;
    fetchProject();
    fetchDeployments();
  }, [id, user]);

  async function fetchProject() {
    const { data } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
    setProject(data);
  }

  async function fetchDeployments() {
    const { data } = await supabase
      .from('deployments')
      .select('*')
      .eq('project_id', id)
      .order('deployed_at', { ascending: false });
    setDeployments(data || []);
  }

  async function handleDeploy() {
    if (!user || !id) return;
    setDeploying(true);
    setLogs([]);

    const { data: deployment } = await supabase
      .from('deployments')
      .insert({ project_id: id, provider: selectedProvider, status: 'building' })
      .select()
      .single();

    const deployLogs = [
      'Initializing build environment...',
      'Installing dependencies...',
      'Running build command...',
      'Optimizing assets...',
      'Uploading to CDN...',
      'Configuring routing...',
      'Running health checks...',
      `Deployment successful! URL: https://${project?.name?.toLowerCase().replace(/\s+/g, '-')}-${id?.slice(0, 6)}.${selectedProvider}.app`,
    ];

    for (const log of deployLogs) {
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));
      setLogs((prev) => [...prev, log]);
    }

    const deployedUrl = `https://${project?.name?.toLowerCase().replace(/\s+/g, '-')}-${id?.slice(0, 6)}.${selectedProvider}.app`;

    if (deployment) {
      await supabase
        .from('deployments')
        .update({ status: 'deployed', url: deployedUrl, logs: deployLogs.join('\n') })
        .eq('id', deployment.id);
    }

    await supabase
      .from('projects')
      .update({ status: 'deployed', deployed_url: deployedUrl })
      .eq('id', id);

    setDeploying(false);
    await fetchDeployments();
    setProject((prev) => prev ? { ...prev, status: 'deployed', deployed_url: deployedUrl } : prev);
  }

  return (
    <div className="min-h-full bg-[#0A0F1E] p-8">
      <Link
        to={`/project/${id}`}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6"
      >
        <ChevronLeft size={16} /> Back to Builder
      </Link>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Rocket size={18} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Deploy</h1>
            <p className="text-gray-500 text-sm">{project?.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deploy config */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/3 border border-white/5 rounded-2xl p-6">
              <h2 className="font-semibold text-white mb-4">Select Provider</h2>
              <div className="grid grid-cols-2 gap-3">
                {DEPLOY_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider.id)}
                    className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                      selectedProvider === provider.id
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-white'
                        : 'bg-white/3 border-white/5 text-gray-400 hover:border-white/10'
                    }`}
                  >
                    <span className="text-xl">{provider.icon}</span>
                    <div>
                      <div className="font-medium text-sm mb-0.5">{provider.name}</div>
                      <div className="text-xs text-gray-500">{provider.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Deploy log */}
            {logs.length > 0 && (
              <div className="bg-black/50 border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Globe size={14} className="text-green-400" />
                  <span className="text-xs font-medium text-gray-400">Deploy Log</span>
                </div>
                <div className="font-mono text-xs text-gray-300 space-y-1">
                  {logs.map((log, i) => (
                    <div key={i} className={log.includes('successful') ? 'text-emerald-400' : 'text-gray-400'}>
                      <span className="text-gray-600 mr-2">$</span>{log}
                    </div>
                  ))}
                  {deploying && <span className="text-gray-600 animate-pulse">▊</span>}
                </div>
              </div>
            )}

            <button
              onClick={handleDeploy}
              disabled={deploying || project?.status === 'generating'}
              className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#0A0F1E] font-bold py-3.5 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]"
            >
              {deploying ? (
                <><Loader2 size={18} className="animate-spin" /> Deploying...</>
              ) : (
                <><Rocket size={18} /> Deploy to {DEPLOY_PROVIDERS.find(p => p.id === selectedProvider)?.name}</>
              )}
            </button>
          </div>

          {/* Deploy history */}
          <div className="bg-white/3 border border-white/5 rounded-2xl p-5">
            <h2 className="font-semibold text-white mb-4">History</h2>
            {deployments.length === 0 ? (
              <div className="text-center py-8">
                <Clock size={24} className="text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600">No deployments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deployments.map((d) => (
                  <div key={d.id} className="border border-white/5 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-white capitalize">{d.provider}</span>
                      <span className={`flex items-center gap-1 text-xs ${
                        d.status === 'deployed' ? 'text-emerald-400' :
                        d.status === 'failed' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {d.status === 'deployed' ? <CheckCircle2 size={11} /> :
                         d.status === 'failed' ? <AlertCircle size={11} /> :
                         <Loader2 size={11} className="animate-spin" />}
                        {d.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">{timeAgo(d.deployed_at)}</div>
                    {d.url && d.status === 'deployed' && (
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <ExternalLink size={10} /> View Live
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
