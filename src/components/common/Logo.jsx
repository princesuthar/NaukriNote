// NaukriNote brand logo — construction notepad with hard hat icon.
// Uses unique gradient IDs via useId to avoid SVG conflicts.
import { useId } from 'react'

function Logo({ size = 40, className = '' }) {
  const uid = useId()
  const gradId = `nk-grad-${uid}`
  const grad2Id = `nk-grad2-${uid}`

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
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id={grad2Id} x1="20" y1="10" x2="44" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Rounded background */}
      <rect width="64" height="64" rx="16" fill={`url(#${gradId})`} />

      {/* Notepad body */}
      <rect x="18" y="18" width="28" height="34" rx="3" fill={`url(#${grad2Id})`} />

      {/* Notepad lines */}
      <line x1="23" y1="28" x2="41" y2="28" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
      <line x1="23" y1="33" x2="37" y2="33" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
      <line x1="23" y1="38" x2="39" y2="38" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" opacity="0.3" />
      <line x1="23" y1="43" x2="34" y2="43" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" opacity="0.25" />

      {/* Hard hat — dome */}
      <path
        d="M24 22 C24 15 30 10 36 10 C42 10 48 15 48 22"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Hard hat — brim */}
      <rect x="22" y="20" width="28" height="5" rx="2.5" fill="#fff" />

      {/* Checkmark on notepad */}
      <path
        d="M35 30 L37.5 33 L42 27"
        stroke="#f97316"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.7"
      />
    </svg>
  )
}

export default Logo
