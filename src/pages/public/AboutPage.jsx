// Premium about page with gradient hero and glassmorphism mission section.
import Footer from '../../components/layout/Footer'
import PublicNavbar from '../../components/layout/PublicNavbar'

function AboutPage() {
  return (
    <div className="min-h-screen bg-surface-400">
      <PublicNavbar />
      <main>
        <section className="relative overflow-hidden bg-surface-400 px-4 py-20 pt-32 text-center sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-10 left-1/4 h-[300px] w-[300px] rounded-full bg-brand-500/10 blur-[100px] animate-glow-pulse" />
            <div className="absolute bottom-10 right-1/4 h-[250px] w-[250px] rounded-full bg-amber-500/8 blur-[80px] animate-glow-pulse delay-500" />
          </div>
          <div className="relative mx-auto w-full max-w-3xl animate-slide-up">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">About <span className="text-gradient">NokriNote</span></h1>
            <p className="mt-5 text-lg text-gray-400">We are building tools to make life easier for construction contractors across India.</p>
          </div>
        </section>
        <section className="bg-surface-500 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-3xl">
            <div className="glass-card p-8 text-center sm:p-12">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-brand shadow-glow"><span className="text-2xl">🎯</span></div>
              <h2 className="text-3xl font-bold text-white">Our Mission</h2>
              <p className="mt-6 leading-8 text-gray-400">Construction contractors in India manage large, mobile workforces across multiple sites with very few digital tools. NokriNote was built to solve this — making attendance, payroll, and worker management simple, fast, and mobile-friendly.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default AboutPage
