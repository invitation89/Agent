/*
  # DevForge AI — Complete Database Schema

  Creates all tables for the DevForge platform in correct dependency order.
  Includes RLS, indexes, and updated_at triggers.
*/

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  bio text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Org Members (created before org policies that reference it)
CREATE TABLE IF NOT EXISTS org_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'developer' CHECK (role IN ('owner', 'admin', 'developer', 'viewer')),
  invited_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(org_id, user_id)
);

ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

-- Org policies (after org_members exists)
CREATE POLICY "Org members can view org"
  ON organizations FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM org_members WHERE org_members.org_id = organizations.id AND org_members.user_id = auth.uid())
  );

CREATE POLICY "Owners can update org"
  ON organizations FOR UPDATE TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Authenticated can create org"
  ON organizations FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Org member policies
CREATE POLICY "Org members can view members"
  ON org_members FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM org_members om2 WHERE om2.org_id = org_members.org_id AND om2.user_id = auth.uid())
  );

CREATE POLICY "Admins can insert members"
  ON org_members FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM org_members om2 WHERE om2.org_id = org_id AND om2.user_id = auth.uid() AND om2.role IN ('owner', 'admin'))
  );

CREATE POLICY "Admins can delete members"
  ON org_members FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM org_members om2 WHERE om2.org_id = org_members.org_id AND om2.user_id = auth.uid() AND om2.role IN ('owner', 'admin'))
  );

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  stack text DEFAULT 'react',
  status text DEFAULT 'idle' CHECK (status IN ('idle', 'generating', 'error', 'ready', 'deployed')),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  thumbnail_url text DEFAULT '',
  deployed_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own projects"
  ON projects FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid() OR
    (org_id IS NOT NULL AND EXISTS (SELECT 1 FROM org_members WHERE org_members.org_id = projects.org_id AND org_members.user_id = auth.uid()))
  );

CREATE POLICY "Owners can create projects"
  ON projects FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update projects"
  ON projects FOR UPDATE TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can delete projects"
  ON projects FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- Project Files
CREATE TABLE IF NOT EXISTS project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  path text NOT NULL,
  content text DEFAULT '',
  language text DEFAULT 'text',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_id, path)
);

ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project owners can view files"
  ON project_files FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_files.project_id AND projects.owner_id = auth.uid()));

CREATE POLICY "Project owners can insert files"
  ON project_files FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id AND projects.owner_id = auth.uid()));

CREATE POLICY "Project owners can update files"
  ON project_files FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_files.project_id AND projects.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_files.project_id AND projects.owner_id = auth.uid()));

CREATE POLICY "Project owners can delete files"
  ON project_files FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_files.project_id AND projects.owner_id = auth.uid()));

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  encrypted_key text NOT NULL,
  label text DEFAULT '',
  model text DEFAULT '',
  is_active boolean DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own api keys"
  ON api_keys FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own api keys"
  ON api_keys FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own api keys"
  ON api_keys FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own api keys"
  ON api_keys FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Agent Runs
CREATE TABLE IF NOT EXISTS agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  agent_type text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  input text DEFAULT '',
  output text DEFAULT '',
  tokens_used integer DEFAULT 0,
  cost_usd numeric(10,6) DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  finished_at timestamptz
);

ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project owners can view agent runs"
  ON agent_runs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = agent_runs.project_id AND projects.owner_id = auth.uid()));

CREATE POLICY "Project owners can insert agent runs"
  ON agent_runs FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id AND projects.owner_id = auth.uid()));

CREATE POLICY "Project owners can update agent runs"
  ON agent_runs FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = agent_runs.project_id AND projects.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = agent_runs.project_id AND projects.owner_id = auth.uid()));

-- Agent Logs
CREATE TABLE IF NOT EXISTS agent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_run_id uuid NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  level text DEFAULT 'info' CHECK (level IN ('info', 'warn', 'error', 'debug')),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logs for own projects"
  ON agent_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agent_runs
      JOIN projects ON projects.id = agent_runs.project_id
      WHERE agent_runs.id = agent_logs.agent_run_id AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert logs for own projects"
  ON agent_logs FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agent_runs
      JOIN projects ON projects.id = agent_runs.project_id
      WHERE agent_runs.id = agent_run_id AND projects.owner_id = auth.uid()
    )
  );

-- Deployments
CREATE TABLE IF NOT EXISTS deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  provider text DEFAULT 'vercel',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'deployed', 'failed')),
  url text DEFAULT '',
  logs text DEFAULT '',
  deployed_at timestamptz DEFAULT now()
);

ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project owners can view deployments"
  ON deployments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = deployments.project_id AND projects.owner_id = auth.uid()));

CREATE POLICY "Project owners can insert deployments"
  ON deployments FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id AND projects.owner_id = auth.uid()));

CREATE POLICY "Project owners can update deployments"
  ON deployments FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = deployments.project_id AND projects.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = deployments.project_id AND projects.owner_id = auth.uid()));

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team', 'enterprise')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  stripe_customer_id text DEFAULT '',
  stripe_subscription_id text DEFAULT '',
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Usage Events
CREATE TABLE IF NOT EXISTS usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  provider text NOT NULL,
  model text NOT NULL,
  tokens_in integer DEFAULT 0,
  tokens_out integer DEFAULT 0,
  cost_usd numeric(10,6) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON usage_events FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own usage"
  ON usage_events FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_org ON projects(org_id);
CREATE INDEX IF NOT EXISTS idx_project_files_project ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_project ON agent_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_run ON agent_logs(agent_run_id);
CREATE INDEX IF NOT EXISTS idx_deployments_project ON deployments(project_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_user ON usage_events(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_created ON usage_events(created_at);

-- Updated At Trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER project_files_updated_at
  BEFORE UPDATE ON project_files FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
