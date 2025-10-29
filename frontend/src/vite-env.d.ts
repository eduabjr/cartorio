/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_GATEWAY_URL?: string
  readonly VITE_AUTH_SERVICE_URL?: string
  readonly VITE_USER_SERVICE_URL?: string
  readonly VITE_CLIENTE_SERVICE_URL?: string
  readonly VITE_FUNCIONARIO_SERVICE_URL?: string
  readonly VITE_PROTOCOLO_SERVICE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

