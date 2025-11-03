import { useEffect, useRef, useState } from 'react'

interface AutoLogoutConfig {
  enabled: boolean
  timeoutMinutes: number
  warningMinutes?: number // Minutos antes do logout para mostrar aviso (padrão: 1)
  onLogout: () => void
}

export function useAutoLogout({ enabled, timeoutMinutes, warningMinutes = 1, onLogout }: AutoLogoutConfig) {
  const [remainingTime, setRemainingTime] = useState<number>(warningMinutes * 60)
  const [showWarning, setShowWarning] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  const resetTimer = () => {
    // Limpar timers anteriores
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
    
    setShowWarning(false)
    setRemainingTime(warningMinutes * 60)

    if (!enabled) return

    console.log(`⏰ Timer resetado: ${timeoutMinutes}min total, aviso em ${warningMinutes}min antes`)

    // Aviso X minutos antes (configurável)
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000
    if (warningTime > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        setShowWarning(true)
        console.log(`⚠️ Aviso: ${warningMinutes} minuto(s) para logout automático!`)
        
        // Countdown
        let seconds = warningMinutes * 60
        setRemainingTime(seconds)
        
        countdownRef.current = setInterval(() => {
          seconds--
          setRemainingTime(seconds)
          
          if (seconds <= 0 && countdownRef.current) {
            clearInterval(countdownRef.current)
          }
        }, 1000)
      }, warningTime)
    }

    // Logout automático
    timeoutRef.current = setTimeout(() => {
      console.log('🚪 Logout automático por inatividade!')
      onLogout()
    }, timeoutMinutes * 60 * 1000)
  }

  useEffect(() => {
    console.log('🔄 useAutoLogout useEffect - enabled:', enabled, 'timeoutMinutes:', timeoutMinutes, 'warningMinutes:', warningMinutes)
    
    if (!enabled) {
      console.log('⏸️ Auto-logout DESABILITADO - limpando timers')
      // Limpar todos os timers se desabilitado
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
      setShowWarning(false)
      return
    }
    
    console.log(`✅ Auto-logout HABILITADO com ${timeoutMinutes} minutos (aviso ${warningMinutes} min antes)`)

    // Eventos que resetam o timer
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer)
    })

    // Iniciar timer
    resetTimer()

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer)
      })
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [enabled, timeoutMinutes, warningMinutes])

  const cancelLogout = () => {
    resetTimer()
    setShowWarning(false)
  }

  return {
    showWarning,
    remainingTime,
    cancelLogout,
    resetTimer
  }
}

