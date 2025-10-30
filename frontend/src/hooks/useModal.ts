import { useState, useCallback } from 'react'

export interface ModalState {
  isOpen: boolean
  type: 'alert' | 'confirm' | 'prompt'
  title?: string
  message: string
  defaultValue?: string
  onConfirm?: (value?: string) => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  icon?: string
}

export function useModal() {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: 'alert',
    message: ''
  })

  const showAlert = useCallback((message: string, title?: string, icon?: string) => {
    return new Promise<void>((resolve) => {
      setModalState({
        isOpen: true,
        type: 'alert',
        message,
        title,
        icon,
        onConfirm: () => {
          resolve()
        },
        onCancel: () => {
          resolve()
        }
      })
    })
  })

  const showConfirm = useCallback((message: string, title?: string, icon?: string) => {
    return new Promise<boolean>((resolve) => {
      setModalState({
        isOpen: true,
        type: 'confirm',
        message,
        title,
        icon,
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        onConfirm: () => {
          resolve(true)
        },
        onCancel: () => {
          resolve(false)
        }
      })
    })
  })

  const showPrompt = useCallback((message: string, defaultValue: string = '', title?: string, icon?: string) => {
    return new Promise<string | null>((resolve) => {
      setModalState({
        isOpen: true,
        type: 'prompt',
        message,
        defaultValue,
        title,
        icon,
        confirmText: 'OK',
        cancelText: 'Cancelar',
        onConfirm: (value) => {
          resolve(value || null)
        },
        onCancel: () => {
          resolve(null)
        }
      })
    })
  })

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }))
  })

  return {
    modalState,
    showAlert,
    showConfirm,
    showPrompt,
    closeModal
  }
}

