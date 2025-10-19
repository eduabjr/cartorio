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
      {/* Scanner base - retângulo simples */}
      <rect
        x="3"
        y="8"
        width="18"
        height="12"
        rx="2"
        fill="#e5e7eb"
        stroke="#6b7280"
        strokeWidth="1.5"
      />
      
      {/* Scanner lid - tampa aberta */}
      <rect
        x="4"
        y="4"
        width="16"
        height="6"
        rx="1"
        fill="#f9fafb"
        stroke="#6b7280"
        strokeWidth="1.5"
        transform="rotate(-5 12 7)"
      />
      
      {/* Área de digitalização - retângulo escuro */}
      <rect
        x="6"
        y="10"
        width="12"
        height="6"
        rx="1"
        fill="#1f2937"
        stroke="#374151"
        strokeWidth="1"
      />
      
      {/* Linha de digitalização - azul brilhante */}
      <rect
        x="6"
        y="12.5"
        width="12"
        height="1"
        fill="#3b82f6"
        rx="0.5"
      />
      
      {/* Linha de digitalização - azul brilhante */}
      <rect
        x="6"
        y="14.5"
        width="12"
        height="1"
        fill="#3b82f6"
        rx="0.5"
      />
      
      {/* Botão de controle */}
      <circle
        cx="18"
        cy="6"
        r="1.5"
        fill="#ef4444"
        stroke="#dc2626"
        strokeWidth="0.5"
      />
    </svg>
  )
}
