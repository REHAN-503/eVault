import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PortalShell from '../components/PortalShell';
import { getDocumentAudit } from '../api/documents';
import { Search, History, Clock, FileText } from 'lucide-react';

export default function AuditPage({ role }) {
  const { user } = useAuth();
  const [docId, setDocId] = useState('');
  const [events, setEvents] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!docId.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await getDocumentAudit(docId.trim());
      setEvents(data);
    } catch (err) {
      setEvents([]);
    }
    setLoading(false);
  }

  return (
    <PortalShell role={role} user={user}>
      {/* Enterprise Page Header */}
      <div className="mb-8 bg-white border border-line rounded-lg shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight text-ink mb-2">Ledger Audit Trail</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-slate"><History size={16} className="text-slate-light" /> Tamper-Evident Logs</span>
            <span className="text-line">|</span>
            <span className="flex items-center gap-1.5 text-verified"><div className="w-2 h-2 rounded-full bg-verified"></div> Network Verified</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-line rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-line bg-paper-dim/30">
          <form onSubmit={handleSearch} className="max-w-xl">
            <label className="block text-xs font-bold text-ink-2 uppercase tracking-wide mb-2">Search Ledger Events by Document ID</label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-light" size={16} />
                <input
                  type="text"
                  required
                  value={docId}
                  onChange={(e) => setDocId(e.target.value)}
                  placeholder="e.g. DOC-88213"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-md border border-line bg-white focus:border-seal outline-none transition-colors font-mono"
                />
              </div>
              <button disabled={loading} className="px-6 py-2.5 bg-ink text-white text-sm font-medium rounded-md hover:bg-ink-2 transition-colors disabled:opacity-70 shadow-sm">
                {loading ? 'Searching...' : 'Search Ledger'}
              </button>
            </div>
          </form>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {!searched ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-seal/5 rounded-full blur-[60px] pointer-events-none"></div>
              <div className="h-16 w-16 bg-white border border-line rounded-2xl flex items-center justify-center text-slate-light shadow-sm mb-5 relative z-10">
                <FileText size={32} />
              </div>
              <p className="text-base font-semibold text-ink mb-1 relative z-10">No Document Selected</p>
              <p className="text-sm text-slate relative z-10">Enter a Document ID to view its immutable audit log.</p>
            </div>
          ) : events.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="bg-paper-dim/50 border-b border-line text-xs uppercase tracking-wider text-slate-light font-semibold">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Event / Action</th>
                  <th className="px-6 py-3">Participant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {events.map((e) => (
                  <tr key={e.id} className="hover:bg-paper-dim/50 transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-light whitespace-nowrap flex items-center gap-1.5">
                      <Clock size={14} className="text-slate" /> {new Date(e.timestamp || e.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-ink">
                      {e.action}
                    </td>
                    <td className="px-6 py-4 text-slate font-mono text-xs">
                      {e.userName || e.userId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-slate relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-maroon/5 rounded-full blur-[60px] pointer-events-none"></div>
              <div className="h-16 w-16 bg-white border border-line rounded-2xl flex items-center justify-center text-maroon shadow-sm mb-5 relative z-10">
                <Search size={32} />
              </div>
              <p className="text-base font-semibold text-ink mb-1 relative z-10">No events found</p>
              <p className="text-sm text-slate relative z-10">The document ID <span className="font-mono text-ink-2">"{docId}"</span> does not exist or has no recorded events.</p>
            </div>
          )}
        </div>
      </div>
    </PortalShell>
  );
}
