import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PortalShell from '../components/PortalShell';
import { listDocuments } from '../api/documents';
import { StatusPill } from '../components/Atoms';
import { FileText, Search, ExternalLink, ShieldCheck, UserCircle, Download } from 'lucide-react';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await listDocuments();
      setDocs(data.filter((d) => d.sharedWith?.includes(user?.id)));
      setLoading(false);
    })();
  }, [user]);

  return (
    <PortalShell role="client" user={user}>
      
      {/* Client Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-display font-semibold tracking-tight text-ink mb-2">My Shared Records</h1>
          <p className="text-sm text-slate max-w-2xl">
            Securely access and download legal records that have been shared with you by your legal counsel or the court.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white border border-line rounded-lg shadow-sm px-4 py-2 shrink-0">
          <ShieldCheck size={24} className="text-verified" />
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate">Connection Status</p>
            <p className="text-sm font-semibold text-verified">End-to-End Secure</p>
          </div>
        </div>
      </div>

      {/* Main Table Workspace */}
      <div className="bg-white border border-line rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-line flex items-center justify-between bg-[#FAFAFA]">
          <h2 className="font-semibold text-sm text-ink uppercase tracking-wider">Documents Shared With You</h2>
          <div className="px-2 py-1 bg-ink text-white rounded text-xs font-bold">{docs.length} Records</div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-b border-line text-[10px] uppercase tracking-widest text-slate font-bold">
              <tr>
                <th className="px-6 py-4">Record Title</th>
                <th className="px-6 py-4">Case Reference</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading && Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-5"><div className="h-4 w-48 bg-slate/10 rounded mb-2"></div></td>
                  <td className="px-6 py-5"><div className="h-4 w-24 bg-slate/10 rounded"></div></td>
                  <td className="px-6 py-5"><div className="h-6 w-20 bg-slate/10 rounded-full"></div></td>
                  <td className="px-6 py-5"><div className="h-4 w-24 bg-slate/10 rounded"></div></td>
                  <td className="px-6 py-5 text-right"><div className="h-8 w-24 bg-slate/10 rounded ml-auto"></div></td>
                </tr>
              ))}
              
              {!loading && docs.map((d) => (
               <tr key={d.docId} className="hover:bg-[#FAFAFA] transition-colors group">
                 <td className="px-6 py-5">
                   <p className="font-semibold text-ink text-base">{d.title}</p>
                 </td>
                 <td className="px-6 py-5 font-mono text-xs text-slate">{d.caseNo}</td>
                 <td className="px-6 py-5"><StatusPill status={d.status} /></td>
                 <td className="px-6 py-5 text-xs text-slate font-medium">{new Date(d.updatedAt).toLocaleDateString()}</td>
                 <td className="px-6 py-5 text-right">
                   <Link to={`/documents/${d.docId}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-white text-xs font-semibold text-ink border border-line hover:bg-slate/5 transition-all shadow-sm">
                     Open Record <ExternalLink size={14} />
                   </Link>
                 </td>
               </tr>
              ))}
              
              {docs.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-[#FAFAFA] border border-line rounded-full flex items-center justify-center text-slate mb-4">
                        <UserCircle size={24} />
                      </div>
                      <h3 className="text-base font-semibold text-ink mb-1">No Shared Records</h3>
                      <p className="text-sm text-slate max-w-sm mx-auto">
                        When your legal counsel or the court shares a document with you, it will appear securely in this vault.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PortalShell>
  );
}
