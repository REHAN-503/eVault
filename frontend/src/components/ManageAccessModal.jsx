import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { grantAccess, revokeAccess } from '../api/documents';
import { UserPlus, UserMinus, X, Loader2 } from 'lucide-react';

export default function ManageAccessModal({ open, onClose, docId, onUpdated }) {
  const [userId, setUserId] = useState('');
  const [permission, setPermission] = useState('READ');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleGrant(e) {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await grantAccess(docId, userId, permission);
      setSuccess(`Granted ${permission} access to ${userId}.`);
      setUserId('');
      onUpdated?.();
    } catch (err) {
      setError(err.message || 'Failed to grant access');
    }
    setLoading(false);
  }

  async function handleRevoke() {
    if (!userId) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await revokeAccess(docId, userId);
      setSuccess(`Revoked access for ${userId}.`);
      setUserId('');
      onUpdated?.();
    } catch (err) {
      setError(err.message || 'Failed to revoke access');
    }
    setLoading(false);
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[420px] rounded-xl bg-white shadow-2xl overflow-hidden border border-line"
          role="dialog"
          aria-modal="true"
          aria-labelledby="access-modal-title"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-paper-dim/50">
            <h3 id="access-modal-title" className="font-display text-lg font-semibold text-ink flex items-center gap-2">
              <UserPlus size={18} className="text-seal" /> Manage Access
            </h3>
            <button type="button" onClick={onClose} disabled={loading} className="text-slate hover:text-ink disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-seal/30 rounded-md p-1" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div className="p-6">
            <form onSubmit={handleGrant}>
              <label className="block text-[10px] uppercase tracking-wider text-slate mb-1.5 font-bold">Participant ID</label>
              <input
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. usr_105"
                className="w-full rounded-md border border-line bg-paper-dim px-3.5 py-2.5 text-sm mb-4 focus:bg-white focus:border-seal focus:ring-2 focus:ring-seal/20 outline-none font-mono"
              />

              <label className="block text-[10px] uppercase tracking-wider text-slate mb-1.5 font-bold">Permission Level</label>
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                className="w-full rounded-md border border-line bg-paper-dim px-3.5 py-2.5 text-sm mb-6 focus:bg-white focus:border-seal focus:ring-2 focus:ring-seal/20 outline-none"
              >
                <option value="READ">View Only (Read)</option>
                <option value="WRITE">Edit & Update (Write)</option>
              </select>

              {error && <p className="text-xs text-maroon mb-4 bg-maroon/5 border border-maroon/20 rounded-md px-3 py-2">{error}</p>}
              {success && <p className="text-xs text-verified-dark mb-4 bg-verified-bg border border-verified/20 rounded-md px-3 py-2">{success}</p>}

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleRevoke}
                  disabled={loading || !userId}
                  className="flex items-center justify-center gap-2 rounded-md border border-maroon/30 text-maroon hover:bg-maroon/5 px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-maroon/20"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <UserMinus size={16} />} Revoke
                </button>
                <button
                  type="submit"
                  disabled={loading || !userId}
                  className="flex items-center justify-center gap-2 rounded-md bg-ink text-white px-4 py-2 text-sm font-medium hover:bg-ink-2 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-seal/30"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} Grant
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
