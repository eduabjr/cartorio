import React from 'react'
import { useAccessibility } from '../hooks/useAccessibility'

interface CivitasLogoProps {
  size?: number
}

export function CivitasLogo({ size = 40 }: CivitasLogoProps) {
  const { getTheme } = useAccessibility()
  const theme = getTheme()

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 0'
    }}>
      {/* Logo SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          flexShrink: 0
        }}
      >
        {/* Cityscape background */}
        <g opacity="0.3">
          <rect x="10" y="60" width="8" height="25" fill={theme.text} />
          <rect x="20" y="55" width="8" height="30" fill={theme.text} />
          <rect x="30" y="50" width="8" height="35" fill={theme.text} />
          <rect x="40" y="45" width="8" height="40" fill={theme.text} />
          <rect x="50" y="50" width="8" height="35" fill={theme.text} />
          <rect x="60" y="55" width="8" height="30" fill={theme.text} />
          <rect x="70" y="60" width="8" height="25" fill={theme.text} />
          <rect x="80" y="65" width="8" height="20" fill={theme.text} />
        </g>

        {/* Scales of Justice */}
        <g fill={theme.text}>
          {/* Central stand */}
          <rect x="48" y="20" width="4" height="50" />
          
          {/* Horizontal beam */}
          <rect x="25" y="25" width="50" height="3" />
          
          {/* Left chain and pan */}
          <line x1="30" y1="28" x2="30" y2="40" stroke={theme.text} strokeWidth="2" />
          <path d="M25 40 L35 40 L35 45 L25 45 Z" fill={theme.text} />
          
          {/* Right chain and pan */}
          <line x1="70" y1="28" x2="70" y2="40" stroke={theme.text} strokeWidth="2" />
          <path d="M65 40 L75 40 L75 45 L65 45 Z" fill={theme.text} />
          
          {/* Document on central pivot */}
          <rect x="46" y="22" width="8" height="10" fill="white" stroke={theme.text} strokeWidth="1" />
          <line x1="47" y1="25" x2="53" y2="25" stroke={theme.text} strokeWidth="0.5" />
          <line x1="47" y1="27" x2="52" y2="27" stroke={theme.text} strokeWidth="0.5" />
          <line x1="47" y1="29" x2="51" y2="29" stroke={theme.text} strokeWidth="0.5" />
          <line x1="47" y1="31" x2="53" y2="31" stroke={theme.text} strokeWidth="0.5" />
        </g>
      </svg>

      {/* Text */}
      <span style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: theme.text,
        letterSpacing: '1px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        CIVITAS
      </span>
    </div>
  )
}
