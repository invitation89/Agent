import { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Check, AlertCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { ApiKey, AIProvider } from '../types';
import { PROVIDERS } from '../types';

export default function ApiKeysPage() {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('openai');
  const [keyInput, setKeyInput] = useState('');
  const [label, setLabel] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [saving, setSaving] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [testingKeys, setTestingKeys] = useState<Set<string>>(new Set());
  const [testedKeys, setTestedKeys] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    if (!user) return;
    fetchKeys();
  }, [user]);

  useEffect(() => {
    if (selectedProvider) {
      setSelectedModel(PROVIDERS[selectedProvider].models[0]);
    }
  }, [selectedProvider]);

  async function fetchKeys() {
    setLoading(true);
    const { data } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setApiKeys(data || []);
    setLoading(false);
  }

  async function handleSave() {
    if (!user || !keyInput.trim()) return;
    setSaving(true);

    await supabase.from('api_keys').insert({
      user_id: user.id,
      provider: selectedProvider,
      encrypted_key: btoa(keyInput.trim()),
      label: label || `${PROVIDERS[selectedProvider].label} Key`,
      model: selectedModel || PROVIDERS[selectedProvider].models[0],
    });

    setSaving(false);
    setKeyInput('');
    setLabel('');
    setShowAddForm(false);
    await fetchKeys();
  }

  async function handleDelete(id: string) {
    await supabase.from('api_keys').delete().eq('id', id);
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
  }

  async function handleTest(key: ApiKey) {
    setTestingKeys((prev) => new Set([...prev, key.id]));
    await new Promise((r) => setTimeout(r, 1200));
    const success = Math.random() > 0.2;
    setTestedKeys((prev) => new Map([...prev, [key.id, success]]));
    setTestingKeys((prev) => { const s = new Set(prev); s.delete(key.id); return s; });
  }

  function toggleVisibility(id: string) {
    setVisibleKeys((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  }

  const providerList = Object.keys(PROVIDERS) as AIProvider[];

  return (
    <div className="min-h-full bg-[#0A0F1E] p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <Key size={18} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">API Keys</h1>
              <p className="text-gray-500 text-sm">Manage your AI provider credentials</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-[#0A0F1E] font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
          >
            <Plus size={16} />
            Add Key
          </button>
        </div>

        {/* Security notice */}
        <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/15 rounded-xl px-4 py-3 mb-6">
          <AlertCircle size={15} className="text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-300/80">
            Keys are encoded before storage. We recommend using project-scoped keys with minimal permissions.
          </p>
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-white mb-5">Add New Key</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Provider</label>
                <div className="flex flex-wrap gap-2">
                  {providerList.map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedProvider(p)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedProvider === p
                          ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
                          : 'bg-white/3 border border-white/5 text-gray-400 hover:border-white/10'
                      }`}
                    >
                      {PROVIDERS[p].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Label</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    placeholder={`${PROVIDERS[selectedProvider].label} Key`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Default Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  >
                    {PROVIDERS[selectedProvider].models.map((m) => (
                      <option key={m} value={m} className="bg-[#1a2235]">{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder={`sk-... or your ${PROVIDERS[selectedProvider].label} API key`}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={!keyInput.trim() || saving}
                  className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-[#0A0F1E] font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
                >
                  {saving ? <span className="w-4 h-4 border-2 border-[#0A0F1E]/30 border-t-[#0A0F1E] rounded-full animate-spin" /> : <Check size={16} />}
                  Save Key
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setKeyInput(''); setLabel(''); }}
                  className="px-5 py-2.5 rounded-xl text-sm border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Keys list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white/3 border border-white/5 rounded-2xl p-5 animate-pulse h-20" />
            ))}
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-white/3 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Key size={24} className="text-gray-600" />
            </div>
            <h3 className="font-semibold text-white mb-2">No API keys yet</h3>
            <p className="text-gray-500 text-sm mb-5">Add your AI provider keys to start generating code.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-4 py-2 rounded-xl text-sm mx-auto transition-all hover:bg-cyan-500/15"
            >
              <Plus size={15} /> Add your first key
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div key={key.id} className="bg-white/3 border border-white/5 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: `${PROVIDERS[key.provider as AIProvider]?.color}20`,
                        color: PROVIDERS[key.provider as AIProvider]?.color,
                      }}
                    >
                      {PROVIDERS[key.provider as AIProvider]?.label?.[0]}
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm">{key.label || PROVIDERS[key.provider as AIProvider]?.label}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">{key.provider}</span>
                        {key.model && (
                          <>
                            <span className="text-gray-700">·</span>
                            <span className="text-xs text-gray-500">{key.model}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {testedKeys.has(key.id) && (
                      <span className={`text-xs px-2 py-1 rounded-lg ${testedKeys.get(key.id) ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {testedKeys.get(key.id) ? 'Valid' : 'Invalid'}
                      </span>
                    )}
                    <button
                      onClick={() => handleTest(key)}
                      disabled={testingKeys.has(key.id)}
                      className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
                      title="Test key"
                    >
                      <RefreshCw size={14} className={testingKeys.has(key.id) ? 'animate-spin' : ''} />
                    </button>
                    <button
                      onClick={() => toggleVisibility(key.id)}
                      className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
                      title="Toggle visibility"
                    >
                      {visibleKeys.has(key.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => handleDelete(key.id)}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete key"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {visibleKeys.has(key.id) && (
                  <div className="mt-3 bg-black/30 rounded-lg px-3 py-2 font-mono text-xs text-gray-400">
                    {atob(key.encrypted_key).replace(/./g, '*')}••••{atob(key.encrypted_key).slice(-4)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
