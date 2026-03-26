// Public about page introducing mission and product context.
import Footer from '../../components/layout/Footer'
import PublicNavbar from '../../components/layout/PublicNavbar'

function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <main>
        <section className="bg-gray-900 px-4 py-20 pt-32 text-center sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-3xl">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">About WorkSite Manager</h1>
            <p className="mt-4 text-lg text-gray-300">
              We are building tools to make life easier for construction contractors across India.
            </p>
          </div>
        </section>

        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            <p className="mt-5 leading-8 text-gray-600">
              Construction contractors in India manage large, mobile workforces across multiple sites
              with very few digital tools. WorkSite Manager was built to solve this - making attendance,
              payroll, and worker management simple, fast, and mobile-friendly.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default AboutPage
