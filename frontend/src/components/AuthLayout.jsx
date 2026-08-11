import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import courtHouseImg from '../assets/images/courtHouse.png';
import gavelImg from '../assets/images/gavel.png';
import goldScalesImg from '../assets/images/Gold_Scales.svg';
import whiteScalesImg from '../assets/images/whiteScales.png';
import immutableShieldImg from '../assets/images/immutable-shield.svg';
import lockImg from '../assets/images/lock.svg';
import auditDocumentImg from '../assets/images/audit-document.svg';
import roleAccessImg from '../assets/images/role-access.svg';

const features = [
  { icon: lockImg,             title: 'Secure by Design',   desc: 'End-to-end encryption\n& access control' },
  { icon: immutableShieldImg,  title: 'Immutable Records',  desc: 'On-chain proof ensures\ntamper evidence' },
  { icon: auditDocumentImg,    title: 'Audit Ready',        desc: 'Complete audit trail\nand transparency' },
  { icon: roleAccessImg,       title: 'Role Based Access',  desc: 'Granular permissions\nfor every user' },
];

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-body antialiased">

      {/* ──────────────────────── LEFT PANEL ──────────────────────── */}
      <div className="lg:w-[52%] relative flex flex-col justify-between overflow-hidden min-h-[480px] lg:min-h-screen">

        {/* Layer 1 — Courthouse photograph, clearly visible */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${courtHouseImg})` }}
        />

        {/* Layer 2 — Light navy base overlay — reduced to let
            the photograph's own lighting breathe through */}
        <div className="absolute inset-0 bg-[#0a1628]/25" />

        {/* Layer 3 — Directional gradient: dark on the left (text area),
            lighter on the right where columns + entrance live */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              to right,
              rgba(10,22,40,0.75) 0%,
              rgba(10,22,40,0.40) 40%,
              rgba(10,22,40,0.05) 70%,
              rgba(10,22,40,0.15) 100%
            )`
          }}
        />

        {/* Layer 4 — Warm radial glow centred on the courthouse entrance
            to preserve the natural warm/orange doorway light */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 72% 48%, rgba(180,130,60,0.12) 0%, transparent 55%)'
          }}
        />

        {/* Layer 5 — Bottom vignette for footer / gavel grounding */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(10,22,40,0.90) 0%, rgba(10,22,40,0.30) 22%, transparent 45%)'
          }}
        />

        {/* Layer 6 — Very subtle star-like particles */}
        <div className="absolute inset-0 pointer-events-none opacity-30" style={{
          backgroundImage: `
            radial-gradient(1px 1px at 18% 42%, rgba(255,255,255,0.5) 50%, transparent 50%),
            radial-gradient(1px 1px at 72% 28%, rgba(255,255,255,0.4) 50%, transparent 50%),
            radial-gradient(1px 1px at 55% 75%, rgba(255,255,255,0.3) 50%, transparent 50%),
            radial-gradient(1.5px 1.5px at 30% 88%, rgba(255,255,255,0.35) 50%, transparent 50%),
            radial-gradient(1px 1px at 82% 68%, rgba(255,255,255,0.25) 50%, transparent 50%),
            radial-gradient(1px 1px at 45% 15%, rgba(255,255,255,0.4) 50%, transparent 50%),
            radial-gradient(1px 1px at 10% 72%, rgba(255,255,255,0.3) 50%, transparent 50%)
          `,
          backgroundSize: '200px 200px'
        }} />

        {/* Layer 7 — Edge vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{
          boxShadow: 'inset 0 0 120px 40px rgba(0,0,0,0.3)'
        }} />

        {/* ── Content ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 flex flex-col justify-between flex-1 px-8 py-8 md:px-12 md:py-10 lg:px-16 lg:py-12"
        >
          {/* Top section */}
          <div>
            {/* ─── Brand ─── */}
            <Link to="/" className="inline-flex items-center gap-4 mb-14 group">
              <div className="w-14 h-14 rounded-full border border-[#c9a24b]/40 bg-[#0c1a30]/60 backdrop-blur-sm flex items-center justify-center shadow-[0_0_20px_rgba(201,162,75,0.08)] group-hover:border-[#c9a24b]/60 transition-colors">
                <img src={goldScalesImg} alt="eVault Emblem" className="w-7 h-7 object-contain" />
              </div>
              <div>
                <div className="font-serif text-[30px] font-bold text-white leading-none tracking-tight">eVault</div>
                <div className="text-[10.5px] text-[#8b9cb7] uppercase tracking-[0.18em] mt-1.5 font-medium">Ministry of Law & Justice</div>
              </div>
            </Link>

            {/* ─── Trusted Badge ─── */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-[#c9a24b]/25 bg-[#0c1a30]/40 backdrop-blur-sm mb-10">
              <img src={goldScalesImg} alt="" className="w-5 h-5 object-contain opacity-80" />
              <span className="text-[#c9a24b] text-[11px] font-semibold tracking-[0.22em] leading-none">TRUSTED. SECURE. VERIFIED.</span>
            </div>

            {/* ─── Headline ─── */}
            <h1 className="font-serif text-[40px] md:text-[48px] lg:text-[56px] font-bold text-white leading-[1.12] mb-6 max-w-[520px]">
              Institutional<br />Legal Records
            </h1>

            {/* ─── Gold divider ─── */}
            <div className="w-16 h-[3px] bg-gradient-to-r from-[#c9a24b] to-[#d4af37] mb-7 rounded-full" />

            {/* ─── Description ─── */}
            <p className="text-[#a3b1c6] text-[16px] md:text-[17px] leading-[1.7] max-w-[440px] mb-14">
              Immutable, verifiable, and strictly governed<br className="hidden md:block" />
              document storage for the modern judicial registry.
            </p>

            {/* ─── Four feature blocks ─── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
              {features.map((f, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  {/* The source PNGs already contain a complete gold-on-navy
                      circular medallion badge. Show them at full badge size
                      via overflow-hidden + object-cover to crop into the
                      centre of each image (eliminates edge bleed/padding). */}
                  <div className="w-[54px] h-[54px] rounded-full overflow-hidden mb-3 flex-shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
                    <img
                      src={f.icon}
                      alt={f.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-white font-semibold text-[13px] leading-tight mb-1.5">{f.title}</h3>
                  <p className="text-[#7b8da6] text-[11px] leading-[1.55] whitespace-pre-line">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Footer ─── */}
          <div className="flex items-center gap-3 mt-14 lg:mt-8">
            {/* Gold Scales emblem — shown as a monochrome institutional mark,
                no circular UI badge wrapper, no border */}
            <img
              src={goldScalesImg}
              alt="Ministry Emblem"
              className="w-[36px] h-[36px] object-contain flex-shrink-0"
              style={{ opacity: 0.7, filter: 'brightness(1.8) grayscale(0.6)' }}
            />
            <div className="text-[11px] text-[#5e7290] leading-[1.6]">
              © 2026 Ministry of Law and Justice.<br />
              All rights reserved.
            </div>
          </div>
        </motion.div>

        {/* ─── Gavel — blended into the scene ─── */}
        <div
          className="hidden md:block absolute bottom-0 right-0 w-[300px] lg:w-[400px] h-[260px] lg:h-[340px] pointer-events-none z-[5]"
          style={{
            /* Mask fades the gavel edges so it melts into the background
               instead of showing a hard rectangular image boundary */
            maskImage: 'linear-gradient(to top, rgba(0,0,0,0.9) 10%, rgba(0,0,0,0.6) 50%, transparent 85%), linear-gradient(to right, transparent 0%, rgba(0,0,0,0.8) 20%, rgba(0,0,0,1) 100%)',
            maskComposite: 'intersect',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.9) 10%, rgba(0,0,0,0.6) 50%, transparent 85%), linear-gradient(to right, transparent 0%, rgba(0,0,0,0.8) 20%, rgba(0,0,0,1) 100%)',
            WebkitMaskComposite: 'source-in',
          }}
        >
          <img
            src={gavelImg}
            alt=""
            className="w-full h-full object-contain object-bottom drop-shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
          />
        </div>
      </div>

      {/* ──────────────────────── RIGHT PANEL ──────────────────────── */}
      <div className="lg:w-[48%] flex-1 flex flex-col relative overflow-hidden" style={{ backgroundColor: '#f5f3ef' }}>

        {/* Paper-like texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px'
        }} />

        {/* White scales watermark — large, embossed feel */}
        <img
          src={whiteScalesImg}
          alt=""
          className="absolute -top-20 -right-20 w-[520px] lg:w-[620px] pointer-events-none select-none"
          style={{ opacity: 0.08, mixBlendMode: 'multiply' }}
        />

        {/* Subtle warm-gold contour lines radiating from top-right */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none opacity-[0.025]" style={{
          background: 'radial-gradient(ellipse at 100% 0%, rgba(201,162,75,0.6) 0%, transparent 60%)'
        }} />

        {/* ── Card container ── */}
        <div className="flex-1 flex items-center justify-center px-6 py-10 md:px-12 lg:px-16 relative z-10">
          <div
            className="w-full max-w-[480px] rounded-[24px] p-8 md:p-11"
            style={{
              backgroundColor: 'rgba(255,255,255,0.92)',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.04), 0 12px 48px rgba(0,0,0,0.03)'
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
