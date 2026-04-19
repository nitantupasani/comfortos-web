import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import {
  Building2,
  Thermometer,
  ArrowRight,
  Sparkles,
  Vote,
  BarChart3,
  Layers,
  ShieldCheck,
  Gauge,
  Settings2,
  Check,
  Sun,
  Wind,
  Volume2,
} from 'lucide-react';
import VariationsNav from '../components/landing/VariationsNav';

const features = [
  { icon: Thermometer, title: 'Real-time comfort voting', body: 'Occupants report thermal, air, lighting and acoustic comfort in seconds.', tone: 'peach' as const },
  { icon: BarChart3, title: 'Analytics that matter', body: 'Turn votes and sensor data into clear trends, hotspots and actions.', tone: 'sage' as const },
  { icon: Layers, title: 'Server-driven UI', body: 'Dashboards and vote forms configured centrally, delivered on the fly.', tone: 'sky' as const },
  { icon: ShieldCheck, title: 'Role-based access', body: 'Scoped experiences for occupants, FMs and admins, with safe view-as.', tone: 'lavender' as const },
  { icon: Gauge, title: 'Presence-aware', body: 'Location and presence signals tie feedback to the right space.', tone: 'butter' as const },
  { icon: Settings2, title: 'Configurable per tenant', body: 'Each tenant gets its own dashboard, vote schema and rules.', tone: 'rose' as const },
];

type Tone = 'peach' | 'sage' | 'sky' | 'lavender' | 'butter' | 'rose';
const toneBg: Record<Tone, string> = {
  peach: '#FFD9C2',
  sage: '#CFE7D4',
  sky: '#C9E3F2',
  lavender: '#DED4F2',
  butter: '#FBE9B7',
  rose: '#F6CEDA',
};
const toneFg: Record<Tone, string> = {
  peach: '#9A4A25',
  sage: '#2E5F47',
  sky: '#24567A',
  lavender: '#4E3D8C',
  butter: '#8A6A1B',
  rose: '#8A3553',
};

/* Soft clay shadow — inset highlight + soft drop + subtle ring */
const clay =
  '12px 12px 32px rgba(180,150,120,0.18), -8px -8px 24px rgba(255,255,255,0.85), inset 2px 2px 4px rgba(255,255,255,0.9), inset -2px -2px 6px rgba(180,150,120,0.12)';
const clayRaised =
  '18px 18px 40px rgba(180,150,120,0.22), -10px -10px 28px rgba(255,255,255,0.9), inset 2px 2px 4px rgba(255,255,255,0.95), inset -2px -2px 8px rgba(180,150,120,0.15)';
const clayInset = 'inset 6px 6px 14px rgba(180,150,120,0.25), inset -4px -4px 10px rgba(255,255,255,0.9)';

export default function LandingCove() {
  const reduce = useReducedMotion();

  useEffect(() => {
    const id = 'comfortos-cove-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=DM+Sans:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);

  const fade: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };
  const stagger: Variants = { show: { transition: { staggerChildren: 0.07 } } };

  const display = "'Fraunces', ui-serif, Georgia, serif";
  const body = "'DM Sans', ui-sans-serif, system-ui, -apple-system, sans-serif";

  const bg = '#FDF8F0';

  return (
    <div
      className="min-h-screen antialiased"
      style={{ background: bg, fontFamily: body, color: '#3B2F2A' }}
    >
      <style>{`
        @keyframes cove-float-a { 0%,100%{transform:translate(0,0) rotate(0deg);} 50%{transform:translate(10px,-14px) rotate(4deg);} }
        @keyframes cove-float-b { 0%,100%{transform:translate(0,0) rotate(0deg);} 50%{transform:translate(-12px,10px) rotate(-6deg);} }
        @keyframes cove-float-c { 0%,100%{transform:translate(0,0) rotate(0deg);} 50%{transform:translate(8px,8px) rotate(3deg);} }
      `}</style>

      <VariationsNav active="cove" />

      {/* Nav */}
      <header className="sticky top-10 z-30 backdrop-blur" style={{ background: 'rgba(253,248,240,0.82)' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: '#CFE7D4', boxShadow: clay }}
            >
              <Building2 className="h-5 w-5" style={{ color: '#2E5F47' }} />
            </div>
            <span
              className="text-xl tracking-tight"
              style={{ fontFamily: display, fontWeight: 600, color: '#2A2421' }}
            >
              ComfortOS
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm" style={{ color: '#6B584E' }}>
            <a href="#features" className="hover:text-[#2A2421]">Features</a>
            <a href="#how" className="hover:text-[#2A2421]">How it works</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium px-3 py-2" style={{ color: '#3B2F2A' }}>
              Sign in
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-2xl transition active:scale-95"
              style={{ background: '#2E5F47', color: '#FDF8F0', boxShadow: clay }}
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Floating blobs */}
        <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden>
          <div
            className="absolute top-20 -left-16 w-56 h-56 rounded-full"
            style={{
              background: '#FFD9C2',
              boxShadow: clay,
              animation: reduce ? undefined : 'cove-float-a 11s ease-in-out infinite',
              opacity: 0.7,
            }}
          />
          <div
            className="absolute top-40 right-[8%] w-40 h-40 rounded-[40%_60%_55%_45%/50%_45%_55%_50%]"
            style={{
              background: '#DED4F2',
              boxShadow: clay,
              animation: reduce ? undefined : 'cove-float-b 13s ease-in-out infinite',
              opacity: 0.75,
            }}
          />
          <div
            className="absolute bottom-16 left-[15%] w-32 h-32 rounded-[55%_45%_60%_40%/50%_55%_45%_50%]"
            style={{
              background: '#FBE9B7',
              boxShadow: clay,
              animation: reduce ? undefined : 'cove-float-c 9s ease-in-out infinite',
              opacity: 0.8,
            }}
          />
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center relative z-10"
        >
          <motion.div
            variants={fade}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-10"
            style={{ background: '#FFFFFF', color: '#2E5F47', boxShadow: clay }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Somewhere between HAL and Hogwarts — the nice kind
          </motion.div>

          <motion.h1
            variants={fade}
            className="text-5xl sm:text-6xl md:text-[84px] leading-[1.04] tracking-[-0.02em]"
            style={{ fontFamily: display, fontWeight: 500, color: '#2A2421' }}
          >
            Your building{' '}
            <span
              className="relative inline-block px-4 py-1 rounded-[1.4rem] italic"
              style={{ background: '#CFE7D4', color: '#2E5F47', boxShadow: clay }}
            >
              listens.
            </span>
            <br />
            Your spaces{' '}
            <span
              className="relative inline-block px-4 py-1 rounded-[1.4rem] italic"
              style={{ background: '#FFD9C2', color: '#9A4A25', boxShadow: clay }}
            >
              respond.
            </span>
          </motion.h1>

          <motion.p
            variants={fade}
            className="mt-8 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#6B584E' }}
          >
            ComfortOS unifies occupants, facility managers and building systems — so comfort feedback turns into action, in real time.
          </motion.p>

          <motion.div variants={fade} className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl font-semibold transition active:scale-[0.97]"
              style={{ background: '#2E5F47', color: '#FDF8F0', boxShadow: clayRaised }}
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl font-semibold transition active:scale-[0.97]"
              style={{ background: '#FDF8F0', color: '#3B2F2A', boxShadow: clay }}
            >
              Sign in
            </Link>
          </motion.div>

          <motion.div
            variants={fade}
            className="mt-12 flex flex-wrap justify-center items-center gap-x-5 gap-y-2 text-sm"
            style={{ color: '#6B584E' }}
          >
            {['Real-time votes', 'Role-aware', 'Server-driven UI', 'Presence-aware'].map((it) => (
              <span key={it} className="inline-flex items-center gap-1.5">
                <span
                  className="w-5 h-5 rounded-full inline-flex items-center justify-center"
                  style={{ background: '#CFE7D4', boxShadow: clay }}
                >
                  <Check className="h-3 w-3" style={{ color: '#2E5F47' }} />
                </span>
                {it}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Phone vote + clay dashboard */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mb-12"
          >
            <div className="text-xs uppercase tracking-[0.22em] mb-3" style={{ color: '#2E5F47' }}>
              The comfort loop
            </div>
            <h2
              className="text-3xl md:text-5xl leading-tight tracking-tight"
              style={{ fontFamily: display, fontWeight: 500, color: '#2A2421' }}
            >
              One vote. One action. Already warmer.
            </h2>
            <p className="mt-4 max-w-xl" style={{ color: '#6B584E' }}>
              Occupants share how a space feels. Facility managers see the signal. The
              building adjusts — in seconds, not seasons.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-10 items-start">
            {/* Left: clay phone vote mock */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 relative mx-auto max-w-sm w-full"
            >
              <div
                className="relative rounded-[2.5rem] p-4"
                style={{ background: '#FDF8F0', boxShadow: clayRaised }}
              >
                <div
                  className="rounded-[2rem] p-5"
                  style={{ background: '#FFFFFF', boxShadow: clayInset }}
                >
                  {/* Building header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-9 h-9 rounded-2xl flex items-center justify-center"
                        style={{ background: '#CFE7D4', boxShadow: clay }}
                      >
                        <Building2 className="h-4 w-4" style={{ color: '#2E5F47' }} />
                      </div>
                      <div>
                        <div className="text-[10px] font-medium leading-none" style={{ color: '#8A7668' }}>
                          Ocean House
                        </div>
                        <div
                          className="text-[12px] font-semibold leading-tight mt-0.5"
                          style={{ fontFamily: display, color: '#2A2421' }}
                        >
                          Floor 4 · East wing
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] font-medium tabular-nums" style={{ color: '#8A7668' }}>
                      9:42
                    </div>
                  </div>

                  <div
                    className="text-[15px] font-semibold mb-1"
                    style={{ fontFamily: display, color: '#2A2421' }}
                  >
                    How&apos;s the comfort right now?
                  </div>
                  <div className="text-[11px] mb-4" style={{ color: '#8A7668' }}>
                    Tap your feeling — it&apos;s anonymous.
                  </div>

                  {/* Vote scale */}
                  <div className="flex justify-between gap-1 mb-2">
                    {[
                      { v: '−3', bg: '#C9E3F2', fg: '#24567A', active: false },
                      { v: '−2', bg: '#C9E3F2', fg: '#24567A', active: false },
                      { v: '−1', bg: '#C9E3F2', fg: '#24567A', active: false },
                      { v: '0', bg: '#CFE7D4', fg: '#2E5F47', active: false },
                      { v: '+1', bg: '#FBE9B7', fg: '#8A6A1B', active: false },
                      { v: '+2', bg: '#FFD9C2', fg: '#9A4A25', active: true },
                      { v: '+3', bg: '#F6CEDA', fg: '#8A3553', active: false },
                    ].map((b) => (
                      <div
                        key={b.v}
                        className="flex-1 rounded-xl text-[11px] font-semibold py-2 text-center tabular-nums"
                        style={{
                          background: b.active ? '#2E5F47' : b.bg,
                          color: b.active ? '#FDF8F0' : b.fg,
                          boxShadow: b.active ? clayRaised : clay,
                        }}
                      >
                        {b.v}
                      </div>
                    ))}
                  </div>
                  <div
                    className="flex items-center justify-between text-[10px] mb-5 px-1 uppercase tracking-[0.18em]"
                    style={{ color: '#8A7668' }}
                  >
                    <span>Cold</span>
                    <span>Neutral</span>
                    <span>Hot</span>
                  </div>

                  {/* Sensor readout */}
                  <div
                    className="rounded-2xl p-3 flex items-center gap-3"
                    style={{ background: '#FDF8F0', boxShadow: clayInset }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: '#FFD9C2', boxShadow: clay }}
                    >
                      <Thermometer className="h-4 w-4" style={{ color: '#9A4A25' }} />
                    </div>
                    <div className="flex-1">
                      <div
                        className="text-[12px] font-semibold tabular-nums"
                        style={{ fontFamily: display, color: '#2A2421' }}
                      >
                        Thermal · 23.4°C
                      </div>
                      <div className="text-[10px] tabular-nums" style={{ color: '#8A7668' }}>
                        48% RH · CO₂ 612 ppm
                      </div>
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: '#2E5F47' }}>
                      Live
                    </div>
                  </div>

                  {/* Category pills */}
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {[
                      { icon: Thermometer, label: 'Thermal', tone: 'peach' as Tone, active: true },
                      { icon: Wind, label: 'Air', tone: 'sky' as Tone, active: false },
                      { icon: Sun, label: 'Light', tone: 'butter' as Tone, active: false },
                      { icon: Volume2, label: 'Sound', tone: 'lavender' as Tone, active: false },
                    ].map((c) => (
                      <div
                        key={c.label}
                        className="rounded-xl py-2 flex flex-col items-center justify-center gap-0.5"
                        style={{
                          background: c.active ? toneBg[c.tone] : '#FDF8F0',
                          color: c.active ? toneFg[c.tone] : '#8A7668',
                          boxShadow: c.active ? clay : clayInset,
                        }}
                      >
                        <c.icon className="h-4 w-4" />
                        <span className="text-[10px] font-medium">{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating "vote received" pill */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 16 }}
                className="absolute -bottom-5 -right-3 flex items-center gap-2 rounded-2xl px-3.5 py-2.5"
                style={{ background: '#FDF8F0', boxShadow: clayRaised }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#2E5F47' }} />
                </span>
                <div className="text-[11px] font-semibold" style={{ color: '#2A2421' }}>
                  Vote received · +2
                </div>
              </motion.div>

              {/* Floating FM action pill */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7, type: 'spring', stiffness: 200, damping: 16 }}
                className="absolute -top-4 -left-5 flex items-center gap-2 rounded-2xl px-3.5 py-2.5 max-w-[220px]"
                style={{ background: '#FDF8F0', boxShadow: clayRaised }}
              >
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: '#FFD9C2', boxShadow: clay }}
                >
                  <Gauge className="h-3.5 w-3.5" style={{ color: '#9A4A25' }} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold leading-tight" style={{ color: '#2A2421' }}>
                    FM action queued
                  </div>
                  <div className="text-[10px] leading-tight" style={{ color: '#8A7668' }}>
                    Lower setpoint · 0.5°C
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: clay dashboard preview */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-7"
            >
              <div
                className="rounded-[2rem] p-5 md:p-6"
                style={{ background: '#FDF8F0', boxShadow: clayRaised }}
              >
                {/* Title row */}
                <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-[0.22em]" style={{ color: '#8A7668' }}>
                      Ocean House · Overview
                    </div>
                    <div
                      className="text-xl md:text-2xl tracking-tight mt-0.5"
                      style={{ fontFamily: display, fontWeight: 500, color: '#2A2421' }}
                    >
                      Comfort dashboard
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ background: '#CFE7D4', color: '#2E5F47', boxShadow: clay }}>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ background: '#2E5F47' }} />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: '#2E5F47' }} />
                    </span>
                    Streaming
                  </div>
                </div>

                {/* KPI grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  {[
                    { k: 'Comfort index', v: '78', sub: '+4 vs yesterday', bg: '#CFE7D4', fg: '#2E5F47' },
                    { k: 'Votes today', v: '1,284', sub: 'across 7 floors', bg: '#C9E3F2', fg: '#24567A' },
                    { k: 'Response time', v: '6m 42s', sub: 'median FM reply', bg: '#FBE9B7', fg: '#8A6A1B' },
                    { k: 'Zones flagged', v: '3', sub: '2 warm · 1 cold', bg: '#FFD9C2', fg: '#9A4A25' },
                  ].map((kpi) => (
                    <div
                      key={kpi.k}
                      className="rounded-2xl p-4"
                      style={{ background: '#FFFFFF', boxShadow: clay }}
                    >
                      <div className="text-[10px] font-medium uppercase tracking-[0.18em]" style={{ color: '#8A7668' }}>
                        {kpi.k}
                      </div>
                      <div
                        className="mt-1.5 text-2xl tabular-nums tracking-tight"
                        style={{ fontFamily: display, fontWeight: 600, color: '#2A2421' }}
                      >
                        {kpi.v}
                      </div>
                      <div
                        className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: kpi.bg, color: kpi.fg }}
                      >
                        {kpi.sub}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart + zones */}
                <div className="grid grid-cols-12 gap-3">
                  <div
                    className="col-span-12 lg:col-span-8 rounded-2xl p-4"
                    style={{ background: '#FFFFFF', boxShadow: clay }}
                  >
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div>
                        <div className="text-xs font-semibold" style={{ color: '#2A2421' }}>
                          Comfort trend
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: '#8A7668' }}>
                          Per floor · last 7 days
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[10px]" style={{ color: '#6B584E' }}>
                        <span className="inline-flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full" style={{ background: '#2E5F47' }} /> Floor 2
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full" style={{ background: '#70c1b3' }} /> Floor 4
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full" style={{ background: '#FB923C' }} /> Floor 7
                        </span>
                      </div>
                    </div>
                    <svg viewBox="0 0 400 110" className="w-full h-24">
                      <line x1="0" y1="20" x2="400" y2="20" stroke="#EEE5D4" strokeWidth="1" />
                      <line x1="0" y1="55" x2="400" y2="55" stroke="#EEE5D4" strokeWidth="1" />
                      <line x1="0" y1="90" x2="400" y2="90" stroke="#EEE5D4" strokeWidth="1" />
                      <polyline fill="none" stroke="#2E5F47" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points="0,60 40,52 80,55 120,48 160,42 200,40 240,35 280,30 320,28 360,24 400,22" />
                      <polyline fill="none" stroke="#70c1b3" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points="0,72 40,68 80,70 120,62 160,60 200,58 240,55 280,50 320,48 360,45 400,42" />
                      <polyline fill="none" stroke="#FB923C" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points="0,50 40,56 80,48 120,62 160,70 200,66 240,72 280,70 320,80 360,76 400,82" />
                    </svg>
                    <div className="flex justify-between text-[10px] mt-1 px-1 uppercase tracking-[0.18em]" style={{ color: '#A99789' }}>
                      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                  </div>

                  <div
                    className="col-span-12 lg:col-span-4 rounded-2xl p-4"
                    style={{ background: '#FFFFFF', boxShadow: clay }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-semibold" style={{ color: '#2A2421' }}>
                        Zones flagged
                      </div>
                      <div className="text-[10px] font-medium" style={{ color: '#2E5F47' }}>
                        View all →
                      </div>
                    </div>
                    <ul className="space-y-3 text-xs">
                      {[
                        { z: 'Floor 4 · East wing', m: '14 votes · 18m ago', tag: 'Warm', tagBg: '#FFD9C2', tagFg: '#9A4A25' },
                        { z: 'Floor 2 · Atrium', m: '8 votes · 34m ago', tag: 'Cold', tagBg: '#C9E3F2', tagFg: '#24567A' },
                        { z: 'Floor 7 · Lab 3', m: '21 votes · 47m ago', tag: 'Warm', tagBg: '#FFD9C2', tagFg: '#9A4A25' },
                      ].map((z) => (
                        <li key={z.z} className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-medium truncate" style={{ color: '#2A2421' }}>{z.z}</div>
                            <div className="text-[10px]" style={{ color: '#8A7668' }}>{z.m}</div>
                          </div>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
                            style={{ background: z.tagBg, color: z.tagFg, boxShadow: clay }}
                          >
                            {z.tag}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Live activity */}
                <div
                  className="mt-3 rounded-2xl p-4"
                  style={{ background: '#FFFFFF', boxShadow: clay }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-semibold" style={{ color: '#2A2421' }}>
                      Live activity
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-medium" style={{ color: '#2E5F47' }}>
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ background: '#70c1b3' }} />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: '#2E5F47' }} />
                      </span>
                      Streaming
                    </div>
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]" style={{ color: '#6B584E' }}>
                    {[
                      { icon: Vote, bg: '#CFE7D4', fg: '#2E5F47', t: '+2 vote · Floor 4 · East wing', s: 'Thermal · 2m ago' },
                      { icon: Gauge, bg: '#FFD9C2', fg: '#9A4A25', t: 'Setpoint lowered 0.5°C', s: 'HVAC · Zone 4E · 3m ago' },
                      { icon: Thermometer, bg: '#C9E3F2', fg: '#24567A', t: 'Atrium flagged cold', s: '8 votes · 34m ago' },
                    ].map((it) => (
                      <li key={it.t} className="flex items-start gap-2">
                        <div
                          className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: it.bg, color: it.fg, boxShadow: clay }}
                        >
                          <it.icon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="font-medium" style={{ color: '#2A2421' }}>{it.t}</div>
                          <div style={{ color: '#8A7668' }}>{it.s}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trio — voice · impact · floor */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mb-12 md:mb-16"
          >
            <div className="text-xs uppercase tracking-[0.22em] mb-3" style={{ color: '#2E5F47' }}>
              Why occupants actually use it
            </div>
            <h2
              className="text-3xl md:text-5xl leading-tight tracking-tight"
              style={{ fontFamily: display, fontWeight: 500, color: '#2A2421' }}
            >
              Your voice.{' '}
              <span
                className="inline-block px-3 py-0.5 rounded-[1.2rem] italic"
                style={{ background: '#CFE7D4', color: '#2E5F47', boxShadow: clay }}
              >
                Your impact.
              </span>{' '}
              Your floor.
            </h2>
            <p className="mt-4 max-w-2xl" style={{ color: '#6B584E' }}>
              ComfortOS isn&apos;t a suggestion box. Every vote belongs to the person
              who filed it, leads to a visible building action, and sits alongside
              the feelings of everyone else in the same space.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 — Voice */}
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[2rem] p-7"
              style={{ background: '#FDF8F0', boxShadow: clay }}
            >
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] mb-4"
                style={{ background: '#CFE7D4', color: '#2E5F47', boxShadow: clay }}
              >
                I &middot; Your voice
              </div>
              <h3
                className="text-2xl tracking-tight mb-2"
                style={{ fontFamily: display, fontWeight: 500, color: '#2A2421' }}
              >
                Anonymous. Five seconds. Done.
              </h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: '#6B584E' }}>
                One tap, one feeling, one space. Your vote is yours — not your
                manager&apos;s, not HR&apos;s.
              </p>

              <div
                className="rounded-2xl p-4"
                style={{ background: '#FFFFFF', boxShadow: clayInset }}
              >
                <div
                  className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] mb-2"
                  style={{ color: '#8A7668' }}
                >
                  <span>Thermal &middot; 4E</span>
                  <span className="inline-flex items-center gap-1" style={{ color: '#2E5F47' }}>
                    <ShieldCheck className="h-3 w-3" />
                    Anonymous
                  </span>
                </div>
                <div className="flex justify-between gap-1">
                  {[
                    { v: '−3', bg: '#C9E3F2', fg: '#24567A', active: false },
                    { v: '−2', bg: '#C9E3F2', fg: '#24567A', active: false },
                    { v: '−1', bg: '#C9E3F2', fg: '#24567A', active: false },
                    { v: '0', bg: '#CFE7D4', fg: '#2E5F47', active: false },
                    { v: '+1', bg: '#FBE9B7', fg: '#8A6A1B', active: false },
                    { v: '+2', bg: '#FFD9C2', fg: '#9A4A25', active: true },
                    { v: '+3', bg: '#F6CEDA', fg: '#8A3553', active: false },
                  ].map((b) => (
                    <div
                      key={b.v}
                      className="flex-1 rounded-lg text-[10px] font-semibold py-1.5 text-center tabular-nums"
                      style={{
                        background: b.active ? '#2E5F47' : b.bg,
                        color: b.active ? '#FDF8F0' : b.fg,
                        boxShadow: b.active ? clayRaised : clay,
                      }}
                    >
                      {b.v}
                    </div>
                  ))}
                </div>
                <div
                  className="mt-3 text-[10px] uppercase tracking-[0.22em]"
                  style={{ color: '#8A7668' }}
                >
                  Your history &rarr; kept private
                </div>
              </div>
            </motion.article>

            {/* Card 2 — Impact */}
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[2rem] p-7"
              style={{ background: '#FDF8F0', boxShadow: clay }}
            >
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] mb-4"
                style={{ background: '#FFD9C2', color: '#9A4A25', boxShadow: clay }}
              >
                II &middot; Your impact
              </div>
              <h3
                className="text-2xl tracking-tight mb-2"
                style={{ fontFamily: display, fontWeight: 500, color: '#2A2421' }}
              >
                Every vote traces to an action.
              </h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: '#6B584E' }}>
                Not a ticket. Not a &ldquo;we&rsquo;ll look into it.&rdquo; A setpoint
                moves, and you see it happen.
              </p>

              <ol
                className="rounded-2xl overflow-hidden"
                style={{ background: '#FFFFFF', boxShadow: clayInset }}
              >
                {[
                  { t: 'You voted warm (+2)', s: '09:42 · Floor 4E', bg: '#CFE7D4', fg: '#2E5F47' },
                  { t: 'Setpoint −0.5°C', s: '09:44 · HVAC Zone 4E', bg: '#FFD9C2', fg: '#9A4A25' },
                  { t: '23.1°C · −0.3°', s: '09:47 · sensor confirms', bg: '#C9E3F2', fg: '#24567A' },
                ].map((row, i) => (
                  <li
                    key={row.t}
                    className={`flex items-start gap-3 px-4 py-3 ${
                      i > 0 ? 'border-t' : ''
                    }`}
                    style={{ borderColor: '#EEE5D4' }}
                  >
                    <span
                      className="mt-1 h-5 w-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: row.bg, color: row.fg, boxShadow: clay }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: row.fg }} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold tabular-nums" style={{ color: '#2A2421' }}>
                        {row.t}
                      </div>
                      <div className="text-[10px] tabular-nums" style={{ color: '#8A7668' }}>
                        {row.s}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <div
                className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]"
                style={{ background: '#CFE7D4', color: '#2E5F47', boxShadow: clay }}
              >
                <Check className="h-3 w-3" />
                Loop closed in 5&nbsp;min
              </div>
            </motion.article>

            {/* Card 3 — Floor */}
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[2rem] p-7"
              style={{ background: '#FDF8F0', boxShadow: clay }}
            >
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] mb-4"
                style={{ background: '#C9E3F2', color: '#24567A', boxShadow: clay }}
              >
                III &middot; Your floor
              </div>
              <h3
                className="text-2xl tracking-tight mb-2"
                style={{ fontFamily: display, fontWeight: 500, color: '#2A2421' }}
              >
                You&apos;re not the only one feeling it.
              </h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: '#6B584E' }}>
                Agreement gives your vote weight — and makes comfort a shared
                project, not a private gripe.
              </p>

              <div
                className="rounded-2xl p-4"
                style={{ background: '#FFFFFF', boxShadow: clayInset }}
              >
                <div
                  className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] mb-3"
                  style={{ color: '#8A7668' }}
                >
                  <span>Floor 4 &middot; right now</span>
                  <span className="inline-flex items-center gap-1" style={{ color: '#2E5F47' }}>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ background: '#70c1b3' }} />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: '#2E5F47' }} />
                    </span>
                    Live
                  </span>
                </div>

                <div
                  className="flex h-7 w-full overflow-hidden rounded-full"
                  style={{ boxShadow: clayInset }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '18%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="flex items-center justify-center text-[9px] font-semibold tabular-nums"
                    style={{ background: '#C9E3F2', color: '#24567A' }}
                  >
                    18%
                  </motion.div>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '45%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.1 }}
                    className="flex items-center justify-center text-[9px] font-semibold tabular-nums"
                    style={{ background: '#CFE7D4', color: '#2E5F47' }}
                  >
                    45%
                  </motion.div>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '37%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.85, delay: 0.2 }}
                    className="flex items-center justify-center text-[9px] font-semibold tabular-nums"
                    style={{ background: '#FFD9C2', color: '#9A4A25' }}
                  >
                    37%
                  </motion.div>
                </div>
                <div
                  className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.22em]"
                  style={{ color: '#8A7668' }}
                >
                  <span>Cold</span>
                  <span>Neutral</span>
                  <span>Warm</span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[
                      { n: 'NU', bg: '#2E5F47', fg: '#FDF8F0' },
                      { n: 'AR', bg: '#FFD9C2', fg: '#9A4A25' },
                      { n: 'JL', bg: '#FBE9B7', fg: '#8A6A1B' },
                      { n: 'MK', bg: '#F6CEDA', fg: '#8A3553' },
                      { n: 'SS', bg: '#DED4F2', fg: '#4E3D8C' },
                    ].map((a) => (
                      <div
                        key={a.n}
                        className="h-7 w-7 rounded-full border-2 flex items-center justify-center text-[9px] font-semibold tabular-nums"
                        style={{
                          background: a.bg,
                          color: a.fg,
                          borderColor: '#FDF8F0',
                          boxShadow: clay,
                        }}
                      >
                        {a.n}
                      </div>
                    ))}
                    <div
                      className="h-7 px-2 rounded-full border-2 flex items-center text-[9px] font-semibold tabular-nums"
                      style={{
                        background: '#FDF8F0',
                        color: '#6B584E',
                        borderColor: '#FDF8F0',
                        boxShadow: clay,
                      }}
                    >
                      +9
                    </div>
                  </div>
                  <div className="text-[11px] leading-tight" style={{ color: '#6B584E' }}>
                    <span className="font-semibold" style={{ color: '#2A2421' }}>
                      14 others
                    </span>{' '}
                    voted the same as you today.
                  </div>
                </div>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      {/* Feature grid — clay cards */}
      <section id="features" className="relative py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center mb-14"
          >
            <div className="text-xs uppercase tracking-[0.22em] mb-3" style={{ color: '#2E5F47' }}>
              What it does
            </div>
            <h2
              className="text-3xl md:text-5xl leading-tight tracking-tight"
              style={{ fontFamily: display, fontWeight: 500, color: '#2A2421' }}
            >
              A single platform for comfort, analytics &amp; control.
            </h2>
            <p className="mt-4" style={{ color: '#6B584E' }}>
              ComfortOS unifies feedback, presence, sensor data and configuration — so every stakeholder works from the same live picture.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -5 }}
                className="rounded-3xl p-7 transition"
                style={{ background: '#FDF8F0', boxShadow: clay }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: toneBg[f.tone], color: toneFg[f.tone], boxShadow: clay }}
                >
                  <f.icon className="h-6 w-6" />
                </div>
                <h3
                  className="text-xl tracking-tight mb-2"
                  style={{ fontFamily: display, fontWeight: 500, color: '#2A2421' }}
                >
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6B584E' }}>
                  {f.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="how" className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[2.5rem] p-12 md:p-16 text-center"
            style={{ background: '#CFE7D4', boxShadow: clayRaised }}
          >
            <div
              aria-hidden
              className="absolute -top-10 -right-10 w-48 h-48 rounded-full"
              style={{ background: '#FFD9C2', boxShadow: clay, opacity: 0.7 }}
            />
            <div
              aria-hidden
              className="absolute -bottom-14 -left-14 w-56 h-56 rounded-full"
              style={{ background: '#FBE9B7', boxShadow: clay, opacity: 0.7 }}
            />

            <h2
              className="relative text-3xl md:text-5xl tracking-tight leading-tight"
              style={{ fontFamily: display, fontWeight: 500, color: '#1E3D2E' }}
            >
              Ready to close your{' '}
              <span className="italic">comfort loop?</span>
            </h2>
            <p className="relative mt-4 max-w-xl mx-auto" style={{ color: '#3B5E49' }}>
              Create an account in a minute, or sign in to pick up where you left off.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold transition active:scale-[0.97]"
                style={{ background: '#2E5F47', color: '#FDF8F0', boxShadow: clayRaised }}
              >
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold transition active:scale-[0.97]"
                style={{ background: '#FDF8F0', color: '#2A2421', boxShadow: clay }}
              >
                <Vote className="h-4 w-4" /> Sign in
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm" style={{ color: '#8A7668' }}>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: '#CFE7D4', boxShadow: clay }}
            >
              <Building2 className="h-3.5 w-3.5" style={{ color: '#2E5F47' }} />
            </div>
            <span>ComfortOS — Smart Building Platform</span>
          </div>
          <div>Variation 06 — Cove</div>
        </div>
      </footer>
    </div>
  );
}
