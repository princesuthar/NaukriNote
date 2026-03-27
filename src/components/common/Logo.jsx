// NaukriNote brand logo — clipboard where 'N' morphs into an attendance checkmark.
// Uses unique gradient IDs via useId to avoid SVG definition conflicts.
import { useId } from 'react'

function Logo({ size = 40, className = '' }) {
  const uid = useId()
  const bgGradId = `bgGrad-${uid}`
  const nMarkGradId = `nMarkGrad-${uid}`
  const shadowId = `shadow-${uid}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="NaukriNote logo"
      style={{ minWidth: size, minHeight: size }}
    >
      <defs>
        <linearGradient id={bgGradId} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id={nMarkGradId} x1="22" y1="26" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <filter id={shadowId} x="0" y="0" width="100%" height="100%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* App Icon Base */}
      <rect width="64" height="64" rx="16" fill={`url(#${bgGradId})`} />

      {/* Clipboard Body */}
      <rect x="14" y="14" width="36" height="42" rx="4" fill="#ffffff" filter={`url(#${shadowId})`} />

      {/* Clipboard Metal Clip */}
      <rect x="24" y="10" width="16" height="8" rx="4" fill="#cbd5e1" />
      <circle cx="32" cy="14" r="2" fill="#94a3b8" />

      {/* Horizontal lines for the "Note" aspect */}
      <line x1="20" y1="24" x2="44" y2="24" stroke="#f1f5f9" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="32" x2="44" y2="32" stroke="#f1f5f9" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="40" x2="44" y2="40" stroke="#f1f5f9" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="48" x2="36" y2="48" stroke="#f1f5f9" strokeWidth="2" strokeLinecap="round" />

      {/* The stylized 'N' + Checkmark */}
      <path
        d="M22 42 V26 L31 42 L44 24"
        stroke={`url(#${nMarkGradId})`}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default Logo
