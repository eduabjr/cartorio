import { useCallback, useRef } from 'react'
import { announcementService } from '../services/AnnouncementService'

/**
 * Hook para anunciar mensagens com leitor de tela respeitando configurações do usuário
 */
export function useScreenReaderAnnounce() {
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  /**
   * Anuncia uma mensagem imediatamente
   */
  const announce = useCallback(async (text: string, priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal') => {
    if (!text) return
    
    await announcementService.announce(text, {
      priority,
      interrupt: priority === 'urgent'
    })
  }, [])
  
  /**
   * Anuncia uma mensagem ao passar o mouse, respeitando o delay configurado
   */
  const announceOnHover = useCallback((text: string) => {
    if (!text) return
    
    // Limpar timeout anterior se existir
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    
    // Carregar delay configurado
    let delay = 300 // Padrão
    try {
      const savedSettings = localStorage.getItem('accessibility-settings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        delay = settings.hoverDelay !== undefined ? settings.hoverDelay : 300
      }
    } catch (error) {
      console.error('❌ Erro ao carregar delay:', error)
    }
    
    // Agendar anúncio
    hoverTimeoutRef.current = setTimeout(async () => {
      await announcementService.announce(text, {
        priority: 'low'
      })
    }, delay)
  }, [])
  
  /**
   * Cancela um anúncio pendente (quando o mouse sai)
   */
  const cancelAnnounce = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }, [])
  
  return {
    announce,
    announceOnHover,
    cancelAnnounce
  }
}

