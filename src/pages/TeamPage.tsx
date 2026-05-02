import { useState, useEffect } from 'react';
import { Users, UserPlus, Crown, Shield, Code2, Eye, Trash2, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Role = 'owner' | 'admin' | 'developer' | 'viewer';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  joinedAt: string;
}

const ROLE_CONFIG: Record<Role, { label: string; icon: React.ElementType; color: string }> = {
  owner: { label: 'Owner', icon: Crown, color: 'text-amber-400' },
  admin: { label: 'Admin', icon: Shield, color: 'text-blue-400' },
  developer: { label: 'Developer', icon: Code2, color: 'text-emerald-400' },
  viewer: { label: 'Viewer', icon: Eye, color: 'text-gray-400' },
};

export default function TeamPage() {
  const { user, profile } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('developer');
  const [inviting, setInviting] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  useEffect(() => {
    if (user && profile) {
      setMembers([
        {
          id: user.id,
          name: profile.full_name || 'You',
          email: user.email || '',
          role: 'owner',
          avatar: profile.full_name?.[0]?.toUpperCase() || 'Y',
          joinedAt: profile.created_at,
        },
      ]);
    }
  }, [user, profile]);

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setInviting(false);
    setInviteSent(true);
    setInviteEmail('');
    setTimeout(() => setInviteSent(false), 4000);
  }

  return (
    <div className="min-h-full bg-[#0A0F1E] p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Users size={18} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Team</h1>
            <p className="text-gray-500 text-sm">Manage team members and permissions</p>
          </div>
        </div>

        {/* Invite section */}
        <div className="bg-white/3 border border-white/5 rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <UserPlus size={16} className="text-cyan-400" /> Invite Member
          </h2>

          {inviteSent && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 mb-4 text-sm flex items-center gap-2">
              <Mail size={14} /> Invitation sent successfully.
            </div>
          )}

          <div className="flex gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as Role)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
            >
              <option value="admin" className="bg-[#1a2235]">Admin</option>
              <option value="developer" className="bg-[#1a2235]">Developer</option>
              <option value="viewer" className="bg-[#1a2235]">Viewer</option>
            </select>
            <button
              onClick={handleInvite}
              disabled={!inviteEmail.trim() || inviting}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-[#0A0F1E] font-semibold px-4 py-2.5 rounded-xl text-sm transition-all whitespace-nowrap"
            >
              {inviting ? <span className="w-4 h-4 border-2 border-[#0A0F1E]/30 border-t-[#0A0F1E] rounded-full animate-spin" /> : <UserPlus size={15} />}
              Send Invite
            </button>
          </div>
        </div>

        {/* Members list */}
        <div className="bg-white/3 border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="font-semibold text-white">Members ({members.length})</h2>
          </div>
          <div className="divide-y divide-white/5">
            {members.map((member) => {
              const roleConfig = ROLE_CONFIG[member.role];
              const RoleIcon = roleConfig.icon;
              return (
                <div key={member.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                      {member.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1.5 text-xs ${roleConfig.color}`}>
                      <RoleIcon size={12} />
                      {roleConfig.label}
                    </div>
                    {member.role !== 'owner' && (
                      <button className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Role legend */}
        <div className="mt-6 bg-white/3 border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Role Permissions</h3>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(ROLE_CONFIG) as Role[]).map((role) => {
              const config = ROLE_CONFIG[role];
              const Icon = config.icon;
              const descriptions: Record<Role, string> = {
                owner: 'Full access, billing, delete org',
                admin: 'Manage members, all projects',
                developer: 'Create & edit projects',
                viewer: 'View projects only',
              };
              return (
                <div key={role} className="flex items-start gap-2.5">
                  <Icon size={14} className={`mt-0.5 shrink-0 ${config.color}`} />
                  <div>
                    <div className={`text-xs font-medium ${config.color}`}>{config.label}</div>
                    <div className="text-xs text-gray-600">{descriptions[role]}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
