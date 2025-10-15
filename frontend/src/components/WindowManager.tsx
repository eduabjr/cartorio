import React from 'react'
import { MovableWindow } from './MovableWindow'
import { useWindows } from '../contexts/WindowContext'

export function WindowManager() {
  const { windows, closeWindow } = useWindows()

  return (
    <>
      {windows.map((window) => (
        <MovableWindow
          key={window.id}
          title={window.title}
          isOpen={true}
          onClose={() => closeWindow(window.id)}
          width={window.width}
          height={window.height}
          initialX={window.initialX}
          initialY={window.initialY}
        >
          {window.component}
        </MovableWindow>
      ))}
    </>
  )
}
