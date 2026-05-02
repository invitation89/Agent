import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, Layers } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { STACK_OPTIONS, type ProjectStack } from '../types';

export default function NewProjectPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stack, setStack] = useState<ProjectStack>('react');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');

    const { data, error: err } = await supabase
      .from('projects')
      .insert({
        name: name.trim(),
        description: description.trim(),
        stack,
        owner_id: user.id,
        status: 'idle',
      })
      .select()
      .single();

    setLoading(false);

    if (err) {
      setError(err.message);
    } else {
      navigate(`/project/${data.id}`);
    }
  }

  return (
    <div className="min-h-full bg-[#0A0F1E] p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-8"
        >
          <ChevronLeft size={16} /> Back to Dashboard
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center">
            <Sparkles size={18} className="text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">New Project</h1>
        </div>
        <p className="text-gray-500 mb-8">Describe your app and let AI agents build it.</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
              placeholder="my-awesome-app"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors resize-none"
              placeholder="Describe what you want to build. Be as detailed as possible — agents work best with clear descriptions."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <span className="flex items-center gap-2">
                <Layers size={14} className="text-gray-500" />
                Tech Stack
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STACK_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStack(option.value)}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-sm transition-all ${
                    stack === option.value
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                      : 'bg-white/3 border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#0A0F1E] font-bold py-3.5 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-[#0A0F1E]/30 border-t-[#0A0F1E] rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create Project
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
