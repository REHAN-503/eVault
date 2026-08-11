import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PortalShell from '../components/PortalShell';
import { getDocument, getVersionHistory, getDocumentAudit, downloadDocument } from '../api/documents';
import { StatusPill, HashChip } from '../components/Atoms';
import ManageAccessModal from '../components/ManageAccessModal';
import UpdateVersionModal from '../components/UpdateVersionModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { ArrowLeft, Download, ShieldCheck, History, Clock, FileText, FileSignature, Trash2, Key, Activity, Lock, Users, Fingerprint, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function DocumentDetail() {
  const { docId } = useParams();
  const { user } = useAuth();
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState(null);
  const [versions, setVersions] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('history');

  const [updateOpen, setUpdateOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const docData = await getDocument(docId);
      if (!docData) throw new Error("Document not found");
      setDoc(docData);
      setVersions(await getVersionHistory(docId));
      setEvents(await getDocumentAudit(docId));
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to load document");
    }
  }, [docId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDownload = async () => {
    try {
      toast.info('Decrypting and preparing download...');
      const url = await downloadDocument(docId);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.title || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Document downloaded successfully');
    } catch (e) {
      toast.error("Failed to download or decrypt file: " + e.message);
    }
  };

  if (error) {
    return (
      <PortalShell role={user?.role} user={user}>
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white border border-line rounded-lg shadow-sm">
          <div className="h-16 w-16 bg-maroon/10 rounded-full flex items-center justify-center text-maroon mb-6">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-display font-semibold text-ink mb-2">Access Restricted</h1>
          <p className="text-slate mb-6 max-w-md">{error}</p>
          <Link to={`/${user?.role?.toLowerCase()}`} className="px-6 py-2.5 bg-ink text-white rounded-md text-sm font-medium hover:bg-ink/90 transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </PortalShell>
    );
  }

  if (!doc) {
    return (
      <PortalShell role={user?.role} user={user}>
        <div className="animate-pulse flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            <div className="h-64 bg-slate/10 rounded-lg"></div>
            <div className="h-48 bg-slate/10 rounded-lg"></div>
          </div>
          <div className="flex-1 bg-slate/10 rounded-lg h-[500px]"></div>
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell role={user?.role} user={user}>
      {/* Back Navigation */}
      <div className="mb-4">
        <Link to={`/${user?.role?.toLowerCase()}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate hover:text-ink transition-colors uppercase tracking-wider">
          <ArrowLeft size={14} /> Back to Registry Workspace
        </Link>
      </div>

      {/* Main Document Header */}
      <div className="bg-white border border-line rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[10px] uppercase tracking-widest text-slate font-bold bg-[#F4F4F5] px-2 py-0.5 rounded border border-line">
                Case: {doc.caseNo}
              </span>
              <StatusPill status={doc.status} />
              {(user.role === 'client' || user.role === 'judge') && (
                <span className="text-[10px] font-bold tracking-widest uppercase bg-slate/10 text-slate px-2 py-0.5 rounded border border-slate/20 flex items-center gap-1">
                  <Lock size={10} /> Read Only
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight leading-tight text-ink mb-4">{doc.title}</h1>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate mb-1">Filed By</p>
                <p className="text-sm font-medium text-ink">{doc.ownerName}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate mb-1">Version</p>
                <p className="text-sm font-medium text-ink">v{doc.version}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate mb-1">Last Updated</p>
                <p className="text-sm font-medium text-ink">{new Date(doc.updatedAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate mb-1">Size</p>
                <p className="text-sm font-medium text-ink">{doc.size || '1.2 MB'}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 min-w-[200px]">
            <button onClick={handleDownload} className="w-full flex items-center justify-center gap-2 rounded-md bg-ink text-white px-4 py-2.5 text-sm font-medium hover:bg-ink/90 transition-colors shadow-sm">
              <Download size={16} /> Download Decrypted
            </button>
            {(user.role === 'lawyer' || user.role === 'admin') && (
              <div className="flex gap-2">
                <button onClick={() => setUpdateOpen(true)} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-white border border-line text-ink px-3 py-2 text-sm font-medium hover:bg-slate/5 transition-colors shadow-sm">
                  <FileSignature size={14} /> Update
                </button>
                <button onClick={() => setAccessOpen(true)} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-white border border-line text-ink px-3 py-2 text-sm font-medium hover:bg-slate/5 transition-colors shadow-sm">
                  <Key size={14} /> Access
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Integrity & Access */}
        <div className="w-full lg:w-1/3 space-y-6">
          
          {/* Cryptographic Integrity */}
          <div className="bg-white border border-line rounded-lg shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-line bg-[#FAFAFA] flex items-center gap-2">
              <Fingerprint size={16} className="text-slate" />
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Cryptographic Identity</h3>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <p className="text-[10px] text-slate font-bold uppercase tracking-widest">SHA-256 Hash</p>
                  {doc.status === 'verified' && <span className="text-[9px] font-bold text-verified flex items-center gap-1"><ShieldCheck size={10}/> VERIFIED</span>}
                </div>
                <HashChip value={doc.hash} chars={28} />
              </div>
              
              <div>
                <p className="text-[10px] text-slate font-bold uppercase tracking-widest mb-1.5">IPFS Storage CID</p>
                <HashChip value={doc.cid} chars={28} />
              </div>

              <div className="pt-4 border-t border-line">
                <p className="text-[10px] text-slate font-bold uppercase tracking-widest mb-1.5">Ledger Transaction ID</p>
                <div className="flex items-center justify-between bg-[#F4F4F5] border border-line rounded px-3 py-2">
                  <span className="font-mono text-xs text-ink truncate">0x9f2a...7e40</span>
                  <ExternalLink size={14} className="text-slate-light" />
                </div>
              </div>
            </div>
          </div>

          {/* Progressive Access Control */}
          <div className="bg-white border border-line rounded-lg shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-line bg-[#FAFAFA] flex items-center gap-2">
              <Users size={16} className="text-slate" />
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Access Registry</h3>
            </div>
            <div className="p-0">
              <div className="px-5 py-3 border-b border-line flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-ink text-white flex items-center justify-center text-[10px] font-bold">L</div>
                  <div>
                    <p className="text-sm font-medium text-ink">{doc.ownerName}</p>
                    <p className="text-[10px] text-slate">Owner / Creator</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate bg-slate/10 px-2 py-0.5 rounded">FULL</span>
              </div>
              
              {/* Mocking shared users */}
              <div className="px-5 py-3 border-b border-line flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate text-white flex items-center justify-center text-[10px] font-bold">C</div>
                  <div>
                    <p className="text-sm font-medium text-ink">Rahul Sharma</p>
                    <p className="text-[10px] text-slate">Client</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate bg-slate/10 px-2 py-0.5 rounded">READ</span>
              </div>
            </div>
            {(user.role === 'lawyer' || user.role === 'admin') && (
              <div className="p-3 bg-[#FAFAFA]">
                <button onClick={() => setAccessOpen(true)} className="w-full py-1.5 text-xs font-medium text-ink border border-line rounded bg-white hover:bg-slate/5 transition-colors">
                  Modify Access
                </button>
              </div>
            )}
          </div>
          
          {(user.role === 'lawyer' || user.role === 'admin') && (
            <div className="pt-4">
              <button onClick={() => setDeleteOpen(true)} className="flex items-center gap-2 text-xs font-semibold text-maroon hover:text-maroon-dark transition-colors">
                <Trash2 size={14} /> Request Document Deletion
              </button>
            </div>
          )}

        </div>

        {/* Right Column: Timeline & Audit */}
        <div className="w-full lg:w-2/3 bg-white border border-line rounded-lg shadow-sm flex flex-col min-h-[500px] overflow-hidden">
          
          {/* Workspace Tabs */}
          <div className="flex px-2 pt-2 border-b border-line bg-[#FAFAFA]">
            {[
              { id: 'history', label: 'Version Timeline', icon: History },
              { id: 'audit', label: 'Audit Trail', icon: Activity }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id ? 'border-ink text-ink bg-white' : 'border-transparent text-slate hover:text-ink hover:bg-slate/5'
                }`}
              >
                <tab.icon size={16} className={activeTab === tab.id ? 'text-ink' : 'text-slate'} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Workspace Content */}
          <div className="flex-1 p-0">
            {activeTab === 'history' && (
              <div className="p-8">
                <div className="space-y-0 relative before:absolute before:inset-0 before:ml-[1.4rem] before:h-full before:w-px before:bg-line">
                  {versions.map((v, i) => (
                    <div key={v.version} className="relative flex gap-6 pb-8 last:pb-0">
                      <div className={`flex items-center justify-center w-11 h-11 rounded-full border-4 bg-white shrink-0 z-10 ${i === 0 ? 'border-ink text-ink font-bold shadow-sm' : 'border-line text-slate'}`}>
                        v{v.version}
                      </div>
                      <div className="flex-1 pt-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                          <span className="font-semibold text-ink text-base">{v.updatedBy || 'System User'}</span>
                          <span className="text-xs text-slate font-medium flex items-center gap-1">
                            <Clock size={12}/> {new Date(v.updatedAt || v.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-[#F4F4F5] border border-line rounded-lg p-4 w-full">
                          <p className="text-[10px] text-slate font-bold uppercase tracking-widest mb-1">State Hash</p>
                          <HashChip value={v.hash} chars={32} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {versions.length === 0 && <p className="text-sm text-slate ml-14">No version history available.</p>}
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] uppercase tracking-widest font-bold text-slate border-b border-line bg-[#FAFAFA]">
                    <tr>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Action Recorded</th>
                      <th className="px-6 py-4">Actor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {events.map((e) => (
                      <tr key={e.id} className="hover:bg-slate/5 transition-colors">
                        <td className="px-6 py-4 text-xs text-slate font-medium whitespace-nowrap">
                          {new Date(e.timestamp || e.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-semibold text-ink text-sm">
                          {e.action}
                        </td>
                        <td className="px-6 py-4 text-slate text-xs font-mono">
                          {e.userName || e.userId}
                        </td>
                      </tr>
                    ))}
                    {events.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-slate">No immutable events logged for this record.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Modals */}
      <UpdateVersionModal open={updateOpen} onClose={() => setUpdateOpen(false)} docId={docId} onUpdated={loadData} />
      <ManageAccessModal open={accessOpen} onClose={() => setAccessOpen(false)} docId={docId} onUpdated={loadData} />
      <ConfirmDeleteModal open={deleteOpen} onClose={() => setDeleteOpen(false)} docId={docId} title={doc.title} role={user?.role} />

    </PortalShell>
  );
}
