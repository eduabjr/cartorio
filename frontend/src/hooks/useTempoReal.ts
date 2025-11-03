import { useState, useEffect } from 'react'

/**
 * Hook para calcular tempo decorrido em tempo real
 * Atualiza automaticamente a cada segundo
 */
export function useTempoDecorrido(dataInicial: Date | string | undefined): number {
  const [minutos, setMinutos] = useState(0)

  useEffect(() => {
    if (!dataInicial) {
      setMinutos(0)
      return
    }

    const calcularTempo = () => {
      const agora = new Date()
      const inicio = new Date(dataInicial)
      const diffMs = agora.getTime() - inicio.getTime()
      const diffMin = Math.floor(diffMs / 1000 / 60)
      setMinutos(diffMin)
    }

    // Calcular imediatamente
    calcularTempo()

    // Atualizar a cada segundo
    const intervalo = setInterval(calcularTempo, 1000)

    return () => clearInterval(intervalo)
  }, [dataInicial])

  return minutos
}

/**
 * Hook para forçar re-render a cada segundo
 * Útil para componentes que precisam atualizar tempos
 */
export function useTempoReal() {
  const [agora, setAgora] = useState(new Date())

  useEffect(() => {
    const intervalo = setInterval(() => {
      setAgora(new Date())
    }, 1000)

    return () => clearInterval(intervalo)
  }, [])

  return agora
}

/**
 * Formata minutos em formato legível
 */
export function formatarTempo(minutos: number): string {
  if (minutos < 1) return '< 1 min'
  if (minutos < 60) return `${Math.floor(minutos)} min`
  
  const horas = Math.floor(minutos / 60)
  const mins = Math.floor(minutos % 60)
  
  return `${horas}h${mins > 0 ? ` ${mins}min` : ''}`
}

