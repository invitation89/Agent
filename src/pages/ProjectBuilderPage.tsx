import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft, Play, Send, Loader2, CheckCircle2, AlertCircle,
  Clock, Code2, FileText, Folder, FolderOpen, ChevronDown,
  ChevronRight as ChevronRightIcon, Maximize2, Minimize2,
  TerminalSquare, Bot, Zap, Settings, Rocket
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Project, ProjectFile, AgentRun, AgentType } from '../types';
import { AGENT_LABELS } from '../types';

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
}

function buildFileTree(files: ProjectFile[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split('/').filter(Boolean);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      let node = current.find((n) => n.name === part);

      if (!node) {
        node = {
          name: part,
          path: parts.slice(0, i + 1).join('/'),
          type: isLast ? 'file' : 'folder',
          children: isLast ? undefined : [],
        };
        current.push(node);
      }
      if (!isLast) current = node.children!;
    }
  }

  return root;
}

function FileTreeItem({
  node, depth, selectedPath, onSelect,
}: {
  node: FileTreeNode;
  depth: number;
  selectedPath: string | null;
  onSelect: (path: string) => void;
}) {
  const [open, setOpen] = useState(depth < 2);

  if (node.type === 'folder') {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs text-gray-400 hover:text-white hover:bg-white/4 transition-colors"
          style={{ paddingLeft: `${8 + depth * 12}px` }}
        >
          {open ? <FolderOpen size={12} className="text-yellow-400" /> : <Folder size={12} className="text-yellow-400" />}
          {open ? <ChevronDown size={10} /> : <ChevronRightIcon size={10} />}
          {node.name}
        </button>
        {open && node.children?.map((child) => (
          <FileTreeItem key={child.path} node={child} depth={depth + 1} selectedPath={selectedPath} onSelect={onSelect} />
        ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect(node.path)}
      className={`w-full flex items-center gap-1.5 py-1 rounded text-xs transition-colors ${
        selectedPath === node.path ? 'bg-cyan-500/10 text-cyan-300' : 'text-gray-400 hover:text-white hover:bg-white/4'
      }`}
      style={{ paddingLeft: `${8 + depth * 12}px` }}
    >
      <FileText size={11} />
      {node.name}
    </button>
  );
}

const AGENT_ORDER: AgentType[] = [
  'planner', 'code_writer', 'bug_hunter', 'security', 'test_writer', 'reviewer',
];

const AGENT_COLORS: Record<string, string> = {
  planner: 'bg-cyan-500',
  code_writer: 'bg-emerald-500',
  bug_hunter: 'bg-red-500',
  security: 'bg-orange-500',
  optimizer: 'bg-yellow-500',
  test_writer: 'bg-pink-500',
  reviewer: 'bg-blue-500',
  doc_writer: 'bg-violet-500',
  deploy: 'bg-teal-500',
};

function detectLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'tsx', js: 'javascript', jsx: 'jsx',
    py: 'python', css: 'css', html: 'html', json: 'json',
    md: 'markdown', sql: 'sql', yaml: 'yaml', yml: 'yaml',
    sh: 'bash', dockerfile: 'dockerfile',
  };
  return map[ext || ''] || 'text';
}

export default function ProjectBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'agents'>('agents');
  const [agentOutput, setAgentOutput] = useState<string[]>([]);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !user) return;
    fetchProject();
    fetchFiles();
    fetchAgentRuns();
  }, [id, user]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [agentOutput]);

  async function fetchProject() {
    const { data } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
    setProject(data);
  }

  async function fetchFiles() {
    const { data } = await supabase.from('project_files').select('*').eq('project_id', id).order('path');
    setFiles(data || []);
    if (data && data.length > 0) setSelectedFile(data[0]);
  }

  async function fetchAgentRuns() {
    const { data } = await supabase
      .from('agent_runs')
      .select('*')
      .eq('project_id', id)
      .order('started_at', { ascending: false })
      .limit(20);
    setAgentRuns(data || []);
  }

  async function handleGenerate() {
    if (!prompt.trim() || !user || !id) return;
    setGenerating(true);
    setAgentOutput([]);
    setCurrentAgent('planner');
    setActiveTab('agents');

    const { data: agentRun } = await supabase
      .from('agent_runs')
      .insert({ project_id: id, agent_type: 'planner', status: 'running', input: prompt })
      .select()
      .single();

    if (agentRun) {
      await supabase.from('projects').update({ status: 'generating' }).eq('id', id);
      setProject((prev) => prev ? { ...prev, status: 'generating' } : prev);
    }

    const simulatedAgentFlow = [
      { agent: 'planner', messages: ['Analyzing prompt...', 'Breaking into subtasks...', 'Identifying file structure...', 'Task plan created.'] },
      { agent: 'code_writer', messages: ['Starting code generation...', 'Writing components...', 'Writing utility functions...', 'Writing configuration files...', 'Code generation complete.'] },
      { agent: 'bug_hunter', messages: ['Scanning for syntax errors...', 'Checking type safety...', 'Validating imports...', 'No critical errors found.'] },
      { agent: 'security', messages: ['Running OWASP checks...', 'Scanning for hardcoded secrets...', 'Validating input sanitization...', 'Security scan passed.'] },
      { agent: 'test_writer', messages: ['Generating unit tests...', 'Writing integration tests...', 'Tests created.'] },
      { agent: 'reviewer', messages: ['Final code quality pass...', 'Checking style consistency...', 'Review complete. Ready to deploy.'] },
    ];

    for (const phase of simulatedAgentFlow) {
      setCurrentAgent(phase.agent);
      for (const msg of phase.messages) {
        await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));
        setAgentOutput((prev) => [...prev, `[${AGENT_LABELS[phase.agent as AgentType] || phase.agent}] ${msg}`]);
      }

      await supabase.from('agent_runs').insert({
        project_id: id,
        agent_type: phase.agent,
        status: 'completed',
        input: prompt,
        output: phase.messages.join('\n'),
      });
    }

    await supabase.from('projects').update({ status: 'ready' }).eq('id', id);
    setProject((prev) => prev ? { ...prev, status: 'ready' } : prev);
    setCurrentAgent(null);
    setGenerating(false);
    setPrompt('');
    await fetchAgentRuns();
    setAgentOutput((prev) => [...prev, '[System] Generation complete! Your project is ready.']);
  }

  const fileTree = buildFileTree(files);

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      {/* Topbar */}
      <div className="flex items-center justify-between px-5 h-14 border-b border-white/5 bg-[#0d1424] shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ChevronLeft size={14} />
            Dashboard
          </Link>
          <span className="text-gray-700">/</span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Zap size={11} className="text-white" />
            </div>
            <span className="text-sm font-medium text-white">{project?.name || 'Loading...'}</span>
            {project?.status && (
              <span className={`text-xs px-2 py-0.5 rounded-md ${
                project.status === 'generating' ? 'bg-cyan-500/10 text-cyan-400' :
                project.status === 'ready' ? 'bg-emerald-500/10 text-emerald-400' :
                project.status === 'deployed' ? 'bg-blue-500/10 text-blue-400' :
                'bg-white/5 text-gray-500'
              }`}>
                {project.status}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/project/${id}/deploy`}
            className="flex items-center gap-1.5 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
          >
            <Rocket size={13} /> Deploy
          </Link>
          <Link
            to={`/project/${id}/settings`}
            className="flex items-center gap-1.5 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
          >
            <Settings size={13} />
          </Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: file tree + agents */}
        <div className="w-60 border-r border-white/5 bg-[#0d1424] flex flex-col shrink-0 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/5">
            <button
              onClick={() => setActiveTab('files')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${activeTab === 'files' ? 'text-white border-b-2 border-cyan-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Folder size={12} /> Files
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${activeTab === 'agents' ? 'text-white border-b-2 border-cyan-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Bot size={12} /> Agents
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {activeTab === 'files' ? (
              files.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <Code2 size={20} className="text-gray-700 mb-2" />
                  <p className="text-xs text-gray-600">No files yet. Generate to start.</p>
                </div>
              ) : (
                fileTree.map((node) => (
                  <FileTreeItem
                    key={node.path}
                    node={node}
                    depth={0}
                    selectedPath={selectedFile?.path || null}
                    onSelect={(path) => {
                      const f = files.find((f) => f.path === path);
                      if (f) setSelectedFile(f);
                    }}
                  />
                ))
              )
            ) : (
              <div className="space-y-1.5">
                {AGENT_ORDER.map((agentType) => {
                  const runs = agentRuns.filter((r) => r.agent_type === agentType);
                  const latestRun = runs[0];
                  const isActive = currentAgent === agentType;
                  return (
                    <div
                      key={agentType}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all ${
                        isActive ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-white/3'
                      }`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${AGENT_COLORS[agentType] || 'bg-gray-500'} ${
                        isActive ? 'animate-pulse' : latestRun?.status === 'completed' ? 'opacity-100' : 'opacity-30'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-white truncate">{AGENT_LABELS[agentType]}</div>
                        {latestRun && !isActive && (
                          <div className={`text-xs ${latestRun.status === 'completed' ? 'text-emerald-500' : latestRun.status === 'failed' ? 'text-red-400' : 'text-gray-500'}`}>
                            {latestRun.status}
                          </div>
                        )}
                        {isActive && <div className="text-xs text-cyan-400 animate-pulse">running...</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Center: code editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor area */}
          <div className="flex-1 overflow-auto bg-[#0f172a]">
            {selectedFile ? (
              <div className="h-full">
                <div className="flex items-center gap-3 px-4 py-2 border-b border-white/5 bg-[#0d1424]">
                  <FileText size={13} className="text-gray-500" />
                  <span className="text-xs text-gray-400 font-mono">{selectedFile.path}</span>
                  <span className="ml-auto text-xs bg-white/5 px-2 py-0.5 rounded text-gray-500">
                    {detectLanguage(selectedFile.path)}
                  </span>
                </div>
                <pre className="p-4 text-xs font-mono text-gray-300 leading-6 overflow-auto h-full">
                  <code>{selectedFile.content || '// No content yet'}</code>
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-white/3 rounded-2xl flex items-center justify-center mb-4">
                  <Code2 size={28} className="text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No file selected</h3>
                <p className="text-gray-500 text-sm max-w-xs">
                  Generate code with a prompt below, or select a file from the explorer.
                </p>
              </div>
            )}
          </div>

          {/* Terminal */}
          <div className="border-t border-white/5">
            <div className="flex items-center justify-between px-4 py-2 bg-[#0d1424] border-b border-white/5">
              <div className="flex items-center gap-2">
                <TerminalSquare size={13} className="text-green-400" />
                <span className="text-xs font-medium text-gray-400">Agent Log</span>
              </div>
              <button
                onClick={() => setTerminalOpen(!terminalOpen)}
                className="text-gray-600 hover:text-gray-300 transition-colors"
              >
                {terminalOpen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
            </div>
            {terminalOpen && (
              <div
                ref={terminalRef}
                className="h-36 overflow-y-auto bg-black/50 p-3 font-mono text-xs leading-6"
              >
                {agentOutput.length === 0 ? (
                  <span className="text-gray-700">$ Waiting for agent output...</span>
                ) : (
                  agentOutput.map((line, i) => (
                    <div key={i} className={`${
                      line.includes('[Planner]') ? 'text-cyan-400' :
                      line.includes('[Code Writer]') ? 'text-emerald-400' :
                      line.includes('[Bug Hunter]') ? 'text-red-400' :
                      line.includes('[Security]') ? 'text-orange-400' :
                      line.includes('[Test Writer]') ? 'text-pink-400' :
                      line.includes('[Reviewer]') ? 'text-blue-400' :
                      line.includes('[System]') ? 'text-yellow-400' :
                      'text-gray-300'
                    }`}>
                      {line}
                    </div>
                  ))
                )}
                {generating && (
                  <div className="flex items-center gap-2 text-gray-500 mt-1">
                    <span className="animate-pulse">▊</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prompt bar */}
      <div className="border-t border-white/5 bg-[#0d1424] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && !generating && handleGenerate()}
              placeholder="Describe what you want to build or change..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-32 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 transition-colors"
              disabled={generating}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {generating && <Loader2 size={14} className="text-cyan-400 animate-spin mr-1" />}
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#0A0F1E] font-semibold px-5 py-3 rounded-xl text-sm transition-all"
          >
            {generating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  );
}
