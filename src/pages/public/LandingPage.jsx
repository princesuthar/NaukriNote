// Public landing page with hero, features, process, testimonials, CTA, and footer.
import { Link } from 'react-router-dom'
import FeatureCard from '../../components/common/FeatureCard'
import TestimonialCard from '../../components/common/TestimonialCard'
import Footer from '../../components/layout/Footer'
import PublicNavbar from '../../components/layout/PublicNavbar'

const features = [
  {
    icon: '🏗️',
    title: 'Multi-Site Management',
    description:
      'Manage multiple construction sites from a single dashboard. Add sites, assign workers, and track everything separately.',
  },
  {
    icon: '✅',
    title: 'Smart Attendance Tracking',
    description:
      'Mark attendance manually or let workers request attendance from their phones. Approve with one click.',
  },
  {
    icon: '💰',
    title: 'Automatic Payroll',
    description:
      'Daily wages are calculated automatically as attendance is marked. See exactly what is owed to each worker.',
  },
  {
    icon: '👷',
    title: 'Worker Profiles',
    description:
      'Store complete worker information including daily wage, UPI QR code, and full attendance history.',
  },
  {
    icon: '📱',
    title: 'Mobile Worker Interface',
    description:
      'Workers get their own mobile-friendly interface to request attendance and view their earnings history.',
  },
  {
    icon: '💳',
    title: 'UPI Payment Ready',
    description:
      "Save each worker's UPI QR code and pay directly from the app. Mark payments instantly to keep records clean.",
  },
]

const testimonials = [
  {
    quote:
      'Managing 3 sites and 40 workers used to be a nightmare. Now I approve attendance from my phone in the morning and payroll calculates itself.',
    name: 'Rajesh Patel',
    role: 'Contractor, Mumbai',
  },
  {
    quote:
      'The UPI QR feature is brilliant. I just open the app, see who to pay and how much, scan their QR and done. No more manual calculation.',
    name: 'Suresh Kumar',
    role: 'Site Manager, Pune',
  },
  {
    quote:
      'My workers love that they can check their attendance and earnings from their own phones. It builds trust on the site.',
    name: 'Amit Singh',
    role: 'Contractor, Delhi',
  },
]

const steps = [
  {
    title: 'Create Your Account',
    description: 'Sign up free and set up your contractor profile in seconds.',
  },
  {
    title: 'Add Your Sites',
    description: 'Create your construction sites and organize your workforce by location.',
  },
  {
    title: 'Add Workers',
    description: 'Add workers with their daily wage and assign them to sites.',
  },
  {
    title: 'Track & Pay',
    description: 'Mark attendance daily and pay workers directly through the app.',
  },
]

function LandingPage() {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="bg-white">
      <PublicNavbar />
      <main>
        <section className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 px-4 pt-28 pb-10 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(30deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

          <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center text-center">
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px w-10 bg-orange-400/70" />
              <p className="text-sm uppercase tracking-widest text-orange-400">
                Trusted by Construction Contractors
              </p>
              <span className="h-px w-10 bg-orange-400/70" />
            </div>

            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
              <span className="block">Manage Your Sites.</span>
              <span className="block">Track Your Workers.</span>
              <span className="block text-orange-400">Pay With Ease.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-gray-300">
              The complete attendance and payroll management system built specifically for construction
              site contractors.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/signup"
                className="rounded-lg bg-orange-500 px-8 py-3 text-lg font-semibold text-white transition hover:bg-orange-600"
              >
                Start For Free
              </Link>
              <button
                type="button"
                onClick={scrollToFeatures}
                className="rounded-lg border border-white px-8 py-3 text-lg font-semibold text-white transition hover:bg-white hover:text-gray-900"
              >
                See How It Works
              </button>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-400 sm:gap-4">
              <span>500+ Workers Managed</span>
              <span className="hidden h-4 w-px bg-gray-500 sm:block" />
              <span>50+ Active Sites</span>
              <span className="hidden h-4 w-px bg-gray-500 sm:block" />
              <span>100% Free to Start</span>
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white">
            <span className="block animate-bounce text-2xl" aria-hidden="true">
              ↓
            </span>
          </div>
        </section>

        <section id="features" className="bg-white py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm uppercase tracking-widest text-orange-500">EVERYTHING YOU NEED</p>
            <h2 className="mt-3 text-center text-3xl font-bold text-gray-900">Built for the Construction Site</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-gray-500">
              From marking attendance to processing payroll, manage your entire workforce from one
              dashboard.
            </p>

            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-950 py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm uppercase tracking-widest text-orange-400">HOW IT WORKS</p>
            <h2 className="mt-3 text-center text-3xl font-bold text-white">Up and Running in Minutes</h2>

            <div className="relative mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="pointer-events-none absolute top-6 left-0 hidden h-px w-full border-t-2 border-dotted border-orange-400/50 lg:block" />

              {steps.map((step, index) => (
                <article key={step.title} className="relative rounded-xl border border-gray-800 bg-gray-900/60 p-5">
                  <div className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
                    {index + 1}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-400">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm uppercase tracking-widest text-orange-500">TESTIMONIALS</p>
            <h2 className="mt-3 text-center text-3xl font-bold text-gray-900">Contractors Love WorkSite Manager</h2>

            <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.name} {...testimonial} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-orange-500 py-16">
          <div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white">Ready to Take Control of Your Workforce?</h2>
            <p className="mt-3 text-orange-100">
              Join hundreds of contractors already using WorkSite Manager. Free to start, no credit card
              needed.
            </p>
            <Link
              to="/signup"
              className="mt-6 inline-flex rounded-lg bg-white px-8 py-3 font-bold text-orange-500 transition hover:bg-gray-100"
            >
              Get Started For Free
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default LandingPage
