// NaukriNote brand logo SVG component — orange gradient with hard hat motif.
function Logo({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="NaukriNote logo"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#logoGrad)" />
      {/* Hard hat dome */}
      <path
        d="M15 28c0-5 4-9 9-9s9 4 9 9"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      {/* Hard hat brim */}
      <rect x="12" y="27" width="24" height="4" rx="2" fill="#fff" opacity="0.95" />
      {/* N letter */}
      <text
        x="24"
        y="21"
        textAnchor="middle"
        fontFamily="Inter,Arial,sans-serif"
        fontSize="12"
        fontWeight="800"
        fill="#fff"
        dominantBaseline="central"
        opacity="0.95"
      >
        N
      </text>
    </svg>
  )
}

export default Logo
