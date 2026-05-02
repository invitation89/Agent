export interface Profile {
  id: string;
  username: string | null;
  full_name: string;
  avatar_url: string;
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  invited_by: string | null;
  created_at: string;
}

export type ProjectStatus = 'idle' | 'generating' | 'error' | 'ready' | 'deployed';
export type ProjectStack = 'react' | 'nextjs' | 'vue' | 'svelte' | 'vanilla' | 'node' | 'python' | 'fullstack';

export interface Project {
  id: string;
  name: string;
  description: string;
  stack: ProjectStack;
  status: ProjectStatus;
  owner_id: string;
  org_id: string | null;
  thumbnail_url: string;
  deployed_url: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  path: string;
  content: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'openrouter' | 'mistral' | 'groq';

export interface ApiKey {
  id: string;
  user_id: string;
  provider: AIProvider;
  encrypted_key: string;
  label: string;
  model: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

export type AgentType =
  | 'planner'
  | 'code_writer'
  | 'bug_hunter'
  | 'security'
  | 'optimizer'
  | 'test_writer'
  | 'reviewer'
  | 'doc_writer'
  | 'deploy';

export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface AgentRun {
  id: string;
  project_id: string;
  agent_type: AgentType;
  status: AgentStatus;
  input: string;
  output: string;
  tokens_used: number;
  cost_usd: number;
  started_at: string;
  finished_at: string | null;
}

export interface AgentLog {
  id: string;
  agent_run_id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  created_at: string;
}

export interface Deployment {
  id: string;
  project_id: string;
  provider: string;
  status: 'pending' | 'building' | 'deployed' | 'failed';
  url: string;
  logs: string;
  deployed_at: string;
}

export type SubscriptionPlan = 'free' | 'pro' | 'team' | 'enterprise';

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  stripe_customer_id: string;
  stripe_subscription_id: string;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageEvent {
  id: string;
  user_id: string;
  project_id: string | null;
  provider: string;
  model: string;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
  created_at: string;
}

export interface ProviderConfig {
  models: string[];
  label: string;
  color: string;
}

export const PROVIDERS: Record<AIProvider, ProviderConfig> = {
  openai: { models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'], label: 'OpenAI', color: '#10A37F' },
  anthropic: { models: ['claude-opus-4-5', 'claude-sonnet-4-5', 'claude-haiku-4-5'], label: 'Anthropic', color: '#D97706' },
  google: { models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash'], label: 'Google', color: '#4285F4' },
  openrouter: { models: ['auto', 'openai/gpt-4o', 'anthropic/claude-3.5-sonnet'], label: 'OpenRouter', color: '#6366F1' },
  mistral: { models: ['mistral-large', 'mistral-medium', 'mistral-small'], label: 'Mistral', color: '#FF7000' },
  groq: { models: ['llama-3.3-70b', 'mixtral-8x7b', 'llama-3.1-8b'], label: 'Groq', color: '#F55036' },
};

export const AGENT_LABELS: Record<AgentType, string> = {
  planner: 'Planner',
  code_writer: 'Code Writer',
  bug_hunter: 'Bug Hunter',
  security: 'Security',
  optimizer: 'Optimizer',
  test_writer: 'Test Writer',
  reviewer: 'Reviewer',
  doc_writer: 'Doc Writer',
  deploy: 'Deploy',
};

export const STACK_OPTIONS: { value: ProjectStack; label: string; icon: string }[] = [
  { value: 'react', label: 'React', icon: '⚛️' },
  { value: 'nextjs', label: 'Next.js', icon: '▲' },
  { value: 'vue', label: 'Vue', icon: '🟢' },
  { value: 'svelte', label: 'Svelte', icon: '🔥' },
  { value: 'vanilla', label: 'Vanilla JS', icon: '🍦' },
  { value: 'node', label: 'Node.js', icon: '🟩' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'fullstack', label: 'Full Stack', icon: '🏗️' },
];
