// Testimonial card with glassmorphism and gradient quote accent.
function TestimonialCard({ quote, name, role }) {
  return (
    <article className="glass-card group p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
      <div className="text-2xl font-bold text-gradient leading-none">"</div>
      <blockquote className="mt-3 text-sm leading-relaxed text-gray-300 italic">
        {quote}
      </blockquote>
      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-white">{name}</p>
          <p className="text-xs text-gray-400">{role}</p>
        </div>
      </div>
    </article>
  )
}

export default TestimonialCard