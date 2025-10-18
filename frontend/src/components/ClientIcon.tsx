import React from 'react'

interface ClientIconProps {
  size?: number
  color?: string
}

export function ClientIcon({ size = 24, color = 'currentColor' }: ClientIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Person silhouette */}
      <path
        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
        fill={color}
      />
      <path
        d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z"
        fill={color}
      />
      
      {/* Plus sign circle */}
      <circle
        cx="18"
        cy="6"
        r="4"
        fill={color}
      />
      <path
        d="M16 6H20M18 4V8"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
