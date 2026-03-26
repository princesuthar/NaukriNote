// Premium landing page with animated hero, glassmorphism features, and gradient sections.
import { Link } from 'react-router-dom'
import FeatureCard from '../../components/common/FeatureCard'
import TestimonialCard from '../../components/common/TestimonialCard'
import Footer from '../../components/layout/Footer'
import PublicNavbar from '../../components/layout/PublicNavbar'

const features = [
  { icon: '🏗️', title: 'Multi-Site Management', description: 'Manage multiple construction sites from a single dashboard. Add sites, assign workers, and track everything separately.' },
  { icon: '✅', title: 'Smart Attendance Tracking', description: 'Mark attendance manually or let workers request attendance from their phones. Approve with one click.' },
  { icon: '💰', title: 'Automatic Payroll', description: 'Daily wages are calculated automatically as attendance is marked. See exactly what is owed to each worker.' },
  { icon: '👷', title: 'Worker Profiles', description: 'Store complete worker information including daily wage, UPI QR code, and full attendance history.' },
  { icon: '📱', title: 'Mobile Worker Interface', description: 'Workers get their own mobile-friendly interface to request attendance and view their earnings history.' },
  { icon: '💳', title: 'UPI Payment Ready', description: "Save each worker's UPI QR code and pay directly from the app. Mark payments instantly to keep records clean." },
]

const testimonials = [
  { quote: 'Managing 3 sites and 40 workers used to be a nightmare. Now I approve attendance from my phone in the morning and payroll calculates itself.', name: 'Rajesh Patel', role: 'Contractor, Mumbai' },
  { quote: 'The UPI QR feature is brilliant. I just open the app, see who to pay and how much, scan their QR and done. No more manual calculation.', name: 'Suresh Kumar', role: 'Site Manager, Pune' },
  { quote: 'My workers love that they can check their attendance and earnings from their own phones. It builds trust on the site.', name: 'Amit Singh', role: 'Contractor, Delhi' },
]

const steps = [
  { title: 'Create Your Account', description: 'Sign up free and set up your contractor profile in seconds.' },
  { title: 'Add Your Sites', description: 'Create your construction sites and organize your workforce by location.' },
  { title: 'Add Workers', description: 'Add workers with their daily wage and assign them to sites.' },
  { title: 'Track & Pay', description: 'Mark attendance daily and pay workers directly through the app.' },
]

function LandingPage() {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="bg-surface-400">
      <PublicNavbar />
      <main>
        <section className="relative flex min-h-screen items-center overflow-hidden bg-surface-400 px-4 pt-28 pb-10 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-20 -left-32 h-[500px] w-[500px] rounded-full bg-brand-500/10 blur-[120px] animate-glow-pulse" />
            <div className="absolute -right-32 bottom-20 h-[400px] w-[400px] rounded-full bg-amber-500/8 blur-[100px] animate-glow-pulse delay-500" />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(30deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>
          <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center text-center">
            <div className="mb-8 flex items-center gap-4 animate-fade-in">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-brand-400" />
              <p className="text-sm uppercase tracking-widest text-brand-400">Trusted by Construction Contractors</p>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-brand-400" />
            </div>
            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl animate-slide-up">
              <span className="block">Manage Your Sites.</span>
              <span className="block">Track Your Workers.</span>
              <span className="block text-gradient">Pay With Ease.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-gray-400 animate-slide-up" style={{animationDelay: '200ms'}}>
              The complete attendance and payroll management system built specifically for construction site contractors.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row animate-slide-up" style={{animationDelay: '400ms'}}>
              <Link to="/signup" className="btn-primary px-8 py-3 text-lg">Start For Free</Link>
              <button type="button" onClick={scrollToFeatures} className="btn-secondary px-8 py-3 text-lg">See How It Works</button>
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500 sm:gap-6 animate-fade-in" style={{animationDelay: '600ms'}}>
              <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /><span>500+ Workers Managed</span></div>
              <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-400" /><span>50+ Active Sites</span></div>
              <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /><span>100% Free to Start</span></div>
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500">
            <span className="block animate-bounce text-2xl" aria-hidden="true">↓</span>
          </div>
        </section>

        <section id="features" className="bg-surface-500 py-24">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm uppercase tracking-widest text-brand-400">EVERYTHING YOU NEED</p>
            <h2 className="mt-3 text-center text-3xl font-bold text-white">Built for the Construction Site</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-gray-400">From marking attendance to processing payroll, manage your entire workforce from one dashboard.</p>
            <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (<FeatureCard key={feature.title} {...feature} />))}
            </div>
          </div>
        </section>

        <section className="bg-surface-400 py-24">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm uppercase tracking-widest text-brand-400">HOW IT WORKS</p>
            <h2 className="mt-3 text-center text-3xl font-bold text-white">Up and Running in Minutes</h2>
            <div className="relative mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="pointer-events-none absolute top-8 left-0 hidden h-px w-full bg-gradient-to-r from-brand-500/50 via-amber-500/30 to-transparent lg:block" />
              {steps.map((step, index) => (
                <article key={step.title} className="glass-card relative p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
                  <div className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand font-bold text-white shadow-glow">{index + 1}</div>
                  <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-400">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface-500 py-24">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm uppercase tracking-widest text-brand-400">TESTIMONIALS</p>
            <h2 className="mt-3 text-center text-3xl font-bold text-white">Contractors Love NaukriNote</h2>
            <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {testimonials.map((testimonial) => (<TestimonialCard key={testimonial.name} {...testimonial} />))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 bg-gradient-brand opacity-90" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:30px_30px]" />
          <div className="relative mx-auto w-full max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white">Ready to Take Control of Your Workforce?</h2>
            <p className="mt-3 text-orange-100">Join hundreds of contractors already using NaukriNote. Free to start, no credit card needed.</p>
            <Link to="/signup" className="mt-8 inline-flex rounded-xl bg-white px-8 py-3 font-bold text-brand-600 shadow-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-xl hover:-translate-y-0.5">
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
