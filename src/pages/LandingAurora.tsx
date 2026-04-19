import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import {
  Building2,
  Thermometer,
  ArrowRight,
  Vote,
  BarChart3,
  Layers,
  ShieldCheck,
  Gauge,
  Settings2,
  Check,
  Users,
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

const titleLines: { words: string[]; accentIdx: number }[] = [
  { words: ['Your', 'building', 'listens.'], accentIdx: 2 },
  { words: ['Your', 'spaces', 'respond.'], accentIdx: 2 },
];

export default function LandingAurora() {
  const reduce = useReducedMotion();

  useEffect(() => {
    const id = 'comfortos-aurora-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(link);
  }, []);

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
  };
  const stagger: Variants = { show: { transition: { staggerChildren: 0.07 } } };

  return (
    <div
      className="min-h-screen bg-white text-gray-900 antialiased"
      style={{
        fontFamily:
          "'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <style>{`
        @keyframes aurora-a { 0%{transform:translate(0%,0%) scale(1);} 25%{transform:translate(15%,-15%) scale(1.2);} 50%{transform:translate(-15%,18%) scale(.85);} 75%{transform:translate(8%,-8%) scale(1.1);} 100%{transform:translate(0%,0%) scale(1);} }
        @keyframes aurora-b { 0%{transform:translate(0%,0%) scale(1);} 25%{transform:translate(-18%,18%) scale(1.1);} 50%{transform:translate(18%,-18%) scale(.9);} 75%{transform:translate(-8%,8%) scale(1.2);} 100%{transform:translate(0%,0%) scale(1);} }
        @keyframes aurora-c { 0%{transform:translate(0%,0%) scale(1);} 50%{transform:translate(10%,10%) scale(1.15);} 100%{transform:translate(0%,0%) scale(1);} }
      `}</style>

      <VariationsNav active="aurora" />

      {/* Nav */}
      <header className="sticky top-10 z-30 backdrop-blur bg-white/80 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" aria-label="ComfortOS home">
            <div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="font-semibold text-lg tracking-tight">ComfortOS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900">Features</a>
            <a href="#how" className="hover:text-gray-900">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2">Sign in</Link>
            <Link to="/signup" className="inline-flex items-center gap-1.5 text-sm font-semibold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero with Aurora */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden>
          <div
            className="absolute -top-40 left-1/4 h-[34rem] w-[34rem] rounded-full bg-primary-300/40 blur-3xl"
            style={{ animation: 'aurora-a 22s ease-in-out infinite' }}
          />
          <div
            className="absolute -bottom-32 right-1/4 h-[32rem] w-[32rem] rounded-full bg-emerald-200/50 blur-3xl"
            style={{ animation: 'aurora-b 26s ease-in-out infinite' }}
          />
          <div
            className="absolute top-1/3 right-1/3 h-[20rem] w-[20rem] rounded-full bg-teal-200/50 blur-3xl"
            style={{ animation: 'aurora-c 30s ease-in-out infinite' }}
          />
        </div>

        <div className="absolute inset-0 -z-10 opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)',
          }}
        />

        <div className="max-w-6xl mx-auto px-6 pt-16 pb-0 w-full">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <motion.div variants={stagger} initial="hidden" animate="show" className="lg:col-span-7 text-center lg:text-left">
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/90 pl-2 pr-3.5 py-1.5 text-xs font-medium text-gray-700 mb-8 shadow-sm backdrop-blur"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-600 text-white px-2 py-0.5 text-[10px] font-semibold tracking-wide">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-white/80 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                  </span>
                  Live
                </span>
                <span className="text-gray-600">A building that takes hints</span>
              </motion.div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter leading-[1.04]">
                {titleLines.map((line, li) => (
                  <span key={li} className="block">
                    {line.words.map((word, wi) => {
                      const isAccent = wi === line.accentIdx;
                      const base = 0.15 + li * 0.35;
                      return (
                        <span key={`${li}-${wi}`} className="inline-block mr-3">
                          {word.split('').map((ch, ci) => (
                            <motion.span
                              key={`${li}-${wi}-${ci}`}
                              initial={{ y: reduce ? 0 : 60, opacity: 0, filter: 'blur(8px)' }}
                              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                              transition={{
                                delay: base + wi * 0.06 + ci * 0.022,
                                type: 'spring',
                                stiffness: 110,
                                damping: 14,
                              }}
                              className={`inline-block ${isAccent ? 'text-primary-700 italic' : 'text-gray-900'}`}
                            >
                              {ch}
                            </motion.span>
                          ))}
                        </span>
                      );
                    })}
                  </span>
                ))}
              </h1>

              <motion.p variants={fadeUp} className="mt-7 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                ComfortOS unifies occupants, facility managers and building systems — so comfort feedback turns into action, in real time.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-9 flex flex-wrap justify-center lg:justify-start gap-3">
                <Link to="/signup" className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3.5 rounded-full font-semibold hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all hover:shadow-xl hover:-translate-y-0.5">
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className="inline-flex items-center gap-2 border border-gray-300 bg-white/80 backdrop-blur text-gray-800 px-6 py-3.5 rounded-full font-semibold hover:bg-white">
                  Sign in
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-12 flex flex-wrap justify-center lg:justify-start items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                {['Real-time votes', 'Role-aware', 'Server-driven UI', 'Presence-aware'].map((it) => (
                  <span key={it} className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-primary-600" />
                    {it}
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
                          <div className="text-[10px] font-medium text-gray-500 leading-none">De Rotterdam</div>
                          <div className="text-[11px] font-semibold text-gray-900 leading-tight">Floor 4 · Oostvleugel</div>
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
        </div>
      </section>

      {/* Rich dashboard mock */}
      <section className="relative pt-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative mx-auto max-w-5xl px-6"
        >
          <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-primary-900/10 overflow-hidden">
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
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">De Rotterdam · Wilhelminakade 179</div>
                    <div className="text-lg md:text-xl font-bold tracking-tight text-gray-900">Comfort dashboard</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-medium inline-flex items-center gap-1.5">
                      <span aria-hidden>🌤</span>
                      7°C · Rotterdam
                    </div>
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
                          <div className="font-medium text-gray-900 truncate">Floor 4 · Oostvleugel</div>
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
                          <div className="font-medium text-gray-900 truncate">Floor 7 · Laboratorium 3</div>
                          <div className="text-[10px] text-gray-500">21 votes · 47m ago</div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-semibold shrink-0">Warm</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-4 rounded-xl border border-gray-100 p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-semibold text-gray-900">Occupancy</div>
                      <div className="text-[10px] font-medium text-gray-500">Nu in gebouw</div>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <div className="text-xl font-bold tracking-tight text-gray-900 tabular-nums">412</div>
                      <div className="text-[11px] text-gray-500">/ 640</div>
                      <div className="ml-auto text-[11px] font-medium text-primary-700">64%</div>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-primary-500" style={{ width: '64%' }} />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px]">
                      {[
                        { l: 'V2', v: 82 },
                        { l: 'V4', v: 71 },
                        { l: 'V7', v: 43 },
                      ].map((f) => (
                        <div key={f.l} className="rounded-md bg-gray-50 px-2 py-1 flex items-center justify-between">
                          <span className="font-medium text-gray-600">{f.l}</span>
                          <span className="font-semibold text-gray-900 tabular-nums">{f.v}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-12 md:col-span-4 rounded-xl border border-gray-100 p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-semibold text-gray-900">Energy today</div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">−8%</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <div className="text-xl font-bold tracking-tight text-gray-900 tabular-nums">142</div>
                      <div className="text-[11px] text-gray-500">kWh · HVAC</div>
                    </div>
                    <svg viewBox="0 0 120 32" className="w-full h-8 mt-2" aria-hidden="true">
                      <polyline
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        className="text-emerald-500"
                        points="0,22 15,18 30,20 45,14 60,16 75,10 90,12 105,8 120,6"
                      />
                    </svg>
                    <div className="mt-1 text-[10px] text-gray-500">vs yesterday · baseline from BMS</div>
                  </div>

                  <div className="col-span-12 md:col-span-4 rounded-xl border border-gray-100 p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-semibold text-gray-900">HVAC setpoints</div>
                      <div className="text-[10px] font-medium text-primary-700">Edit →</div>
                    </div>
                    <ul className="space-y-2 text-[11px]">
                      {[
                        { z: 'Zone 4-Oost', t: '22.5°C', tone: 'text-orange-600' },
                        { z: 'Zone 2-Atrium', t: '21.0°C', tone: 'text-blue-600' },
                        { z: 'Zone 7-Lab', t: '22.0°C', tone: 'text-gray-700' },
                      ].map((s) => (
                        <li key={s.z} className="flex items-center justify-between gap-2">
                          <span className="text-gray-600 truncate">{s.z}</span>
                          <span className={`font-semibold tabular-nums ${s.tone}`}>{s.t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

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
                        <div className="text-gray-900 font-medium">+2 vote · Floor 4 · Oostvleugel</div>
                        <div className="text-gray-500">Thermal · 2m ago</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-md bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Gauge className="h-3 w-3 text-orange-600" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="text-gray-900 font-medium">Setpoint lowered 0.5°C</div>
                        <div className="text-gray-500">HVAC · Zone 4-Oost · 3m ago</div>
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
        </motion.div>
      </section>

      {/* Trio — voice · impact · floor */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* soft aurora glow */}
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div
            className="absolute left-1/2 top-1/3 -translate-x-1/2 h-[26rem] w-[26rem] rounded-full bg-primary-200/40 blur-3xl"
            style={{ animation: reduce ? undefined : 'aurora-c 26s ease-in-out infinite' }}
          />
        </div>
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-14 md:mb-16">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary-700 mb-3">
              Why occupants use it
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Your voice.{' '}
              <span className="text-primary-700 italic">Your impact.</span>{' '}
              Your floor.
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              ComfortOS isn&apos;t a suggestion box. Every vote belongs to the person
              who filed it, leads to a visible building action, and sits alongside the
              feelings of everyone else in the same space.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Card 1 — Voice (autonomy) */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="relative rounded-3xl border border-gray-200 bg-white p-6 md:p-7 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 text-primary-700 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider mb-4">
                I · Your voice
              </div>
              <h3 className="text-xl font-bold tracking-tight text-gray-900 mb-2">
                Anonymous. Five seconds. Done.
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                One tap, one feeling, one space. Your vote is yours — not your
                manager&apos;s, not HR&apos;s.
              </p>

              <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-primary-50/40 p-4">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-gray-500 mb-3">
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
                      className={`flex-1 rounded-lg text-[11px] font-semibold py-1.5 text-center tabular-nums ${
                        i === 5
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'bg-white border border-gray-200 text-gray-600'
                      }`}
                    >
                      {v}
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-[11px] text-gray-500">
                  Your history → kept private
                </div>
              </div>
            </motion.article>

            {/* Card 2 — Impact (competence) */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="relative rounded-3xl border border-gray-200 bg-white p-6 md:p-7 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 text-orange-700 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider mb-4">
                II · Your impact
              </div>
              <h3 className="text-xl font-bold tracking-tight text-gray-900 mb-2">
                Every vote traces to an action.
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                Not a ticket. Not a &ldquo;we&apos;ll look into it.&rdquo; A setpoint
                moves — and you see it happen.
              </p>

              <ol className="rounded-2xl border border-gray-100 overflow-hidden bg-white">
                {[
                  { t: 'You voted warm (+2)', s: '09:42 · Floor 4E', dot: 'bg-gray-900' },
                  { t: 'Setpoint −0.5°C', s: '09:44 · HVAC Zone 4E', dot: 'bg-orange-500' },
                  { t: '23.1°C · −0.3°', s: '09:47 · sensor confirms', dot: 'bg-primary-500' },
                ].map((row, i) => (
                  <li
                    key={row.t}
                    className={`flex items-start gap-3 px-4 py-3 ${
                      i > 0 ? 'border-t border-gray-100' : ''
                    }`}
                  >
                    <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${row.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-gray-900 tabular-nums">
                        {row.t}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{row.s}</div>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-50 text-primary-700 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
                <Check className="h-3 w-3" />
                Loop closed in 5&nbsp;min
              </div>
            </motion.article>

            {/* Card 3 — Floor (relatedness) */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="relative rounded-3xl border border-gray-200 bg-white p-6 md:p-7 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider mb-4">
                III · Your floor
              </div>
              <h3 className="text-xl font-bold tracking-tight text-gray-900 mb-2">
                You&apos;re not the only one feeling it.
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                Agreement gives your vote weight — and turns comfort into a shared
                project, not a private gripe.
              </p>

              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-gray-500 mb-3">
                  <span>Floor 4 · right now</span>
                  <span className="inline-flex items-center gap-1 text-primary-700 font-semibold">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-500" />
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
                    className="bg-primary-500 flex items-center justify-center text-[10px] font-semibold text-white tabular-nums"
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
                <div className="mt-2 flex justify-between text-[11px] uppercase tracking-wider text-gray-500">
                  <span>Cold</span>
                  <span>Neutral</span>
                  <span>Warm</span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[
                      { n: 'NU', bg: 'bg-primary-600', fg: 'text-white' },
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
                  <div className="text-[11px] text-gray-600 leading-tight">
                    <span className="font-semibold text-gray-900">14 others</span> voted
                    the same as you today.
                  </div>
                </div>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center mb-12 md:mb-16"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-primary-700 mb-3">What it does</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              A single platform for comfort, analytics and control
            </h2>
            <p className="mt-4 text-gray-600">ComfortOS unifies feedback, presence, sensor data and configuration — so every stakeholder works from the same live picture.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-gray-200 bg-white p-6 hover:border-primary-300 hover:shadow-lg transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mb-3">
                  <f.icon className="h-5 w-5 text-primary-700" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{f.body}</p>
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
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 text-white p-10 md:p-14 text-center shadow-xl"
          >
            <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(400px 160px at 20% 0%, rgba(255,255,255,0.35), transparent), radial-gradient(300px 140px at 80% 100%, rgba(255,255,255,0.25), transparent)' }} />
            <h2 className="relative text-3xl md:text-4xl font-bold tracking-tight">Ready to make your building listen?</h2>
            <p className="relative mt-3 text-primary-100 max-w-xl mx-auto">Create an account in a minute, or sign in to pick up where you left off.</p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/signup" className="inline-flex items-center gap-2 bg-white text-primary-700 px-5 py-3 rounded-xl font-semibold hover:bg-primary-50 shadow-md">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 border border-white/40 text-white px-5 py-3 rounded-xl font-semibold hover:bg-white/10">
                Sign in
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary-600 text-white flex items-center justify-center">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            <span>ComfortOS — Smart Building Platform</span>
          </div>
          <div>Variation: Aurora</div>
        </div>
      </footer>
    </div>
  );
}
