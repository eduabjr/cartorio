# Configuração da API do TJSP

## 📋 Variáveis de Ambiente

Para configurar a integração com a API do TJSP, crie um arquivo `.env` na pasta `frontend/` com as seguintes variáveis:

```env
# URL base da API do TJSP
REACT_APP_TJSP_API_URL=https://api-sandbox.tjsp.jus.br

# Credenciais OAuth 2.0 para autenticação
REACT_APP_TJSP_CLIENT_ID=seu_client_id_aqui
REACT_APP_TJSP_CLIENT_SECRET=seu_client_secret_aqui

# Ambiente (sandbox para testes, production para produção)
REACT_APP_TJSP_ENVIRONMENT=sandbox

# Configurações opcionais
REACT_APP_TJSP_TIMEOUT=30000
REACT_APP_TJSP_RETRY_ATTEMPTS=3
```

## 🔧 Configuração

### 1. Ambiente Sandbox (Desenvolvimento)
- **URL**: `https://api-sandbox.tjsp.jus.br`
- **Uso**: Para testes e desenvolvimento
- **Dados**: Dados fictícios para teste

### 2. Ambiente Production (Produção)
- **URL**: `https://api.tjsp.jus.br`
- **Uso**: Para ambiente de produção
- **Dados**: Dados reais do TJSP

## 🔐 Autenticação

A API do TJSP utiliza OAuth 2.0 com fluxo Client Credentials:

1. **Client ID**: Identificador da aplicação
2. **Client Secret**: Chave secreta da aplicação
3. **Scope**: `selos_digitais` (permissão para acessar selos digitais)

## 📡 Endpoints Disponíveis

### Autenticação
- `POST /oauth/token` - Obter token de acesso

### Selos Digitais
- `GET /api/v1/selos-digitais` - Listar selos digitais
- `GET /api/v1/selos-digitais/{id}` - Consultar selo específico
- `POST /api/v1/selos-digitais/{id}/cancelar` - Cancelar selo
- `POST /api/v1/selos-digitais/validar` - Validar selo
- `POST /api/v1/selos-digitais/qr-code` - Gerar QR Code
- `GET /api/v1/selos-digitais/estatisticas` - Obter estatísticas

## 🚀 Como Usar

### 1. Configurar Credenciais
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar com suas credenciais
nano .env
```

### 2. Reiniciar Aplicação
```bash
npm start
```

### 3. Testar Integração
1. Abra a tela "Cliente"
2. Vá para a aba "Selo Digital"
3. Clique em "🔄 Sincronizar TJSP"
4. Verifique se os selos são carregados

## 🔍 Funcionalidades Implementadas

### ✅ Sincronização
- Buscar selos digitais do TJSP
- Atualizar lista local
- Autenticação automática

### ✅ Validação
- Validar selo digital no TJSP
- Verificar status e validade
- Exibir resultado da validação

### ✅ Cancelamento
- Cancelar selo no TJSP
- Solicitar motivo do cancelamento
- Atualizar lista local

### ✅ QR Code
- Gerar QR Code para selo
- Copiar para área de transferência
- Atualizar visualização

### ✅ Estatísticas
- Obter estatísticas dos selos
- Total, ativos, cancelados, expirados

## 🛠️ Troubleshooting

### Erro de Autenticação
- Verificar se `REACT_APP_TJSP_CLIENT_ID` e `REACT_APP_TJSP_CLIENT_SECRET` estão corretos
- Verificar se as credenciais têm permissão para o scope `selos_digitais`

### Erro de Conexão
- Verificar se `REACT_APP_TJSP_API_URL` está correto
- Verificar conectividade com a internet
- Verificar se o ambiente está correto (sandbox/production)

### Erro de Timeout
- Aumentar `REACT_APP_TJSP_TIMEOUT` se necessário
- Verificar se a API do TJSP está respondendo

## 📞 Suporte

Para suporte técnico com a API do TJSP:
- **Documentação**: https://api.tjsp.jus.br/docs
- **Suporte**: suporte-api@tjsp.jus.br
- **Status**: https://status.tjsp.jus.br
