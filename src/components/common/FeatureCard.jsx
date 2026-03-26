// Reusable feature card for highlighting platform capabilities.
function FeatureCard({ icon, title, description }) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition hover:shadow-xl">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-xl">
        <span role="img" aria-hidden="true">
          {icon}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
    </article>
  )
}

export default FeatureCard