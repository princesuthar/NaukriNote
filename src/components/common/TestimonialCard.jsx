// Reusable testimonial card used to present contractor feedback.
function TestimonialCard({ quote, name, role }) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
      <p className="text-lg tracking-wide text-amber-500">★★★★★</p>
      <blockquote className="mt-3 text-gray-600 italic">"{quote}"</blockquote>
      <p className="mt-5 font-semibold text-gray-900">{name}</p>
      <p className="text-sm text-gray-400">{role}</p>
    </article>
  )
}

export default TestimonialCard