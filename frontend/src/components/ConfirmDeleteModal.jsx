import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { deleteDocument } from '../api/documents';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ConfirmDeleteModal({ open, onClose, docId, title, role }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleDelete() {
    setLoading(true);
    setError('');
    try {
      await deleteDocument(docId);
      onClose();
      navigate(`/${role?.toLowerCase() || ''}`);
    } catch (err) {
      setError(err.message || 'Failed to delete record');
      setLoading(false);
    }
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
          className="w-full max-w-[400px] rounded-xl bg-white shadow-2xl overflow-hidden border border-maroon/20"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-maroon/5 text-maroon-dark">
            <h3 id="delete-modal-title" className="font-display text-lg font-semibold flex items-center gap-2">
              <AlertTriangle size={18} /> Delete Record
            </h3>
            <button type="button" onClick={onClose} disabled={loading} className="hover:text-maroon disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-maroon/20 rounded-md p-1" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div className="p-6">
            <p className="text-sm text-ink-2 mb-4">
              Are you sure you want to permanently delete the registry record for:
            </p>
            <p className="font-medium text-ink bg-paper-dim p-3 rounded-md mb-6 border border-line break-words">{title}</p>

            <p className="text-xs text-maroon mb-6 leading-relaxed">
              <strong>Warning:</strong> This action cannot be undone. All version history, audit logs, and IPFS references for this document will be unlinked from the registry.
            </p>

            {error && <p className="text-xs text-maroon mb-4 bg-maroon/10 p-2 rounded-md border border-maroon/20">{error}</p>}

            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-sm text-slate hover:text-ink font-medium transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-2 rounded-md bg-maroon text-white px-5 py-2 text-sm font-medium hover:bg-maroon-dark transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-maroon/30"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Confirm Delete
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
