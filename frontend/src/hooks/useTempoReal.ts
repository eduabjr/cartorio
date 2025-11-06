import { useState, useEffect } from 'react'

/**
 * Hook para calcular tempo decorrido em tempo real
 * Atualiza automaticamente a cada segundo
 * Retorna: { horas, minutos, segundos }
 */
export function useTempoDecorrido(dataInicial: Date | string | undefined): { horas: number; minutos: number; segundos: number } {
  const [tempo, setTempo] = useState({ horas: 0, minutos: 0, segundos: 0 })

  useEffect(() => {
    if (!dataInicial) {
      setTempo({ horas: 0, minutos: 0, segundos: 0 })
      return
    }

    const calcularTempo = () => {
      const agora = new Date()
      const inicio = new Date(dataInicial)
      const diffMs = agora.getTime() - inicio.getTime()
      const diffSegundos = Math.floor(diffMs / 1000)
      
      const horas = Math.floor(diffSegundos / 3600)
      const minutos = Math.floor((diffSegundos % 3600) / 60)
      const segundos = diffSegundos % 60
      
      setTempo({ horas, minutos, segundos })
    }

    // Calcular imediatamente
    calcularTempo()

    // Atualizar a cada segundo
    const intervalo = setInterval(calcularTempo, 1000)

    return () => clearInterval(intervalo)
  }, [dataInicial])

  return tempo
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
 * Formata tempo em formato legível
 * Aceita número (minutos) ou objeto { horas, minutos, segundos }
 */
export function formatarTempo(tempo: number | { horas: number; minutos: number; segundos: number }): string {
  // Se for número (compatibilidade com código antigo)
  if (typeof tempo === 'number') {
    if (tempo < 1) return '< 1 min'
    if (tempo < 60) return `${Math.floor(tempo)} min`
    
    const horas = Math.floor(tempo / 60)
    const mins = Math.floor(tempo % 60)
    
    return `${horas}h${mins > 0 ? ` ${mins}min` : ''}`
  }
  
  // Se for objeto com horas, minutos e segundos
  const { horas, minutos, segundos } = tempo
  
  // Se tudo é zero
  if (horas === 0 && minutos === 0 && segundos === 0) return '0s'
  
  // Se tem horas
  if (horas > 0) {
    if (minutos === 0 && segundos === 0) return `${horas}h`
    if (segundos === 0) return `${horas}h ${minutos}min`
    return `${horas}h ${minutos}min ${segundos}s`
  }
  
  // Se tem apenas minutos e segundos
  if (minutos > 0) {
    if (segundos === 0) return `${minutos}min`
    return `${minutos}min ${segundos}s`
  }
  
  // Apenas segundos
  return `${segundos}s`
}

