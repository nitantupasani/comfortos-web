import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useReducedMotion,
  useMotionTemplate,
  AnimatePresence,
} from 'framer-motion';
import {
  Building2,
  ArrowRight,
  ArrowUpRight,
  Thermometer,
  Wind,
  Sun,
  Users,
  Vote,
  Gauge,
  Layers,
  ShieldCheck,
  Sparkles,
  Zap,
  Activity,
  Check,
} from 'lucide-react';
import VariationsNav from '../components/landing/VariationsNav';

/* ---------------- Digit roller (kinetic numbers) ---------------- */
function DigitRoller({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' | 'lg' }) {
  const digits = value.toString().padStart(4, '0').split('');
  const cls =
    size === 'lg' ? 'h-14 text-5xl' : size === 'sm' ? 'h-7 text-xl' : 'h-10 text-3xl';
  return (
    <span className={`inline-flex gap-0.5 tabular-nums font-semibold ${cls}`}>
      {digits.map((d, i) => (
        <span key={i} className="relative overflow-hidden w-[0.6em] inline-block">
          <motion.span
            key={d}
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="block"
          >
            {d}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ---------------- Live metric ticker ---------------- */
function LiveTicker() {
  const [votes, setVotes] = useState(1284);
  const [temp, setTemp] = useState(224);
  const [co2, setCo2] = useState(462);
  const [occ, setOcc] = useState(74);

  useEffect(() => {
    const id = setInterval(() => {
      setVotes((v) => v + Math.floor(Math.random() * 3) + 1);
      setTemp((t) => Math.max(200, Math.min(250, t + (Math.random() > 0.5 ? 1 : -1))));
      setCo2((c) => Math.max(380, Math.min(800, c + (Math.random() > 0.5 ? 4 : -4))));
      setOcc((o) => Math.max(0, Math.min(99, o + (Math.random() > 0.5 ? 1 : -1))));
    }, 1400);
    return () => clearInterval(id);
  }, []);

  const items = [
    { label: 'Votes today', val: votes, unit: '', icon: Vote, accent: 'from-violet-500 to-fuchsia-500' },
    { label: 'Avg temp', val: temp, unit: '°', scale: 0.1, icon: Thermometer, accent: 'from-sky-500 to-cyan-400' },
    { label: 'CO₂ ppm', val: co2, unit: '', icon: Wind, accent: 'from-emerald-500 to-teal-400' },
    { label: 'Occupancy', val: occ, unit: '%', icon: Users, accent: 'from-amber-500 to-orange-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((it) => (
        <div
          key={it.label}
          className="relative rounded-2xl bg-white border border-slate-200/80 p-5 overflow-hidden"
        >
          <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${it.accent} opacity-20 blur-2xl`} />
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-500">{it.label}</div>
            <it.icon className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={it.val}
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -18, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl font-semibold tracking-tight text-slate-900 tabular-nums"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {it.scale ? (it.val * it.scale).toFixed(1) : it.val.toLocaleString()}
              <span className="text-slate-400 text-lg ml-0.5">{it.unit}</span>
            </motion.div>
          </AnimatePresence>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className={`absolute inline-flex h-full w-full rounded-full bg-gradient-to-r ${it.accent} opacity-75 animate-ping`} />
              <span className={`relative inline-flex h-1.5 w-1.5 rounded-full bg-gradient-to-r ${it.accent}`} />
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400">Live</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- 3D tilt card with parallax glow ---------------- */
function ParallaxHero({ reduce }: { reduce: boolean | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [8, -8]), { stiffness: 100, damping: 18 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-12, 12]), { stiffness: 100, damping: 18 });
  const glowX = useSpring(useTransform(mx, [-1, 1], ['30%', '70%']), { stiffness: 80, damping: 16 });
  const glowY = useSpring(useTransform(my, [-1, 1], ['30%', '70%']), { stiffness: 80, damping: 16 });
  const glow = useMotionTemplate`radial-gradient(600px circle at ${glowX} ${glowY}, rgba(99,102,241,0.35), rgba(14,165,233,0.18) 30%, transparent 60%)`;

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={reduce ? undefined : onMove}
      onMouseLeave={reduce ? undefined : onLeave}
      className="relative w-full aspect-[1.15/1] max-w-[620px] mx-auto"
      style={{ perspective: '1400px' }}
    >
      {/* Glow */}
      <motion.div className="absolute inset-0 rounded-[2rem]" style={{ background: glow }} aria-hidden />

      {/* Building layered deck */}
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className="relative w-full h-full"
      >
        {/* Back floor plate */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ transform: 'translateZ(-60px)' }}
          className="absolute left-[8%] top-[18%] w-[78%] h-[64%] rounded-3xl bg-gradient-to-br from-indigo-500/90 via-violet-500/80 to-fuchsia-500/80 shadow-2xl"
        >
          <div className="absolute inset-0 rounded-3xl opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.18) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="absolute top-5 left-5 text-white/80 text-[10px] uppercase tracking-[0.2em] font-semibold">Zone map · Floor 4</div>
        </motion.div>

        {/* Mid card — live dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ transform: 'translateZ(20px)' }}
          className="absolute right-[6%] top-[8%] w-[62%] rounded-2xl bg-white border border-slate-200 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.25)] overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-1.5 bg-slate-50/60">
            <span className="w-2 h-2 rounded-full bg-rose-400/60" />
            <span className="w-2 h-2 rounded-full bg-amber-400/60" />
            <span className="w-2 h-2 rounded-full bg-emerald-400/60" />
            <span className="ml-3 text-[10px] text-slate-400 tracking-wide">comfortos · live</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-widest text-slate-400">Comfort index</div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">+4</span>
            </div>
            <div className="flex items-end gap-3">
              <div className="text-5xl font-semibold tabular-nums tracking-tight text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>78</div>
              <div className="flex-1 h-12 flex items-end gap-1">
                {[40, 55, 48, 62, 70, 58, 72, 80, 74, 85, 78, 88].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.9 + i * 0.04, duration: 0.5 }}
                    className="flex-1 rounded-sm bg-gradient-to-t from-indigo-500 via-violet-500 to-fuchsia-400"
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Front mini card — vote */}
        <motion.div
          initial={{ opacity: 0, y: 30, x: -10 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ transform: 'translateZ(60px)' }}
          className="absolute left-[4%] bottom-[6%] w-[44%] rounded-2xl bg-white border border-slate-200 shadow-[0_30px_60px_-15px_rgba(99,102,241,0.35)] p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Vote className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400">Vote received</div>
              <div className="text-xs font-semibold text-slate-900">Floor 4 East · +2 Warm</div>
            </div>
          </div>
          <div className="flex items-end gap-0.5 h-10">
            {[30, 48, 35, 60, 88, 72, 45].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: 1.1 + i * 0.05, duration: 0.4 }}
                className={`flex-1 rounded-sm ${i === 4 ? 'bg-amber-500' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </motion.div>

        {/* Sparkle badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.3, type: 'spring' }}
          style={{ transform: 'translateZ(80px)' }}
          className="absolute right-[10%] bottom-[12%] flex items-center gap-2 rounded-full bg-white border border-slate-200 pl-2 pr-3 py-1.5 shadow-lg"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <Zap className="h-3 w-3 text-white" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700">4.2s to action</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ---------------- Horizontal pinned scroll ---------------- */
function HorizontalShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const x = useTransform(scrollYProgress, [0, 1], ['2%', '-72%']);

  const panels = [
    {
      n: '01',
      title: 'Vote in a tap',
      body: 'A 7-point comfort scale across thermal, air, light and acoustic — configurable per tenant. No surveys.',
      icon: Vote,
      grad: 'from-indigo-500 to-violet-600',
      chip: 'OCCUPANT SURFACE',
    },
    {
      n: '02',
      title: 'Located automatically',
      body: 'BLE, Wi-Fi and optional QR tie every vote to the right zone and HVAC circuit. Never orphaned data.',
      icon: Gauge,
      grad: 'from-sky-500 to-cyan-500',
      chip: 'PRESENCE ENGINE',
    },
    {
      n: '03',
      title: 'Building responds',
      body: 'Setpoints shift, alerts route, facility teams get a clear next action — in seconds, not shifts.',
      icon: Zap,
      grad: 'from-emerald-500 to-teal-500',
      chip: 'CONTROL LOOP',
    },
    {
      n: '04',
      title: 'Managed server-side',
      body: 'Push new dashboards and vote forms from the backend. No app release. No IT ticket. No waiting.',
      icon: Layers,
      grad: 'from-amber-500 to-orange-500',
      chip: 'SERVER-DRIVEN UI',
    },
    {
      n: '05',
      title: 'Safe by design',
      body: 'Role-aware scopes, multi-tenant isolation, audit trails, view-as — ready for the enterprise.',
      icon: ShieldCheck,
      grad: 'from-rose-500 to-fuchsia-500',
      chip: 'SECURITY',
    },
  ];

  return (
    <section ref={ref} className="relative" style={{ height: '420vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-6 w-full mb-10">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-indigo-600 font-semibold mb-3">Flow</div>
              <h2 className="text-5xl md:text-7xl leading-[0.95] tracking-tight text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                From tap <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">to action.</span>
              </h2>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
              <span className="w-8 h-px bg-slate-300" />
              Scroll →
            </div>
          </div>
        </div>

        <motion.div style={{ x }} className="flex gap-6 pl-[6vw] pr-[6vw] will-change-transform">
          {panels.map((p) => (
            <div
              key={p.n}
              className="relative shrink-0 w-[78vw] md:w-[48vw] lg:w-[38vw] h-[60vh] rounded-[2rem] overflow-hidden bg-white border border-slate-200 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)]"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${p.grad} opacity-[0.08]`} />
              <div className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(15,23,42,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.5) 1px, transparent 1px)',
                  backgroundSize: '36px 36px',
                }}
              />
              <div className="relative h-full p-9 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div className="text-[10px] uppercase tracking-[0.22em] font-semibold text-slate-500">{p.chip}</div>
                  <div className={`text-6xl font-bold bg-gradient-to-br ${p.grad} bg-clip-text text-transparent`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {p.n}
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${p.grad} flex items-center justify-center mb-8 shadow-lg`}>
                  <p.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-4xl md:text-5xl leading-[1.02] text-slate-900 mb-4 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                  {p.title}
                </h3>
                <p className="text-slate-600 text-lg leading-relaxed max-w-md">{p.body}</p>
                <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-slate-700">
                  Learn more <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- Kinetic scrolling marquee ---------------- */
function KineticBand() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x1 = useTransform(scrollYProgress, [0, 1], ['5%', '-35%']);
  const x2 = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);
  return (
    <section ref={ref} className="relative py-24 overflow-hidden border-y border-slate-200/80 bg-white">
      <motion.div style={{ x: x1 }} className="whitespace-nowrap text-[10vw] leading-none font-semibold tracking-tight text-slate-900 mb-4" aria-hidden>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Every occupant · Every zone ·&nbsp;
          <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">Every second</span>
          &nbsp;· Every occupant · Every zone ·
        </span>
      </motion.div>
      <motion.div style={{ x: x2 }} className="whitespace-nowrap text-[10vw] leading-none font-semibold tracking-tight text-slate-200" aria-hidden>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          &nbsp;Listens · Responds · Every vote, an action · Listens · Responds ·&nbsp;
        </span>
      </motion.div>
    </section>
  );
}

/* ---------------- Main page ---------------- */
export default function LandingKinetic() {
  const reduce = useReducedMotion();

  useEffect(() => {
    const id = 'comfortos-velocity-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);

  // Counter for CTA
  const [votes, setVotes] = useState(2478921);
  useEffect(() => {
    const id = setInterval(() => setVotes((v) => v + Math.floor(Math.random() * 4) + 1), 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="min-h-screen bg-white text-slate-900 antialiased selection:bg-indigo-200/60"
      style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
    >
      <style>{`
        .grotesk { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.02em; }
        @keyframes vel-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes vel-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
      `}</style>

      <VariationsNav active="kinetic" />

      {/* Nav */}
      <header className="sticky top-10 z-30 border-b border-slate-200/70" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(14px)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="text-lg tracking-tight font-semibold text-slate-900 grotesk">ComfortOS</span>
            <span className="hidden sm:inline-block text-[11px] uppercase tracking-[0.18em] text-slate-400 ml-2">V3 · Velocity</span>
          </Link>
          <nav className="hidden md:flex items-center gap-9 text-sm text-slate-600">
            <a href="#flow" className="hover:text-slate-900 transition">Flow</a>
            <a href="#live" className="hover:text-slate-900 transition">Live</a>
            <a href="#stack" className="hover:text-slate-900 transition">Stack</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden sm:inline-block text-sm text-slate-700 hover:text-slate-900 px-3 py-2">Sign in</Link>
            <Link
              to="/signup"
              className="relative inline-flex items-center gap-1.5 text-sm font-semibold text-white pl-4 pr-3 py-2 rounded-full overflow-hidden group"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #d946ef)' }}
            >
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition" />
              Get started <ArrowRight className="h-3.5 w-3.5 relative" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden">
        {/* Ambient gradient orbs */}
        <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden>
          <div className="absolute -top-40 left-1/4 w-[32rem] h-[32rem] rounded-full blur-[120px] opacity-60"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35), transparent 60%)' }} />
          <div className="absolute top-40 right-0 w-[28rem] h-[28rem] rounded-full blur-[120px] opacity-50"
            style={{ background: 'radial-gradient(circle, rgba(217,70,239,0.28), transparent 60%)' }} />
          <div className="absolute bottom-0 left-0 w-[24rem] h-[24rem] rounded-full blur-[120px] opacity-40"
            style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.28), transparent 60%)' }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 pl-1.5 pr-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700 mb-8 shadow-sm"
            >
              <span className="rounded-full px-2 py-0.5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white">New</span>
              Your thermostat stops being passive-aggressive
            </motion.div>

            <h1 className="grotesk text-[11vw] md:text-[88px] lg:text-[104px] leading-[0.92] tracking-tight font-semibold text-slate-900">
              {['Feel it.', 'Vote it.', 'Fix it.'].map((line, li) => (
                <motion.span
                  key={line}
                  initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.8, delay: 0.15 + li * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="block"
                >
                  {li === 2 ? (
                    <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent italic font-light">
                      {line}
                    </span>
                  ) : (
                    line
                  )}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="mt-8 text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl"
            >
              Your building listens. Your spaces respond. Every occupant becomes a live sensor — so the building learns, adjusts and improves in real time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="mt-10 flex flex-wrap gap-3"
            >
              <Link
                to="/signup"
                className="relative inline-flex items-center gap-2 text-white px-6 py-3.5 rounded-full text-[15px] font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #d946ef)' }}
              >
                Launch ComfortOS <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#flow"
                className="inline-flex items-center gap-2 border border-slate-300 bg-white text-slate-800 px-6 py-3.5 rounded-full text-[15px] font-semibold hover:border-slate-900 transition"
              >
                See the flow
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500"
            >
              {['Real-time', 'Role-aware', 'Server-driven', 'Multi-tenant'].map((it) => (
                <span key={it} className="inline-flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-600" />
                  </span>
                  {it}
                </span>
              ))}
            </motion.div>
          </div>

          <div className="lg:col-span-6 relative">
            <ParallaxHero reduce={reduce ?? false} />
          </div>
        </div>
      </section>

      {/* Live ticker */}
      <section id="live" className="relative py-16 border-y border-slate-200/70" style={{ background: 'linear-gradient(180deg, #ffffff, #f8fafc)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-indigo-600 font-semibold mb-3">Live now</div>
              <h2 className="grotesk text-3xl md:text-5xl font-semibold tracking-tight text-slate-900">
                The heartbeat of your <span className="italic font-normal text-slate-500">portfolio.</span>
              </h2>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <Activity className="h-3.5 w-3.5" /> Updated every 1.4s
            </div>
          </div>
          <LiveTicker />
        </div>
      </section>

      {/* Horizontal pinned showcase */}
      <div id="flow">
        <HorizontalShowcase />
      </div>

      {/* Kinetic band */}
      <KineticBand />

      {/* Trio — voice · impact · floor (kinetic) */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(700px 340px at 20% 15%, rgba(124,58,237,0.10), transparent 60%), radial-gradient(700px 340px at 85% 85%, rgba(14,165,233,0.10), transparent 60%)',
          }}
        />
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mb-14 md:mb-16"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 pl-1.5 pr-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700 mb-5 shadow-sm">
              <span className="rounded-full px-2 py-0.5 text-white" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed,#d946ef)' }}>
                Loop
              </span>
              Why occupants actually use it
            </div>
            <h2 className="grotesk text-4xl md:text-6xl leading-[0.98] tracking-tight font-semibold text-slate-900">
              Your voice.{' '}
              <span
                className="bg-clip-text text-transparent italic font-light"
                style={{ backgroundImage: 'linear-gradient(135deg,#4f46e5,#7c3aed,#d946ef)' }}
              >
                Your impact.
              </span>{' '}
              <span
                className="bg-clip-text text-transparent italic font-light"
                style={{ backgroundImage: 'linear-gradient(135deg,#0ea5e9,#10b981)' }}
              >
                Your floor.
              </span>
            </h2>
            <p className="mt-5 text-lg text-slate-600 max-w-2xl leading-relaxed">
              ComfortOS isn&apos;t a suggestion box. Every vote belongs to the person
              who filed it, leads to a visible building action, and sits alongside
              the feelings of everyone else in the same space.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Card I — Voice */}
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="relative rounded-3xl bg-white border border-slate-200 p-7 overflow-hidden group"
            >
              <div
                aria-hidden
                className="absolute -top-20 -right-20 h-48 w-48 rounded-full opacity-40 blur-3xl"
                style={{ background: 'radial-gradient(closest-side, rgba(124,58,237,0.5), transparent)' }}
              />
              <div className="relative">
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white mb-5"
                  style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed,#d946ef)' }}
                >
                  I · Your voice
                </div>
                <h3 className="grotesk text-2xl font-semibold tracking-tight text-slate-900 mb-2">
                  Anonymous. Five seconds. Done.
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-5">
                  One tap, one feeling, one space. Your vote is yours — not your
                  manager&apos;s, not HR&apos;s.
                </p>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-3">
                    <span>Thermal · 4E</span>
                    <span className="inline-flex items-center gap-1 text-violet-700 font-semibold">
                      <ShieldCheck className="h-3 w-3" />
                      Anonymous
                    </span>
                  </div>
                  <div className="flex justify-between gap-1">
                    {['−3', '−2', '−1', '0', '+1', '+2', '+3'].map((v, i) => (
                      <div
                        key={v}
                        className={`flex-1 rounded-lg text-[11px] font-semibold py-1.5 text-center tabular-nums ${
                          i === 5
                            ? 'text-white shadow-lg shadow-violet-500/30'
                            : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                        style={
                          i === 5
                            ? { background: 'linear-gradient(135deg,#4f46e5,#7c3aed,#d946ef)' }
                            : undefined
                        }
                      >
                        {v}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-[11px] text-slate-500">
                    Your history → kept private
                  </div>
                </div>
              </div>
            </motion.article>

            {/* Card II — Impact */}
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="relative rounded-3xl bg-white border border-slate-200 p-7 overflow-hidden group"
            >
              <div
                aria-hidden
                className="absolute -top-20 -right-20 h-48 w-48 rounded-full opacity-40 blur-3xl"
                style={{ background: 'radial-gradient(closest-side, rgba(14,165,233,0.5), transparent)' }}
              />
              <div className="relative">
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white mb-5"
                  style={{ background: 'linear-gradient(135deg,#0ea5e9,#06b6d4,#22d3ee)' }}
                >
                  II · Your impact
                </div>
                <h3 className="grotesk text-2xl font-semibold tracking-tight text-slate-900 mb-2">
                  Every vote traces to an action.
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-5">
                  Not a ticket. Not a &ldquo;we&apos;ll look into it.&rdquo; A setpoint
                  moves, and you see it happen.
                </p>

                <ol className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  {[
                    { t: 'You voted warm (+2)', s: '09:42 · Floor 4E', dot: 'from-slate-700 to-slate-900' },
                    { t: 'Setpoint −0.5°C', s: '09:44 · HVAC Zone 4E', dot: 'from-amber-400 to-orange-500' },
                    { t: '23.1°C · −0.3°', s: '09:47 · sensor confirms', dot: 'from-emerald-400 to-teal-500' },
                  ].map((row, i) => (
                    <li
                      key={row.t}
                      className={`flex items-start gap-3 px-4 py-3 ${
                        i > 0 ? 'border-t border-slate-100' : ''
                      }`}
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 rounded-full shrink-0 bg-gradient-to-br ${row.dot}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-slate-900 tabular-nums">
                          {row.t}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{row.s}</div>
                      </div>
                    </li>
                  ))}
                </ol>
                <div
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white"
                  style={{ background: 'linear-gradient(135deg,#0ea5e9,#06b6d4)' }}
                >
                  <Check className="h-3 w-3" />
                  Loop closed in 5&nbsp;min
                </div>
              </div>
            </motion.article>

            {/* Card III — Floor */}
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="relative rounded-3xl bg-white border border-slate-200 p-7 overflow-hidden group"
            >
              <div
                aria-hidden
                className="absolute -top-20 -right-20 h-48 w-48 rounded-full opacity-40 blur-3xl"
                style={{ background: 'radial-gradient(closest-side, rgba(16,185,129,0.5), transparent)' }}
              />
              <div className="relative">
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white mb-5"
                  style={{ background: 'linear-gradient(135deg,#10b981,#22c55e,#84cc16)' }}
                >
                  III · Your floor
                </div>
                <h3 className="grotesk text-2xl font-semibold tracking-tight text-slate-900 mb-2">
                  You&apos;re not the only one feeling it.
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-5">
                  Agreement gives your vote weight — and turns comfort into a shared
                  project, not a private gripe.
                </p>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-3">
                    <span>Floor 4 · right now</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                      </span>
                      Live
                    </span>
                  </div>

                  <div className="flex h-7 w-full overflow-hidden rounded-full border border-slate-200">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '18%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="flex items-center justify-center text-[10px] font-semibold text-white tabular-nums"
                      style={{ background: 'linear-gradient(135deg,#0ea5e9,#22d3ee)' }}
                    >
                      18%
                    </motion.div>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '45%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
                      className="flex items-center justify-center text-[10px] font-semibold text-white tabular-nums"
                      style={{ background: 'linear-gradient(135deg,#10b981,#22c55e)' }}
                    >
                      45%
                    </motion.div>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '37%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.85, delay: 0.2, ease: 'easeOut' }}
                      className="flex items-center justify-center text-[10px] font-semibold text-white tabular-nums"
                      style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)' }}
                    >
                      37%
                    </motion.div>
                  </div>
                  <div className="mt-2 flex justify-between text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    <span>Cold</span>
                    <span>Neutral</span>
                    <span>Warm</span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[
                        { n: 'NU', grad: 'from-indigo-600 via-violet-600 to-fuchsia-600' },
                        { n: 'AR', grad: 'from-amber-400 to-orange-500' },
                        { n: 'JL', grad: 'from-sky-500 to-cyan-400' },
                        { n: 'MK', grad: 'from-rose-400 to-pink-500' },
                        { n: 'SS', grad: 'from-emerald-500 to-teal-500' },
                      ].map((a) => (
                        <div
                          key={a.n}
                          className={`h-7 w-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-semibold tabular-nums text-white bg-gradient-to-br ${a.grad}`}
                        >
                          {a.n}
                        </div>
                      ))}
                      <div className="h-7 px-2 rounded-full border-2 border-white bg-slate-100 text-slate-700 flex items-center text-[10px] font-semibold tabular-nums">
                        +9
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-600 leading-tight">
                      <span className="font-semibold text-slate-900">14 others</span> voted
                      the same as you today.
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      {/* Stack section */}
      <section id="stack" className="py-28 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mb-14"
          >
            <div className="text-[11px] uppercase tracking-[0.2em] text-indigo-600 font-semibold mb-4">Built right</div>
            <h2 className="grotesk text-4xl md:text-6xl font-semibold leading-[1.02] tracking-tight text-slate-900">
              Engineered for <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">every floor.</span>
            </h2>
            <p className="mt-5 text-lg text-slate-600">Battery-friendly. Offline-first. Multi-tenant by default. A platform that respects both occupants and operators.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Layers, title: 'Server-driven UI', body: 'Roll out new vote forms and dashboards without shipping an app update.', grad: 'from-indigo-500 to-violet-600' },
              { icon: ShieldCheck, title: 'Privacy first', body: 'Zone-level resolution, per-tenant isolation, audit trails, view-as safe mode.', grad: 'from-emerald-500 to-teal-500' },
              { icon: Sun, title: 'Offline-friendly', body: 'Votes queue locally and sync the moment you are back on the network.', grad: 'from-amber-500 to-orange-500' },
              { icon: Users, title: 'Role-aware', body: 'Occupant, FM, tenant admin, building admin — scoped to what they should see.', grad: 'from-sky-500 to-cyan-500' },
              { icon: Gauge, title: 'Low-latency loop', body: 'Median 4.2 seconds from a vote to a setpoint change in the right zone.', grad: 'from-rose-500 to-fuchsia-500' },
              { icon: Sparkles, title: 'Insightful, not noisy', body: 'Trends and hotspots — not another dashboard nobody opens.', grad: 'from-violet-500 to-purple-600' },
            ].map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                className="group relative rounded-2xl bg-white border border-slate-200 p-6 overflow-hidden hover:border-slate-300 transition"
              >
                <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${s.grad} opacity-10 blur-2xl group-hover:opacity-25 transition`} />
                <div className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center mb-5 shadow-md`}>
                  <s.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="relative font-semibold text-slate-900 mb-2 text-lg grotesk">{s.title}</h3>
                <p className="relative text-sm text-slate-600 leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-[2.5rem] p-12 md:p-20 text-center"
            style={{
              background:
                'radial-gradient(circle at 20% 0%, rgba(99,102,241,0.25), transparent 60%), radial-gradient(circle at 80% 100%, rgba(217,70,239,0.25), transparent 60%), linear-gradient(180deg, #0f172a, #1e1b4b)',
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
              }}
            />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-200 mb-6">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-300 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-400" />
                </span>
                <DigitRoller value={votes} size="sm" /> votes captured
              </div>
              <h2 className="grotesk text-5xl md:text-7xl font-semibold tracking-tight leading-[0.98] text-white mb-6">
                Your building. <br />
                <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent italic font-light">At your fingertips.</span>
              </h2>
              <p className="text-slate-300 max-w-xl mx-auto mb-10 text-lg">
                Spin up a tenant in a minute. Wire up existing HVAC without replacing it. Ship comfort updates like software.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3.5 rounded-full font-semibold hover:bg-slate-100 transition"
                >
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 border border-white/25 text-white px-6 py-3.5 rounded-full font-semibold hover:bg-white/10 transition"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-slate-200/70 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white flex items-center justify-center">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            <span>ComfortOS — Smart Building Platform</span>
          </div>
          <div className="tracking-[0.2em] uppercase text-[11px]">V3 · Velocity</div>
        </div>
      </footer>
    </div>
  );
}
