import { useState, FormEvent, useEffect } from 'react';
import { Settings, User, Save, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');
    setSaved(false);

    const { error: err } = await supabase
      .from('profiles')
      .update({ full_name: fullName, username, bio })
      .eq('id', user.id);

    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSaved(true);
      await refreshProfile();
      setTimeout(() => setSaved(false), 3000);
    }
  }

  return (
    <div className="min-h-full bg-[#0A0F1E] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
            <Settings size={18} className="text-gray-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-gray-500 text-sm">Manage your account preferences</p>
          </div>
        </div>

        <div className="bg-white/3 border border-white/5 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                {fullName?.[0]?.toUpperCase() || 'U'}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#1a2235] border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                <Camera size={12} />
              </button>
            </div>
            <div>
              <div className="font-semibold text-white">{fullName || 'Your Name'}</div>
              <div className="text-sm text-gray-500">{user?.email}</div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}

          {saved && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 mb-6 text-sm">
              Profile saved successfully.
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="janedoe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-[#0A0F1E] font-bold px-6 py-3 rounded-xl transition-all"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-[#0A0F1E]/30 border-t-[#0A0F1E] rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
