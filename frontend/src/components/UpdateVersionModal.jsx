import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateDocument } from '../api/documents';
import { UploadCloud, FileText, Loader2, X, FileSignature } from 'lucide-react';
import { HashChip, PipelineStepper, ProofSeal } from './Atoms';
import { toast } from 'sonner';

const UPDATE_STEPS = [
  'Encrypting new version (AES-256)',
  'Authenticating request',
  'Uploading file to IPFS',
  'Updating DocumentRegistryContract',
  'DocumentUpdated event confirmed',
];

export default function UpdateVersionModal({ open, onClose, docId, onUpdated }) {
  const [file, setFile] = useState(null);
  const [stepLog, setStepLog] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [phase, setPhase] = useState('form');
  const [result, setResult] = useState(null);

  function reset() {
    setFile(null);
    setStepLog([]);
    setCurrentStep(-1);
    setPhase('form');
    setResult(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;
    setPhase('running');
    setStepLog([]);
    setCurrentStep(0);
    try {
      const doc = await updateDocument(docId, { file }, (i, label) => {
        setCurrentStep(i);
        setStepLog((prev) => (prev.includes(label) ? prev : [...prev, label]));
      });
      setResult(doc);
      setPhase('done');
      onUpdated?.(doc);
    } catch (err) {
      toast.error('Failed to update version: ' + err.message);
      reset();
      onClose();
    }
  }

  function handleClose() {
    if (phase === 'running') return;
    reset();
    onClose();
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[480px] rounded-xl bg-white shadow-2xl overflow-hidden border border-line"
          role="dialog"
          aria-modal="true"
          aria-labelledby="update-modal-title"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-paper-dim/50">
            <h3 id="update-modal-title" className="font-display text-lg font-semibold text-ink flex items-center gap-2">
              <FileSignature size={18} className="text-seal" /> Update Version
            </h3>
            <button type="button" onClick={handleClose} disabled={phase === 'running'} className="text-slate hover:text-ink disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-seal/30 rounded-md p-1" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div className="p-6">
            {phase === 'form' && (
              <form onSubmit={handleSubmit}>
                <p className="text-sm text-slate mb-6">
                  Upload a new file. It will be encrypted client-side and appended to the document&apos;s on-chain version history.
                </p>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate mb-1.5 font-bold">New File</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 rounded-lg border border-dashed border-slate/40 bg-paper-dim hover:bg-slate/5 transition-colors cursor-pointer group">
                    <input required type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    {file ? (
                      <div className="flex flex-col items-center gap-2 text-ink">
                        <FileText size={24} className="text-seal" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-slate">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate group-hover:text-ink transition-colors">
                        <UploadCloud size={24} />
                        <span className="text-sm">Click or drag new version to upload</span>
                      </div>
                    )}
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 mt-8">
                  <button type="button" onClick={handleClose} className="px-4 py-2 text-sm text-slate hover:text-ink font-medium">Cancel</button>
                  <button type="submit" disabled={!file} className="rounded-md bg-ink text-white px-6 py-2 text-sm font-medium hover:bg-ink-2 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-seal/30">
                    Upload & Update
                  </button>
                </div>
              </form>
            )}

            {phase === 'running' && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <ProofSeal status="pending" size={40} showLabel={false} />
                  <h3 className="font-display text-xl font-semibold text-ink">Uploading New Version…</h3>
                </div>
                <PipelineStepper steps={UPDATE_STEPS} currentStep={currentStep} stepLog={stepLog} />
              </div>
            )}

            {phase === 'done' && result && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <ProofSeal status="verified" size={40} />
                  <h3 className="font-display text-xl font-semibold text-ink">Update Complete</h3>
                </div>
                <div className="rounded-xl border border-line bg-paper-dim p-4 space-y-3">
                  <p className="font-medium text-sm">Version {result.version} registered on ledger</p>
                  <HashChip value={result.hash} chars={28} />
                </div>
                <div className="flex justify-end mt-8">
                  <button type="button" onClick={handleClose} className="rounded-md bg-ink text-white px-6 py-2 text-sm font-medium hover:bg-ink-2 transition-colors focus:outline-none focus:ring-2 focus:ring-seal/30">
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
