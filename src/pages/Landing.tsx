import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import {
  Building2,
  Thermometer,
  Vote,
  BarChart3,
  Users,
  Layers,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Gauge,
  MessageSquareHeart,
  Settings2,
  Check,
} from 'lucide-react';
import VariationsNav from '../components/landing/VariationsNav';

const features = [
  {
    icon: Thermometer,
    title: 'Real-time comfort voting',
    body: 'Occupants report thermal, air, lighting and acoustic comfort in seconds, from the exact space they are in.',
  },
  {
    icon: BarChart3,
    title: 'Analytics that matter',
    body: 'Turn votes and sensor data into clear trends, hotspots and actions — per tenant, floor and zone.',
  },
  {
    icon: Layers,
    title: 'Server-driven UI',
    body: 'Dashboards and vote forms are configured centrally and delivered on the fly. No app updates to ship.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-based access',
    body: 'Scoped experiences for occupants, tenant FMs, building FMs and admins, with safe view-as modes.',
  },
  {
    icon: Gauge,
    title: 'Presence-aware',
    body: 'Location and presence signals tie feedback to the right space, so action targets the right system.',
  },
  {
    icon: Settings2,
    title: 'Configurable per tenant',
    body: 'Each tenant and building gets its own dashboard layout, vote schema and notification rules.',
  },
];

const roles = [
  {
    icon: MessageSquareHeart,
    title: 'For occupants',
    points: ['One-tap comfort feedback', 'Personal history & trends', 'Clear space and presence context'],
  },
  {
    icon: Users,
    title: 'For facility managers',
    points: ['Live comfort analytics per zone', 'Notifications on anomalies', 'Configure dashboards & votes'],
  },
  {
    icon: Building2,
    title: 'For admins',
    points: ['Multi-building & tenant setup', 'FM role approvals', 'Platform-wide analytics'],
  },
];

export default function Landing() {
  const reduce = useReducedMotion();

  useEffect(() => {
    const id = 'comfortos-landing-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(link);
  }, []);

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };
  const stagger: Variants = { show: { transition: { staggerChildren: 0.08 } } };

  return (
    <div
      className="min-h-screen bg-white text-gray-900 antialiased"
      style={{
        fontFamily:
          "'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <VariationsNav active="original" />
      {/* Nav */}
      <header className="sticky top-10 z-30 backdrop-blur bg-white/80 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 cursor-pointer" aria-label="ComfortOS home">
            <div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="font-semibold text-lg tracking-tight">ComfortOS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors duration-200">Features</a>
            <a href="#how" className="hover:text-gray-900 transition-colors duration-200">How it works</a>
            <a href="#roles" className="hover:text-gray-900 transition-colors duration-200">Who it's for</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors duration-200 shadow-sm"
            >
              Get started <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-50/70 via-white to-white" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-[0.25]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
            maskImage: 'radial-gradient(ellipse at top, black 40%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at top, black 40%, transparent 75%)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-[28rem] opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(600px 220px at 15% 10%, rgba(54,128,92,0.18), transparent), radial-gradient(500px 200px at 85% 0%, rgba(112,193,179,0.20), transparent)',
          }}
        />

        <div className="max-w-6xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <motion.div variants={stagger} initial="hidden" animate="show" className="lg:col-span-7">
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full border border-primary-200/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-700 mb-6 shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Smart buildings that listen back
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tighter text-gray-900 leading-[1.05]"
              >
                Two-way comfort,<br />
                for every space in{' '}
                <span className="text-primary-700">your building.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed"
              >
                ComfortOS is a unified, server-driven platform that connects
                occupants, facility managers and building systems — so comfort
                feedback turns into action, in real time.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-3">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-primary-700 cursor-pointer transition-colors duration-200 shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  Get started <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 border border-gray-300 bg-white text-gray-800 px-5 py-3 rounded-xl font-semibold hover:bg-gray-50 cursor-pointer transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
                >
                  Sign in
                </Link>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500"
              >
                {['Real-time votes', 'Role-aware access', 'Server-driven UI', 'Presence-aware'].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-primary-600" aria-hidden="true" />
                    {item}
                  </span>
                ))}
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
                  className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary-100/60 via-primary-50/40 to-transparent blur-2xl"
                />
                <div className="rounded-[2rem] border border-gray-200 bg-white shadow-2xl shadow-gray-900/10 p-4">
                  <div className="rounded-[1.5rem] bg-gradient-to-b from-primary-50/80 to-white p-5">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary-600 text-white flex items-center justify-center">
                          <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="text-[10px] font-medium text-gray-500 leading-none">Ocean House</div>
                          <div className="text-[11px] font-semibold text-gray-900 leading-tight">Floor 4 · East wing</div>
                        </div>
                      </div>
                      <div className="text-[10px] font-medium text-gray-400">9:42</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 mb-1">How's the comfort right now?</div>
                    <div className="text-[11px] text-gray-500 mb-4">Tap your feeling — it's anonymous.</div>
                    <div className="flex justify-between gap-1 mb-2">
                      {['-3', '-2', '-1', '0', '+1', '+2', '+3'].map((v, i) => (
                        <div
                          key={v}
                          className={`flex-1 rounded-lg text-[11px] font-semibold py-2 text-center ${
                            i === 5
                              ? 'bg-primary-600 text-white shadow-sm'
                              : 'bg-white border border-gray-200 text-gray-600'
                          }`}
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
                    <div className="rounded-xl bg-white border border-gray-100 p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                        <Thermometer className="h-4 w-4 text-primary-700" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[11px] font-semibold text-gray-900">Thermal · 23.4°C</div>
                        <div className="text-[10px] text-gray-500">48% RH · CO₂ 612 ppm</div>
                      </div>
                      <div className="text-[10px] font-semibold text-primary-700">Live</div>
                    </div>
                  </div>
                </div>
                {/* Floating "vote received" pill */}
                <div className="absolute -bottom-4 -right-2 bg-white rounded-xl shadow-lg shadow-gray-900/10 border border-gray-100 px-3 py-2 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
                  </span>
                  <div className="text-[11px] font-semibold text-gray-800">Vote received · +2</div>
                </div>
                {/* Floating FM action card */}
                <div className="absolute -top-4 -left-6 bg-white rounded-xl shadow-lg shadow-gray-900/10 border border-gray-100 px-3 py-2 flex items-center gap-2 max-w-[200px]">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
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

          {/* Visual mock panel */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-16 md:mt-20 relative mx-auto max-w-5xl"
          >
            <div className="rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-900/5 overflow-hidden">
              <div className="border-b border-gray-100 px-4 py-3 flex items-center gap-1.5 bg-gray-50/60">
                <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
                <span className="ml-3 text-xs font-medium text-gray-500">comfortos.app / dashboard</span>
              </div>

              <div className="grid grid-cols-12">
                {/* Sidebar rail */}
                <div className="hidden sm:flex col-span-1 border-r border-gray-100 py-5 flex-col items-center gap-3 bg-gray-50/40">
                  <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center shadow-sm">
                    <Building2 className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="h-px w-5 bg-gray-200 my-1" />
                  <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center">
                    <BarChart3 className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="w-8 h-8 rounded-lg text-gray-400 flex items-center justify-center hover:bg-gray-100 transition-colors">
                    <Vote className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="w-8 h-8 rounded-lg text-gray-400 flex items-center justify-center hover:bg-gray-100 transition-colors">
                    <Layers className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="w-8 h-8 rounded-lg text-gray-400 flex items-center justify-center hover:bg-gray-100 transition-colors">
                    <Users className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="w-8 h-8 rounded-lg text-gray-400 flex items-center justify-center hover:bg-gray-100 transition-colors">
                    <Settings2 className="h-4 w-4" aria-hidden="true" />
                  </div>
                </div>

                {/* Main panel */}
                <div className="col-span-12 sm:col-span-11 p-5 md:p-6 space-y-4">
                  {/* Title row */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Ocean House · Overview</div>
                      <div className="text-lg md:text-xl font-bold tracking-tight text-gray-900">Comfort dashboard</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-2.5 py-1 rounded-lg bg-gray-100 text-[11px] font-medium text-gray-700 inline-flex items-center gap-1">
                        All buildings
                        <span className="text-gray-400">▾</span>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-gray-100 text-[11px] font-medium text-gray-700 inline-flex items-center gap-1">
                        Last 24h
                        <span className="text-gray-400">▾</span>
                      </div>
                      <div className="h-7 w-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-[11px] font-semibold">NU</div>
                    </div>
                  </div>

                  {/* KPI row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-gray-100 p-4 bg-white">
                      <div className="text-[11px] font-medium text-gray-500">Comfort index</div>
                      <div className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900">
                        78 <span className="text-sm font-medium text-primary-600">/100</span>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-primary-700">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-500" />
                        +4 vs yesterday
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-100 p-4 bg-white">
                      <div className="text-[11px] font-medium text-gray-500">Votes today</div>
                      <div className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900">1,284</div>
                      <div className="mt-2 flex gap-0.5 h-6 items-end" aria-hidden="true">
                        {[30, 55, 40, 70, 60, 85, 75, 90, 65, 80, 95, 72].map((h, i) => (
                          <div key={i} className="flex-1 rounded-sm bg-primary-200" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-100 p-4 bg-white">
                      <div className="text-[11px] font-medium text-gray-500">Response time</div>
                      <div className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900">
                        6<span className="text-sm font-medium text-gray-500">m</span> 42<span className="text-sm font-medium text-gray-500">s</span>
                      </div>
                      <div className="mt-2 text-[11px] text-gray-500">Median FM reply</div>
                    </div>
                    <div className="rounded-xl border border-gray-100 p-4 bg-white">
                      <div className="text-[11px] font-medium text-gray-500">Zones flagged</div>
                      <div className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900">3</div>
                      <div className="mt-2 text-[11px] text-orange-600">2 warm · 1 cold</div>
                    </div>
                  </div>

                  {/* Chart + list */}
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 lg:col-span-8 rounded-xl border border-gray-100 p-4 bg-white">
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div>
                          <div className="text-xs font-semibold text-gray-900">Comfort trend</div>
                          <div className="text-[11px] text-gray-500">Per floor · last 7 days</div>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-600">
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-primary-600" /> Floor 2
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-primary-300" /> Floor 4
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-orange-400" /> Floor 7
                          </span>
                        </div>
                      </div>
                      <svg viewBox="0 0 400 110" className="w-full h-24" aria-hidden="true">
                        <line x1="0" y1="20" x2="400" y2="20" stroke="#f3f4f6" strokeWidth="1" />
                        <line x1="0" y1="55" x2="400" y2="55" stroke="#f3f4f6" strokeWidth="1" />
                        <line x1="0" y1="90" x2="400" y2="90" stroke="#f3f4f6" strokeWidth="1" />
                        <polyline
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          className="text-primary-600"
                          points="0,60 40,52 80,55 120,48 160,42 200,40 240,35 280,30 320,28 360,24 400,22"
                        />
                        <polyline
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          className="text-primary-300"
                          points="0,72 40,68 80,70 120,62 160,60 200,58 240,55 280,50 320,48 360,45 400,42"
                        />
                        <polyline
                          fill="none"
                          stroke="#fb923c"
                          strokeWidth="1.75"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          points="0,50 40,56 80,48 120,62 160,70 200,66 240,72 280,70 320,80 360,76 400,82"
                        />
                      </svg>
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                      </div>
                    </div>

                    <div className="col-span-12 lg:col-span-4 rounded-xl border border-gray-100 p-4 bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs font-semibold text-gray-900">Zones flagged</div>
                        <div className="text-[10px] font-medium text-primary-700">View all →</div>
                      </div>
                      <ul className="space-y-3 text-xs">
                        <li className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate">Floor 4 · East wing</div>
                            <div className="text-[10px] text-gray-500">14 votes · 18m ago</div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-semibold shrink-0">Warm</span>
                        </li>
                        <li className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate">Floor 2 · Atrium</div>
                            <div className="text-[10px] text-gray-500">8 votes · 34m ago</div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold shrink-0">Cold</span>
                        </li>
                        <li className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate">Floor 7 · Lab 3</div>
                            <div className="text-[10px] text-gray-500">21 votes · 47m ago</div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-semibold shrink-0">Warm</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Activity feed */}
                  <div className="rounded-xl border border-gray-100 p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-semibold text-gray-900">Live activity</div>
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-primary-700">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75 animate-ping" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-500" />
                        </span>
                        Streaming
                      </div>
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-gray-600">
                      <li className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-md bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Vote className="h-3 w-3 text-primary-700" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="text-gray-900 font-medium">+2 vote · Floor 4 · East wing</div>
                          <div className="text-gray-500">Thermal · 2m ago</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-md bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Gauge className="h-3 w-3 text-orange-600" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="text-gray-900 font-medium">Setpoint lowered 0.5°C</div>
                          <div className="text-gray-500">HVAC · Zone 4E · 3m ago</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Thermometer className="h-3 w-3 text-blue-600" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="text-gray-900 font-medium">Atrium flagged cold</div>
                          <div className="text-gray-500">8 votes · 34m ago</div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="absolute -inset-x-8 -bottom-8 -z-10 h-40 bg-gradient-to-t from-white to-transparent"
            />
          </motion.div>
        </div>
      </section>

      {/* Features — Linear-style divided grid */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary-700 mb-3">What it does</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
              A single platform for comfort, analytics and control
            </h2>
            <p className="mt-4 text-gray-600 text-balance">
              ComfortOS unifies occupant feedback, presence, sensor data and configuration —
              so every stakeholder works from the same live picture.
            </p>
          </div>

          <div className="relative mx-auto grid max-w-2xl lg:max-w-4xl divide-x divide-y divide-gray-200 border border-gray-200 rounded-2xl overflow-hidden *:p-8 sm:grid-cols-2 lg:grid-cols-3 bg-white">
            {features.map((f) => (
              <div key={f.title} className="space-y-3 bg-white">
                <div className="flex items-center gap-2.5">
                  <f.icon className="size-4 text-primary-700" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-gray-900">{f.title}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed text-justify hyphens-auto">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 md:py-28 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12 md:mb-16">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary-700 mb-3">How it works</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              From a vote to a decision, in three steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                n: '01',
                icon: Vote,
                title: 'Occupants vote',
                body: 'Quick, contextual comfort votes from the space they are in — on mobile or web.',
              },
              {
                n: '02',
                icon: BarChart3,
                title: 'Platform aggregates',
                body: 'Votes, presence and sensor data roll up into per-zone, per-tenant and building-wide insights.',
              },
              {
                n: '03',
                icon: Settings2,
                title: 'FMs & admins act',
                body: 'Managers tune dashboards, vote forms and notifications, closing the loop on comfort.',
              },
            ].map((step) => (
              <div
                key={step.n}
                className="relative rounded-2xl bg-white border border-gray-200 p-6 hover:border-primary-300 hover:shadow-sm transition-all duration-200"
              >
                <div className="absolute -top-3 left-6 text-[11px] font-mono font-semibold bg-gray-900 text-white rounded-full px-2.5 py-0.5">
                  {step.n}
                </div>
                <step.icon className="h-6 w-6 text-primary-700 mb-3" aria-hidden="true" />
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12 md:mb-16">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary-700 mb-3">Who it's for</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              One platform, tailored to every role
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((r) => (
              <div
                key={r.title}
                className="rounded-2xl border border-gray-200 p-6 hover:border-primary-300 hover:shadow-sm transition-all duration-200 bg-white"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center mb-4">
                  <r.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-gray-900">{r.title}</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  {r.points.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 text-white p-10 md:p-14 text-center shadow-xl">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(400px 160px at 20% 0%, rgba(255,255,255,0.35), transparent), radial-gradient(300px 140px at 80% 100%, rgba(255,255,255,0.25), transparent)',
              }}
            />
            <h2 className="relative text-3xl md:text-4xl font-bold tracking-tight">
              Ready to make your building listen?
            </h2>
            <p className="relative mt-3 text-primary-100 max-w-xl mx-auto">
              Create an account in a minute, or sign in to pick up where you left off.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-white text-primary-700 px-5 py-3 rounded-xl font-semibold hover:bg-primary-50 cursor-pointer transition-colors duration-200 shadow-md"
              >
                Get started <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 border border-white/40 text-white px-5 py-3 rounded-xl font-semibold hover:bg-white/10 cursor-pointer transition-colors duration-200"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary-600 text-white flex items-center justify-center">
              <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
            <span>ComfortOS — Smart Building Platform</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/login" className="hover:text-gray-800 cursor-pointer transition-colors duration-200">Sign in</Link>
            <Link to="/signup" className="hover:text-gray-800 cursor-pointer transition-colors duration-200">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
