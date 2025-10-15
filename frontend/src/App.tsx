import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { TestPage } from './pages/TestPage'
import { ProtocolosPage } from './pages/ProtocolosPage'
import { ProtocoloLancamentoPage } from './pages/ProtocoloLancamentoPage'
import { ProtocoloBaixaPage } from './pages/ProtocoloBaixaPage'
import { AuthProvider } from './contexts/AuthContext'
import { WindowProvider } from './contexts/WindowContext'
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <WindowProvider>
          <Routes>
            <Route path="/test" element={<TestPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<Layout />}>
              <Route index element={
                <div className="h-full">
                  {/* Fundo completamente vazio conforme solicitado */}
                </div>
              } />
                  <Route path="protocolos" element={<ProtocolosPage />} />
                  <Route path="protocolos/lancamento" element={<ProtocoloLancamentoPage />} />
                  <Route path="protocolos/baixa" element={<ProtocoloBaixaPage />} />
            </Route>
          </Routes>
        </WindowProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App

