import React from 'react'

interface FallbackComponentProps {
  error?: Error
  resetError?: () => void
}

export function FallbackComponent({ error, resetError }: FallbackComponentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center">
          <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Sistema em Manutenção
          </h2>
          <p className="text-gray-600 mb-6">
            O sistema está sendo atualizado. Você pode continuar usando as funcionalidades básicas.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Recarregar Sistema
            </button>
            
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Ir para Login
            </button>
            
            {resetError && (
              <button
                onClick={resetError}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Tentar Novamente
              </button>
            )}
          </div>
          
          {error && process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500">
                Detalhes do erro (desenvolvimento)
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {error.toString()}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}
