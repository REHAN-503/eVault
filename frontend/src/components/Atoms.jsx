import { useState } from 'react';
import Seal from './Seal';

export function HashChip({ value, chars = 10 }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  const short = `${value.slice(0, chars)}…${value.slice(-4)}`;
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      title={value}
      aria-label={copied ? 'Copied to clipboard' : `Copy hash ${short}`}
      className="group inline-flex items-center gap-1.5 rounded-md border border-line bg-white/70 px-2 py-1 font-mono text-[11px] text-ink-2 hover:border-seal/60 hover:bg-seal/5 transition-colors focus:outline-none focus:ring-2 focus:ring-seal/30"
    >
      {short}
      <span className="text-slate group-hover:text-seal transition-colors">{copied ? '✓' : '⧉'}</span>
    </button>
  );
}

const statusStyles = {
  verified: 'bg-verified-bg text-verified-dark border-verified/30',
  pending: 'bg-seal/10 text-seal-dark border-seal/30',
  flagged: 'bg-maroon/10 text-maroon-dark border-maroon/30',
  active: 'bg-verified-bg text-verified-dark border-verified/30',
};

export function StatusPill({ status }) {
  const cls = statusStyles[status] || 'bg-slate/10 text-slate border-slate/20';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

const accentText = {
  ink: 'text-ink',
  seal: 'text-seal-dark',
  verified: 'text-verified-dark',
  maroon: 'text-maroon-dark',
};

export function StatCard({ label, value, sub, accent = 'ink', icon: Icon }) {
  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-[0.12em] text-slate font-bold">{label}</p>
        {Icon && <Icon size={18} className="text-slate-light" />}
      </div>
      <p className={`font-display text-3xl font-semibold leading-none ${accentText[accent] || accentText.ink}`}>{value}</p>
      {sub && <p className="mt-1.5 text-xs text-slate">{sub}</p>}
    </div>
  );
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div>
        <h1 className="text-3xl font-display font-semibold tracking-tight text-ink mb-2">{title}</h1>
        {description && <p className="text-sm text-slate max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}

export function Card({ title, headerAction, children, className = '' }) {
  return (
    <div className={`bg-white border border-line rounded-xl shadow-sm overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-paper-dim/50">
          <h2 className="font-semibold text-sm text-ink uppercase tracking-wider">{title}</h2>
          {headerAction}
        </div>
      )}
      {children}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center px-6">
      {Icon && (
        <div className="w-16 h-16 bg-paper-dim border border-line rounded-2xl flex items-center justify-center text-slate mb-4 shadow-sm">
          <Icon size={28} />
        </div>
      )}
      <h3 className="text-base font-semibold text-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-slate max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}

export function ProofSeal({ status = 'verified', size = 40, showLabel = true }) {
  const label = { verified: 'On-Chain Verified', pending: 'Pending Ledger Write', flagged: 'Integrity Flagged' }[status];
  return <Seal status={status} size={size} animate={false} label={showLabel ? label : undefined} />;
}

export const UPLOAD_PIPELINE_STEPS = [
  'Encrypting file (AES-256, client-side)',
  'Authenticating request at API Gateway',
  'Pushing encrypted object to IPFS',
  'Content hash (CID) returned',
  'Calling DocumentRegistryContract.recordDocument()',
  'Writing hash + metadata to ledger',
  'DocumentAdded event confirmed',
];

export function PipelineStepper({ steps, currentStep, stepLog = [] }) {
  return (
    <ol className="space-y-0">
      {steps.map((label, i) => {
        const done = stepLog.includes(label) || i < currentStep;
        const active = i === currentStep && !done;
        return (
          <li key={i} className="flex gap-3 relative pb-4 last:pb-0">
            {i < steps.length - 1 && (
              <span className={`absolute left-[11px] top-6 bottom-0 w-px ${done ? 'bg-verified/40' : 'bg-line'}`} />
            )}
            <span
              className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold border-2 transition-colors ${
                done
                  ? 'bg-verified border-verified text-white'
                  : active
                    ? 'bg-seal/10 border-seal text-seal animate-pulse'
                    : 'bg-paper-dim border-line text-slate-light'
              }`}
            >
              {done ? '✓' : i + 1}
            </span>
            <div className="pt-0.5 min-w-0">
              <p className={`text-sm font-medium leading-tight ${done ? 'text-verified-dark' : active ? 'text-ink' : 'text-slate'}`}>
                {label}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function LoadingSkeleton({ rows = 4, cols = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: cols }).map((__, j) => (
            <td key={j} className="px-6 py-5">
              <div className="h-4 bg-slate/10 rounded" style={{ width: `${60 + (j * 7) % 40}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
