import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PortalShell from '../components/PortalShell';
import { listDocuments, checkAccess } from '../api/documents';
import { FileText, ShieldCheck, ShieldAlert, CheckCircle2, AlertCircle, ChevronRight, Scale, Search, Shield, Fingerprint } from 'lucide-react';
import { HashChip } from '../components/Atoms';
import { toast } from 'sonner';

export default function JudgeDashboard() {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);
  const [verifiedIds, setVerifiedIds] = useState({});

  useEffect(() => {
    (async () => {
      setDocs(await listDocuments());
      setLoading(false);
    })();
  }, []);

  async function handleVerify(docId) {
    setVerifying(docId);
    try {
      const res = await checkAccess(docId, user.id);
      setVerifiedIds((prev) => ({ ...prev, [docId]: res.allowed }));
      if (res.allowed) {
        toast.success(`Ledger matched for ${docId}`);
      } else {
        toast.error(`Cryptographic mismatch detected for ${docId}`);
      }
    } catch (e) {
      toast.error('Failed to verify document integrity');
    }
    setVerifying(null);
  }

  const flagged = docs.filter((d) => d.status === 'flagged').length;
  const verified = docs.filter((d) => d.status === 'verified').length;

  return (
    <PortalShell role="judge" user={user}>
      
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-display font-semibold tracking-tight text-ink mb-2">Court Verification Queue</h1>
          <p className="text-sm text-slate max-w-2xl">
            Review submitted records and verify their cryptographic integrity against the blockchain ledger.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white border border-line rounded-lg shadow-sm px-4 py-2 shrink-0">
          <Scale size={24} className="text-slate-light" />
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate">Session Active</p>
            <p className="text-sm font-semibold text-ink">Hon. {user?.name?.replace('Justice ', '') || 'Judge'}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Verification Queue */}
        <div className="flex-1 flex flex-col gap-6">
          
          <div className="bg-white border border-line rounded-lg shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="px-6 py-5 border-b border-line flex items-center justify-between bg-[#FAFAFA]">
              <h2 className="font-semibold text-sm text-ink uppercase tracking-wider flex items-center gap-2">
                <Shield size={16} className="text-slate" /> Pending & Verified Records
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white border-b border-line text-[10px] uppercase tracking-widest text-slate font-bold">
                  <tr>
                    <th className="px-6 py-4">Record & Identity</th>
                    <th className="px-6 py-4">Filed By</th>
                    <th className="px-6 py-4">Integrity Hash</th>
                    <th className="px-6 py-4">Verification</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {loading && Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-5"><div className="h-4 w-32 bg-slate/10 rounded mb-2"></div><div className="h-3 w-24 bg-slate/10 rounded"></div></td>
                      <td className="px-6 py-5"><div className="h-4 w-24 bg-slate/10 rounded"></div></td>
                      <td className="px-6 py-5"><div className="h-6 w-32 bg-slate/10 rounded-md"></div></td>
                      <td className="px-6 py-5"><div className="h-8 w-24 bg-slate/10 rounded-md"></div></td>
                      <td className="px-6 py-5 text-right"><div className="h-8 w-16 bg-slate/10 rounded-md ml-auto"></div></td>
                    </tr>
                  ))}
                  
                  {!loading && docs.map((d) => (
                    <tr key={d.docId} className="hover:bg-[#FAFAFA] transition-colors group">
                      <td className="px-6 py-5">
                        <span className="font-semibold text-ink block mb-1">
                          {d.title}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate bg-slate/5 px-2 py-0.5 rounded border border-slate/10 inline-flex">
                          {d.caseNo}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-ink">{d.ownerName}</p>
                      </td>
                      <td className="px-6 py-5">
                         <HashChip value={d.hash} chars={12} />
                      </td>
                      <td className="px-6 py-5">
                        {verifiedIds[d.docId] === undefined ? (
                          <button
                            onClick={() => handleVerify(d.docId)}
                            disabled={verifying === d.docId}
                            className="flex items-center gap-1.5 rounded bg-white border border-line text-ink px-3 py-1.5 text-xs font-semibold hover:border-ink transition-all disabled:opacity-50 shadow-sm"
                          >
                            <Fingerprint size={14} />
                            {verifying === d.docId ? 'Checking...' : 'Verify Ledger'}
                          </button>
                        ) : verifiedIds[d.docId] ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-verified/30 bg-verified/5 text-xs font-bold text-verified">
                            <CheckCircle2 size={14} /> Verified Match
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-maroon/30 bg-maroon/5 text-xs font-bold text-maroon">
                            <AlertCircle size={14} /> Mismatch
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link to={`/documents/${d.docId}`} className="inline-flex items-center gap-1 text-xs font-semibold text-ink bg-white border border-line px-3 py-1.5 rounded hover:bg-slate/5 transition-colors shadow-sm">
                          Review <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {docs.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-[#FAFAFA] border border-line rounded-full flex items-center justify-center text-slate mb-4">
                            <Search size={24} />
                          </div>
                          <h3 className="text-base font-semibold text-ink mb-1">Queue Empty</h3>
                          <p className="text-sm text-slate">No records require verification at this time.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar Status */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
          <div className="bg-white border border-line rounded-lg shadow-sm p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-verified/10 flex items-center justify-center mb-4 border border-verified/20">
              <ShieldCheck size={28} className="text-verified" />
            </div>
            <p className="text-3xl font-display font-semibold text-ink mb-1">{verified}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate mb-4">Legally Verified Records</p>
            <div className="w-full h-px bg-line mb-4"></div>
            <p className="text-xs text-slate">These records have passed cryptographic hash matching against the ledger.</p>
          </div>

          <div className="bg-white border border-line rounded-lg shadow-sm p-6 flex flex-col items-center text-center">
             <div className="w-16 h-16 rounded-full bg-maroon/10 flex items-center justify-center mb-4 border border-maroon/20">
              <ShieldAlert size={28} className="text-maroon" />
            </div>
            <p className="text-3xl font-display font-semibold text-ink mb-1">{flagged}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate mb-4">Flagged Anomalies</p>
            <div className="w-full h-px bg-line mb-4"></div>
            <p className="text-xs text-slate">Records that failed verification and require judicial review.</p>
          </div>
        </div>

      </div>
    </PortalShell>
  );
}
