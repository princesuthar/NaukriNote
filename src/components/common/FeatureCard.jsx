// Feature card with glassmorphism, gradient hover border, and micro-animations.
function FeatureCard({ icon, title, description }) {
  return (
    <article className="gradient-border group p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-xl shadow-glow transition-transform duration-300 group-hover:scale-110">
        <span role="img" aria-hidden="true">
          {icon}
        </span>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-400">{description}</p>
    </article>
  )
}

export default FeatureCard