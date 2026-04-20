import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  Cpu,
  FileJson,
  Gauge,
  MessageSquare,
  LayoutDashboard,
  LogIn,
  MapPin,
  Network,
  Radio,
  Server,
  Sliders,
  Thermometer,
  Users,
  Zap,
} from 'lucide-react';

const CALENDLY_URL = 'https://calendly.com/nitantupasani/30min';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const MONO =
  "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const trendData = [
  { t: 'Mon', warm: 18, cold: 12 },
  { t: 'Tue', warm: 22, cold: 14 },
  { t: 'Wed', warm: 31, cold: 9 },
  { t: 'Thu', warm: 27, cold: 11 },
  { t: 'Fri', warm: 19, cold: 16 },
  { t: 'Sat', warm: 8, cold: 6 },
  { t: 'Sun', warm: 6, cold: 5 },
];

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
      'Setpoint recommendation engine (advisory)',
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
      "Buildings optimize for what they can measure. Adding a low-friction channel for subjective comfort makes occupants a direct input — not a complaint backlog.",
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
      'Pilot buildings vary — schema, scale, and surfaces ship from the server so each tenant can tune forms and dashboards without a release.',
  },
  {
    icon: MapPin,
    title: 'Feedback tied to a visible outcome',
    body:
      'Votes roll up to a zone, a floor, a building — and a person sees their signal reflected back. That visibility is what sustains participation over weeks, not days.',
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
                className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-gray-900"
              >
                Buildings that listen.{' '}
                <span className="text-teal-600">Occupants that know.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-6 text-[17px] md:text-lg text-gray-600 leading-relaxed text-justify max-w-[58ch]"
              >
                ComfortOS is the mutual communication layer for smart buildings.
                Occupants share how they feel. The building shares what it knows.
                Across a network of connected buildings, this ongoing dialogue
                turns comfort into something that adapts to people, not just
                sensors.
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
                    <div className="text-[11px] text-gray-500 mb-4">Tap your feeling — it's anonymous.</div>
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

          {/* What ships today: Capture → Analyze → Configure */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="mt-16"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500"
                style={{ fontFamily: MONO }}
              >
                · the two-way loop
              </div>
              <span
                className="text-[11px] text-gray-500"
                style={{ fontFamily: MONO }}
              >
                listen · understand · inform
              </span>
            </div>

            <div className="grid lg:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 items-stretch">
              {/* Capture */}
              <motion.div variants={fadeUp} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50/60">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-500"
                      style={{ fontFamily: MONO }}
                    >
                      01 · Capture
                    </span>
                  </div>
                  <Radio className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <div className="p-4">
                  <div className="text-[11px] text-gray-500 mb-3" style={{ fontFamily: MONO }}>
                    occupant · /vote
                  </div>
                  <div className="text-[12.5px] font-medium text-gray-900 mb-3">
                    Thermal comfort — Room 402
                  </div>
                  <div className="flex justify-between gap-1">
                    {['−3', '−2', '−1', '0', '+1', '+2', '+3'].map((v, i) => (
                      <div
                        key={v}
                        className={`flex-1 rounded-md text-[10.5px] font-semibold py-1.5 text-center tabular-nums border ${
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
                </div>
              </motion.div>

              <div className="hidden lg:flex items-center justify-center text-gray-300">
                <ArrowRight className="h-5 w-5" />
              </div>

              {/* Analyze */}
              <motion.div variants={fadeUp} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50/60">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-500"
                      style={{ fontFamily: MONO }}
                    >
                      02 · Analyze
                    </span>
                  </div>
                  <Activity className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <div className="p-4">
                  <div className="text-[11px] text-gray-500 mb-1" style={{ fontFamily: MONO }}>
                    FM · /comfort
                  </div>
                  <div className="text-[12.5px] font-medium text-gray-900 mb-3">
                    Zone comfort — last 7 days
                  </div>
                  <div className="h-[96px] -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                        <defs>
                          <linearGradient id="warmFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f97316" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="coldFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity={0.22} />
                            <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="t"
                          tick={{ fontSize: 9, fill: '#9ca3af', fontFamily: MONO }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{
                            fontSize: 11,
                            fontFamily: MONO,
                            borderRadius: 6,
                            border: '1px solid #e5e7eb',
                          }}
                        />
                        <Area type="monotone" dataKey="warm" stroke="#f97316" strokeWidth={1.5} fill="url(#warmFill)" />
                        <Area type="monotone" dataKey="cold" stroke="#2563eb" strokeWidth={1.5} fill="url(#coldFill)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-[10.5px] text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-orange-500" /> warm votes
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-blue-600" /> cold votes
                    </span>
                  </div>
                </div>
              </motion.div>

              <div className="hidden lg:flex items-center justify-center text-gray-300">
                <ArrowRight className="h-5 w-5" />
              </div>

              {/* Configure */}
              <motion.div variants={fadeUp} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50/60">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-500"
                      style={{ fontFamily: MONO }}
                    >
                      03 · Configure
                    </span>
                  </div>
                  <FileJson className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <div className="p-4">
                  <div className="text-[11px] text-gray-500 mb-3" style={{ fontFamily: MONO }}>
                    admin · /vote-config
                  </div>
                  <pre
                    className="text-[11px] leading-relaxed bg-gray-50 rounded border border-gray-100 p-3 overflow-x-auto text-gray-800"
                    style={{ fontFamily: MONO }}
                  >
{`{
  "surface": "vote_form",
  "scale": "pmv_7pt",
  "fields": [
    "thermal",
    "clothing",
    "activity"
  ]
}`}
                  </pre>
                  <div className="mt-3 text-[11px] text-gray-600">
                    Ship the same schema to every occupant and FM — no app release.
                  </div>
                </div>
              </motion.div>
            </div>
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
                A network of buildings that have conversations with their people.
              </h2>
              <p className="mt-4 text-[15px] text-gray-600 leading-relaxed text-justify mx-auto max-w-2xl">
                Most buildings regulate. Few listen. None talk back.
                ComfortOS closes that loop. People share how they feel and the
                building shares what it knows. When this dialogue scales across a
                network of smart buildings, comfort stops being a setting and
                becomes a conversation.
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
                <div className="w-9 h-9 rounded-md bg-teal-50 flex items-center justify-center mb-3">
                  <MessageSquare className="h-4 w-4 text-teal-700" />
                </div>
                <h3 className="text-[14px] font-semibold text-gray-900">Buildings respond</h3>
                <p className="mt-1.5 text-[13px] text-gray-600 leading-relaxed">
                  Live telemetry, zone conditions, and comfort trends flow back to occupants.
                  They see their input reflected. They see the bigger picture.
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="w-9 h-9 rounded-md bg-teal-50 flex items-center justify-center mb-3">
                  <Network className="h-4 w-4 text-teal-700" />
                </div>
                <h3 className="text-[14px] font-semibold text-gray-900">Networks learn</h3>
                <p className="mt-1.5 text-[13px] text-gray-600 leading-relaxed">
                  Connected buildings share patterns across sites. What works in one
                  building informs the next. The network gets smarter with every conversation.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why occupants vote — floor snapshot */}
      <section className="border-b border-gray-200/70">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-24 grid lg:grid-cols-12 gap-10 items-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="lg:col-span-5"
          >
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 mb-2"
              style={{ fontFamily: MONO }}
            >
              · the building talks back
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 max-w-xl">
              You spoke up. Here's what the building sees.
            </h2>
            <p className="mt-3 text-[13.5px] text-gray-600 max-w-xl leading-relaxed text-justify">
              Every vote rolls up into a live picture of the floor. The
              building shares it back. Occupants see how their comfort compares
              to the room around them. The building listens, then responds
              with context. FMs act on signals instead of anecdotes.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="lg:col-span-7"
          >
            <div className="rounded-xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm max-w-md mx-auto lg:ml-auto lg:mr-0">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-gray-500 mb-3" style={{ fontFamily: MONO }}>
                <span>Floor 4 · right now</span>
                <span className="inline-flex items-center gap-1 text-teal-700 font-semibold">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500" />
                  </span>
                  Live
                </span>
              </div>

              <div className="flex h-7 w-full overflow-hidden rounded-full border border-gray-100">
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
                  className="bg-teal-500 flex items-center justify-center text-[10px] font-semibold text-white tabular-nums"
                >
                  45%
                </motion.div>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '37%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.85, delay: 0.2, ease: 'easeOut' }}
                  className="bg-orange-400 flex items-center justify-center text-[10px] font-semibold text-white tabular-nums"
                >
                  37%
                </motion.div>
              </div>
              <div className="mt-2 flex justify-between text-[10.5px] uppercase tracking-[0.12em] text-gray-500" style={{ fontFamily: MONO }}>
                <span>Cold</span>
                <span>Neutral</span>
                <span>Warm</span>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[
                    { n: 'NU', bg: 'bg-teal-600', fg: 'text-white' },
                    { n: 'AR', bg: 'bg-orange-100', fg: 'text-orange-800' },
                    { n: 'JL', bg: 'bg-blue-100', fg: 'text-blue-800' },
                    { n: 'MK', bg: 'bg-rose-100', fg: 'text-rose-800' },
                    { n: 'SS', bg: 'bg-amber-100', fg: 'text-amber-800' },
                  ].map((a) => (
                    <div
                      key={a.n}
                      className={`h-7 w-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-semibold tabular-nums ${a.bg} ${a.fg}`}
                    >
                      {a.n}
                    </div>
                  ))}
                  <div className="h-7 px-2 rounded-full border-2 border-white bg-gray-100 text-gray-700 flex items-center text-[10px] font-semibold tabular-nums">
                    +9
                  </div>
                </div>
                <div className="text-[12px] text-gray-600 leading-tight">
                  <span className="font-semibold text-gray-900">14 others</span>{' '}
                  voted the same as you today.
                </div>
              </div>
            </div>
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
              across the day — before anyone opens a complaint.
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
                contracts shipped by the server. Change the schema once — every
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
                <pre
                  className="text-[11.5px] leading-relaxed p-4 overflow-x-auto text-gray-800"
                  style={{ fontFamily: MONO }}
                >
{`{
  "surface": "vote_form",
  "title": "Thermal comfort",
  "scale": {
    "type": "pmv_7pt",
    "labels": ["Cold", "Neutral", "Hot"]
  },
  "fields": [
    { "id": "thermal", "required": true },
    { "id": "clothing", "type": "chips" },
    { "id": "activity", "type": "select" }
  ],
  "submit": {
    "label": "Submit",
    "rate_limit": "1/5min"
  }
}`}
                </pre>
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
              control. Every surface exists for a reason — no dashboards for their
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
                    consortium — pilot data co-developed with two member
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
                that egresses over HTTPS — we do not punch holes into your LAN.
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
                push API — sourced from the building owner's vendor cloud, not from
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
                intro call — we map your building, agree on a scope, and get
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
            <span>ComfortOS · occupant-centric control</span>
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
    </div>
  );
}
