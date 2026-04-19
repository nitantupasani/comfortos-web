import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
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
  Activity,
} from 'lucide-react';
import VariationsNav from '../components/landing/VariationsNav';

const features = [
  { icon: Thermometer, title: 'Real-time comfort voting', body: 'Occupants report thermal, air, lighting and acoustic comfort in seconds.' },
  { icon: BarChart3, title: 'Analytics that matter', body: 'Turn votes and sensor data into clear trends, hotspots and actions.' },
  { icon: Layers, title: 'Server-driven UI', body: 'Dashboards and vote forms configured centrally, delivered on the fly.' },
  { icon: ShieldCheck, title: 'Role-based access', body: 'Scoped experiences for occupants, FMs and admins, with safe view-as.' },
  { icon: Gauge, title: 'Presence-aware', body: 'Location and presence signals tie feedback to the right space.' },
  { icon: Settings2, title: 'Configurable per tenant', body: 'Each tenant gets its own dashboard, vote schema and rules.' },
];

const titleLines: { text: string; accent?: boolean }[] = [
  { text: 'Your building' },
  { text: 'listens.', accent: true },
  { text: 'Your spaces' },
  { text: 'respond.', accent: true },
];

function useTelemetry() {
  const [votes, setVotes] = useState(1284);
  const [comfort, setComfort] = useState(78);
  const [co2, setCo2] = useState(462);
  const [occ, setOcc] = useState(74);
  useEffect(() => {
    const id = setInterval(() => {
      setVotes((v) => v + Math.floor(Math.random() * 3) + 1);
      setComfort((c) => Math.max(60, Math.min(96, c + (Math.random() > 0.5 ? 1 : -1))));
      setCo2((c) => Math.max(380, Math.min(720, c + (Math.random() > 0.5 ? 4 : -4))));
      setOcc((o) => Math.max(0, Math.min(99, o + (Math.random() > 0.5 ? 1 : -1))));
    }, 1500);
    return () => clearInterval(id);
  }, []);
  return { votes, comfort, co2, occ };
}

export default function LandingMidnight() {
  const reduce = useReducedMotion();
  const { votes, comfort } = useTelemetry();

  useEffect(() => {
    const id = 'comfortos-midnight-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
    document.head.appendChild(link);
  }, []);

  /* Pointer spotlight */
  const mx = useMotionValue(50);
  const my = useMotionValue(30);
  const smx = useSpring(mx, { stiffness: 60, damping: 20 });
  const smy = useSpring(my, { stiffness: 60, damping: 20 });
  const spotlight = useMotionTemplate`radial-gradient(420px 320px at ${smx}% ${smy}%, rgba(112,193,179,0.16), transparent 60%)`;
  useEffect(() => {
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth) * 100);
      my.set((e.clientY / window.innerHeight) * 100);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mx, my, reduce]);

  const fade: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
  };
  const stagger: Variants = { show: { transition: { staggerChildren: 0.06 } } };

  const display = "'Space Grotesk', ui-sans-serif, system-ui, sans-serif";
  const body = "'Inter', ui-sans-serif, system-ui, sans-serif";
  const mono = "'JetBrains Mono', ui-monospace, monospace";

  return (
    <div
      className="min-h-screen bg-zinc-950 text-zinc-100 antialiased relative overflow-hidden"
      style={{ fontFamily: body }}
    >
      <style>{`
        @keyframes mid-pulse { 0%,100%{opacity:.55;transform:scale(1);} 50%{opacity:1;transform:scale(1.02);} }
        @keyframes mid-scan { 0%{transform:translateY(-20vh);} 100%{transform:translateY(110vh);} }
        @keyframes mid-dash { to { stroke-dashoffset: -24; } }
      `}</style>

      <VariationsNav active="midnight" theme="dark" />

      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(1200px 700px at 80% -10%, rgba(16,185,129,0.10), transparent 60%), radial-gradient(1000px 600px at 10% 110%, rgba(34,211,238,0.10), transparent 60%), linear-gradient(180deg, #09090b 0%, #0a0a0a 100%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at 50% 30%, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 40%, transparent 80%)',
          }}
        />
        <motion.div className="absolute inset-0" style={{ background: spotlight }} />
        {!reduce && (
          <div
            className="absolute left-0 right-0 h-px opacity-40"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(112,193,179,0.6), transparent)',
              animation: 'mid-scan 9s linear infinite',
            }}
          />
        )}
      </div>

      {/* Nav */}
      <header className="relative z-20 sticky top-10 bg-zinc-950/70 backdrop-blur border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary-300" />
            </div>
            <span className="text-lg tracking-tight" style={{ fontFamily: display, fontWeight: 600 }}>
              ComfortOS
            </span>
            <span
              className="ml-2 hidden sm:inline text-[10px] uppercase tracking-[0.2em] text-primary-300/80 border border-primary-300/30 rounded-full px-2 py-0.5"
              style={{ fontFamily: mono }}
            >
              OPS
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#how" className="hover:text-white">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm text-zinc-300 hover:text-white px-3 py-2">
              Sign in
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-950 bg-primary-300 px-4 py-2 rounded-lg hover:bg-primary-200"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 min-h-[88vh] flex items-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-6xl mx-auto px-6 grid grid-cols-12 gap-8 py-16"
        >
          <div className="col-span-12 lg:col-span-7">
            <motion.div
              variants={fade}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-300 mb-8"
              style={{ fontFamily: mono }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary-300 opacity-70 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-300" />
              </span>
              Building Ops · Live
            </motion.div>

            <h1
              className="text-5xl sm:text-6xl md:text-7xl leading-[0.98] tracking-[-0.02em]"
              style={{ fontFamily: display, fontWeight: 600 }}
            >
              {titleLines.map((line, i) => (
                <motion.span
                  key={i}
                  variants={fade}
                  className={`inline-block mr-3 ${
                    line.accent
                      ? 'bg-gradient-to-br from-primary-200 via-cyan-200 to-emerald-300 bg-clip-text text-transparent'
                      : 'text-white'
                  }`}
                >
                  {line.text}
                  {i === 1 && <br />}
                </motion.span>
              ))}
            </h1>

            <motion.p variants={fade} className="mt-7 text-lg text-zinc-400 max-w-xl leading-relaxed">
              ComfortOS unifies occupants, facility managers and building systems — so comfort feedback turns into action, in real time.
            </motion.p>

            <motion.div
              variants={fade}
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] text-primary-200"
              style={{ fontFamily: mono }}
            >
              <span className="text-primary-400">$</span>
              <span className="text-zinc-400">echo</span>
              <span className="text-zinc-100">
                &quot;your building used to be mute. that was the bug.&quot;
              </span>
            </motion.div>

            <motion.div variants={fade} className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-primary-300 text-zinc-950 px-6 py-3.5 rounded-full font-semibold hover:bg-primary-200 shadow-[0_20px_60px_-20px_rgba(112,193,179,0.6)] transition"
              >
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 border border-white/15 bg-white/5 backdrop-blur text-white px-6 py-3.5 rounded-full font-semibold hover:bg-white/10"
              >
                Sign in
              </Link>
            </motion.div>

            <motion.div
              variants={fade}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-500"
              style={{ fontFamily: mono }}
            >
              {['Real-time votes', 'Role-aware', 'Server-driven UI', 'Presence-aware'].map((it) => (
                <span key={it} className="inline-flex items-center gap-1.5 uppercase tracking-[0.18em]">
                  <Check className="h-3.5 w-3.5 text-primary-300" />
                  {it}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Dashboard preview (dark glass) */}
          <motion.div variants={fade} className="col-span-12 lg:col-span-5 relative">
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85)] overflow-hidden">
              {/* Window chrome */}
              <div
                className="border-b border-white/5 px-4 py-2.5 flex items-center gap-1.5 bg-white/[0.02]"
                style={{ fontFamily: mono }}
              >
                <span className="h-2 w-2 rounded-full bg-white/20" />
                <span className="h-2 w-2 rounded-full bg-white/20" />
                <span className="h-2 w-2 rounded-full bg-white/20" />
                <span className="ml-3 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  comfortos.app / dashboard
                </span>
                <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] text-primary-300">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-primary-300"
                    style={{ animation: 'mid-pulse 1.6s ease-in-out infinite' }}
                  />
                  <span className="uppercase tracking-[0.22em]">Live</span>
                </span>
              </div>

              <div className="grid grid-cols-12">
                {/* Sidebar rail */}
                <div className="hidden sm:flex col-span-1 border-r border-white/5 py-4 flex-col items-center gap-2.5 bg-white/[0.02]">
                  <div className="w-8 h-8 rounded-lg bg-primary-300/20 border border-primary-300/30 text-primary-300 flex items-center justify-center">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="h-px w-5 bg-white/10 my-1" />
                  <div className="w-8 h-8 rounded-lg bg-white/5 text-primary-300 flex items-center justify-center">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  {[Vote, Layers, Gauge, Settings2].map((I, i) => (
                    <div key={i} className="w-8 h-8 rounded-lg text-zinc-500 hover:bg-white/5 flex items-center justify-center transition">
                      <I className="h-4 w-4" />
                    </div>
                  ))}
                </div>

                {/* Main panel */}
                <div className="col-span-12 sm:col-span-11 p-4 md:p-5 space-y-3.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500" style={{ fontFamily: mono }}>
                        Ocean House · Overview
                      </div>
                      <div className="text-base md:text-lg tracking-tight text-white font-semibold" style={{ fontFamily: display }}>
                        Comfort dashboard
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-primary-300" style={{ fontFamily: mono }}>
                      <Activity className="h-3 w-3" />
                      Streaming
                    </div>
                  </div>

                  {/* KPI row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2" style={{ fontFamily: mono }}>
                    {[
                      { k: 'Comfort', v: comfort, u: '/100', tone: 'text-primary-300', sub: '+4' },
                      { k: 'Votes', v: votes.toLocaleString(), u: '', tone: 'text-cyan-300', sub: 'today' },
                      { k: 'Resp.', v: '6m', u: '42s', tone: 'text-white', sub: 'median' },
                      { k: 'Flagged', v: '3', u: '', tone: 'text-amber-300', sub: '2W · 1C' },
                    ].map((kpi) => (
                      <div key={kpi.k} className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                        <div className="text-[9px] uppercase tracking-[0.18em] text-zinc-500">{kpi.k}</div>
                        <div className={`mt-1 text-lg tabular-nums font-semibold leading-none ${kpi.tone}`}>
                          {kpi.v}
                          <span className="text-[10px] text-zinc-500 ml-0.5">{kpi.u}</span>
                        </div>
                        <div className="mt-1 text-[9px] uppercase tracking-[0.18em] text-zinc-500">{kpi.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Chart */}
                  <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-1.5" style={{ fontFamily: mono }}>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">Comfort trend · 7d</div>
                      <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-zinc-500">
                        <span className="inline-flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary-300" /> F2
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> F4
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> F7
                        </span>
                      </div>
                    </div>
                    <svg viewBox="0 0 400 100" className="w-full h-20">
                      <line x1="0" y1="20" x2="400" y2="20" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                      <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                      <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                      <polyline fill="none" stroke="#70c1b3" strokeWidth="1.75" strokeLinejoin="round" points="0,60 40,52 80,55 120,48 160,42 200,40 240,35 280,30 320,28 360,24 400,22" />
                      <polyline fill="none" stroke="#67e8f9" strokeWidth="1.75" strokeLinejoin="round" points="0,72 40,68 80,70 120,62 160,60 200,58 240,55 280,50 320,48 360,45 400,42" />
                      <polyline fill="none" stroke="#fbbf24" strokeWidth="1.75" strokeLinejoin="round" points="0,50 40,56 80,48 120,62 160,70 200,66 240,72 280,70 320,80 360,76 400,82" />
                    </svg>
                  </div>

                  {/* Activity feed */}
                  <ul className="space-y-1.5 text-[11px] text-zinc-300">
                    {[
                      { icon: Vote, t: '+2 vote · Floor 4 East', s: 'Thermal · 2m ago', tone: 'text-primary-300' },
                      { icon: Gauge, t: 'Setpoint lowered 0.5°C', s: 'HVAC · Zone 4E · 3m ago', tone: 'text-amber-300' },
                      { icon: Thermometer, t: 'Atrium flagged cold', s: '8 votes · 34m ago', tone: 'text-cyan-300' },
                    ].map((it, i) => (
                      <motion.li
                        key={it.t}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="flex items-start gap-2 rounded-md bg-white/[0.02] border border-white/5 px-2.5 py-1.5"
                      >
                        <it.icon className={`h-3 w-3 mt-0.5 shrink-0 ${it.tone}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">{it.t}</div>
                          <div className="text-zinc-500 text-[10px]" style={{ fontFamily: mono }}>
                            {it.s}
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Floating phone vote mock */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="hidden md:block absolute -bottom-12 -left-10 w-56 rounded-2xl border border-white/10 bg-zinc-900/90 backdrop-blur-xl p-3 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]"
            >
              <div className="flex items-center justify-between mb-3" style={{ fontFamily: mono }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-primary-300/20 border border-primary-300/30 text-primary-300 flex items-center justify-center">
                    <Building2 className="h-2.5 w-2.5" />
                  </div>
                  <div>
                    <div className="text-[8px] uppercase tracking-[0.18em] text-zinc-500 leading-none">Floor 4E</div>
                    <div className="text-[9px] text-white font-semibold leading-tight mt-0.5" style={{ fontFamily: display }}>
                      Ocean House
                    </div>
                  </div>
                </div>
                <div className="text-[9px] text-zinc-500 tabular-nums">9:42</div>
              </div>
              <div className="text-[10px] text-white font-medium mb-2" style={{ fontFamily: display }}>
                How&apos;s the comfort?
              </div>
              <div className="flex justify-between gap-0.5 mb-1.5">
                {['−3', '−2', '−1', '0', '+1', '+2', '+3'].map((v, i) => (
                  <div
                    key={v}
                    className={`flex-1 text-[8px] font-semibold py-1 text-center rounded tabular-nums ${
                      i === 5
                        ? 'bg-primary-300 text-zinc-950'
                        : 'bg-white/5 border border-white/10 text-zinc-400'
                    }`}
                    style={{ fontFamily: mono }}
                  >
                    {v}
                  </div>
                ))}
              </div>
              <div className="mt-2.5 inline-flex items-center gap-1.5 text-[9px] text-primary-300 uppercase tracking-[0.18em]" style={{ fontFamily: mono }}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-primary-300 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-300" />
                </span>
                Vote filed · +2
              </div>
            </motion.div>

            <div className="absolute -inset-8 -z-10 bg-primary-500/10 blur-3xl rounded-full" aria-hidden />
          </motion.div>
        </motion.div>
      </section>

      {/* Trio — voice · impact · floor */}
      <section className="relative z-10 py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mb-12 md:mb-16"
          >
            <div
              className="text-[10px] uppercase tracking-[0.28em] text-primary-300 mb-3"
              style={{ fontFamily: mono }}
            >
              // Why occupants use it
            </div>
            <h2
              className="text-3xl md:text-5xl tracking-tight leading-tight"
              style={{ fontFamily: display, fontWeight: 600 }}
            >
              <span className="text-white">Your voice. </span>
              <span className="bg-gradient-to-br from-primary-200 via-cyan-200 to-emerald-300 bg-clip-text text-transparent">
                Your impact.
              </span>{' '}
              <span className="text-white">Your floor.</span>
            </h2>
            <p className="mt-4 text-zinc-400 max-w-2xl">
              ComfortOS isn&apos;t a suggestion box. Every vote belongs to the person who
              filed it, leads to a visible building action, and sits alongside the
              feelings of everyone else in the same space.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Card 1 — Voice */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5 }}
              className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-6 overflow-hidden"
            >
              <div
                className="text-[10px] uppercase tracking-[0.28em] text-primary-300 mb-2"
                style={{ fontFamily: mono }}
              >
                I · Your voice
              </div>
              <h3
                className="text-xl text-white tracking-tight mb-2"
                style={{ fontFamily: display, fontWeight: 600 }}
              >
                Anonymous. Five seconds. Done.
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-5">
                One tap, one feeling, one space. Your vote is yours — not your
                manager&apos;s, not HR&apos;s.
              </p>

              <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                <div
                  className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-zinc-500 mb-2"
                  style={{ fontFamily: mono }}
                >
                  <span>Thermal · 4E</span>
                  <span className="inline-flex items-center gap-1 text-primary-300">
                    <ShieldCheck className="h-3 w-3" />
                    Anonymous
                  </span>
                </div>
                <div className="flex justify-between gap-0.5">
                  {['−3', '−2', '−1', '0', '+1', '+2', '+3'].map((v, i) => (
                    <div
                      key={v}
                      className={`flex-1 text-[10px] font-semibold py-1.5 text-center rounded tabular-nums ${
                        i === 5
                          ? 'bg-primary-300 text-zinc-950'
                          : 'bg-white/5 border border-white/10 text-zinc-400'
                      }`}
                      style={{ fontFamily: mono }}
                    >
                      {v}
                    </div>
                  ))}
                </div>
                <div
                  className="mt-3 text-[10px] uppercase tracking-[0.22em] text-zinc-500"
                  style={{ fontFamily: mono }}
                >
                  Your history &rarr; kept private
                </div>
              </div>
            </motion.article>

            {/* Card 2 — Impact */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-6 overflow-hidden"
            >
              <div
                className="text-[10px] uppercase tracking-[0.28em] text-primary-300 mb-2"
                style={{ fontFamily: mono }}
              >
                II · Your impact
              </div>
              <h3
                className="text-xl text-white tracking-tight mb-2"
                style={{ fontFamily: display, fontWeight: 600 }}
              >
                Every vote traces to an action.
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-5">
                Not a ticket. Not a &ldquo;we&rsquo;ll look into it.&rdquo; A setpoint
                moves, and you see it happen.
              </p>

              <ol className="relative rounded-lg border border-white/10 bg-black/30">
                {[
                  { t: 'You voted warm (+2)', s: '09:42 · Floor 4E', dot: 'bg-zinc-300' },
                  { t: 'Setpoint −0.5°C', s: '09:44 · HVAC Zone 4E', dot: 'bg-amber-300' },
                  { t: '23.1°C · −0.3°', s: '09:47 · sensor confirms', dot: 'bg-primary-300' },
                ].map((row, i) => (
                  <li
                    key={row.t}
                    className={`flex items-start gap-3 px-3 py-2.5 ${
                      i > 0 ? 'border-t border-white/5' : ''
                    }`}
                  >
                    <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${row.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-white tabular-nums">
                        {row.t}
                      </div>
                      <div
                        className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 mt-0.5"
                        style={{ fontFamily: mono }}
                      >
                        {row.s}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <div
                className="mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-primary-300"
                style={{ fontFamily: mono }}
              >
                <Check className="h-3 w-3" />
                Loop closed in 5&nbsp;min
              </div>
            </motion.article>

            {/* Card 3 — Floor */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-6 overflow-hidden"
            >
              <div
                className="text-[10px] uppercase tracking-[0.28em] text-primary-300 mb-2"
                style={{ fontFamily: mono }}
              >
                III · Your floor
              </div>
              <h3
                className="text-xl text-white tracking-tight mb-2"
                style={{ fontFamily: display, fontWeight: 600 }}
              >
                You&apos;re not the only one feeling it.
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-5">
                Agreement gives your vote weight — and makes comfort a shared
                project, not a private gripe.
              </p>

              <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                <div
                  className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-zinc-500 mb-3"
                  style={{ fontFamily: mono }}
                >
                  <span>Floor 4 · right now</span>
                  <span className="inline-flex items-center gap-1 text-primary-300">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-primary-300"
                      style={{ animation: 'mid-pulse 1.6s ease-in-out infinite' }}
                    />
                    Live
                  </span>
                </div>

                <div className="flex h-6 w-full overflow-hidden rounded-md border border-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '18%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="bg-cyan-400/80 flex items-center justify-center text-[9px] font-semibold text-zinc-950 tabular-nums"
                  >
                    18%
                  </motion.div>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '45%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
                    className="bg-primary-300 flex items-center justify-center text-[9px] font-semibold text-zinc-950 tabular-nums"
                  >
                    45%
                  </motion.div>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '37%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.85, delay: 0.2, ease: 'easeOut' }}
                    className="bg-amber-400/90 flex items-center justify-center text-[9px] font-semibold text-zinc-950 tabular-nums"
                  >
                    37%
                  </motion.div>
                </div>
                <div
                  className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.22em] text-zinc-500"
                  style={{ fontFamily: mono }}
                >
                  <span>Cold</span>
                  <span>Neutral</span>
                  <span>Warm</span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['NU', 'AR', 'JL', 'MK', 'SS'].map((n, i) => (
                      <div
                        key={n}
                        className={`h-6 w-6 rounded-full border-2 border-zinc-900 flex items-center justify-center text-[9px] font-semibold tabular-nums ${
                          i === 0
                            ? 'bg-primary-300 text-zinc-950'
                            : 'bg-amber-400/80 text-zinc-950'
                        }`}
                        style={{ fontFamily: mono }}
                      >
                        {n}
                      </div>
                    ))}
                    <div
                      className="h-6 px-2 rounded-full border-2 border-zinc-900 bg-white/10 text-zinc-300 flex items-center text-[9px] font-semibold tabular-nums"
                      style={{ fontFamily: mono }}
                    >
                      +9
                    </div>
                  </div>
                  <div className="text-[11px] text-zinc-300 leading-tight">
                    <span className="font-semibold text-white">14 others</span>{' '}
                    <span className="text-zinc-500">voted the same as you today.</span>
                  </div>
                </div>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mb-14"
          >
            <div
              className="text-[10px] uppercase tracking-[0.28em] text-primary-300 mb-3"
              style={{ fontFamily: mono }}
            >
              // What it does
            </div>
            <h2
              className="text-3xl md:text-5xl tracking-tight"
              style={{ fontFamily: display, fontWeight: 600 }}
            >
              A single platform for comfort, analytics and control.
            </h2>
            <p className="mt-4 text-zinc-400">
              ComfortOS unifies feedback, presence, sensor data and configuration — so every stakeholder works from the same live picture.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <GlassCard key={f.title} delay={i * 0.05}>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary-300" />
                </div>
                <h3 className="text-base font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{f.body}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="how" className="relative z-10 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl p-10 md:p-14 text-center"
          >
            <div
              className="absolute inset-0 -z-10"
              style={{
                background:
                  'radial-gradient(500px 200px at 30% 0%, rgba(112,193,179,0.35), transparent), radial-gradient(400px 200px at 80% 100%, rgba(34,211,238,0.25), transparent)',
              }}
            />
            <div
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-primary-300 mb-5"
              style={{ fontFamily: mono }}
            >
              <Sparkles className="h-3 w-3" />
              Ready to deploy
            </div>
            <h2
              className="text-3xl md:text-5xl tracking-tight text-white"
              style={{ fontFamily: display, fontWeight: 600 }}
            >
              Ready to make your building listen?
            </h2>
            <p className="mt-3 text-zinc-400 max-w-xl mx-auto">
              Create an account in a minute, or sign in to pick up where you left off.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-primary-300 text-zinc-950 px-6 py-3 rounded-xl font-semibold hover:bg-primary-200"
              >
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/5"
              >
                Sign in
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-10">
        <div
          className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500"
          style={{ fontFamily: mono }}
        >
          <div className="flex items-center gap-2 uppercase tracking-[0.2em]">
            <div className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
              <Building2 className="h-3 w-3 text-primary-300" />
            </div>
            <span>ComfortOS · Smart Building Platform</span>
          </div>
          <div className="uppercase tracking-[0.22em]">Variation 05 — Midnight Ops</div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Glass feature card ---------- */
function GlassCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const bg = useMotionTemplate`radial-gradient(300px 200px at ${gx}% ${gy}%, rgba(112,193,179,0.12), transparent 70%)`;
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    gx.set(((e.clientX - r.left) / r.width) * 100);
    gy.set(((e.clientY - r.top) / r.height) * 100);
  };
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -3 }}
      className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-6 overflow-hidden"
    >
      <motion.div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: bg }} />
      <div className="relative">{children}</div>
    </motion.div>
  );
}
