import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, AlertCircle, ChevronRight, ChevronLeft, Key, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { AIProvider } from '../types';
import { PROVIDERS } from '../types';

type Step = 'account' | 'api-keys';

interface ApiKeyEntry {
  provider: AIProvider;
  key: string;
  model: string;
}

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('account');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [apiKeys, setApiKeys] = useState<Partial<Record<AIProvider, ApiKeyEntry>>>({});
  const [activeProvider, setActiveProvider] = useState<AIProvider>('openai');
  const [keyInput, setKeyInput] = useState('');
  const [savedKeys, setSavedKeys] = useState<Set<AIProvider>>(new Set());

  async function handleAccountSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setStep('api-keys');
    }
  }

  function handleSaveKey() {
    if (!keyInput.trim()) return;
    const providerConfig = PROVIDERS[activeProvider];
    setApiKeys((prev) => ({
      ...prev,
      [activeProvider]: {
        provider: activeProvider,
        key: keyInput.trim(),
        model: providerConfig.models[0],
      },
    }));
    setSavedKeys((prev) => new Set([...prev, activeProvider]));
    setKeyInput('');
  }

  async function handleFinish() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/dashboard'); return; }

    const entries = Object.values(apiKeys);
    if (entries.length > 0) {
      await Promise.all(
        entries.map((entry) =>
          supabase.from('api_keys').insert({
            user_id: user.id,
            provider: entry.provider,
            encrypted_key: btoa(entry.key),
            label: `${PROVIDERS[entry.provider].label} Key`,
            model: entry.model,
          })
        )
      );
    }

    navigate('/dashboard');
  }

  const providerList = Object.keys(PROVIDERS) as AIProvider[];

  if (step === 'api-keys') {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-3xl" />
        </div>

        <div className="relative w-full max-w-lg">
          <Link to="/" className="flex items-center justify-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">DevForge AI</span>
          </Link>

          <div className="bg-white/3 backdrop-blur border border-white/8 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Key size={14} className="text-cyan-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Add AI providers</h1>
            </div>
            <p className="text-gray-400 mb-2 text-sm">
              Add your API keys to start generating code. Keys are encrypted with AES-256.
            </p>
            <p className="text-gray-500 text-xs mb-8">
              You can skip this and add keys later in Settings.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {providerList.map((provider) => (
                <button
                  key={provider}
                  onClick={() => { setActiveProvider(provider); setKeyInput(''); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeProvider === provider
                      ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
                      : 'bg-white/3 border border-white/5 text-gray-400 hover:border-white/10'
                  }`}
                >
                  {savedKeys.has(provider) && <Check size={12} className="text-emerald-400" />}
                  {PROVIDERS[provider].label}
                </button>
              ))}
            </div>

            <div className="bg-white/3 border border-white/5 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-white">{PROVIDERS[activeProvider].label}</span>
                {savedKeys.has(activeProvider) && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <Check size={12} /> Saved
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder={`Paste your ${PROVIDERS[activeProvider].label} API key...`}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                <button
                  onClick={handleSaveKey}
                  disabled={!keyInput.trim()}
                  className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#0A0F1E] font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
                >
                  Save
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Models: {PROVIDERS[activeProvider].models.join(', ')}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep('account')}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button
                onClick={handleFinish}
                className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-[#0A0F1E] font-bold px-6 py-3 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]"
              >
                {savedKeys.size > 0 ? 'Continue to Dashboard' : 'Skip for now'}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">DevForge AI</span>
        </Link>

        <div className="bg-white/3 backdrop-blur border border-white/8 rounded-2xl p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center text-xs font-bold text-[#0A0F1E]">1</div>
              <span className="text-sm text-white font-medium">Account</span>
            </div>
            <div className="flex-1 h-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs text-gray-500">2</div>
              <span className="text-sm text-gray-500">API Keys</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-gray-400 mb-8">Free forever. No credit card required.</p>

          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleAccountSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
                placeholder="Jane Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
                  placeholder="Min. 8 characters"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0F1E] font-bold py-3 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#0A0F1E]/30 border-t-[#0A0F1E] rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Continue
                  <ChevronRight size={18} />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
