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
      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b border-gray-100">
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
          <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-3xl">
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
              <div className="grid grid-cols-12 gap-4 p-6">
                <div className="col-span-12 md:col-span-4 rounded-xl border border-gray-100 p-5">
                  <div className="text-xs font-medium text-gray-500">Comfort index</div>
                  <div className="mt-2 text-3xl font-bold tracking-tight">78 <span className="text-base font-medium text-primary-600">/ 100</span></div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-primary-700">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-500" />
                    +4 vs yesterday
                  </div>
                </div>
                <div className="col-span-12 md:col-span-4 rounded-xl border border-gray-100 p-5">
                  <div className="text-xs font-medium text-gray-500">Votes today</div>
                  <div className="mt-2 text-3xl font-bold tracking-tight">1,284</div>
                  <div className="mt-3 flex gap-1 h-8 items-end" aria-hidden="true">
                    {[30, 55, 40, 70, 60, 85, 75, 90, 65, 80, 95, 72].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm bg-primary-200" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="col-span-12 md:col-span-4 rounded-xl border border-gray-100 p-5">
                  <div className="text-xs font-medium text-gray-500">Zones flagged</div>
                  <div className="mt-2 text-3xl font-bold tracking-tight">3</div>
                  <ul className="mt-3 space-y-1.5 text-xs text-gray-600">
                    <li className="flex items-center justify-between"><span>Floor 4 · East wing</span><span className="text-orange-600">Warm</span></li>
                    <li className="flex items-center justify-between"><span>Floor 2 · Atrium</span><span className="text-blue-600">Cold</span></li>
                    <li className="flex items-center justify-between"><span>Floor 7 · Lab 3</span><span className="text-orange-600">Warm</span></li>
                  </ul>
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
                <p className="text-sm text-gray-600 leading-relaxed">{f.body}</p>
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
