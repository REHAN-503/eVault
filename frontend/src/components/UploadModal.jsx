import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadDocument } from '../api/documents';
import { UploadCloud, FileText, X, ShieldCheck, Fingerprint, Lock } from 'lucide-react';
import { HashChip, PipelineStepper, ProofSeal, UPLOAD_PIPELINE_STEPS } from './Atoms';

export default function UploadModal({ open, onClose, onUploaded }) {
  const [title, setTitle] = useState('');
  const [caseNo, setCaseNo] = useState('');
  const [file, setFile] = useState(null);
  const [stepLog, setStepLog] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [phase, setPhase] = useState('form');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  function reset() {
    setTitle('');
    setCaseNo('');
    setFile(null);
    setStepLog([]);
    setCurrentStep(-1);
    setPhase('form');
    setResult(null);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;

    setError('');
    setPhase('running');
    setStepLog([]);
    setCurrentStep(0);

    try {
      const doc = await uploadDocument({ title, caseNo, file }, (i, label) => {
        setCurrentStep(i);
        setStepLog((prev) => (prev.includes(label) ? prev : [...prev, label]));
      });
      setResult(doc);
      setPhase('done');
      onUploaded?.(doc);
    } catch (err) {
      setError(err.message || 'Upload failed');
      setPhase('form');
    }
  }

  function handleClose() {
    if (phase === 'running') return;
    reset();
    onClose();
  }

  const busy = phase === 'running';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[560px] rounded-xl bg-white shadow-2xl overflow-hidden border border-line"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-modal-title"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-line bg-paper-dim/50">
              <h3 id="upload-modal-title" className="font-display text-lg font-semibold text-ink flex items-center gap-2">
                <Lock size={18} className="text-slate" /> Secure Document Intake
              </h3>
              <button
                type="button"
                onClick={handleClose}
                disabled={busy}
                className="text-slate hover:text-ink disabled:opacity-30 transition-colors bg-white border border-line rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-seal/30"
                aria-label="Close upload dialog"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-0">
              {phase === 'form' && (
                <form onSubmit={handleSubmit}>
                  <div className="p-6 space-y-5">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-slate mb-1.5">Official Title</label>
                        <input
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. Affidavit of Evidence"
                          className="w-full rounded-md border border-line bg-paper-dim px-3.5 py-2.5 text-sm focus:bg-white focus:border-seal focus:ring-2 focus:ring-seal/20 outline-none transition-colors"
                        />
                      </div>
                      <div className="w-1/3">
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-slate mb-1.5">Case Ref</label>
                        <input
                          required
                          value={caseNo}
                          onChange={(e) => setCaseNo(e.target.value)}
                          placeholder="CIV/2026/0417"
                          className="w-full rounded-md border border-line bg-paper-dim px-3.5 py-2.5 text-sm font-mono focus:bg-white focus:border-seal focus:ring-2 focus:ring-seal/20 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-widest text-slate mb-1.5">Source Document</label>
                      <label className="flex flex-col items-center justify-center w-full h-36 rounded-lg border-2 border-dashed border-slate/30 bg-paper-dim hover:bg-slate/5 hover:border-slate/50 transition-all cursor-pointer group">
                        <input required type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        {file ? (
                          <div className="flex flex-col items-center gap-2 text-ink">
                            <FileText size={32} className="text-ink mb-1" />
                            <span className="text-sm font-semibold">{file.name}</span>
                            <span className="text-xs text-slate font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB — ready for encryption</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-slate group-hover:text-ink transition-colors">
                            <div className="w-12 h-12 bg-white rounded-full border border-line flex items-center justify-center mb-1 shadow-sm">
                              <UploadCloud size={20} />
                            </div>
                            <span className="text-sm font-medium">Click or drag file to secure intake</span>
                            <span className="text-[10px] uppercase tracking-widest text-slate/70 font-bold">PDF, JPG, PNG up to 50MB</span>
                          </div>
                        )}
                      </label>
                    </div>

                    {error && (
                      <p className="text-sm text-maroon bg-maroon/5 border border-maroon/20 rounded-md px-3 py-2">{error}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between px-6 py-4 bg-paper-dim/50 border-t border-line">
                    <span className="text-[10px] text-slate font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-verified" /> AES-256 Client-Side Encryption
                    </span>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={handleClose} className="px-4 py-2 text-xs font-semibold text-slate hover:text-ink transition-colors">Cancel</button>
                      <button
                        type="submit"
                        disabled={!file || !title || !caseNo}
                        className="rounded-md bg-ink text-white px-6 py-2 text-sm font-semibold hover:bg-ink-2 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-seal/30"
                      >
                        Sign & Register <Fingerprint size={14} />
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {phase === 'running' && (
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <ProofSeal status="pending" size={48} showLabel={false} />
                    <div>
                      <h3 className="font-display text-xl font-semibold text-ink">Registering to Ledger</h3>
                      <p className="text-xs text-slate font-mono mt-1">Off-chain file → on-chain proof pipeline</p>
                    </div>
                  </div>
                  <PipelineStepper steps={UPLOAD_PIPELINE_STEPS} currentStep={currentStep} stepLog={stepLog} />
                </div>
              )}

              {phase === 'done' && result && (
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <ProofSeal status="verified" size={48} />
                    <div>
                      <h3 className="font-display text-2xl font-semibold text-ink">Registration Confirmed</h3>
                      <p className="text-xs text-slate font-medium mt-1">Record immutable on the registry ledger</p>
                    </div>
                  </div>

                  <div className="bg-paper-dim border border-line rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-line pb-3">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate">Record ID</span>
                      <span className="text-sm font-mono text-ink font-bold">{result.docId}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-line pb-3">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate">Version</span>
                      <span className="text-sm font-bold text-ink">v{result.version}</span>
                    </div>
                    <div className="border-b border-line pb-3">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate block mb-1">State Hash</span>
                      <HashChip value={result.hash} chars={32} />
                    </div>
                    {result.cid && (
                      <div className="border-b border-line pb-3">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate block mb-1">IPFS CID</span>
                        <HashChip value={result.cid} chars={24} />
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate block mb-1">Timestamp</span>
                      <span className="text-xs font-mono text-slate">{new Date(result.updatedAt).toISOString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="rounded-md bg-ink text-white px-8 py-2.5 text-sm font-semibold hover:bg-ink-2 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-seal/30"
                    >
                      Close Workspace
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
