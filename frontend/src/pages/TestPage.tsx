import React from 'react'

export function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Sistema Funcionando!
          </h1>
          <p className="text-gray-600 mb-6">
            O sistema está rodando perfeitamente. Agora você pode fazer login para acessar todas as funcionalidades.
          </p>
          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Email:</strong> admin@cartorio.com
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Senha:</strong> qualquer senha
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Perfil:</strong> Administrador
              </p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir para Login
          </button>
        </div>
      </div>
    </div>
  )
}
