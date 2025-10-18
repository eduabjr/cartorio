import React from 'react'
import { MovableClienteWindow } from '../components/MovableClienteWindow'

interface ClientePageProps {
  onClose: () => void
}

export function ClientePage({ onClose }: ClientePageProps) {
  console.log('📺 ClientePage RENDERIZADO!')
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <MovableClienteWindow onClose={onClose} />
      </div>
    </div>
  )
}

