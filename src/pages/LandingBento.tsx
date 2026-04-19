import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  useMotionValue,
  useInView,
} from 'framer-motion';
import {
  Building2,
  ArrowRight,
  ArrowUpRight,
  Thermometer,
  Wind,
  Sun,
  Volume2,
  Users,
  Gauge,
  Sparkles,
  Check,
  MapPin,
  Vote,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import VariationsNav from '../components/landing/VariationsNav';

/* ---------------- Count-up ---------------- */
function CountUp({ to, suffix = '', duration = 1.6 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    let raf = 0;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ---------------- Marquee row ---------------- */
function Marquee({ items }: { items: { icon: typeof Thermometer; label: string }[] }) {
  const loop = [...items, ...items, ...items];
  return (
    <div className="relative overflow-hidden py-2" aria-hidden>
      <div
        className="flex gap-10 whitespace-nowrap will-change-transform"
        style={{
          animation: 'signal-marquee 38s linear infinite',
        }}
      >
        {loop.map((it, i) => (
          <span key={i} className="inline-flex items-center gap-2.5 text-[15px] tracking-tight text-stone-500">
            <it.icon className="h-4 w-4 text-stone-400" />
            {it.label}
            <span className="mx-4 text-stone-300">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Pinned device mock ---------------- */
function PhoneFrame({ step }: { step: 0 | 1 | 2 }) {
  return (
    <div className="relative w-[260px] h-[540px] rounded-[44px] bg-stone-900 p-2.5 shadow-[0_40px_100px_-20px_rgba(28,25,23,0.35)]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 rounded-b-2xl bg-stone-900 z-10" />
      <div className="relative w-full h-full rounded-[36px] bg-[#FAFAF7] overflow-hidden">
        {/* Step 0: Presence */}
        <motion.div
          initial={false}
          animate={{ opacity: step === 0 ? 1 : 0, y: step === 0 ? 0 : -20 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-6 ring-1 ring-primary-100">
            <MapPin className="w-7 h-7 text-primary-700" />
          </div>
          <div className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-2">You're in</div>
          <div className="text-2xl font-semibold text-stone-900 mb-1" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Floor 4 · East Wing
          </div>
          <div className="text-sm text-stone-500 mb-8">Arrived 2 minutes ago</div>
          <div className="w-full space-y-2">
            <div className="h-2 w-2/3 rounded-full bg-stone-200 mx-auto" />
            <div className="h-2 w-1/2 rounded-full bg-stone-200 mx-auto" />
          </div>
        </motion.div>

        {/* Step 1: Vote */}
        <motion.div
          initial={false}
          animate={{ opacity: step === 1 ? 1 : 0, y: step === 1 ? 0 : 20 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex flex-col p-6"
        >
          <div className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-1">How does it feel?</div>
          <div className="text-xl text-stone-900 mb-5" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Thermal comfort
          </div>
          <div className="flex items-end justify-between gap-1.5 h-32 mb-5">
            {[-3, -2, -1, 0, 1, 2, 3].map((v) => {
              const active = v === 2;
              const h = 30 + Math.abs(v) * 9;
              const color =
                v < -1 ? 'bg-blue-200' : v > 1 ? 'bg-amber-300' : 'bg-primary-200';
              const colorActive =
                v < -1 ? 'bg-blue-500' : v > 1 ? 'bg-amber-500' : 'bg-primary-500';
              return (
                <motion.div
                  key={v}
                  animate={{ height: active ? '100%' : `${h}%`, opacity: active ? 1 : 0.6 }}
                  transition={{ duration: 0.5, delay: step === 1 ? 0.1 + Math.abs(v) * 0.05 : 0 }}
                  className={`flex-1 rounded-md ${active ? colorActive : color}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-stone-400 mb-6 px-0.5">
            <span>Cold</span>
            <span>Neutral</span>
            <span>Hot</span>
          </div>
          <button className="mt-auto w-full py-3 rounded-xl bg-stone-900 text-white text-sm font-medium">
            Submit vote · +2 Warm
          </button>
        </motion.div>

        {/* Step 2: Response */}
        <motion.div
          initial={false}
          animate={{ opacity: step === 2 ? 1 : 0, y: step === 2 ? 0 : 20 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex flex-col p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-600" />
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary-700 font-semibold">Live</span>
          </div>
          <div className="text-xl text-stone-900 mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Building responding
          </div>
          <div className="space-y-3 text-xs">
            {[
              { t: 'Setpoint lowered 0.5°C', s: 'Zone 4E · now', c: 'bg-blue-50 text-blue-700' },
              { t: 'Airflow increased', s: 'VAV 4E-02 · 3s ago', c: 'bg-primary-50 text-primary-700' },
              { t: '8 similar votes flagged', s: 'Comfort team notified', c: 'bg-amber-50 text-amber-700' },
            ].map((row, i) => (
              <motion.div
                key={row.t}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: step === 2 ? 1 : 0, x: step === 2 ? 0 : 12 }}
                transition={{ delay: step === 2 ? 0.1 + i * 0.1 : 0 }}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-100"
              >
                <div className={`w-6 h-6 rounded-md ${row.c} flex items-center justify-center shrink-0`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-stone-900 font-medium">{row.t}</div>
                  <div className="text-stone-500 mt-0.5">{row.s}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-auto pt-4 text-[11px] text-stone-400">Action completed in 4.2s</div>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------------- Feature tilt card ---------------- */
function TiltCard({
  icon: Icon,
  title,
  body,
  delay = 0,
  className = '',
}: {
  icon: typeof Thermometer;
  title: string;
  body: string;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rxS = useSpring(rx, { stiffness: 140, damping: 14 });
  const ryS = useSpring(ry, { stiffness: 140, damping: 14 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    ry.set((x - 0.5) * 10);
    rx.set(-(y - 0.5) * 10);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rxS, rotateY: ryS, transformPerspective: 900 }}
      className={`relative rounded-3xl bg-white border border-stone-200/70 p-7 overflow-hidden group ${className}`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-primary-50/60 via-transparent to-transparent" />
      <div className="relative">
        <div className="w-11 h-11 rounded-2xl bg-stone-900 text-white flex items-center justify-center mb-5 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-xl text-stone-900 mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
          {title}
        </h3>
        <p className="text-sm text-stone-600 leading-relaxed">{body}</p>
      </div>
      <ArrowUpRight className="absolute top-6 right-6 w-4 h-4 text-stone-300 group-hover:text-stone-900 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition" />
    </motion.div>
  );
}

/* ---------------- Main page ---------------- */
export default function LandingBento() {
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = 'comfortos-signal-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap';
    document.head.appendChild(link);
  }, []);

  // Hero scroll-linked
  const { scrollYProgress: heroP } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(heroP, [0, 1], [0, -120]);
  const heroScale = useTransform(heroP, [0, 1], [1, 0.94]);
  const heroOpacity = useTransform(heroP, [0, 0.85], [1, 0]);

  // Story scroll-linked (3 steps)
  const { scrollYProgress: storyP } = useScroll({
    target: storyRef,
    offset: ['start start', 'end end'],
  });
  const [stepState, setStepState] = useState<0 | 1 | 2>(0);
  useEffect(() => {
    return storyP.on('change', (v) => {
      if (v < 0.33) setStepState(0);
      else if (v < 0.66) setStepState(1);
      else setStepState(2);
    });
  }, [storyP]);

  const sensors = [
    { icon: Thermometer, label: 'Thermal comfort' },
    { icon: Wind, label: 'Air quality · CO₂' },
    { icon: Sun, label: 'Lighting' },
    { icon: Volume2, label: 'Acoustic' },
    { icon: Users, label: 'Occupancy · presence' },
    { icon: Gauge, label: 'HVAC setpoints' },
  ];

  return (
    <div
      className="min-h-screen text-stone-900 antialiased selection:bg-primary-200/60"
      style={{
        background: '#FAFAF7',
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <style>{`
        @keyframes signal-marquee { from{transform:translateX(0)} to{transform:translateX(-33.333%)} }
        @keyframes signal-draw { to { stroke-dashoffset: 0; } }
        .serif { font-family: 'Instrument Serif', serif; letter-spacing: -0.01em; }
      `}</style>

      <VariationsNav active="bento" />

      {/* Nav */}
      <header className="sticky top-10 z-30 border-b border-stone-200/70" style={{ background: 'rgba(250,250,247,0.8)', backdropFilter: 'blur(14px)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="text-lg tracking-tight font-medium text-stone-900">ComfortOS</span>
            <span className="hidden sm:inline-block text-[11px] uppercase tracking-[0.18em] text-stone-400 ml-2">V2 · Signal</span>
          </Link>
          <nav className="hidden md:flex items-center gap-9 text-sm text-stone-600">
            <a href="#how" className="hover:text-stone-900 transition">How it works</a>
            <a href="#features" className="hover:text-stone-900 transition">Platform</a>
            <a href="#numbers" className="hover:text-stone-900 transition">Numbers</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden sm:inline-block text-sm text-stone-700 hover:text-stone-900 px-3 py-2">Sign in</Link>
            <Link to="/signup" className="inline-flex items-center gap-1.5 text-sm font-medium bg-stone-900 text-white pl-4 pr-3 py-2 rounded-full hover:bg-stone-800 transition">
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — editorial, big serif, pinned transforms on scroll */}
      <section ref={heroRef} className="relative min-h-[100vh] flex items-center pt-10 pb-20 overflow-hidden">
        {/* Soft wash */}
        <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden>
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[90vw] max-w-[1200px] h-[520px] rounded-full blur-3xl opacity-50"
            style={{ background: 'radial-gradient(ellipse at center, rgba(54,128,92,0.18), transparent 60%)' }} />
          <div className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(68,64,60,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(68,64,60,0.5) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
              maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 35%, transparent 75%)',
            }}
          />
        </div>

        <motion.div
          style={{ y: reduce ? 0 : heroY, scale: reduce ? 1 : heroScale, opacity: heroOpacity }}
          className="max-w-6xl mx-auto px-6 w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-stone-600 shadow-sm">
              <Sparkles className="h-3 w-3 text-primary-600" />
              Your building was never dumb. Just quiet.
            </span>
          </motion.div>

          <h1 className="text-center serif leading-[0.98] tracking-tight text-stone-900 text-[15vw] md:text-[120px] lg:text-[148px] font-normal">
            <motion.span
              initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              Comfort,
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="block italic text-primary-700"
            >
              authored by everyone.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-10 mx-auto max-w-2xl text-center text-lg text-stone-600 leading-relaxed"
          >
            ComfortOS turns every occupant into a sensor. One tap becomes a setpoint change, a flagged zone, a measurable improvement — in real time, across every floor.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            <Link to="/signup" className="inline-flex items-center gap-2 bg-stone-900 text-white px-6 py-3.5 rounded-full text-[15px] font-medium hover:bg-stone-800 transition shadow-[0_10px_30px_-10px_rgba(28,25,23,0.5)]">
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how" className="inline-flex items-center gap-2 border border-stone-300 bg-white text-stone-800 px-6 py-3.5 rounded-full text-[15px] font-medium hover:border-stone-900 transition">
              See how it works
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-16 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-stone-400"
          >
            <span>Scroll</span>
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block w-px h-6 bg-stone-400"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Sensor marquee band */}
      <section className="border-y border-stone-200/70 bg-white/60 py-6">
        <div className="max-w-7xl mx-auto px-6 mb-3 flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-[0.2em] text-stone-400">Things the building now has opinions on</div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-stone-400">Yes, all of them · in real time</div>
        </div>
        <Marquee items={sensors} />
      </section>

      {/* Pinned scroll narrative — the hero section of the page */}
      <section id="how" ref={storyRef} className="relative" style={{ height: '300vh' }}>
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: phone */}
            <div className="flex justify-center lg:justify-start relative">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <PhoneFrame step={stepState} />
              </motion.div>
              {/* Trailing blob */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl opacity-60 -z-10"
                style={{ background: 'radial-gradient(circle, rgba(54,128,92,0.22), transparent 60%)' }} />
            </div>

            {/* Right: step panels */}
            <div className="relative h-[560px]">
              {[
                {
                  eyebrow: '01 · Presence',
                  title: 'It knows where you are.',
                  body:
                    'BLE, Wi-Fi, and optional QR check-ins tie every vote to the right floor, zone and HVAC circuit. Feedback is never orphaned — it becomes actionable data.',
                  badge: { icon: MapPin, text: 'Zone-level accuracy' },
                },
                {
                  eyebrow: '02 · Voice',
                  title: 'One tap is the interview.',
                  body:
                    'A 7-point comfort scale. Four dimensions — thermal, air, light, acoustic. A vote schema configurable per tenant. No surveys, no friction.',
                  badge: { icon: Vote, text: '4-second median' },
                },
                {
                  eyebrow: '03 · Response',
                  title: 'The building moves.',
                  body:
                    'Setpoints shift, alerts route, facility teams get a clear next action. Every action is attributed back to the occupants who asked for it.',
                  badge: { icon: Zap, text: 'Median 4.2s to action' },
                },
              ].map((st, i) => (
                <motion.div
                  key={st.title}
                  initial={false}
                  animate={{
                    opacity: stepState === i ? 1 : 0,
                    y: stepState === i ? 0 : stepState < i ? 40 : -40,
                    filter: stepState === i ? 'blur(0px)' : 'blur(6px)',
                  }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex flex-col justify-center"
                >
                  <div className="text-[11px] uppercase tracking-[0.2em] text-primary-700 font-semibold mb-5">{st.eyebrow}</div>
                  <h2 className="serif text-5xl md:text-6xl leading-[1.02] text-stone-900 mb-6">
                    {st.title}
                  </h2>
                  <p className="text-lg text-stone-600 max-w-lg leading-relaxed mb-7">{st.body}</p>
                  <div className="inline-flex items-center gap-2 self-start rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700">
                    <st.badge.icon className="h-4 w-4 text-primary-700" />
                    {st.badge.text}
                  </div>
                </motion.div>
              ))}

              {/* Progress rail */}
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 h-48 w-px bg-stone-200 hidden lg:block">
                <motion.div
                  className="w-px bg-primary-600 origin-top"
                  style={{ height: '100%', scaleY: storyP }}
                />
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="absolute -left-[5px] w-[11px] h-[11px] rounded-full border-2 border-stone-300 bg-white"
                    style={{ top: `${i * 50}%`, borderColor: stepState >= i ? '#2d6b4d' : undefined, background: stepState >= i ? '#2d6b4d' : '#fff' }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trio — voice · impact · floor (editorial bento) */}
      <section className="relative py-24 md:py-32 bg-[#FAFAF7]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mb-14 md:mb-20"
          >
            <div className="text-[11px] uppercase tracking-[0.2em] text-primary-700 font-semibold mb-4">
              The loop, chapter by chapter
            </div>
            <h2 className="serif text-5xl md:text-6xl leading-[1.04] text-stone-900">
              Your voice.{' '}
              <span className="italic text-primary-700">Your impact.</span>
              <br />
              Your floor.
            </h2>
            <p className="mt-5 text-lg text-stone-600 max-w-2xl leading-relaxed">
              ComfortOS isn&apos;t a suggestion box. Every vote belongs to the person
              who filed it, leads to a visible building action, and sits alongside the
              feelings of everyone else in the same space.
            </p>
          </motion.div>

          {/* Asymmetric bento — I and III tall, II wide under */}
          <div className="grid grid-cols-12 gap-4 md:gap-5">
            {/* Card I — Voice (tall, left) */}
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="col-span-12 md:col-span-6 lg:col-span-4 rounded-3xl bg-white border border-stone-200/70 p-7 md:p-8 relative"
            >
              <div className="text-[11px] uppercase tracking-[0.2em] text-stone-500 font-semibold mb-5">
                Chapter I · Your voice
              </div>
              <h3 className="serif text-3xl md:text-4xl leading-[1.05] text-stone-900 mb-3">
                Anonymous. Five seconds. <span className="italic text-primary-700">Done.</span>
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-6">
                One tap, one feeling, one space. Your vote is yours — not your
                manager&apos;s, not HR&apos;s.
              </p>

              <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-stone-500 mb-3">
                  <span>Thermal · 4E</span>
                  <span className="inline-flex items-center gap-1 text-primary-700 font-semibold">
                    <ShieldCheck className="h-3 w-3" />
                    Anonymous
                  </span>
                </div>
                <div className="flex justify-between gap-1">
                  {['−3', '−2', '−1', '0', '+1', '+2', '+3'].map((v, i) => (
                    <div
                      key={v}
                      className={`flex-1 rounded-md text-[11px] font-semibold py-2 text-center tabular-nums ${
                        i === 5
                          ? 'bg-stone-900 text-white shadow-sm'
                          : 'bg-white border border-stone-200 text-stone-600'
                      }`}
                    >
                      {v}
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-[11px] text-stone-500 italic serif">
                  Your history — kept private.
                </div>
              </div>
              <ArrowUpRight className="absolute top-6 right-6 w-4 h-4 text-stone-300" />
            </motion.article>

            {/* Card II — Impact (tall, middle) */}
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="col-span-12 md:col-span-6 lg:col-span-4 rounded-3xl bg-stone-900 text-stone-100 p-7 md:p-8 relative overflow-hidden"
            >
              <div
                aria-hidden
                className="absolute inset-0 opacity-25 -z-0"
                style={{
                  background:
                    'radial-gradient(360px 160px at 70% 0%, rgba(112,193,179,0.4), transparent), radial-gradient(260px 140px at 10% 100%, rgba(255,255,255,0.2), transparent)',
                }}
              />
              <div className="relative">
                <div className="text-[11px] uppercase tracking-[0.2em] text-primary-300 font-semibold mb-5">
                  Chapter II · Your impact
                </div>
                <h3 className="serif text-3xl md:text-4xl leading-[1.05] text-white mb-3">
                  Every vote traces to an <span className="italic text-primary-300">action.</span>
                </h3>
                <p className="text-sm text-stone-300 leading-relaxed mb-6">
                  Not a ticket. Not a &ldquo;we&apos;ll look into it.&rdquo; A setpoint
                  moves, and you see it happen.
                </p>

                <ol className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
                  {[
                    { t: 'You voted warm (+2)', s: '09:42 · Floor 4E', dot: 'bg-stone-300' },
                    { t: 'Setpoint −0.5°C', s: '09:44 · HVAC Zone 4E', dot: 'bg-amber-300' },
                    { t: '23.1°C · −0.3°', s: '09:47 · sensor confirms', dot: 'bg-primary-300' },
                  ].map((row, i) => (
                    <li
                      key={row.t}
                      className={`flex items-start gap-3 px-4 py-3 ${
                        i > 0 ? 'border-t border-white/5' : ''
                      }`}
                    >
                      <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${row.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-white tabular-nums">
                          {row.t}
                        </div>
                        <div className="text-[11px] text-stone-400 mt-0.5">{row.s}</div>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary-300/15 text-primary-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] border border-primary-300/20">
                  <Check className="h-3 w-3" />
                  Loop closed in 5&nbsp;min
                </div>
              </div>
            </motion.article>

            {/* Card III — Floor (tall, right) */}
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="col-span-12 md:col-span-12 lg:col-span-4 rounded-3xl bg-white border border-stone-200/70 p-7 md:p-8 relative"
            >
              <div className="text-[11px] uppercase tracking-[0.2em] text-stone-500 font-semibold mb-5">
                Chapter III · Your floor
              </div>
              <h3 className="serif text-3xl md:text-4xl leading-[1.05] text-stone-900 mb-3">
                You&apos;re not the only one <span className="italic text-primary-700">feeling it.</span>
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-6">
                Agreement gives your vote weight — and turns comfort into a shared
                project, not a private gripe.
              </p>

              <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-stone-500 mb-3">
                  <span>Floor 4 · right now</span>
                  <span className="inline-flex items-center gap-1 text-primary-700 font-semibold">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-600" />
                    </span>
                    Live
                  </span>
                </div>

                <div className="flex h-7 w-full overflow-hidden rounded-full border border-stone-200">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '18%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="bg-blue-400 flex items-center justify-center text-[10px] font-semibold text-white tabular-nums"
                  >
                    18%
                  </motion.div>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '45%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
                    className="bg-primary-500 flex items-center justify-center text-[10px] font-semibold text-white tabular-nums"
                  >
                    45%
                  </motion.div>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '37%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.85, delay: 0.2, ease: 'easeOut' }}
                    className="bg-amber-400 flex items-center justify-center text-[10px] font-semibold text-white tabular-nums"
                  >
                    37%
                  </motion.div>
                </div>
                <div className="mt-2 flex justify-between text-[11px] uppercase tracking-[0.18em] text-stone-500">
                  <span>Cold</span>
                  <span>Neutral</span>
                  <span>Warm</span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[
                      { n: 'NU', bg: 'bg-stone-900', fg: 'text-white' },
                      { n: 'AR', bg: 'bg-amber-100', fg: 'text-amber-800' },
                      { n: 'JL', bg: 'bg-blue-100', fg: 'text-blue-800' },
                      { n: 'MK', bg: 'bg-rose-100', fg: 'text-rose-800' },
                      { n: 'SS', bg: 'bg-primary-100', fg: 'text-primary-800' },
                    ].map((a) => (
                      <div
                        key={a.n}
                        className={`h-7 w-7 rounded-full border-2 border-stone-50 flex items-center justify-center text-[10px] font-semibold tabular-nums ${a.bg} ${a.fg}`}
                      >
                        {a.n}
                      </div>
                    ))}
                    <div className="h-7 px-2 rounded-full border-2 border-stone-50 bg-stone-100 text-stone-700 flex items-center text-[10px] font-semibold tabular-nums">
                      +9
                    </div>
                  </div>
                  <div className="text-[11px] text-stone-600 leading-tight">
                    <span className="font-semibold text-stone-900">14 others</span> voted
                    the same as you today.
                  </div>
                </div>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      {/* Feature grid — asymmetric, tilt cards */}
      <section id="features" className="relative py-28 md:py-36">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 mb-16"
          >
            <div className="md:col-span-5">
              <div className="text-[11px] uppercase tracking-[0.2em] text-primary-700 font-semibold mb-4">Platform</div>
              <h2 className="serif text-5xl md:text-6xl leading-[1.02] text-stone-900">
                Six primitives.<br /><span className="italic text-stone-500">One building OS.</span>
              </h2>
            </div>
            <p className="md:col-span-6 md:col-start-7 text-lg text-stone-600 leading-relaxed self-end">
              Every ComfortOS deployment is assembled from the same six pieces — arranged in minutes for a single tenant, or scaled across a portfolio.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
            <TiltCard
              icon={Vote}
              title="Real-time comfort voting"
              body="Occupants report thermal, air, light and acoustic comfort in seconds — no surveys, no friction."
              delay={0}
              className="md:col-span-4 md:row-span-2"
            />
            <TiltCard
              icon={Gauge}
              title="Presence-aware"
              body="Every vote is tied to the right zone and HVAC circuit."
              delay={0.05}
              className="md:col-span-2"
            />
            <TiltCard
              icon={Sparkles}
              title="Analytics that matter"
              body="Trends, hotspots, next actions — not dashboards for dashboards."
              delay={0.1}
              className="md:col-span-2"
            />
            <TiltCard
              icon={Users}
              title="Server-driven UI"
              body="Push new vote forms and dashboards centrally — no app release."
              delay={0.15}
              className="md:col-span-3"
            />
            <TiltCard
              icon={Thermometer}
              title="Role-aware access"
              body="Occupant, FM, admin — scoped surfaces with safe view-as."
              delay={0.2}
              className="md:col-span-3"
            />
            <TiltCard
              icon={Wind}
              title="Tenant configurable"
              body="Per-tenant dashboards, vote schema, rules and branding."
              delay={0.25}
              className="md:col-span-3"
            />
            <TiltCard
              icon={Building2}
              title="Portfolio rollups"
              body="From a single zone up to a continent of buildings."
              delay={0.3}
              className="md:col-span-3"
            />
          </div>
        </div>
      </section>

      {/* Numbers — kinetic counters on view */}
      <section id="numbers" className="relative py-28 border-y border-stone-200/70" style={{ background: '#F5F3EE' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-[11px] uppercase tracking-[0.2em] text-primary-700 font-semibold mb-4">Scale</div>
            <h2 className="serif text-5xl md:text-6xl leading-[1.02] text-stone-900">
              Small taps, <span className="italic text-stone-500">compound results.</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {[
              { val: 2400000, suffix: '+', label: 'Comfort votes captured' },
              { val: 178, suffix: '', label: 'Buildings running ComfortOS' },
              { val: 34, suffix: '', label: 'Cities across 3 continents' },
              { val: 42, suffix: '%', label: 'Average complaint reduction' },
            ].map((n, i) => (
              <motion.div
                key={n.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="text-center md:text-left md:border-l md:border-stone-300 md:pl-6"
              >
                <div className="serif text-6xl md:text-7xl leading-none text-stone-900 tabular-nums">
                  <CountUp to={n.val} suffix={n.suffix} />
                </div>
                <div className="mt-4 text-sm text-stone-600 max-w-[180px] md:max-w-none mx-auto md:mx-0">{n.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Voices — editorial quote */}
      <section className="py-28 md:py-36">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex justify-center gap-1 mb-8">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className="text-primary-600 text-lg">✦</span>
              ))}
            </div>
            <blockquote className="serif text-4xl md:text-5xl leading-[1.15] text-stone-900">
              <span className="text-stone-400">“</span>
              We stopped guessing which floors were cold.<br />
              <span className="italic">The votes told us the same hour.</span>
              <span className="text-stone-400">”</span>
            </blockquote>
            <div className="mt-10 flex items-center justify-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-primary-700" />
              <div className="text-left">
                <div className="text-sm font-medium text-stone-900">Lena Okafor</div>
                <div className="text-xs text-stone-500">Facility Director · Rivet Tower</div>
              </div>
            </div>
          </motion.div>
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
            className="relative overflow-hidden rounded-[2.5rem] p-14 md:p-20 text-center"
            style={{
              background: 'radial-gradient(ellipse at top, rgba(54,128,92,0.14), transparent 60%), linear-gradient(to bottom right, #1c1917, #292524)',
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
              <div className="text-[11px] uppercase tracking-[0.2em] text-primary-300 font-semibold mb-5">Ready when you are</div>
              <h2 className="serif text-5xl md:text-7xl leading-[1.02] text-white mb-6">
                Make your building <span className="italic text-primary-300">listen.</span>
              </h2>
              <p className="text-stone-300 max-w-xl mx-auto mb-10 text-lg">
                Spin up a tenant in a minute. No HVAC rewiring. No year-long rollouts.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/signup" className="inline-flex items-center gap-2 bg-white text-stone-900 px-6 py-3.5 rounded-full font-medium hover:bg-primary-50 transition">
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className="inline-flex items-center gap-2 border border-white/25 text-white px-6 py-3.5 rounded-full font-medium hover:bg-white/10 transition">
                  Sign in
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-stone-200/70 py-10" style={{ background: '#F5F3EE' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-stone-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-stone-900 text-white flex items-center justify-center">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            <span>ComfortOS — Smart Building Platform</span>
          </div>
          <div className="tracking-[0.2em] uppercase text-[11px]">V2 · Signal</div>
        </div>
      </footer>
    </div>
  );
}
