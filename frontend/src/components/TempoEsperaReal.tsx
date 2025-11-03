import React from 'react'
import { useTempoDecorrido, formatarTempo } from '../hooks/useTempoReal'

interface TempoEsperaRealProps {
  dataInicial: Date | string
  style?: React.CSSProperties
  className?: string
  prefixo?: string
}

/**
 * Componente que exibe tempo de espera atualizado em tempo real
 */
export function TempoEsperaReal({ dataInicial, style, className, prefixo = '' }: TempoEsperaRealProps) {
  const minutos = useTempoDecorrido(dataInicial)
  
  return (
    <span style={style} className={className}>
      {prefixo}{formatarTempo(minutos)}
    </span>
  )
}

