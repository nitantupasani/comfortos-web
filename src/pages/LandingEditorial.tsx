import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import {
  Building2,
  Thermometer,
  ArrowRight,
  ArrowUpRight,
  Vote,
  BarChart3,
  Layers,
  ShieldCheck,
  Gauge,
  Settings2,
  Check,
} from 'lucide-react';
import VariationsNav from '../components/landing/VariationsNav';

const features = [
  { n: '01', icon: Thermometer, title: 'Real-time comfort voting', body: 'Occupants report thermal, air, lighting and acoustic comfort in seconds.' },
  { n: '02', icon: BarChart3, title: 'Analytics that matter', body: 'Turn votes and sensor data into clear trends, hotspots and actions.' },
  { n: '03', icon: Layers, title: 'Server-driven UI', body: 'Dashboards and vote forms configured centrally, delivered on the fly.' },
  { n: '04', icon: ShieldCheck, title: 'Role-based access', body: 'Scoped experiences for occupants, FMs and admins, with safe view-as.' },
  { n: '05', icon: Gauge, title: 'Presence-aware', body: 'Location and presence signals tie feedback to the right space.' },
  { n: '06', icon: Settings2, title: 'Configurable per tenant', body: 'Each tenant gets its own dashboard, vote schema and rules.' },
];

export default function LandingEditorial() {
  const reduce = useReducedMotion();

  useEffect(() => {
    const id = 'comfortos-editorial-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Serif:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);

  const fade: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };
  const stagger: Variants = { show: { transition: { staggerChildren: 0.06 } } };

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const serif = "'IBM Plex Serif', Georgia, 'Times New Roman', serif";
  const sans = "'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
  const mono = "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace";

  return (
    <div
      className="min-h-screen bg-[#FAFAF7] text-stone-900 antialiased"
      style={{ fontFamily: sans }}
    >
      <VariationsNav active="editorial" />

      {/* Masthead */}
      <header className="sticky top-10 z-30 bg-[#FAFAF7]/90 backdrop-blur border-b border-stone-900/10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5" aria-label="ComfortOS home">
            <div className="w-7 h-7 rounded-sm bg-stone-900 text-[#FAFAF7] flex items-center justify-center">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            <span
              className="text-[19px] tracking-tight"
              style={{ fontFamily: serif, fontWeight: 600 }}
            >
              ComfortOS
            </span>
          </Link>
          <nav
            className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.18em] text-stone-600"
            style={{ fontFamily: mono }}
          >
            <a href="#features" className="hover:text-stone-900">Features</a>
            <a href="#how" className="hover:text-stone-900">Method</a>
            <a href="#numbers" className="hover:text-stone-900">Numbers</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm text-stone-700 hover:text-stone-900 px-3 py-2">
              Sign in
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 text-sm font-medium bg-stone-900 text-[#FAFAF7] px-4 py-2 rounded-none hover:bg-stone-800"
            >
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Edition bar */}
      <div
        className="border-b border-stone-900/10 bg-[#FAFAF7]"
        style={{ fontFamily: mono }}
      >
        <div className="max-w-6xl mx-auto px-6 h-9 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-stone-500">
          <span>Vol. 01 — Issue 04</span>
          <span className="hidden sm:inline">{today}</span>
          <span>comfortos.app / § Landing</span>
        </div>
      </div>

      {/* Hero */}
      <section className="border-b border-stone-900/10">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-6xl mx-auto px-6 pt-14 md:pt-20 pb-14 md:pb-20 grid grid-cols-12 gap-x-6 gap-y-10"
        >
          {/* Kicker column */}
          <motion.div
            variants={fade}
            className="col-span-12 md:col-span-3 md:border-r md:border-stone-900/10 md:pr-6"
          >
            <div
              className="text-[10px] uppercase tracking-[0.28em] text-stone-500 mb-3"
              style={{ fontFamily: mono }}
            >
              § 01 · Manifesto
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">
              A newspaper for the building. Every occupant files a dispatch. Every system
              reads, reacts, and files back.
            </p>
            <p
              className="mt-4 text-[13px] text-stone-600 italic leading-relaxed border-l-2 border-primary-600 pl-3"
              style={{ fontFamily: serif }}
            >
              &ldquo;Hot take: the room should know the room is hot.&rdquo;
              <span className="block not-italic mt-1 text-[10px] uppercase tracking-[0.22em] text-stone-400" style={{ fontFamily: mono }}>
                — the editors
              </span>
            </p>
            <div className="mt-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-stone-500" style={{ fontFamily: mono }}>
              <span className="h-px w-6 bg-stone-400" />
              Smart buildings, listening back
            </div>
          </motion.div>

          {/* Headline column */}
          <motion.div variants={fade} className="col-span-12 md:col-span-9">
            <h1
              className="text-[44px] sm:text-[64px] md:text-[84px] leading-[0.95] tracking-[-0.02em] text-stone-900"
              style={{ fontFamily: serif, fontWeight: 600 }}
            >
              Your building <em className="italic text-primary-700">listens.</em>
              <br />
              Your spaces <em className="italic text-primary-700">respond.</em>
            </h1>

            <div className="mt-8 grid grid-cols-12 gap-6">
              <p className="col-span-12 md:col-span-7 text-[17px] text-stone-700 leading-relaxed">
                ComfortOS closes the loop between occupants, facility managers and
                building systems — so comfort feedback turns into action, in real time.
                One live page the whole building reads from.
              </p>
              <div
                className="col-span-12 md:col-span-5 text-[12px] text-stone-600 space-y-2 md:border-l md:border-stone-900/10 md:pl-6"
                style={{ fontFamily: mono }}
              >
                <div className="flex justify-between">
                  <span className="uppercase tracking-[0.2em] text-stone-500">Votes / wk</span>
                  <span className="text-stone-900 font-medium">8,421</span>
                </div>
                <div className="flex justify-between">
                  <span className="uppercase tracking-[0.2em] text-stone-500">Median response</span>
                  <span className="text-stone-900 font-medium">4.2s</span>
                </div>
                <div className="flex justify-between">
                  <span className="uppercase tracking-[0.2em] text-stone-500">Zones covered</span>
                  <span className="text-stone-900 font-medium">142</span>
                </div>
                <div className="flex justify-between">
                  <span className="uppercase tracking-[0.2em] text-stone-500">Tenants</span>
                  <span className="text-stone-900 font-medium">17</span>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-stone-900 text-[#FAFAF7] px-5 py-3 text-sm font-medium hover:bg-stone-800"
              >
                Subscribe — Get started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 border border-stone-900/20 text-stone-800 px-5 py-3 text-sm font-medium hover:border-stone-900/50"
              >
                Sign in
              </Link>
              <span
                className="text-[10px] uppercase tracking-[0.22em] text-stone-500 ml-2"
                style={{ fontFamily: mono }}
              >
                ↘ Reading time: 3 min
              </span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Lead story — phone vote + dashboard spread (editorial) */}
      <section id="numbers" className="border-b border-stone-900/10 bg-[#F3EEE4]">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-12 gap-6 mb-10">
            <div className="col-span-12 md:col-span-4">
              <div
                className="text-[10px] uppercase tracking-[0.28em] text-stone-500 mb-3"
                style={{ fontFamily: mono }}
              >
                § 02 · Dispatch from the building
              </div>
              <h2
                className="text-3xl md:text-4xl leading-tight tracking-tight text-stone-900"
                style={{ fontFamily: serif, fontWeight: 500 }}
              >
                The vote, and the building&apos;s reply.
              </h2>
            </div>
            <p className="col-span-12 md:col-span-7 md:col-start-6 text-[15px] text-stone-700 leading-relaxed">
              An occupant files a comfort vote from Floor&nbsp;4&nbsp;East. In the span
              of a coffee break, the platform aggregates it, flags the zone, and hands
              facility management a single, pre-filled action.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-6 items-start">
            {/* Phone vote card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="col-span-12 md:col-span-5 relative"
            >
              <div
                className="text-[10px] uppercase tracking-[0.22em] text-stone-500 mb-3"
                style={{ fontFamily: mono }}
              >
                Fig. 01 — Occupant vote, 9:42
              </div>
              <div className="relative mx-auto max-w-sm">
                <div className="border border-stone-900/15 bg-white p-4 shadow-[0_20px_60px_-20px_rgba(30,25,20,0.25)]">
                  <div className="border border-stone-900/10 bg-stone-50/60 p-5">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-sm bg-stone-900 text-[#FAFAF7] flex items-center justify-center">
                          <Building2 className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="text-[10px] font-medium text-stone-500 leading-none" style={{ fontFamily: mono }}>
                            OCEAN HOUSE
                          </div>
                          <div className="text-[12px] font-semibold text-stone-900 leading-tight mt-0.5" style={{ fontFamily: serif }}>
                            Floor 4 · East wing
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] font-medium text-stone-500 tabular-nums" style={{ fontFamily: mono }}>
                        09:42
                      </div>
                    </div>

                    <div className="text-[15px] font-medium text-stone-900 mb-1" style={{ fontFamily: serif }}>
                      How&apos;s the comfort right now?
                    </div>
                    <div className="text-[11px] text-stone-500 mb-4" style={{ fontFamily: mono }}>
                      Tap your feeling — it&apos;s anonymous.
                    </div>

                    <div className="flex justify-between gap-1 mb-2">
                      {['−3', '−2', '−1', '0', '+1', '+2', '+3'].map((v, i) => (
                        <div
                          key={v}
                          className={`flex-1 text-[11px] font-semibold py-2 text-center tabular-nums ${
                            i === 5
                              ? 'bg-stone-900 text-[#FAFAF7]'
                              : 'bg-white border border-stone-900/15 text-stone-700'
                          }`}
                          style={{ fontFamily: mono }}
                        >
                          {v}
                        </div>
                      ))}
                    </div>
                    <div
                      className="flex items-center justify-between text-[10px] text-stone-500 mb-5 px-1 uppercase tracking-[0.18em]"
                      style={{ fontFamily: mono }}
                    >
                      <span>Cold</span>
                      <span>Neutral</span>
                      <span>Hot</span>
                    </div>

                    <div className="border border-stone-900/10 bg-white p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-primary-50 flex items-center justify-center">
                        <Thermometer className="h-4 w-4 text-primary-700" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[12px] font-semibold text-stone-900 tabular-nums" style={{ fontFamily: mono }}>
                          Thermal · 23.4°C
                        </div>
                        <div className="text-[10px] text-stone-500 tabular-nums" style={{ fontFamily: mono }}>
                          48% RH · CO₂ 612 ppm
                        </div>
                      </div>
                      <div
                        className="text-[10px] font-semibold text-primary-700 uppercase tracking-[0.22em]"
                        style={{ fontFamily: mono }}
                      >
                        Live
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating "vote received" slip */}
                <div
                  className="absolute -bottom-4 -right-3 bg-white border border-stone-900/15 shadow-lg px-3 py-2 flex items-center gap-2"
                  style={{ fontFamily: mono }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-600" />
                  </span>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-stone-900 font-semibold">
                    Vote filed · +2
                  </div>
                </div>

                {/* Floating FM action slip */}
                <div
                  className="absolute -top-4 -left-5 bg-white border border-stone-900/15 shadow-lg px-3 py-2 flex items-center gap-2 max-w-[220px]"
                  style={{ fontFamily: mono }}
                >
                  <div className="w-6 h-6 rounded-sm bg-orange-50 flex items-center justify-center">
                    <Gauge className="h-3.5 w-3.5 text-orange-700" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-stone-900 font-semibold leading-tight">
                      FM action queued
                    </div>
                    <div className="text-[10px] text-stone-500 leading-tight">
                      Lower setpoint · 0.5°C
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Compact dashboard clipping */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="col-span-12 md:col-span-7"
            >
              <div
                className="text-[10px] uppercase tracking-[0.22em] text-stone-500 mb-3"
                style={{ fontFamily: mono }}
              >
                Fig. 02 — Comfort desk, same 4 minutes later
              </div>
              <div className="border border-stone-900/15 bg-white shadow-[0_20px_60px_-20px_rgba(30,25,20,0.20)]">
                <div
                  className="border-b border-stone-900/10 px-4 py-2.5 flex items-center justify-between bg-stone-50/60 text-[10px] uppercase tracking-[0.22em] text-stone-500"
                  style={{ fontFamily: mono }}
                >
                  <span>comfortos.app / dashboard</span>
                  <span className="inline-flex items-center gap-1.5 text-primary-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                    Streaming
                  </span>
                </div>

                <div className="p-5 md:p-6 space-y-4">
                  {/* Title row */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div
                        className="text-[10px] font-medium text-stone-500 uppercase tracking-[0.22em]"
                        style={{ fontFamily: mono }}
                      >
                        Ocean House · Overview
                      </div>
                      <div
                        className="text-lg md:text-xl tracking-tight text-stone-900"
                        style={{ fontFamily: serif, fontWeight: 500 }}
                      >
                        Comfort dashboard
                      </div>
                    </div>
                    <div className="flex items-center gap-2" style={{ fontFamily: mono }}>
                      <div className="px-2.5 py-1 border border-stone-900/15 text-[11px] font-medium text-stone-700 inline-flex items-center gap-1">
                        All buildings <span className="text-stone-400">▾</span>
                      </div>
                      <div className="px-2.5 py-1 border border-stone-900/15 text-[11px] font-medium text-stone-700 inline-flex items-center gap-1">
                        Last 24h <span className="text-stone-400">▾</span>
                      </div>
                    </div>
                  </div>

                  {/* KPI row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-stone-900/10">
                    {[
                      { k: 'Comfort index', v: '78', sub: '+4 vs yesterday', tone: 'text-primary-700' },
                      { k: 'Votes today', v: '1,284', sub: 'across 7 floors', tone: 'text-stone-600' },
                      { k: 'Response time', v: '6m 42s', sub: 'median FM reply', tone: 'text-stone-600' },
                      { k: 'Zones flagged', v: '03', sub: '2 warm · 1 cold', tone: 'text-orange-700' },
                    ].map((kpi, i) => (
                      <div
                        key={kpi.k}
                        className={`p-4 ${
                          i > 0 ? 'md:border-l border-stone-900/10' : ''
                        }`}
                      >
                        <div
                          className="text-[10px] uppercase tracking-[0.22em] text-stone-500"
                          style={{ fontFamily: mono }}
                        >
                          {kpi.k}
                        </div>
                        <div
                          className="mt-1.5 text-2xl tracking-tight text-stone-900 tabular-nums"
                          style={{ fontFamily: serif, fontWeight: 600 }}
                        >
                          {kpi.v}
                        </div>
                        <div
                          className={`mt-1 text-[10px] uppercase tracking-[0.18em] ${kpi.tone}`}
                          style={{ fontFamily: mono }}
                        >
                          {kpi.sub}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chart + zones */}
                  <div className="grid grid-cols-12 gap-0 border-t border-stone-900/10">
                    <div className="col-span-12 lg:col-span-8 p-4 lg:border-r border-stone-900/10">
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div>
                          <div
                            className="text-[11px] font-semibold text-stone-900"
                            style={{ fontFamily: mono }}
                          >
                            Comfort trend
                          </div>
                          <div
                            className="text-[10px] uppercase tracking-[0.18em] text-stone-500"
                            style={{ fontFamily: mono }}
                          >
                            Per floor · last 7 days
                          </div>
                        </div>
                        <div
                          className="flex items-center gap-3 text-[10px] text-stone-600"
                          style={{ fontFamily: mono }}
                        >
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-primary-700" /> Floor 2
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-primary-300" /> Floor 4
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-orange-400" /> Floor 7
                          </span>
                        </div>
                      </div>
                      <svg viewBox="0 0 400 110" className="w-full h-24">
                        <line x1="0" y1="20" x2="400" y2="20" stroke="#e7e5e4" strokeWidth="1" />
                        <line x1="0" y1="55" x2="400" y2="55" stroke="#e7e5e4" strokeWidth="1" />
                        <line x1="0" y1="90" x2="400" y2="90" stroke="#e7e5e4" strokeWidth="1" />
                        <polyline fill="none" stroke="#245740" strokeWidth="1.75" strokeLinejoin="round" points="0,60 40,52 80,55 120,48 160,42 200,40 240,35 280,30 320,28 360,24 400,22" />
                        <polyline fill="none" stroke="#70c1b3" strokeWidth="1.75" strokeLinejoin="round" points="0,72 40,68 80,70 120,62 160,60 200,58 240,55 280,50 320,48 360,45 400,42" />
                        <polyline fill="none" stroke="#fb923c" strokeWidth="1.75" strokeLinejoin="round" points="0,50 40,56 80,48 120,62 160,70 200,66 240,72 280,70 320,80 360,76 400,82" />
                      </svg>
                      <div
                        className="flex justify-between text-[10px] text-stone-400 mt-1 px-1 uppercase tracking-[0.18em]"
                        style={{ fontFamily: mono }}
                      >
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                      </div>
                    </div>

                    <div className="col-span-12 lg:col-span-4 p-4 border-t lg:border-t-0 border-stone-900/10">
                      <div className="flex items-center justify-between mb-3" style={{ fontFamily: mono }}>
                        <div className="text-[11px] font-semibold text-stone-900">Zones flagged</div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-primary-700">View all →</div>
                      </div>
                      <ul className="space-y-3 text-xs" style={{ fontFamily: sans }}>
                        {[
                          { z: 'Floor 4 · East wing', m: '14 votes · 18m ago', tag: 'Warm', tagBg: 'bg-orange-50', tagFg: 'text-orange-700' },
                          { z: 'Floor 2 · Atrium', m: '8 votes · 34m ago', tag: 'Cold', tagBg: 'bg-blue-50', tagFg: 'text-blue-700' },
                          { z: 'Floor 7 · Lab 3', m: '21 votes · 47m ago', tag: 'Warm', tagBg: 'bg-orange-50', tagFg: 'text-orange-700' },
                        ].map((z) => (
                          <li key={z.z} className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-medium text-stone-900 truncate">{z.z}</div>
                              <div className="text-[10px] text-stone-500" style={{ fontFamily: mono }}>
                                {z.m}
                              </div>
                            </div>
                            <span
                              className={`text-[10px] px-2 py-0.5 ${z.tagBg} ${z.tagFg} font-semibold shrink-0 uppercase tracking-[0.18em]`}
                              style={{ fontFamily: mono }}
                            >
                              {z.tag}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Live activity */}
                  <div className="border-t border-stone-900/10 pt-4">
                    <div className="flex items-center justify-between mb-3" style={{ fontFamily: mono }}>
                      <div className="text-[11px] font-semibold text-stone-900">Live activity</div>
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-primary-700 uppercase tracking-[0.18em]">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75 animate-ping" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-600" />
                        </span>
                        Streaming
                      </div>
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-stone-600">
                      {[
                        { icon: Vote, bg: 'bg-primary-50', fg: 'text-primary-700', t: '+2 vote · Floor 4 East', s: 'Thermal · 2m ago' },
                        { icon: Gauge, bg: 'bg-orange-50', fg: 'text-orange-700', t: 'Setpoint lowered 0.5°C', s: 'HVAC · Zone 4E · 3m ago' },
                        { icon: Thermometer, bg: 'bg-blue-50', fg: 'text-blue-700', t: 'Atrium flagged cold', s: '8 votes · 34m ago' },
                      ].map((it) => (
                        <li key={it.t} className="flex items-start gap-2">
                          <div className={`w-6 h-6 rounded-sm ${it.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                            <it.icon className={`h-3 w-3 ${it.fg}`} />
                          </div>
                          <div>
                            <div className="text-stone-900 font-medium">{it.t}</div>
                            <div className="text-stone-500" style={{ fontFamily: mono }}>
                              {it.s}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trio — voice · impact · floor */}
      <section className="border-b border-stone-900/10">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <div className="grid grid-cols-12 gap-6 mb-10 md:mb-14">
            <div className="col-span-12 md:col-span-4">
              <div
                className="text-[10px] uppercase tracking-[0.28em] text-stone-500 mb-3"
                style={{ fontFamily: mono }}
              >
                § 03 · What it feels like
              </div>
              <h2
                className="text-3xl md:text-4xl tracking-tight leading-tight text-stone-900"
                style={{ fontFamily: serif, fontWeight: 500 }}
              >
                Your voice. Your impact. Your floor.
              </h2>
            </div>
            <p className="col-span-12 md:col-span-7 md:col-start-6 text-[15px] text-stone-700 leading-relaxed">
              ComfortOS isn&apos;t a suggestion box. Every vote belongs to the person who
              filed it, leads to a visible building action, and sits alongside the
              feelings of everyone else in the same space.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-0 border-t border-stone-900/15">
            {/* Card 1: Voice (autonomy) */}
            <motion.article
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5 }}
              className="col-span-12 md:col-span-4 py-10 md:pr-8 md:border-r border-stone-900/15 border-b md:border-b-0"
            >
              <div
                className="text-[10px] uppercase tracking-[0.28em] text-stone-500 mb-4"
                style={{ fontFamily: mono }}
              >
                I · Your voice
              </div>
              <h3
                className="text-2xl leading-tight tracking-tight text-stone-900 mb-3"
                style={{ fontFamily: serif, fontWeight: 500 }}
              >
                Anonymous. Five seconds. <em className="italic text-primary-700">Done.</em>
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-5">
                One tap, one feeling, one space. Your vote is yours — not your
                manager&apos;s, not HR&apos;s, not a survey.
              </p>

              <div className="border border-stone-900/15 p-4 bg-stone-50/60">
                <div
                  className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-stone-500 mb-3"
                  style={{ fontFamily: mono }}
                >
                  <span>Thermal · Floor 4E</span>
                  <span className="inline-flex items-center gap-1 text-primary-700">
                    <ShieldCheck className="h-3 w-3" />
                    Anonymous
                  </span>
                </div>
                <div className="flex justify-between gap-1 mb-2">
                  {['−3', '−2', '−1', '0', '+1', '+2', '+3'].map((v, i) => (
                    <div
                      key={v}
                      className={`flex-1 text-[10px] font-semibold py-1.5 text-center tabular-nums ${
                        i === 5
                          ? 'bg-stone-900 text-[#FAFAF7]'
                          : 'bg-white border border-stone-900/15 text-stone-600'
                      }`}
                      style={{ fontFamily: mono }}
                    >
                      {v}
                    </div>
                  ))}
                </div>
                <div
                  className="mt-3 text-[10px] uppercase tracking-[0.22em] text-stone-500"
                  style={{ fontFamily: mono }}
                >
                  Your history → kept private
                </div>
              </div>
            </motion.article>

            {/* Card 2: Impact (competence) */}
            <motion.article
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="col-span-12 md:col-span-4 py-10 md:px-8 md:border-r border-stone-900/15 border-b md:border-b-0"
            >
              <div
                className="text-[10px] uppercase tracking-[0.28em] text-stone-500 mb-4"
                style={{ fontFamily: mono }}
              >
                II · Your impact
              </div>
              <h3
                className="text-2xl leading-tight tracking-tight text-stone-900 mb-3"
                style={{ fontFamily: serif, fontWeight: 500 }}
              >
                Every vote traces to an <em className="italic text-primary-700">action.</em>
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-5">
                Not a ticket. Not a &quot;we&apos;ll look into it.&quot; A setpoint
                moves, air flows, temperature changes — and you see it happen.
              </p>

              <ol className="border border-stone-900/15 bg-stone-50/60 divide-y divide-stone-900/10">
                {[
                  { t: 'You voted warm (+2)', s: '09:42 · Floor 4E', dot: 'bg-stone-900' },
                  { t: 'Setpoint −0.5°C', s: '09:44 · HVAC Zone 4E', dot: 'bg-primary-600' },
                  { t: '23.1°C · −0.3°', s: '09:47 · sensor confirms', dot: 'bg-primary-300' },
                ].map((row) => (
                  <li key={row.t} className="flex items-start gap-3 px-4 py-3">
                    <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${row.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-stone-900 tabular-nums">
                        {row.t}
                      </div>
                      <div
                        className="text-[10px] uppercase tracking-[0.22em] text-stone-500 mt-0.5"
                        style={{ fontFamily: mono }}
                      >
                        {row.s}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <div
                className="mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-primary-700"
                style={{ fontFamily: mono }}
              >
                <Check className="h-3 w-3" />
                Loop closed in 5&nbsp;min
              </div>
            </motion.article>

            {/* Card 3: Floor (relatedness) */}
            <motion.article
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="col-span-12 md:col-span-4 py-10 md:pl-8"
            >
              <div
                className="text-[10px] uppercase tracking-[0.28em] text-stone-500 mb-4"
                style={{ fontFamily: mono }}
              >
                III · Your floor
              </div>
              <h3
                className="text-2xl leading-tight tracking-tight text-stone-900 mb-3"
                style={{ fontFamily: serif, fontWeight: 500 }}
              >
                You&apos;re not the only one <em className="italic text-primary-700">feeling it.</em>
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-5">
                See how the whole floor feels right now. Agreement gives your
                vote weight — and makes comfort a shared project, not a private
                gripe.
              </p>

              <div className="border border-stone-900/15 bg-stone-50/60 p-4">
                <div
                  className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-stone-500 mb-3"
                  style={{ fontFamily: mono }}
                >
                  <span>Floor 4 · right now</span>
                  <span className="inline-flex items-center gap-1 text-primary-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                    Live
                  </span>
                </div>

                {/* Distribution bar */}
                <div className="flex h-6 w-full overflow-hidden border border-stone-900/10">
                  <div className="bg-blue-400/70 flex items-center justify-center text-[9px] font-semibold text-white tabular-nums" style={{ width: '18%' }}>
                    18%
                  </div>
                  <div className="bg-primary-500/80 flex items-center justify-center text-[9px] font-semibold text-white tabular-nums" style={{ width: '45%' }}>
                    45%
                  </div>
                  <div className="bg-orange-400/80 flex items-center justify-center text-[9px] font-semibold text-white tabular-nums" style={{ width: '37%' }}>
                    37%
                  </div>
                </div>
                <div
                  className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.22em] text-stone-500"
                  style={{ fontFamily: mono }}
                >
                  <span>Cold</span>
                  <span>Neutral</span>
                  <span>Warm</span>
                </div>

                {/* Avatar cluster */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['NU', 'AR', 'JL', 'MK', 'SS'].map((n, i) => (
                      <div
                        key={n}
                        className={`h-6 w-6 rounded-full border-2 border-stone-50 flex items-center justify-center text-[9px] font-semibold tabular-nums ${
                          i === 0 ? 'bg-stone-900 text-[#FAFAF7]' : 'bg-orange-100 text-orange-800'
                        }`}
                        style={{ fontFamily: mono }}
                      >
                        {n}
                      </div>
                    ))}
                    <div
                      className="h-6 px-2 rounded-full border-2 border-stone-50 bg-stone-200 text-stone-700 flex items-center text-[9px] font-semibold tabular-nums"
                      style={{ fontFamily: mono }}
                    >
                      +9
                    </div>
                  </div>
                  <div className="text-[11px] text-stone-700 leading-tight">
                    <span className="font-semibold text-stone-900">14 others</span>{' '}
                    <span className="text-stone-500">voted the same as you today.</span>
                  </div>
                </div>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      {/* Features — footnote style grid */}
      <section id="features" className="border-b border-stone-900/10">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <div className="grid grid-cols-12 gap-6 mb-10 md:mb-14">
            <div className="col-span-12 md:col-span-4">
              <div
                className="text-[10px] uppercase tracking-[0.28em] text-stone-500 mb-3"
                style={{ fontFamily: mono }}
              >
                § 04 · Method
              </div>
              <h2
                className="text-3xl md:text-4xl tracking-tight leading-tight"
                style={{ fontFamily: serif, fontWeight: 500 }}
              >
                A single platform for comfort, analytics&nbsp;&amp;&nbsp;control.
              </h2>
            </div>
            <p className="col-span-12 md:col-span-7 md:col-start-6 text-[15px] text-stone-700 leading-relaxed">
              ComfortOS unifies feedback, presence, sensor data and configuration — so
              every stakeholder works from the same live picture. No dashboards that
              disagree; no meetings to reconcile what the building actually feels like.
            </p>
          </div>

          <ol className="grid grid-cols-12 gap-x-6 gap-y-0 border-t border-stone-900/15">
            {features.map((f) => (
              <motion.li
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="col-span-12 md:col-span-6 lg:col-span-4 py-8 border-b border-stone-900/15 lg:[&:nth-child(-n+3)]:border-t-0 md:[&:nth-child(odd)]:lg:border-r-0 lg:[&:nth-child(3n+1)]:pr-6 lg:[&:nth-child(3n)]:pl-6 lg:[&:nth-child(3n+2)]:px-6 lg:border-r lg:last:border-r-0 lg:[&:nth-child(3n)]:border-r-0"
              >
                <div className="flex items-start gap-5">
                  <div
                    className="text-[11px] uppercase tracking-[0.22em] text-stone-400 mt-1 shrink-0"
                    style={{ fontFamily: mono }}
                  >
                    {f.n}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <f.icon className="h-4 w-4 text-primary-700" />
                      <h3
                        className="text-xl tracking-tight"
                        style={{ fontFamily: serif, fontWeight: 500 }}
                      >
                        {f.title}
                      </h3>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed">{f.body}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* Live dispatch quote */}
      <section className="border-b border-stone-900/10">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-3">
            <div
              className="text-[10px] uppercase tracking-[0.28em] text-stone-500"
              style={{ fontFamily: mono }}
            >
              § 05 · Dispatch
            </div>
          </div>
          <figure className="col-span-12 md:col-span-9">
            <blockquote
              className="text-2xl md:text-4xl leading-[1.2] tracking-tight text-stone-900"
              style={{ fontFamily: serif, fontWeight: 500 }}
            >
              <span className="text-primary-700">“</span>The atrium flagged cold at 10:04.
              By 10:08 setpoint was down 0.5°C and the FM had already approved it. That
              never used to happen in our building.<span className="text-primary-700">”</span>
            </blockquote>
            <figcaption
              className="mt-6 flex items-center gap-4 text-[11px] uppercase tracking-[0.22em] text-stone-500"
              style={{ fontFamily: mono }}
            >
              <span className="h-px w-8 bg-stone-400" />
              Facility Manager · Tenant A · Floor 4
            </figcaption>
          </figure>
        </div>
      </section>

      {/* CTA */}
      <section id="how" className="bg-[#FAFAF7]">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-8">
            <div
              className="text-[10px] uppercase tracking-[0.28em] text-stone-500 mb-3"
              style={{ fontFamily: mono }}
            >
              § 06 · Continue reading
            </div>
            <h2
              className="text-4xl md:text-6xl leading-[1.02] tracking-tight text-stone-900"
              style={{ fontFamily: serif, fontWeight: 600 }}
            >
              Ready to close the
              <br />
              comfort <em className="italic text-primary-700">loop?</em>
            </h2>
            <p className="mt-5 max-w-xl text-stone-700">
              Create an account in a minute, or sign in to pick up where you left off.
            </p>
          </div>
          <div className="col-span-12 md:col-span-4 flex md:justify-end">
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-between gap-6 bg-stone-900 text-[#FAFAF7] px-6 py-4 text-sm font-medium hover:bg-stone-800"
              >
                Get started
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-between gap-6 border border-stone-900/20 text-stone-800 px-6 py-4 text-sm font-medium hover:border-stone-900/50"
              >
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div
                className="mt-1 text-[10px] uppercase tracking-[0.22em] text-stone-500"
                style={{ fontFamily: mono }}
              >
                <Vote className="inline h-3 w-3 mr-1 -mt-0.5" />
                No credit card. Cancel any time.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Colophon / footer */}
      <footer className="border-t border-stone-900/10 bg-[#FAFAF7]">
        <div
          className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px] uppercase tracking-[0.22em] text-stone-500"
          style={{ fontFamily: mono }}
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-sm bg-stone-900 text-[#FAFAF7] flex items-center justify-center">
              <Building2 className="h-3 w-3" />
            </div>
            <span>ComfortOS — Smart Building Platform</span>
          </div>
          <div>Variation 04 — Editorial</div>
        </div>
      </footer>
    </div>
  );
}
