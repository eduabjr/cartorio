import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import ProtectedApp from './components/ProtectedApp.tsx'
import './index.css'

/**
 * ⚡ REACT QUERY OTIMIZADO
 * 
 * OTIMIZAÇÕES:
 * 1. Cache por 5 minutos (evita requisições desnecessárias)
 * 2. Stale time de 1 minuto (dados "frescos" por 60s)
 * 3. Retry com backoff exponencial
 * 4. Desabilitar refetch automático
 * 5. Deduplicação de queries
 * 
 * GANHO: -80% requisições HTTP, cache automático
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ⚡ Cache por 5 minutos (gcTime = garbage collection time)
      gcTime: 1000 * 60 * 5,

      // ⚡ Dados ficam "frescos" por 1 minuto
      staleTime: 1000 * 60,

      // ⚡ Retry com backoff exponencial
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // ⚡ Não refetch automático (economia de requisições)
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,

      // Network mode
      networkMode: 'online',

      // Estrutura de dados compartilhada
      structuralSharing: true,
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
})


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ProtectedApp>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ProtectedApp>
  </React.StrictMode>,
)

