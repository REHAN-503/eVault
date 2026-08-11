import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PortalShell from '../components/PortalShell';
import { register, listUsers, updateUserStatus } from '../api/auth';
import { getSystemStatus } from '../api/system';
import { Server, Database, UserPlus, HardDrive, Wifi, Layers, CheckCircle2, XCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state for adding an institutional member
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'LAWYER', status: 'APPROVED' });
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      setStatus(await getSystemStatus());
      const allUsers = await listUsers();
      setUsers(allUsers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function handleRegister(e) {
    e.preventDefault();
    setBusy(true);
    try {
      // Direct provision as active institutional member
      const newUser = await register(form);
      // Immediately approve since the admin is creating them
      await updateUserStatus(newUser.id, 'APPROVED');
      
      setForm({ fullName: '', email: '', password: '', role: 'LAWYER', status: 'APPROVED' });
      toast.success('Institutional Member provisioned successfully.');
      refresh();
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
    setBusy(false);
  }

  async function handleAction(userId, action) {
    try {
      await updateUserStatus(userId, action === 'active' ? 'APPROVED' : 'REJECTED');
      toast.success(`User ${action === 'active' ? 'approved' : 'rejected'}.`);
      refresh();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  }

  const pendingUsers = users.filter(u => String(u.status).toUpperCase() === 'PENDING');
  const activeUsers = users.filter(u => String(u.status).toUpperCase() === 'APPROVED' && String(u.role).toUpperCase() !== 'ADMIN');

  return (
    <PortalShell role="admin" user={user}>
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-display font-semibold tracking-tight text-ink mb-2">Registry Infrastructure</h1>
          <p className="text-sm text-slate max-w-2xl">
            Monitor blockchain node health, manage storage infrastructure, and provision cryptographic identities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-verified/10 border border-verified/20 text-verified px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-verified animate-pulse"></span>
            Network Active
          </div>
          <div className="bg-white border border-line rounded px-3 py-1.5 flex items-center gap-2 text-xs font-mono text-slate shadow-sm">
            <Server size={14} /> Node: eVR-0x74B9
          </div>
        </div>
      </div>

      {/* System Health Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-line rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2 text-slate">
            <Wifi size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">API Gateway</span>
          </div>
          <p className="text-xl font-semibold text-ink mb-1">{status?.api || 'Operational'}</p>
          <p className="text-[10px] text-verified">99.99% Uptime</p>
        </div>
        <div className="bg-white border border-line rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2 text-slate">
            <Database size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">PostgreSQL DB</span>
          </div>
          <p className="text-xl font-semibold text-ink mb-1">{status?.db || 'Connected'}</p>
          <p className="text-[10px] text-slate">14ms latency</p>
        </div>
        <div className="bg-white border border-line rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2 text-slate">
            <Layers size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Blockchain Node</span>
          </div>
          <p className="text-xl font-semibold text-ink mb-1">{status?.chain || 'Synced'}</p>
          <p className="text-[10px] text-slate">Block #149021</p>
        </div>
        <div className="bg-white border border-line rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2 text-slate">
            <HardDrive size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">IPFS Storage</span>
          </div>
          <p className="text-xl font-semibold text-ink mb-1">{status?.ipfs || 'Online'}</p>
          <p className="text-[10px] text-slate">1.2 TB Utilized</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        
        {/* Left Column: User Management */}
        <div className="w-full xl:w-2/3 flex flex-col gap-6">
          
          {/* Pending Requests */}
          <div className="bg-white border border-line rounded-lg shadow-sm overflow-hidden flex-1">
            <div className="px-6 py-4 border-b border-line bg-[#FAFAFA] flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate uppercase tracking-wider flex items-center gap-2">
                <Users size={14} /> Access Requests ({pendingUsers.length})
              </h3>
            </div>
            
            {loading ? (
              <div className="p-8 text-center text-slate">Loading users...</div>
            ) : pendingUsers.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-slate">
                <Users size={32} className="mb-4 opacity-50" />
                <p className="text-sm">No pending client registrations.</p>
              </div>
            ) : (
              <div className="divide-y divide-line">
                {pendingUsers.map(u => (
                  <div key={u.id} className="p-5 flex items-center justify-between hover:bg-[#FAFAFA] transition-colors">
                    <div>
                      <p className="font-semibold text-ink">{u.name}</p>
                      <div className="flex items-center gap-3 text-xs text-slate mt-1">
                        <span>{u.email}</span>
                        <span className="w-1 h-1 bg-slate rounded-full"></span>
                        <span className="uppercase tracking-widest font-bold">{u.role}</span>
                        <span className="w-1 h-1 bg-slate rounded-full"></span>
                        <span className="font-mono">{new Date(u.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(u.id, 'rejected')} className="p-2 text-slate hover:text-maroon hover:bg-maroon/5 rounded transition-colors" title="Reject Request">
                        <XCircle size={20} />
                      </button>
                      <button onClick={() => handleAction(u.id, 'active')} className="p-2 text-slate hover:text-verified hover:bg-verified/5 rounded transition-colors" title="Approve Identity">
                        <CheckCircle2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Active Users */}
          <div className="bg-white border border-line rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-line bg-[#FAFAFA] flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate uppercase tracking-wider flex items-center gap-2">
                <Users size={14} /> Institutional Roster
              </h3>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-line">
               {activeUsers.map(u => (
                  <div key={u.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-ink">{u.name}</p>
                      <p className="text-xs text-slate">{u.org || 'Individual'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] uppercase font-bold tracking-widest bg-slate/10 text-slate px-2 py-1 rounded">
                        {u.role}
                      </span>
                      <span className="text-xs font-mono text-slate-light w-20 text-right">{u.id}</span>
                    </div>
                  </div>
               ))}
            </div>
          </div>
          
        </div>

        {/* Right Column: Provisioning */}
        <div className="w-full xl:w-1/3 flex flex-col gap-6 shrink-0">
          
          {/* Identity Provisioning Form */}
          <div className="bg-white border border-line rounded-lg shadow-sm overflow-hidden sticky top-6">
            <div className="px-5 py-4 border-b border-line bg-[#FAFAFA]">
              <h3 className="text-xs font-bold text-slate uppercase tracking-wider flex items-center gap-2">
                <UserPlus size={14} /> Add Institutional Member
              </h3>
            </div>
            <div className="p-5">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate mb-1">Full Legal Name</label>
                  <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full text-sm border border-line rounded px-3 py-2 bg-[#FAFAFA] focus:bg-white focus:border-ink outline-none transition-colors" placeholder="e.g. Justice K. Menon" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate mb-1">Institutional Email</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full text-sm border border-line rounded px-3 py-2 bg-[#FAFAFA] focus:bg-white focus:border-ink outline-none transition-colors" placeholder="judge@registry.gov.in" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate mb-1">Network Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full bg-white text-slate px-4 py-2 rounded border border-light focus:outline-none focus:border-ink transition-colors"
                  >
                    <option value="LAWYER">Lawyer</option>
                    <option value="JUDGE">Judge</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate mb-1">Temporary Password</label>
                  <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full text-sm border border-line rounded px-3 py-2 bg-[#FAFAFA] focus:bg-white focus:border-ink outline-none transition-colors" placeholder="••••••••" />
                </div>
                <button type="submit" disabled={busy} className="w-full rounded bg-ink text-white px-4 py-2.5 text-sm font-semibold hover:bg-ink/90 transition-colors disabled:opacity-50 shadow-sm mt-2 flex items-center justify-center gap-2">
                  <UserPlus size={16} /> Provision Identity
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </PortalShell>
  );
}
