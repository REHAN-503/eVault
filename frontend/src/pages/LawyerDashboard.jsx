import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PortalShell from '../components/PortalShell';
import { listDocuments, getDocumentAudit } from '../api/documents';
import { PageHeader, StatCard, Card, EmptyState, StatusPill, HashChip, ProofSeal, LoadingSkeleton } from '../components/Atoms';
import UploadModal from '../components/UploadModal';
import { Upload, FileText, Activity, Clock, ShieldCheck, Hash, ArrowUpRight, History } from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';

const uploadData = [
  { day: 'Mon', count: 2 },
  { day: 'Tue', count: 5 },
  { day: 'Wed', count: 3 },
  { day: 'Thu', count: 7 },
  { day: 'Fri', count: 4 },
  { day: 'Sat', count: 1 },
  { day: 'Sun', count: 6 },
];

export default function LawyerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [recentAudit, setRecentAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  async function refresh() {
    setLoading(true);
    const data = await listDocuments();
    const myDocs = data.filter((d) => d.ownerId === user?.id);
    setDocs(myDocs);

    if (myDocs.length > 0) {
      const audits = await getDocumentAudit(myDocs[0].docId);
      setRecentAudit(audits.slice(0, 5));
    } else {
      setRecentAudit([]);
    }

    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  const verified = docs.filter((d) => d.status === 'verified').length;

  return (
    <PortalShell role="lawyer" user={user}>
      <PageHeader
        title="Legal Records Workspace"
        description="Manage cryptographic case files, submit evidence to the verification queue, and monitor ledger integrity."
        actions={
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="flex items-center justify-center gap-2 rounded-md bg-ink text-white px-6 py-3 text-sm font-semibold hover:bg-ink-2 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-seal/30"
          >
            <Upload size={16} /> Register New Document
          </button>
        }
      />

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total Filings" value={loading ? '—' : docs.length} icon={FileText} />
            <StatCard label="Verified on Ledger" value={loading ? '—' : verified} accent="verified" icon={ShieldCheck} />
            <StatCard label="Storage Usage" value={loading ? '—' : '1.2 GB'} sub="33% of quota" icon={Activity} />
          </div>

          <Card title="Document Workspace">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white border-b border-line text-[10px] uppercase tracking-widest text-slate font-bold">
                  <tr>
                    <th className="px-6 py-4">Title & Proof</th>
                    <th className="px-6 py-4">Case Ref</th>
                    <th className="px-6 py-4">Ver.</th>
                    <th className="px-6 py-4">Ledger Status</th>
                    <th className="px-6 py-4">Updated</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {loading && <LoadingSkeleton rows={4} cols={6} />}

                  {!loading && docs.map((d) => (
                    <tr
                      key={d.docId}
                      className="hover:bg-paper-dim/50 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/documents/${d.docId}`)}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-start gap-3">
                          <ProofSeal status={d.status} size={32} showLabel={false} />
                          <div>
                            <span className="font-semibold text-ink block mb-1">{d.title}</span>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="flex items-center gap-1 text-[10px] font-mono text-slate bg-slate/5 px-2 py-0.5 rounded border border-slate/10">
                                <Hash size={10} /> {d.docId}
                              </span>
                              {d.hash && <HashChip value={d.hash} chars={8} />}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-mono text-xs text-slate">{d.caseNo}</td>
                      <td className="px-6 py-5 text-xs text-slate font-bold">v{d.version}</td>
                      <td className="px-6 py-5"><StatusPill status={d.status} /></td>
                      <td className="px-6 py-5 text-xs text-slate font-medium">{new Date(d.updatedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-5 text-right">
                        <Link
                          to={`/documents/${d.docId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-line text-slate hover:bg-white hover:text-ink hover:border-slate/30 transition-all shadow-sm"
                          aria-label={`Open ${d.docId}`}
                        >
                          <ArrowUpRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {docs.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6}>
                        <EmptyState
                          icon={FileText}
                          title="No Active Records"
                          description="Your legal workspace is empty. Register a document to begin."
                          action={
                            <button
                              type="button"
                              onClick={() => setUploadOpen(true)}
                              className="rounded-md bg-ink text-white px-5 py-2 text-sm font-medium hover:bg-ink-2 transition-colors shadow-sm"
                            >
                              Upload Document
                            </button>
                          }
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
          <Card title="Intake Velocity" headerAction={<Activity size={14} className="text-slate" />}>
            <div className="p-5 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={uploadData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#0F172A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #E2E8F0', padding: '4px 8px' }}
                    itemStyle={{ color: '#0F172A', fontSize: '10px', fontWeight: '700' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#0F172A" strokeWidth={1.5} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Recent Ledger Events">
            <div className="p-5">
              {recentAudit.length > 0 ? (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[5px] before:h-full before:w-[2px] before:bg-line">
                  {recentAudit.map((event, i) => (
                    <div key={i} className="relative flex gap-4">
                      <div className="w-3 h-3 rounded-full bg-white border-2 border-ink shrink-0 z-10 mt-1" />
                      <div>
                        <p className="text-xs font-semibold text-ink leading-tight mb-0.5">{event.action}</p>
                        <p className="text-[10px] text-slate font-medium flex items-center gap-1">
                          <Clock size={10} /> {new Date(event.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate text-center py-4">No recent activity on the ledger.</p>
              )}
            </div>
            <div className="p-3 border-t border-line bg-paper-dim/50">
              <Link to="/lawyer/audit" className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-ink border border-line rounded-md bg-white hover:bg-slate/5 transition-colors shadow-sm">
                <History size={12} /> View Full Audit Trail
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={refresh} />
    </PortalShell>
  );
}
