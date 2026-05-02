import { Link } from 'react-router-dom';
import {
  Zap, Code2, Shield, Rocket, Users, BarChart3,
  ChevronRight, Star, Check, ArrowRight, Bot,
  GitBranch, Terminal, Globe, Layers
} from 'lucide-react';

const FEATURES = [
  {
    icon: Bot,
    title: 'Multi-Agent System',
    description: 'Nine specialized AI agents collaborate — Planner, Code Writer, Bug Hunter, Security, Optimizer, Test Writer, Reviewer, Doc Writer, and Deploy Agent.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
  },
  {
    icon: Code2,
    title: 'Full-Stack Code Generation',
    description: 'Generate complete, production-ready applications with React, Next.js, Node.js, Python, and more — not snippets, full working codebases.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    icon: Shield,
    title: 'Security by Default',
    description: 'Every generated project is scanned for OWASP vulnerabilities, secrets exposure, and injection flaws before you ever see the output.',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
  },
  {
    icon: GitBranch,
    title: 'Your API Keys',
    description: 'Bring your own keys for OpenAI, Anthropic, Google, Groq, Mistral, or OpenRouter. AES-256 encrypted at rest — we never see your keys.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    icon: Terminal,
    title: 'Real-time Streaming',
    description: 'Watch agents work in real time over WebSocket. See code generated line by line, bugs fixed, tests written — all live in your browser.',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
  },
  {
    icon: Rocket,
    title: 'One-Click Deploy',
    description: 'Deploy agent pushes directly to Vercel, Railway, Netlify, or any provider. Get a live URL in seconds with zero configuration.',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
];

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for exploring and small personal projects.',
    features: ['3 projects', '100K tokens/month', 'GPT-4o Mini access', 'Community support', 'Basic file explorer'],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    description: 'For developers building serious applications.',
    features: ['Unlimited projects', '5M tokens/month', 'All AI providers', 'Priority support', 'Monaco Editor + terminal', 'Deploy agent', 'Custom domains'],
    cta: 'Start Pro Trial',
    highlight: true,
  },
  {
    name: 'Team',
    price: '$99',
    period: 'per month',
    description: 'For teams building together at scale.',
    features: ['Everything in Pro', 'Up to 10 members', '20M tokens/month', 'Organization projects', 'Role-based access', 'Audit logs', 'SSO support'],
    cta: 'Start Team Trial',
    highlight: false,
  },
];

const AGENTS = [
  { name: 'Planner', desc: 'Breaks your prompt into a structured task graph', color: 'bg-cyan-500' },
  { name: 'Code Writer', desc: 'Generates full file contents for every stack', color: 'bg-emerald-500' },
  { name: 'Bug Hunter', desc: 'Finds and fixes errors before you ever see them', color: 'bg-red-500' },
  { name: 'Security', desc: 'OWASP scan, secrets detection, injection checks', color: 'bg-orange-500' },
  { name: 'Optimizer', desc: 'Improves performance, bundle size, and queries', color: 'bg-yellow-500' },
  { name: 'Test Writer', desc: 'Jest, Vitest, and Playwright tests auto-generated', color: 'bg-pink-500' },
  { name: 'Reviewer', desc: 'Final quality pass and style consistency check', color: 'bg-blue-500' },
  { name: 'Doc Writer', desc: 'JSDoc, README, and OpenAPI spec generation', color: 'bg-violet-500' },
  { name: 'Deploy Agent', desc: 'Builds and deploys to your chosen provider', color: 'bg-teal-500' },
];

const STATS = [
  { value: '50K+', label: 'Projects Built' },
  { value: '99.2%', label: 'Zero-Error Rate' },
  { value: '4.2s', label: 'Avg. First File' },
  { value: '9', label: 'AI Agents' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0A0F1E]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">DevForge AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#agents" className="text-sm text-gray-400 hover:text-white transition-colors">Agents</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors px-4 py-2">
              Sign in
            </Link>
            <Link
              to="/signup"
              className="text-sm bg-cyan-500 hover:bg-cyan-400 text-[#0A0F1E] font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-cyan-500/5 blur-3xl animate-pulse" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-600/8 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-cyan-400/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,212,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-8 text-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-300">Now with 9 specialized AI agents</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Build apps with an
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              AI agent team
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Describe what you want. Nine specialized agents plan, write, debug, secure, test, and deploy your application — completely autonomously.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/signup"
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-[#0A0F1E] font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]"
            >
              Start Building Free
              <ArrowRight size={20} />
            </Link>
            <a
              href="#agents"
              className="flex items-center gap-2 border border-white/10 hover:border-white/20 px-8 py-4 rounded-xl text-lg transition-colors text-gray-300 hover:text-white"
            >
              See how it works
              <ChevronRight size={20} />
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-white/3 backdrop-blur border border-white/5 rounded-2xl p-6">
                <div className="text-3xl font-bold text-cyan-400 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Pipeline Visual */}
      <section id="agents" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Meet your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                AI team
              </span>
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">
              Each agent is a specialist. Together they form an autonomous pipeline that ships production code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AGENTS.map((agent, i) => (
              <div
                key={agent.name}
                className="group relative bg-white/3 backdrop-blur border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 ${agent.color} rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold mb-1">{agent.name}</div>
                    <div className="text-sm text-gray-400">{agent.desc}</div>
                  </div>
                </div>
                {i < AGENTS.length - 1 && (
                  <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                    <ChevronRight size={16} className="text-gray-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything you need to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                ship faster
              </span>
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">
              From a single prompt to a deployed application — all in one workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-white/3 backdrop-blur border border-white/5 rounded-2xl p-7 hover:border-white/10 transition-all group hover:-translate-y-1"
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-5`}>
                  <feature.icon size={22} className={feature.color} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Builder Preview */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">The workspace built for AI-generated code</h2>
            <p className="text-gray-400 text-lg">Monaco Editor, file explorer, agent panel, terminal — all in one view.</p>
          </div>

          {/* Mock workspace UI */}
          <div className="relative bg-[#111827] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0d1424]">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-3 text-xs text-gray-500 font-mono">devforge — my-saas-app — builder</span>
            </div>

            <div className="flex h-[500px]">
              {/* Sidebar */}
              <div className="w-56 border-r border-white/5 bg-[#0d1424] p-3 shrink-0">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Files</div>
                {['src/', 'src/App.tsx', 'src/components/', 'src/pages/', 'package.json', 'vite.config.ts'].map((f) => (
                  <div key={f} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs ${f === 'src/App.tsx' ? 'bg-cyan-500/10 text-cyan-300' : 'text-gray-400 hover:bg-white/5'} cursor-pointer`}>
                    {f.endsWith('/') ? <Layers size={12} /> : <Code2 size={12} />}
                    {f}
                  </div>
                ))}
              </div>

              {/* Editor */}
              <div className="flex-1 bg-[#0f172a] font-mono text-sm p-4 overflow-hidden">
                <div className="text-gray-500 text-xs mb-3">src/App.tsx</div>
                <pre className="text-gray-300 text-xs leading-6">
{`import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { AuthProvider } from './context/AuthContext';

`}<span className="text-cyan-400">export default</span>{` function App() {
  return (
    `}<span className="text-emerald-400">&lt;AuthProvider&gt;</span>{`
      `}<span className="text-emerald-400">&lt;Routes&gt;</span>{`
        `}<span className="text-blue-400">&lt;Route path="/"</span>{` element={`}<span className="text-amber-300">&lt;LandingPage /&gt;</span>{`} /&gt;
        `}<span className="text-blue-400">&lt;Route path="/dashboard"</span>{` element={`}<span className="text-amber-300">&lt;Dashboard /&gt;</span>{`} /&gt;
      `}<span className="text-emerald-400">&lt;/Routes&gt;</span>{`
    `}<span className="text-emerald-400">&lt;/AuthProvider&gt;</span>{`
  );
}`}
                </pre>
              </div>

              {/* Agent panel */}
              <div className="w-64 border-l border-white/5 bg-[#0d1424] p-3 shrink-0">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Agents</div>
                {[
                  { name: 'Planner', status: 'completed', color: 'text-emerald-400' },
                  { name: 'Code Writer', status: 'running', color: 'text-cyan-400' },
                  { name: 'Bug Hunter', status: 'pending', color: 'text-gray-500' },
                ].map((agent) => (
                  <div key={agent.name} className="flex items-center justify-between px-2 py-2 rounded mb-1 bg-white/3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${agent.status === 'running' ? 'bg-cyan-400 animate-pulse' : agent.status === 'completed' ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                      <span className="text-xs text-gray-300">{agent.name}</span>
                    </div>
                    <span className={`text-xs ${agent.color}`}>{agent.status}</span>
                  </div>
                ))}
                <div className="mt-4 bg-black/30 rounded-lg p-3 font-mono text-xs text-green-400">
                  <div className="text-gray-500 mb-1">$ agent log</div>
                  <div>Writing App.tsx...</div>
                  <div>Writing routes...</div>
                  <div className="animate-pulse">▊</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple pricing</h2>
            <p className="text-gray-400 text-xl">Start free. Scale as you build.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-cyan-500/10 to-blue-600/10 border-2 border-cyan-500/40'
                    : 'bg-white/3 border border-white/5'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-[#0A0F1E] text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="text-lg font-semibold mb-1">{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500 text-sm">/{plan.period}</span>
                </div>
                <p className="text-gray-400 text-sm mb-8">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                      <Check size={16} className="text-cyan-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`block text-center py-3 rounded-xl font-semibold transition-all ${
                    plan.highlight
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-[#0A0F1E] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]'
                      : 'border border-white/10 hover:border-white/20 text-gray-300 hover:text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-3xl p-12">
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-cyan-500/10 blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Ready to build with AI?
              </h2>
              <p className="text-gray-400 text-xl mb-8 max-w-xl mx-auto">
                Join thousands of developers shipping production-quality apps in minutes, not weeks.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-[#0A0F1E] font-bold px-10 py-4 rounded-xl text-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]"
              >
                Start for Free
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-semibold">DevForge AI</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Docs</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Status</a>
          </div>
          <div className="text-sm text-gray-600">
            © 2026 DevForge AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
