import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import LandingAiChat from '../components/common/LandingAiChat';
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDot,
  CloudSun,
  Cpu,
  FileJson,
  Gauge,
  GripVertical,
  Leaf,
  List,
  MessageSquare,
  LayoutDashboard,
  LogIn,
  MapPin,
  Network,
  Plus,
  Radio,
  Server,
  Sliders,
  Tag,
  Thermometer,
  TrendingDown,
  Users,
  Zap,
} from 'lucide-react';

const CALENDLY_URL = 'https://calendly.com/nitantupasani/30min';

const MONO =
  "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const roadmap = [
  {
    phase: 'Shipping',
    items: [
      'HTTPS connector gateway · OAuth2 / bearer / API key / basic',
      'Direct telemetry push API · per-building keyed ingest',
      'Firebase SSO · email + Google (OIDC)',
      'FCM + APNs push notifications',
      'JSON-path mapping + metric/unit normalization',
      'Per-tenant SDUI for dashboards and vote forms',
    ],
  },
  {
    phase: 'In development',
    items: [
      'HMAC + mTLS connector auth (stubs landed)',
      'Presence-aware vote routing',
      'Zone-flag notification rules with thresholds',
      'Vendor cloud adapters: Siemens, Honeywell, JCI (scoping)',
    ],
  },
  {
    phase: 'Roadmap · partner pilots',
    items: [
      'On-prem gateway · BACnet / Modbus → HTTPS egress',
      'Weather-aware setpoint optimization · comfort + energy co-objective',
      'Building physics model inference · thermal mass · solar gain',
      'Energy baseline tracking · per-zone HVAC savings attribution',
      'Policy-bounded write-back with audit trail',
    ],
  },
];

const authModes = [
  { name: 'OAuth2 · Client Credentials', sub: 'M2M token exchange · cached', status: 'shipping' },
  { name: 'Bearer Token', sub: 'static · Authorization header', status: 'shipping' },
  { name: 'API Key', sub: 'custom header · per-connector', status: 'shipping' },
  { name: 'HTTP Basic', sub: 'username:password · base64', status: 'shipping' },
  { name: 'HMAC', sub: 'SHA-256 / SHA-512 body sig', status: 'in dev' },
  { name: 'mTLS', sub: 'client cert · PEM', status: 'in dev' },
];

const researchPillars = [
  {
    icon: Users,
    title: 'Occupant voice is first-class',
    body:
      "Buildings optimize for what they can measure. Adding a low-friction channel for subjective comfort makes occupants a direct input, not a complaint backlog.",
  },
  {
    icon: BarChart3,
    title: 'Standards the industry already uses',
    body:
      'Vote capture maps to the PMV 7-point scale (ISO 7730) and ASHRAE 55 comfort categories, so results compare against the thermal-comfort literature.',
  },
  {
    icon: Sliders,
    title: 'Configuration without code',
    body:
      'Pilot buildings vary. Schema, scale, and surfaces ship from the server so each tenant can tune forms and dashboards without a release.',
  },
  {
    icon: MapPin,
    title: 'Feedback tied to a visible outcome',
    body:
      'Votes roll up to a zone, a floor, a building, and a person sees their signal reflected back. That visibility is what sustains participation over weeks, not days.',
  },
  {
    icon: CloudSun,
    title: 'Energy savings from the same data',
    body:
      'Comfort votes, outside weather conditions, and implicit building physics together reveal when HVAC is over-conditioning. Data-driven setpoint strategies reduce energy consumption while maintaining the comfort occupants actually report.',
  },
];

export default function LandingPlatform() {
  const reduce = useReducedMotion();

  useEffect(() => {
    const id = 'comfortos-platform-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  };
  const stagger: Variants = { show: { transition: { staggerChildren: 0.03 } } };

  return (
    <div
      className="min-h-screen bg-white text-gray-900 antialiased"
      style={{
        fontFamily:
          "'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/85 border-b border-gray-200/70">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" aria-label="ComfortOS home">
            <div className="w-7 h-7 rounded-md bg-teal-600 text-white flex items-center justify-center">
              <Cpu className="h-4 w-4" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight">ComfortOS</span>
            <span
              className="ml-2 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 border border-gray-200 rounded uppercase tracking-wider"
              style={{ fontFamily: MONO }}
            >
              pilot
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-[13px] text-gray-600">
            <a href="#mission" className="hover:text-gray-900 transition">Mission</a>
            <a href="#platform" className="hover:text-gray-900 transition">Platform</a>
            <a href="#solutions" className="hover:text-gray-900 transition">Solutions</a>
            <a href="#research" className="hover:text-gray-900 transition">Research</a>
            <a href="#roadmap" className="hover:text-gray-900 transition">Roadmap</a>
            <Link to="/login" className="hover:text-gray-900 transition">Sign In</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-md transition"
            >
              <LogIn className="h-3.5 w-3.5" />
              Open App
            </Link>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold bg-teal-600 text-white px-3.5 py-1.5 rounded-md hover:bg-teal-700 transition"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Book 30-min Pilot Call
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative border-b border-gray-200/70">
        <div
          className="absolute inset-0 -z-10 opacity-[0.35]"
          aria-hidden
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse at top, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at top, black 30%, transparent 75%)',
          }}
        />

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-14">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="lg:col-span-7"
            >
              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] text-gray-900"
              >
                Buildings that listen.<br />
                <span className="text-teal-600">Occupants that understand.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-6 text-[17px] md:text-lg text-gray-600 leading-relaxed text-justify max-w-[58ch]"
              >
                ComfortOS is the mutual communication layer for smart buildings.
                Occupants share how they feel. The building shares what it knows.
                That same dialogue, combined with outside weather, building
                physics, and live telemetry, drives HVAC strategies that cut
                energy waste while keeping people comfortable. Across a network
                of connected buildings, comfort and efficiency improve together.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-2.5">
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold bg-teal-600 text-white px-4 py-2.5 rounded-md hover:bg-teal-700 transition"
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  Book 30-min Pilot Call
                </a>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold border border-gray-300 bg-white text-gray-800 px-4 py-2.5 rounded-md hover:border-gray-400 hover:bg-gray-50 transition"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Open App
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <a
                  href="#research"
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 px-3 py-2.5 transition"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Research Brief
                </a>
              </motion.div>
            </motion.div>

            {/* Hero right-side visual: occupant vote mock */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="lg:col-span-5 relative hidden lg:block"
            >
              <div className="relative mx-auto max-w-sm">
                <div
                  aria-hidden="true"
                  className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-teal-100/60 via-teal-50/40 to-transparent blur-2xl"
                />
                <div className="rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-900/5 p-4">
                  <div className="rounded-xl bg-gradient-to-b from-teal-50/80 to-white p-5">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-teal-600 text-white flex items-center justify-center">
                          <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="text-[10px] font-medium text-gray-500 leading-none">De Rotterdam</div>
                          <div className="text-[11px] font-semibold text-gray-900 leading-tight">Floor 4 · Oostvleugel</div>
                        </div>
                      </div>
                      <div className="text-[10px] font-medium text-gray-400" style={{ fontFamily: MONO }}>9:42</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 mb-1">How's the comfort right now?</div>
                    <div className="text-[11px] text-gray-500 mb-4">Tap your feeling. It's anonymous.</div>
                    <div className="flex justify-between gap-1 mb-2">
                      {['-3', '-2', '-1', '0', '+1', '+2', '+3'].map((v, i) => (
                        <div
                          key={v}
                          className={`flex-1 rounded-md text-[11px] font-semibold py-2 text-center ${
                            i === 5
                              ? 'bg-teal-600 text-white shadow-sm'
                              : 'bg-white border border-gray-200 text-gray-600'
                          }`}
                          style={{ fontFamily: MONO }}
                        >
                          {v}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mb-5 px-1">
                      <span>Cold</span>
                      <span>Neutral</span>
                      <span>Hot</span>
                    </div>
                    <div className="rounded-lg bg-white border border-gray-200 p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-teal-50 flex items-center justify-center">
                        <Thermometer className="h-4 w-4 text-teal-700" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[11px] font-semibold text-gray-900">Thermal · 23.4°C</div>
                        <div className="text-[10px] text-gray-500">48% RH · CO₂ 612 ppm</div>
                      </div>
                      <div className="text-[10px] font-semibold text-teal-700">Live</div>
                    </div>
                  </div>
                </div>
                {/* Floating "vote received" pill */}
                <div className="absolute -bottom-4 -right-2 bg-white rounded-lg shadow-lg shadow-gray-900/10 border border-gray-200 px-3 py-2 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                  </span>
                  <div className="text-[11px] font-semibold text-gray-800">Vote received · +2</div>
                </div>
                {/* Floating FM action card */}
                <div className="absolute -top-4 -left-6 bg-white rounded-lg shadow-lg shadow-gray-900/10 border border-gray-200 px-3 py-2 flex items-center gap-2 max-w-[200px]">
                  <div className="w-7 h-7 rounded-md bg-orange-50 flex items-center justify-center">
                    <Gauge className="h-3.5 w-3.5 text-orange-600" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-gray-900 leading-tight">FM action queued</div>
                    <div className="text-[10px] text-gray-500 leading-tight">Lower setpoint · 0.5°C</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Two-way communication: occupants ↔ brain ↔ building */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="mt-16"
          >
            <div className="flex items-center justify-between mb-5">
              <div
                className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500"
                style={{ fontFamily: MONO }}
              >
                · two-way communication
              </div>
              <span
                className="text-[11px] text-gray-500"
                style={{ fontFamily: MONO }}
              >
                occupants · comfortOS · building
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.85fr_2.2fr_0.85fr_1fr] gap-3 items-center">

              {/* ==================== OCCUPANTS column (left) ==================== */}
              <motion.div
                variants={fadeUp}
                className="rounded-xl border border-gray-200 bg-gradient-to-br from-teal-50/50 to-white p-4 flex flex-col gap-3 lg:min-h-[300px]"
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-md bg-teal-600 text-white flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[12.5px] font-semibold text-gray-900 leading-tight">Occupants</div>
                    <div className="text-[9.5px] text-gray-500" style={{ fontFamily: MONO }}>each person · the group</div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-evenly gap-3">
                {/* what they send */}
                <div className="rounded-md border border-gray-200 bg-white p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <Radio className="h-3 w-3 text-teal-600" />
                    <span className="text-[9px] uppercase tracking-wider text-gray-600 font-semibold" style={{ fontFamily: MONO }}>vote · how you feel</span>
                  </div>
                  <div className="flex justify-between gap-0.5">
                    {['−3', '−2', '−1', '0', '+1', '+2', '+3'].map((v, i) => (
                      <div
                        key={v}
                        className={`flex-1 rounded text-[8.5px] font-semibold py-0.5 text-center tabular-nums border ${
                          i === 5
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white border-gray-200 text-gray-600'
                        }`}
                        style={{ fontFamily: MONO }}
                      >
                        {v}
                      </div>
                    ))}
                  </div>
                  <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-teal-50 text-teal-700 border border-teal-100 px-1.5 py-0.5 text-[9px] font-semibold">
                    <Thermometer className="h-2.5 w-2.5" />
                    Warm · Sweater
                  </div>
                </div>

                {/* what they receive back */}
                <div className="rounded-md border border-teal-200 bg-teal-50/60 p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <MessageSquare className="h-3 w-3 text-teal-700" />
                    <span className="text-[9px] uppercase tracking-wider text-teal-700 font-semibold" style={{ fontFamily: MONO }}>just for you</span>
                  </div>
                  <div className="text-[10.5px] text-gray-800 leading-snug">
                    Dress light today. Try desk NW-12 — runs cooler at noon.
                  </div>
                </div>
                </div>
              </motion.div>

              {/* ==================== ARROWS · occupants ↔ brain ==================== */}
              <div className="hidden lg:flex flex-col justify-center gap-10 px-1">
                <div className="flex flex-col items-center gap-1">
                  <div className="text-[9.5px] font-semibold uppercase tracking-wider text-teal-700" style={{ fontFamily: MONO }}>
                    comfort feedback
                  </div>
                  <div className="relative w-full flex items-center">
                    <div
                      className="flex-1 h-px rounded-full"
                      style={{ backgroundColor: 'rgba(13,148,136,0.85)' }}
                    />
                    <ChevronRight className="h-3 w-3 text-teal-600 -ml-1 shrink-0" strokeWidth={2} />
                  </div>
                  <div className="text-[8.5px] text-gray-500 text-center" style={{ fontFamily: MONO }}>
                    vote · clothing · location
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="text-[9.5px] font-semibold uppercase tracking-wider text-teal-700" style={{ fontFamily: MONO }}>
                    personalized nudge
                  </div>
                  <div className="relative w-full flex items-center">
                    <ChevronRight className="h-3 w-3 text-teal-600 -mr-1 shrink-0 rotate-180" strokeWidth={2} />
                    <div
                      className="flex-1 h-px rounded-full"
                      style={{ backgroundColor: 'rgba(13,148,136,0.85)' }}
                    />
                  </div>
                  <div className="text-[8.5px] text-gray-500 text-center" style={{ fontFamily: MONO }}>
                    adapt tip · alert · explanation
                  </div>
                </div>
              </div>

              {/* ==================== BRAIN · ComfortOS center (translator infrastructure) ==================== */}
              <motion.div
                variants={fadeUp}
                className="relative rounded-xl border border-gray-200 bg-gradient-to-br from-white via-teal-50/30 to-amber-50/30 overflow-hidden flex flex-col lg:min-h-[428px]"
              >
                {!reduce && (
                  <motion.div
                    aria-hidden
                    className="absolute -inset-6 rounded-[2rem] pointer-events-none z-0"
                    style={{
                      background:
                        'conic-gradient(from 0deg, rgba(13,148,136,0.22), rgba(245,158,11,0.22), rgba(13,148,136,0.22))',
                      filter: 'blur(22px)',
                    }}
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                  />
                )}

                <div className="relative z-10 flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-white/70 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500" />
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-700" style={{ fontFamily: MONO }}>
                      ComfortOS engine · translator infrastructure
                    </span>
                  </div>
                  <Brain className="h-3.5 w-3.5 text-teal-600" />
                </div>

                <div className="relative z-10 p-4 flex flex-col gap-3 flex-1">

                  {/* central brain core + label */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                      {!reduce && (
                        <>
                          <motion.div
                            aria-hidden
                            className="absolute inset-0 rounded-full border-2 border-teal-400/70"
                            animate={{ scale: [1, 1.85], opacity: [0.7, 0] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
                          />
                          <motion.div
                            aria-hidden
                            className="absolute inset-0 rounded-full border-2 border-amber-400/70"
                            animate={{ scale: [1, 1.85], opacity: [0.7, 0] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 1.2 }}
                          />
                        </>
                      )}
                      <motion.div
                        className="relative w-28 h-28 rounded-full bg-gradient-to-br from-teal-600 via-teal-500 to-amber-500 flex items-center justify-center"
                        style={{ boxShadow: '0 14px 32px -6px rgba(13,148,136,0.55), 0 6px 14px rgba(245,158,11,0.4)' }}
                        animate={reduce ? undefined : { scale: [1, 1.04, 1] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Brain className="h-14 w-14 text-white" strokeWidth={1.8} />
                      </motion.div>
                    </div>
                    <div className="text-center">
                      <div className="text-[14px] font-semibold text-gray-900 leading-tight">ComfortOS Brain</div>
                      <div className="text-[10px] text-gray-500 mt-0.5" style={{ fontFamily: MONO }}>
                        translates between people &amp; hardware
                      </div>
                    </div>
                  </div>

                  {/* 2x2 flow grid: the 4 distinct processes */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* ← IN from occupants */}
                    <div className="rounded-md border border-teal-200 bg-white/85 backdrop-blur-sm p-2.5">
                      <div className="flex items-center gap-1 mb-1">
                        <ArrowRight className="h-3 w-3 text-teal-600 shrink-0" />
                        <span className="text-[9.5px] font-semibold uppercase tracking-wider text-teal-700" style={{ fontFamily: MONO }}>
                          from occupants
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-700 leading-snug">
                        ingest votes <span className="font-bold text-gray-500">·</span> update each person's comfort model <span className="font-bold text-gray-500">·</span> aggregate the group
                      </div>
                    </div>

                    {/* ← IN from building */}
                    <div className="rounded-md border border-amber-200 bg-white/85 backdrop-blur-sm p-2.5">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-[9.5px] font-semibold uppercase tracking-wider text-amber-700" style={{ fontFamily: MONO }}>
                          from building
                        </span>
                        <ArrowRight className="h-3 w-3 text-amber-600 rotate-180 shrink-0" />
                      </div>
                      <div className="text-[10px] text-gray-700 leading-snug">
                        ingest BMS telemetry + weather <span className="font-bold text-gray-500">·</span> map to live building state
                      </div>
                    </div>

                    {/* → OUT to occupants */}
                    <div className="rounded-md border border-teal-300 bg-teal-50/60 backdrop-blur-sm p-2.5">
                      <div className="flex items-center gap-1 mb-1">
                        <ArrowRight className="h-3 w-3 text-teal-700 rotate-180 shrink-0" />
                        <span className="text-[9.5px] font-semibold uppercase tracking-wider text-teal-800" style={{ fontFamily: MONO }}>
                          to occupants
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-700 leading-snug">
                        emit personalized messages <span className="font-bold text-gray-500">·</span> explain why <span className="font-bold text-gray-500">·</span> suggest small adapts
                      </div>
                    </div>

                    {/* → OUT to building */}
                    <div className="rounded-md border border-amber-300 bg-amber-50/60 backdrop-blur-sm p-2.5">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-[9.5px] font-semibold uppercase tracking-wider text-amber-800" style={{ fontFamily: MONO }}>
                          to building
                        </span>
                        <ArrowRight className="h-3 w-3 text-amber-700 shrink-0" />
                      </div>
                      <div className="text-[10px] text-gray-700 leading-snug">
                        emit setpoints + policy <span className="font-bold text-gray-500">·</span> comfort band vs. energy budget, rebalanced
                      </div>
                    </div>
                  </div>

                  {/* infrastructure bar */}
                  <div className="mt-auto rounded-md border border-dashed border-gray-300 bg-white/60 backdrop-blur-sm px-3 py-2 flex items-center gap-2">
                    <Cpu className="h-3.5 w-3.5 text-gray-600 shrink-0" />
                    <div className="text-[9.5px] text-gray-600 leading-snug" style={{ fontFamily: MONO }}>
                      infrastructure · connectors · auth · SDUI · push · audit
                    </div>
                    <Network className="h-3.5 w-3.5 text-gray-500 ml-auto shrink-0" />
                  </div>
                </div>
              </motion.div>

              {/* ==================== ARROWS · brain ↔ building ==================== */}
              <div className="hidden lg:flex flex-col justify-center gap-10 px-1">
                <div className="flex flex-col items-center gap-1">
                  <div className="text-[9.5px] font-semibold uppercase tracking-wider text-amber-700" style={{ fontFamily: MONO }}>
                    BMS telemetry
                  </div>
                  <div className="relative w-full flex items-center">
                    <ChevronRight className="h-3 w-3 text-amber-600 -mr-1 shrink-0 rotate-180" strokeWidth={2} />
                    <div
                      className="flex-1 h-px rounded-full"
                      style={{ backgroundColor: 'rgba(245,158,11,0.85)' }}
                    />
                  </div>
                  <div className="text-[8.5px] text-gray-500 text-center" style={{ fontFamily: MONO }}>
                    temp · CO₂ · HVAC · occupancy
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="text-[9.5px] font-semibold uppercase tracking-wider text-amber-700" style={{ fontFamily: MONO }}>
                    setpoints + policy
                  </div>
                  <div className="relative w-full flex items-center">
                    <div
                      className="flex-1 h-px rounded-full"
                      style={{ backgroundColor: 'rgba(245,158,11,0.85)' }}
                    />
                    <ChevronRight className="h-3 w-3 text-amber-600 -ml-1 shrink-0" strokeWidth={2} />
                  </div>
                  <div className="text-[8.5px] text-gray-500 text-center" style={{ fontFamily: MONO }}>
                    comfort band · energy budget
                  </div>
                </div>
              </div>

              {/* ==================== BUILDING column (right) ==================== */}
              <motion.div
                variants={fadeUp}
                className="rounded-xl border border-gray-200 bg-gradient-to-br from-amber-50/50 to-white p-4 flex flex-col gap-3 lg:min-h-[300px]"
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-md bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[12.5px] font-semibold text-gray-900 leading-tight">Building</div>
                    <div className="text-[9.5px] text-gray-500" style={{ fontFamily: MONO }}>BMS · sensors · weather</div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-evenly gap-3">
                <div className="rounded-md border border-gray-200 bg-white p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <Activity className="h-3 w-3 text-amber-600" />
                    <span className="text-[9px] uppercase tracking-wider text-gray-600 font-semibold" style={{ fontFamily: MONO }}>live telemetry</span>
                  </div>
                  <div className="grid grid-cols-6 gap-0.5 mb-1.5">
                    {[
                      'rgba(13,148,136,0.25)', 'rgba(13,148,136,0.35)', 'rgba(245,158,11,0.40)',
                      'rgba(245,158,11,0.55)', 'rgba(245,158,11,0.65)', 'rgba(251,146,60,0.65)',
                    ].map((bg, i) => (
                      <div key={i} className="h-2.5 rounded-sm" style={{ backgroundColor: bg }} />
                    ))}
                  </div>
                  <div className="text-[9px] text-orange-700 font-semibold" style={{ fontFamily: MONO }}>
                    south gain · high
                  </div>
                </div>

                <div className="rounded-md border border-amber-200 bg-amber-50/60 p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <Sliders className="h-3 w-3 text-amber-700" />
                    <span className="text-[9px] uppercase tracking-wider text-amber-700 font-semibold" style={{ fontFamily: MONO }}>setpoint applied</span>
                  </div>
                  <div className="text-[10.5px] text-gray-800 leading-snug">
                    Zone 4-NW · band 21–24&nbsp;°C · pre-cool 12:30
                  </div>
                </div>
                </div>
              </motion.div>

            </div>

            {/* ==================== Outcome bar ==================== */}
            <motion.div
              variants={fadeUp}
              className="mt-5 rounded-xl border border-gray-200 bg-gradient-to-r from-emerald-50/70 via-white to-teal-50/70 p-5"
            >
              <div className="grid md:grid-cols-3 gap-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-md bg-emerald-100 flex items-center justify-center shrink-0">
                    <TrendingDown className="h-4 w-4 text-emerald-700" />
                  </div>
                  <div>
                    <div className="text-[10.5px] font-semibold uppercase tracking-wider text-gray-500">HVAC energy</div>
                    <div className="text-[13.5px] font-semibold text-gray-900 mt-0.5 leading-snug">
                      projected 15 to 30% reduction
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                      once comfort and physics models drive setpoints.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-md bg-teal-100 flex items-center justify-center shrink-0">
                    <Leaf className="h-4 w-4 text-teal-700" />
                  </div>
                  <div>
                    <div className="text-[10.5px] font-semibold uppercase tracking-wider text-gray-500">CO₂ emissions</div>
                    <div className="text-[13.5px] font-semibold text-gray-900 mt-0.5 leading-snug">
                      proportional reduction
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                      scales with local grid mix and gas share.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-md bg-amber-100 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4 text-amber-700" />
                  </div>
                  <div>
                    <div className="text-[10.5px] font-semibold uppercase tracking-wider text-gray-500">Occupant comfort</div>
                    <div className="text-[13.5px] font-semibold text-gray-900 mt-0.5 leading-snug">
                      higher, with fewer surprise complaints
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                      people arrive prepared, not reacting.
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="mt-4 pt-3 border-t border-gray-200/70 text-[10.5px] text-gray-500 leading-relaxed"
                style={{ fontFamily: MONO }}
              >
                ranges informed by IEA EBC Annex 79 · ASHRAE 55 adaptive comfort · Brains4Buildings consortium targets. site-specific outcomes reported from pilots.
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="border-b border-gray-200/70 bg-gray-50/40">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-24">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div variants={fadeUp}>
              <div
                className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 mb-2"
                style={{ fontFamily: MONO }}
              >
                · our mission
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
                A network of buildings that balance comfort and energy.
              </h2>
              <p className="mt-4 text-[15px] text-gray-600 leading-relaxed text-justify mx-auto max-w-2xl">
                Most buildings regulate blindly. Few listen. None optimize for both
                the people inside and the energy they consume.
                ComfortOS closes that loop. People share how they feel, the
                building shares what it knows, and together with weather data and
                building physics, the platform finds HVAC strategies that maintain
                comfort while cutting energy waste. When this dialogue scales
                across a network of smart buildings, every building gets smarter.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-12 grid md:grid-cols-3 gap-6 text-left">
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="w-9 h-9 rounded-md bg-teal-50 flex items-center justify-center mb-3">
                  <Users className="h-4 w-4 text-teal-700" />
                </div>
                <h3 className="text-[14px] font-semibold text-gray-900">Occupants speak</h3>
                <p className="mt-1.5 text-[13px] text-gray-600 leading-relaxed">
                  Low-friction voting gives every person a direct channel to tell the building
                  how they feel. No helpdesk. No complaint form. Just one tap.
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="w-9 h-9 rounded-md bg-emerald-50 flex items-center justify-center mb-3">
                  <Leaf className="h-4 w-4 text-emerald-700" />
                </div>
                <h3 className="text-[14px] font-semibold text-gray-900">Operations optimize</h3>
                <p className="mt-1.5 text-[13px] text-gray-600 leading-relaxed">
                  Comfort votes meet outside weather and implicit building physics. The platform
                  uses this combined data to drive HVAC strategies that save energy without
                  sacrificing the comfort people just voted for.
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="w-9 h-9 rounded-md bg-teal-50 flex items-center justify-center mb-3">
                  <Network className="h-4 w-4 text-teal-700" />
                </div>
                <h3 className="text-[14px] font-semibold text-gray-900">Networks learn</h3>
                <p className="mt-1.5 text-[13px] text-gray-600 leading-relaxed">
                  Connected buildings share comfort and energy patterns across sites. What works
                  in one building informs the next. The network gets smarter with every conversation.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FM Console */}
      <section id="solutions" className="border-b border-gray-200/70">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-24 grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-4">
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 mb-2"
              style={{ fontFamily: MONO }}
            >
              · facility manager console
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
              Zone-level comfort, without chasing tickets.
            </h2>
            <p className="mt-4 text-gray-600 text-[15px] leading-relaxed text-justify">
              Every vote rolls up to a zone, a floor, and a building. FMs see which
              spaces are trending cold or warm, who is voting, and how comfort shifts
              across the day, before anyone opens a complaint.
            </p>
            <ul className="mt-6 space-y-3 text-[13.5px] text-gray-700">
              {[
                { icon: Activity, t: 'Zone-level comfort analytics from live votes' },
                { icon: Radio, t: 'Notifications when a zone trends cold or warm' },
                { icon: LayoutDashboard, t: 'Per-tenant dashboards and vote forms, editable in-app' },
                { icon: BarChart3, t: 'Building-level analytics across floors and zones' },
              ].map((it) => (
                <li key={it.t} className="flex items-start gap-2.5">
                  <it.icon className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                  {it.t}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-8">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {/* Window chrome */}
              <div className="border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 bg-gray-50/70">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-gray-300" />
                  <span className="h-2 w-2 rounded-full bg-gray-300" />
                  <span className="h-2 w-2 rounded-full bg-gray-300" />
                </div>
                <span
                  className="text-[11px] text-gray-500"
                  style={{ fontFamily: MONO }}
                >
                  comfortos.app/fm · Pilot Building A
                </span>
                <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-teal-700 font-semibold">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500" />
                  </span>
                  live votes
                </span>
              </div>

              <div className="grid grid-cols-12">
                {/* rail */}
                <div className="hidden sm:flex col-span-1 border-r border-gray-200 py-4 flex-col items-center gap-2.5 bg-gray-50/40">
                  {[LayoutDashboard, Activity, BarChart3, Radio, Sliders, Users].map((Ic, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-md flex items-center justify-center ${
                        i === 1 ? 'bg-teal-600 text-white' : 'text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      <Ic className="h-4 w-4" />
                    </div>
                  ))}
                </div>

                <div className="col-span-12 sm:col-span-11 p-5 space-y-4">
                  {/* top row */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { l: 'Votes · today', v: '284', d: 'across 18 zones' },
                      { l: 'Participation', v: '41%', d: 'of active occupants' },
                      { l: 'Zones flagged', v: '3', d: '2 warm · 1 cold' },
                      { l: 'Median PMV', v: '+0.6', d: 'slightly warm' },
                    ].map((k) => (
                      <div key={k.l} className="rounded-lg border border-gray-200 p-3">
                        <div className="text-[10.5px] font-medium text-gray-500 uppercase tracking-wider">
                          {k.l}
                        </div>
                        <div
                          className="mt-1 text-[18px] font-semibold text-gray-900"
                          style={{ fontFamily: MONO }}
                        >
                          {k.v}
                        </div>
                        <div className="mt-0.5 text-[10.5px] text-gray-500" style={{ fontFamily: MONO }}>
                          {k.d}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* recent votes feed */}
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50/70">
                      <span className="text-[11.5px] font-semibold text-gray-900">
                        Recent votes
                      </span>
                      <span
                        className="text-[10.5px] text-gray-500"
                        style={{ fontFamily: MONO }}
                      >
                        last 15 min
                      </span>
                    </div>
                    <ul className="divide-y divide-gray-100 text-[12px]" style={{ fontFamily: MONO }}>
                      {[
                        { t: '09:44', zone: 'Zone_4-Oost', vote: '+2 warm', tag: 'flagged', tone: 'text-orange-700' },
                        { t: '09:41', zone: 'Zone_2-Atrium', vote: '−2 cold', tag: 'flagged', tone: 'text-blue-700' },
                        { t: '09:38', zone: 'Zone_7-Lab', vote: '+1 warm', tag: 'within band', tone: 'text-gray-500' },
                        { t: '09:36', zone: 'Zone_3-West', vote: '0 neutral', tag: 'within band', tone: 'text-gray-500' },
                      ].map((c) => (
                        <li key={c.t + c.zone} className="px-4 py-2 flex items-center gap-3">
                          <span className="text-gray-400 w-12 shrink-0">{c.t}</span>
                          <span className="text-gray-700 w-36 shrink-0 truncate">{c.zone}</span>
                          <span className="text-gray-900 flex-1 truncate">{c.vote}</span>
                          <span
                            className={`shrink-0 text-[10.5px] uppercase tracking-wider ${c.tone}`}
                          >
                            {c.tag}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* zone grid */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11.5px] font-semibold text-gray-900">Zone map</span>
                      <span className="text-[10.5px] text-gray-500" style={{ fontFamily: MONO }}>
                        color = dominant sentiment
                      </span>
                    </div>
                    <div className="grid grid-cols-6 gap-1.5">
                      {[
                        { id: '402', v: 'warm', tone: 'bg-orange-100 text-orange-800 border-orange-200' },
                        { id: '403', v: 'warm', tone: 'bg-orange-50 text-orange-700 border-orange-100' },
                        { id: '404', v: 'neutral', tone: 'bg-teal-50 text-teal-700 border-teal-100' },
                        { id: '301', v: 'cold', tone: 'bg-blue-50 text-blue-700 border-blue-100' },
                        { id: '302', v: 'neutral', tone: 'bg-teal-50 text-teal-700 border-teal-100' },
                        { id: '303', v: 'neutral', tone: 'bg-teal-50 text-teal-700 border-teal-100' },
                        { id: '201', v: 'cold', tone: 'bg-blue-100 text-blue-800 border-blue-200' },
                        { id: '202', v: 'neutral', tone: 'bg-teal-50 text-teal-700 border-teal-100' },
                        { id: '203', v: 'neutral', tone: 'bg-teal-50 text-teal-700 border-teal-100' },
                        { id: '701', v: 'warm', tone: 'bg-orange-50 text-orange-700 border-orange-100' },
                        { id: '702', v: 'neutral', tone: 'bg-teal-50 text-teal-700 border-teal-100' },
                        { id: '703', v: 'neutral', tone: 'bg-teal-50 text-teal-700 border-teal-100' },
                      ].map((z) => (
                        <div
                          key={z.id}
                          className={`rounded-md border px-2 py-2 ${z.tone}`}
                          style={{ fontFamily: MONO }}
                        >
                          <div className="text-[10px] opacity-70">Zone_{z.id}</div>
                          <div className="text-[12px] font-semibold capitalize">{z.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SDUI Platform */}
      <section id="platform" className="border-b border-gray-200/70">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-24">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4">
              <div
                className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 mb-2"
                style={{ fontFamily: MONO }}
              >
                · server-driven ui
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
                Global configuration, zero code.
              </h2>
              <p className="mt-4 text-gray-600 text-[15px] leading-relaxed text-justify">
                Dashboards, vote forms, and zone layouts are rendered from JSON
                contracts shipped by the server. Change the schema once and every
                occupant and FM sees the new surface on their next session.
              </p>
              <ul className="mt-6 space-y-3 text-[13.5px] text-gray-700">
                {[
                  { icon: FileJson, t: 'Declarative schema, versioned per tenant' },
                  { icon: Cpu, t: 'Update forms and dashboards without a release' },
                  { icon: Server, t: 'Role-scoped surfaces (occupant · FM · admin)' },
                ].map((it) => (
                  <li key={it.t} className="flex items-start gap-2.5">
                    <it.icon className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                    {it.t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-8 grid md:grid-cols-2 gap-4">
              {/* left: config */}
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50/70">
                  <span className="text-[11px] font-semibold text-gray-700 inline-flex items-center gap-1.5">
                    <FileJson className="h-3.5 w-3.5 text-gray-400" />
                    Visual Configurator
                  </span>
                  <span
                    className="text-[10.5px] text-gray-500"
                    style={{ fontFamily: MONO }}
                  >
                    form.thermal.v3
                  </span>
                </div>
                <div className="p-3 space-y-2.5">
                  {/* Form title row */}
                  <div className="rounded-lg border border-gray-200 bg-gray-50/60 px-3 py-2">
                    <div
                      className="text-[10px] font-semibold uppercase tracking-wider text-gray-400"
                      style={{ fontFamily: MONO }}
                    >
                      form title
                    </div>
                    <div className="mt-0.5 text-[13px] font-semibold text-gray-900">
                      Thermal comfort
                    </div>
                  </div>

                  {/* Question 1 — scale */}
                  <div className="rounded-lg border border-gray-200 bg-white px-2.5 py-2">
                    <div className="flex items-start gap-2">
                      <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-300" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 truncate text-[12.5px] font-semibold text-gray-900">
                            How do you feel right now?
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold text-teal-700">
                            <Sliders className="h-3 w-3" />
                            Scale · 7pt
                          </span>
                        </div>
                        <div
                          className="mt-1.5 flex items-center gap-1 text-[10.5px] text-gray-500"
                          style={{ fontFamily: MONO }}
                        >
                          <span className="rounded border border-gray-200 bg-gray-50 px-1">-3 Cold</span>
                          <span>·</span>
                          <span className="rounded border border-gray-200 bg-gray-50 px-1">0 Neutral</span>
                          <span>·</span>
                          <span className="rounded border border-gray-200 bg-gray-50 px-1">+3 Hot</span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-teal-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            <Check className="h-2.5 w-2.5" />
                            required
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Question 2 — chips */}
                  <div className="rounded-lg border border-gray-200 bg-white px-2.5 py-2">
                    <div className="flex items-start gap-2">
                      <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-300" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 truncate text-[12.5px] font-semibold text-gray-900">
                            What are you wearing?
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                            <Tag className="h-3 w-3" />
                            Chips
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {['Light', 'Medium', 'Warm', 'Heavy'].map((o) => (
                            <span
                              key={o}
                              className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10.5px] text-gray-700"
                            >
                              {o}
                            </span>
                          ))}
                          <span className="rounded-full border border-dashed border-gray-300 px-2 py-0.5 text-[10.5px] text-gray-400">
                            + option
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Question 3 — select */}
                  <div className="rounded-lg border border-gray-200 bg-white px-2.5 py-2">
                    <div className="flex items-start gap-2">
                      <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-300" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 truncate text-[12.5px] font-semibold text-gray-900">
                            What were you doing?
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                            <List className="h-3 w-3" />
                            Select
                          </span>
                        </div>
                        <ul className="mt-1.5 space-y-0.5 text-[11.5px] text-gray-700">
                          {['Resting', 'Typing', 'Standing', 'Walking'].map((o) => (
                            <li key={o} className="flex items-center gap-1.5">
                              <CircleDot className="h-2.5 w-2.5 text-gray-300" />
                              {o}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Add question */}
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 bg-white py-1.5 text-[11.5px] font-medium text-gray-500 hover:border-teal-400 hover:text-teal-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add question
                  </button>
                </div>
                <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-gray-50/40">
                  <span className="text-[10.5px] text-gray-500" style={{ fontFamily: MONO }}>
                    saved · 12s ago
                  </span>
                  <span className="text-[10.5px] font-semibold text-gray-900 inline-flex items-center gap-1">
                    <Zap className="h-3 w-3 text-amber-500" />
                    Publish
                  </span>
                </div>
              </div>

              {/* right: rendered */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/60 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50/70">
                  <span className="text-[11px] font-semibold text-gray-700 inline-flex items-center gap-1.5">
                    <LayoutDashboard className="h-3.5 w-3.5 text-gray-400" />
                    Rendered Surface
                  </span>
                  <span
                    className="text-[10.5px] text-gray-500"
                    style={{ fontFamily: MONO }}
                  >
                    occupant · next session
                  </span>
                </div>
                <div className="p-5">
                  <div className="mx-auto max-w-[320px] rounded-[1.2rem] border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="text-[11px] text-gray-500" style={{ fontFamily: MONO }}>
                      Room_402 · Floor 4
                    </div>
                    <div className="mt-1 text-[15px] font-semibold text-gray-900">
                      Thermal comfort
                    </div>
                    <div className="mt-4 flex justify-between gap-1">
                      {['−3', '−2', '−1', '0', '+1', '+2', '+3'].map((v, i) => (
                        <div
                          key={v}
                          className={`flex-1 rounded-md text-[11px] font-semibold py-1.5 text-center tabular-nums border ${
                            i === 5
                              ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                              : 'bg-white border-gray-200 text-gray-600'
                          }`}
                          style={{ fontFamily: MONO }}
                        >
                          {v}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between text-[10px] text-gray-400 px-0.5">
                      <span>Cold</span>
                      <span>Neutral</span>
                      <span>Hot</span>
                    </div>

                    <div className="mt-4">
                      <div className="text-[11px] font-medium text-gray-700 mb-2">
                        What are you wearing?
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { label: 'Light', hint: 'T-shirt', on: false },
                          { label: 'Medium', hint: 'Shirt', on: false },
                          { label: 'Warm', hint: 'Sweater', on: true },
                          { label: 'Heavy', hint: 'Jacket', on: false },
                        ].map((c) => (
                          <div
                            key={c.label}
                            className={`rounded-md border px-1.5 py-1.5 text-center ${
                              c.on
                                ? 'bg-teal-600 text-white border-teal-600'
                                : 'bg-white text-gray-700 border-gray-200'
                            }`}
                          >
                            <div className="text-[11px] font-semibold leading-tight">{c.label}</div>
                            <div className={`text-[9.5px] leading-tight mt-0.5 whitespace-nowrap ${c.on ? 'text-teal-50' : 'text-gray-400'}`}>
                              {c.hint}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button className="mt-4 w-full bg-teal-600 text-white text-[12.5px] font-semibold py-2 rounded-md hover:bg-teal-700 transition">
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research-grounded */}
      <section id="research" className="border-b border-gray-200/70">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <div
                className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 mb-2"
                style={{ fontFamily: MONO }}
              >
                · grounded in research
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 max-w-2xl">
                The design choices, and why they hold up.
              </h2>
            </div>
            <p className="text-[13px] text-gray-500 max-w-md">
              ComfortOS is built out of a PhD research program on occupant-centric
              control. Every surface exists for a reason, not dashboards for their
              own sake.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-l border-gray-200">
            {researchPillars.map((p) => (
              <div
                key={p.title}
                className="border-r border-b border-gray-200 p-6 bg-white"
              >
                <div className="flex items-center gap-2 mb-2">
                  <p.icon className="h-4 w-4 text-gray-500" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    design principle
                  </span>
                </div>
                <h3 className="text-[16px] font-semibold tracking-tight text-gray-900">
                  {p.title}
                </h3>
                <p className="mt-2 text-[13.5px] text-gray-600 leading-relaxed text-justify">{p.body}</p>
              </div>
            ))}
          </div>

          {/* Consortium lineage */}
          <div className="mt-10 rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-start md:items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-teal-600 text-white flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <div
                    className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-gray-500"
                    style={{ fontFamily: MONO }}
                  >
                    · research lineage
                  </div>
                  <div className="mt-1 text-[13px] text-gray-700 leading-relaxed">
                    Built within the{' '}
                    <a
                      href="https://brains4buildings.org/"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-gray-900 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900"
                    >
                      Brains4Buildings
                    </a>{' '}
                    consortium. Pilot data co-developed with two member
                    buildings.
                  </div>
                </div>
              </div>
              <div
                className="text-[11px] text-gray-500 md:text-right"
                style={{ fontFamily: MONO }}
              >
                TU Delft · TU/e · TNO · Haagse Hogeschool · Windesheim · HAN · Avans
                <span className="block text-gray-400">+ 40 industry partners</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Vos — the ComfortOS AI fox */}
      <section id="vos" className="border-b border-gray-200/70">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <div
                className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 mb-2"
                style={{ fontFamily: MONO }}
              >
                · meet the ai
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 max-w-2xl">
                Meet Vos. Your building, with a voice.
              </h2>
            </div>
            <p className="text-[13px] text-gray-500 max-w-md">
              Vos (Dutch for fox) is the ComfortOS companion that lets
              occupants chat with their building directly. Once logged in,
              Vos speaks as the building itself — reading live data,
              explaining the why, and logging issues through conversation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-gray-200">
            {[
              {
                icon: MessageSquare,
                title: 'Chat with the building',
                body:
                  'Every building speaks in the first person through Vos. Ask how it is, and it answers using its own sensors.',
              },
              {
                icon: Brain,
                title: 'The why behind the numbers',
                body:
                  'Vos pulls temperature trends, recent complaints, and your own votes before replying. No generic chatbot lines.',
              },
              {
                icon: Activity,
                title: 'Log issues by conversation',
                body:
                  'No forms. Tell Vos you are cold; it proposes a complaint, waits for your yes, and files it on your behalf.',
              },
              {
                icon: Users,
                title: 'Remembers you, not everyone',
                body:
                  'Vos can reference your own comfort votes so the reply feels personal, not a building-wide broadcast.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="border-r border-b border-gray-200 p-6 bg-white"
              >
                <div className="flex items-center gap-2 mb-2">
                  <f.icon className="h-4 w-4 text-gray-500" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    ai capability
                  </span>
                </div>
                <h3 className="text-[16px] font-semibold tracking-tight text-gray-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-[13.5px] text-gray-600 leading-relaxed text-justify">
                  {f.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-start md:items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-teal-600 text-white flex items-center justify-center shrink-0">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <div
                    className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-gray-500"
                    style={{ fontFamily: MONO }}
                  >
                    · try it on this page
                  </div>
                  <div className="mt-1 text-[13px] text-gray-700 leading-relaxed">
                    Tap the fox in the corner to ask Vos about ComfortOS. The
                    public chat only answers questions about the platform —
                    live building data is reserved for signed-in users.
                  </div>
                </div>
              </div>
              <div
                className="text-[11px] text-gray-500 md:text-right"
                style={{ fontFamily: MONO }}
              >
                powered by Gemini
                <span className="block text-gray-400">Dutch for fox · inspired by Van den Vos Reynaerde</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connectivity Layer */}
      <section id="roadmap" className="border-b border-gray-200/70 bg-gray-50/40">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <div
                className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 mb-2"
                style={{ fontFamily: MONO }}
              >
                · connectivity layer
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 max-w-2xl">
                HTTPS-first. Four auth modes production-ready today.
              </h2>
              <p className="mt-3 text-[13.5px] text-gray-600 max-w-2xl leading-relaxed text-justify">
                Our connector gateway polls vendor APIs on a configurable schedule,
                normalizes telemetry with JSON-path mapping, and auto-disables after
                consecutive failures. Buildings that speak BACnet or Modbus only
                reach us through their vendor cloud API or a thin on-prem gateway
                that egresses over HTTPS. We do not punch holes into your LAN.
              </p>
            </div>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold bg-teal-600 text-white px-4 py-2.5 rounded-md hover:bg-teal-700 transition shrink-0"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Book a pilot call
            </a>
          </div>

          {/* Auth modes matrix */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500"
                style={{ fontFamily: MONO }}
              >
                · authentication modes
              </span>
              <span className="text-[11px] text-gray-500" style={{ fontFamily: MONO }}>
                4/6 shipping · 2 in hardening
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-0 border-t border-l border-gray-200 bg-white rounded-lg overflow-hidden">
              {authModes.map((a) => (
                <div
                  key={a.name}
                  className="border-r border-b border-gray-200 p-4 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-gray-900">{a.name}</span>
                    <span
                      className={`text-[9.5px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                        a.status === 'shipping'
                          ? 'bg-teal-50 text-teal-700 border border-teal-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}
                      style={{ fontFamily: MONO }}
                    >
                      {a.status}
                    </span>
                  </div>
                  <div
                    className="text-[10.5px] text-gray-500"
                    style={{ fontFamily: MONO }}
                  >
                    {a.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live pilot buildings */}
          <div className="mb-10 grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500"
                  style={{ fontFamily: MONO }}
                >
                  · pilot data ingested
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-gray-700 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                  2 buildings · historical batch
                </span>
              </div>
              <ul className="divide-y divide-gray-100 text-[13px]">
                {[
                  {
                    name: 'Building 28',
                    city: 'Delft · W + E wings · 14 rooms',
                    mode: 'temp · CO₂ · RH',
                  },
                  {
                    name: 'HHS',
                    city: 'Den Haag · 28 strip-zones',
                    mode: 'temp · CO₂ · RH',
                  },
                ].map((b) => (
                  <li key={b.name} className="py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-teal-600 text-white flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{b.name}</div>
                      <div
                        className="text-[11px] text-gray-500 truncate"
                        style={{ fontFamily: MONO }}
                      >
                        {b.city}
                      </div>
                    </div>
                    <span
                      className="text-[10.5px] text-gray-600 shrink-0"
                      style={{ fontFamily: MONO }}
                    >
                      {b.mode}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11.5px] text-gray-500 leading-relaxed text-justify">
                Two consortium buildings ingested as historical batches via the
                push API, sourced from the building owner's vendor cloud, not from
                BACnet directly. Same ingestion path used for live pilots.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500"
                  style={{ fontFamily: MONO }}
                >
                  · ingestion modes wired
                </span>
                <span
                  className="text-[10.5px] text-gray-500"
                  style={{ fontFamily: MONO }}
                >
                  4 patterns
                </span>
              </div>
              <ul className="space-y-2.5 text-[12.5px]" style={{ fontFamily: MONO }}>
                {[
                  { id: 'ep-single', t: 'Single-zone', a: 'API key' },
                  { id: 'ep-multi-nw', t: 'Multi-zone', a: 'Bearer token' },
                  { id: 'ep-building-wide', t: 'Building-wide', a: 'OAuth2 client credentials' },
                  { id: 'ep-sensor-centric', t: 'Raw sensor-centric', a: 'HMAC' },
                ].map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-gray-50 border border-gray-100"
                  >
                    <span className="text-gray-400 text-[10.5px] w-32 shrink-0 truncate">
                      {m.id}
                    </span>
                    <span className="text-gray-900 font-semibold flex-1 truncate">
                      {m.t}
                    </span>
                    <span className="text-gray-500 shrink-0">{m.a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Roadmap columns */}
          <div className="grid md:grid-cols-3 gap-4">
            {roadmap.map((col, i) => {
              const tone =
                i === 0
                  ? 'border-teal-600'
                  : i === 1
                  ? 'border-amber-400'
                  : 'border-gray-300 border-dashed';
              const dot =
                i === 0 ? 'bg-teal-600' : i === 1 ? 'bg-amber-500' : 'bg-gray-400';
              return (
                <div
                  key={col.phase}
                  className={`rounded-xl border bg-white p-5 ${tone}`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                    <span
                      className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-600"
                      style={{ fontFamily: MONO }}
                    >
                      {col.phase}
                    </span>
                  </div>
                  <ul className="space-y-2.5">
                    {col.items.map((t) => (
                      <li
                        key={t}
                        className="text-[13px] text-gray-700 flex items-start gap-2"
                      >
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-gray-400 shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Protocol reachability note */}
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <Network className="h-4 w-4 text-gray-500" />
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-600"
                style={{ fontFamily: MONO }}
              >
                · how we reach each protocol
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-[13px]">
              {[
                { name: 'BACnet/IP', via: 'on-prem gateway · partner pilot', state: 'roadmap' },
                { name: 'Modbus TCP', via: 'on-prem gateway · partner pilot', state: 'roadmap' },
                { name: 'MQTT', via: 'direct broker or vendor cloud', state: 'in dev' },
                { name: 'Siemens Navigator', via: 'vendor cloud API', state: 'scoping' },
                { name: 'Honeywell Forge', via: 'vendor cloud API', state: 'scoping' },
                { name: 'JCI OpenBlue', via: 'vendor cloud API', state: 'scoping' },
              ].map((p) => (
                <div key={p.name} className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{p.name}</span>
                    <span
                      className={`text-[9.5px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        p.state === 'in dev'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}
                      style={{ fontFamily: MONO }}
                    >
                      {p.state}
                    </span>
                  </div>
                  <span
                    className="text-[10.5px] text-gray-500"
                    style={{ fontFamily: MONO }}
                  >
                    via · {p.via}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section>
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-24">
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-8 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 max-w-xl">
                Run a pilot in your building.
              </h2>
              <p className="mt-2 text-gray-600 text-[14.5px] max-w-xl text-justify">
                We are bringing on a small number of pilot sites this year. 30-minute
                intro call. We map your building, agree on a scope, and get
                occupants voting within a few weeks.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 shrink-0">
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold bg-teal-600 text-white px-4 py-2.5 rounded-md hover:bg-teal-700 transition"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Book 30-min Pilot Call
              </a>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold border border-gray-300 bg-white text-gray-800 px-4 py-2.5 rounded-md hover:border-gray-400 hover:bg-white transition"
              >
                <LogIn className="h-3.5 w-3.5" />
                Open the App
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200/70 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[12.5px] text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-teal-600 text-white flex items-center justify-center">
              <Cpu className="h-3 w-3" />
            </div>
            <span>ComfortOS · comfort meets efficiency</span>
          </div>
          <div
            className="flex items-center gap-4"
            style={{ fontFamily: MONO }}
          >
            <span>early access · pilot phase</span>
            <span className="text-gray-300">·</span>
            <span>research platform</span>
          </div>
        </div>
      </footer>

      <LandingAiChat />
    </div>
  );
}
