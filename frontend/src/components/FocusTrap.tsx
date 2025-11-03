import React, { useEffect, useRef } from 'react'

interface FocusTrapProps {
  children: React.ReactNode
  active?: boolean
  returnFocusOnDeactivate?: boolean
}

/**
 * Componente que captura o foco dentro de um container (útil para modais)
 */
export function FocusTrap({ 
  children, 
  active = true,
  returnFocusOnDeactivate = true 
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return

    // Salvar elemento focado anteriormente
    previousActiveElement.current = document.activeElement as HTMLElement

    const container = containerRef.current
    if (!container) return

    // Obter todos os elementos focáveis
    const getFocusableElements = (): HTMLElement[] => {
      const selector = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
      ].join(',')

      return Array.from(container.querySelectorAll(selector)) as HTMLElement[]
    }

    // Focar no primeiro elemento focável
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    // Handler de tecla Tab
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        // Shift + Tab (voltar)
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab (avançar)
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTab)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleTab)
      
      // Restaurar foco anterior se solicitado
      if (returnFocusOnDeactivate && previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [active, returnFocusOnDeactivate])

  return <div ref={containerRef}>{children}</div>
}

