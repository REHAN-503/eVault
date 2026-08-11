import { motion } from 'framer-motion';

// The one recurring visual idea in this product: a document's integrity proof
// is not an abstract checkmark, it's rendered as an official seal being
// pressed onto the record — echoing the doc's own metaphor of a court seal,
// but standing for a cryptographic hash match instead of wax.
//
// status: 'verified' | 'pending' | 'flagged'
export default function Seal({ status = 'verified', size = 56, animate = true, label }) {
  const ring = {
    verified: '#2F6E5E',
    pending: '#A8783C',
    flagged: '#7A2A2E',
  }[status];

  const dash = status === 'pending';

  return (
    <div className="inline-flex flex-col items-center gap-1.5">
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        initial={animate ? { scale: 2.2, rotate: -14, opacity: 0 } : false}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 210, damping: 14 }}
      >
        <circle cx="50" cy="50" r="46" fill="none" stroke={ring} strokeWidth="2.5"
          strokeDasharray={dash ? '4 4' : undefined} opacity="0.9" />
        <circle cx="50" cy="50" r="38" fill="none" stroke={ring} strokeWidth="1" opacity="0.55" />
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const x1 = 50 + Math.cos(angle) * 41;
          const y1 = 50 + Math.sin(angle) * 41;
          const x2 = 50 + Math.cos(angle) * 46;
          const y2 = 50 + Math.sin(angle) * 46;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ring} strokeWidth="1.4" opacity="0.7" />;
        })}
        {status === 'verified' && (
          <path d="M35 51 L45 61 L67 38" fill="none" stroke={ring} strokeWidth="6"
            strokeLinecap="round" strokeLinejoin="round" />
        )}
        {status === 'pending' && (
          <circle cx="50" cy="50" r="6" fill={ring} />
        )}
        {status === 'flagged' && (
          <path d="M50 32 L50 56 M50 66 L50 67" stroke={ring} strokeWidth="6" strokeLinecap="round" />
        )}
      </motion.svg>
      {label && (
        <span className="text-[10px] uppercase tracking-[0.14em] font-medium" style={{ color: ring }}>
          {label}
        </span>
      )}
    </div>
  );
}
