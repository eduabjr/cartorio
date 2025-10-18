import React from 'react'

interface ScannerIconProps {
  size?: number
  color?: string
}

export function ScannerIcon({ size = 24, color = 'currentColor' }: ScannerIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Scanner body */}
      <rect
        x="2"
        y="6"
        width="20"
        height="12"
        rx="2"
        fill={color}
        stroke={color}
        strokeWidth="1"
      />
      
      {/* Document area */}
      <rect
        x="3"
        y="7"
        width="18"
        height="10"
        rx="1"
        fill="white"
        stroke={color}
        strokeWidth="0.5"
      />
      
      {/* Scan line */}
      <rect
        x="4"
        y="10"
        width="16"
        height="2"
        fill={color}
        opacity="0.6"
        rx="1"
      />
      
      {/* Input tray */}
      <rect
        x="4"
        y="4"
        width="16"
        height="2"
        rx="1"
        fill={color}
        opacity="0.4"
      />
      
      {/* Output tray */}
      <rect
        x="4"
        y="18"
        width="16"
        height="2"
        rx="1"
        fill={color}
        opacity="0.4"
      />
    </svg>
  )
}
