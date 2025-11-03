import React, { useState } from 'react'
import { Modal } from '../components/Modal'

interface ModalState {
  isOpen: boolean
  type: 'alert' | 'confirm' | 'prompt'
  title?: string
  message: string
  icon?: string
  defaultValue?: string
}

interface UseModalReturn {
  alert: (message: string, title?: string, icon?: string) => Promise<void>
  confirm: (message: string, title?: string, icon?: string) => Promise<boolean>
  prompt: (message: string, defaultValue?: string, title?: string, icon?: string) => Promise<string | null>
  ModalComponent: React.FC
}

const initialState: ModalState = {
  isOpen: false,
  type: 'alert',
  message: ''
}

export function useModal(): UseModalReturn {
  const [modalState, setModalState] = useState<ModalState>(initialState)
  const [isMounted, setIsMounted] = useState(false)

  const resolveRef = React.useRef<((value: any) => void) | null>(null)

  // Garantir que o hook está montado
  React.useEffect(() => {
    setIsMounted(true)
    console.log('✅ useModal montado e pronto')
    return () => {
      setIsMounted(false)
      console.log('🔴 useModal desmontado')
    }
  }, [])

  const alert = (message: string, title?: string, icon?: string): Promise<void> => {
    console.log('📢 Modal.alert chamado:', { message, title, isMounted })
    if (!isMounted) {
      console.warn('⚠️ Modal.alert chamado antes da montagem!')
      return Promise.resolve()
    }
    
    return new Promise<void>((resolve) => {
      resolveRef.current = () => resolve()
      setModalState({
        isOpen: true,
        type: 'alert',
        message,
        title,
        icon
      })
    })
  }

  const confirm = (message: string, title?: string, icon?: string): Promise<boolean> => {
    console.log('📢 Modal.confirm chamado:', { message, title, isMounted })
    if (!isMounted) {
      console.warn('⚠️ Modal.confirm chamado antes da montagem!')
      return Promise.resolve(false)
    }
    
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
      setModalState({
        isOpen: true,
        type: 'confirm',
        message,
        title: title || 'Confirmação',
        icon: icon || '⚠️'
      })
    })
  }

  const prompt = (message: string, defaultValue: string = '', title?: string, icon?: string): Promise<string | null> => {
    console.log('📢 Modal.prompt chamado:', { message, defaultValue, isMounted })
    if (!isMounted) {
      console.warn('⚠️ Modal.prompt chamado antes da montagem!')
      return Promise.resolve(null)
    }
    
    return new Promise<string | null>((resolve) => {
      resolveRef.current = resolve
      setModalState({
        isOpen: true,
        type: 'prompt',
        message,
        title: title || 'Digite',
        icon: icon || '📝',
        defaultValue
      })
    })
  }

  const handleConfirm = React.useCallback((value?: string) => {
    setModalState(prev => ({ ...prev, isOpen: false }))
    if (resolveRef.current) {
      resolveRef.current(value !== undefined ? value : true)
      resolveRef.current = null
    }
  }, [])

  const handleCancel = React.useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }))
    if (resolveRef.current) {
      resolveRef.current(false)
      resolveRef.current = null
    }
  }, [])

  const closeModal = React.useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }))
  }, [])

  const ModalComponent: React.FC = React.useMemo(() => {
    return () => {
      // Tripla verificação de segurança
      if (!isMounted) {
        console.log('⏸️ Modal não montado ainda')
        return null
      }
      
      if (!modalState) {
        console.warn('⚠️ modalState é undefined!')
        return null
      }
      
      if (typeof modalState.isOpen === 'undefined') {
        console.warn('⚠️ modalState.isOpen é undefined!')
        return null
      }
      
      return (
        <Modal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          type={modalState.type}
          message={modalState.message}
          title={modalState.title}
          icon={modalState.icon}
          defaultValue={modalState.defaultValue}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )
    }
  }, [modalState, isMounted, closeModal, handleConfirm, handleCancel])

  return {
    alert,
    confirm,
    prompt,
    ModalComponent
  }
}

