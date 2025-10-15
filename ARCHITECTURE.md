# Arquitetura do Sistema de Cartório

## Visão Geral

Este sistema implementa uma arquitetura de microsserviços robusta e escalável para um sistema de cartório, seguindo as melhores práticas de desenvolvimento moderno.

## 🏗️ Arquitetura de Microsserviços

### 1. Auth Service (Porta 3001)
**Responsabilidade**: Autenticação e autorização de usuários

**Funcionalidades**:
- Registro de usuários
- Login/logout
- Gerenciamento de tokens JWT
- Validação de permissões
- Estratégias de autenticação (Local, JWT)

**Tecnologias**:
- NestJS
- Passport.js
- JWT
- bcrypt
- Prisma ORM

### 2. User Service (Porta 3002)
**Responsabilidade**: Gerenciamento de perfis de usuários

**Funcionalidades**:
- CRUD de usuários
- Perfis de usuário
- Histórico de atividades
- Preferências do usuário

### 3. Document Service (Porta 3003)
**Responsabilidade**: Gestão de documentos cartoriais

**Funcionalidades**:
- Upload/download de documentos
- Versionamento de documentos
- Assinatura digital
- Metadados de documentos
- Categorização

### 4. Registry Service (Porta 3004)
**Responsabilidade**: Registros cartoriais

**Funcionalidades**:
- Criação de registros
- Numeração sequencial
- Livros de registro
- Consultas públicas
- Emissão de certidões

### 5. Payment Service (Porta 3005)
**Responsabilidade**: Processamento de pagamentos

**Funcionalidades**:
- Integração com gateways de pagamento
- Cálculo de taxas
- Histórico de transações
- Relatórios financeiros
- Estornos

### 6. Notification Service (Porta 3006)
**Responsabilidade**: Sistema de notificações

**Funcionalidades**:
- Notificações em tempo real
- Email notifications
- SMS notifications
- Push notifications
- Templates de mensagens

### 7. API Gateway (Porta 3000)
**Responsabilidade**: Gateway de entrada para todos os serviços

**Funcionalidades**:
- Roteamento de requisições
- Rate limiting
- Autenticação centralizada
- Load balancing
- Logging centralizado
- Caching

## 🗄️ Banco de Dados

### PostgreSQL
- **Host**: localhost:5432
- **Database**: cartorio_db
- **User**: cartorio_user
- **Password**: cartorio_password

### Estrutura Principal

```sql
-- Usuários do sistema
users (id, email, password, name, role, phone, address, cpf, created_at, updated_at)

-- Documentos cartoriais
documents (id, user_id, title, description, document_type, status, file_path, created_at, updated_at)

-- Registros cartoriais
registries (id, user_id, document_id, registry_number, registry_date, book_number, page_number, created_at, updated_at)

-- Pagamentos
payments (id, user_id, document_id, amount, status, payment_method, transaction_id, created_at, updated_at)

-- Notificações
notifications (id, user_id, title, message, is_read, notification_type, created_at, updated_at)

-- Log de auditoria
audit_logs (id, user_id, action, table_name, record_id, old_values, new_values, ip_address, created_at)
```

## 🔄 Comunicação Entre Serviços

### 1. Síncrona (HTTP/gRPC)
- Auth Service ↔ API Gateway
- User Service ↔ Auth Service
- Document Service ↔ Auth Service
- Registry Service ↔ Auth Service
- Payment Service ↔ Auth Service

### 2. Assíncrona (RabbitMQ)
- Eventos de notificação
- Processamento de documentos
- Atualizações de status
- Relatórios gerados

### 3. Cache (Redis)
- Sessões de usuário
- Tokens JWT
- Dados frequentemente acessados
- Rate limiting

## 🚀 Frontend

### React 18 + TypeScript
- **Vite** para build otimizado
- **Tailwind CSS** para estilização
- **React Query** para gerenciamento de estado
- **React Router** para navegação
- **Axios** para requisições HTTP

### Estrutura de Componentes
```
src/
├── components/
│   ├── common/
│   ├── auth/
│   ├── documents/
│   ├── registry/
│   └── payments/
├── pages/
├── hooks/
├── services/
├── utils/
└── types/
```

## 🔐 Segurança

### 1. Autenticação
- JWT tokens com expiração
- Refresh tokens
- Hash de senhas com bcrypt
- Rate limiting por IP

### 2. Autorização
- Roles baseadas em usuários (USER, ADMIN, CARTORIO)
- Middleware de autorização
- Guards para rotas protegidas

### 3. Validação
- Validação de entrada com class-validator
- Sanitização de dados
- CORS configurado

### 4. Headers de Segurança
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Content Security Policy

## 📊 Monitoramento e Logs

### 1. Logs Estruturados
- Winston para logging
- Logs centralizados
- Diferentes níveis (error, warn, info, debug)

### 2. Métricas
- Health checks nos serviços
- Métricas de performance
- Monitoramento de recursos

### 3. Auditoria
- Log de todas as ações
- Rastreamento de mudanças
- IP e user agent logging

## 🐳 Containerização

### Docker
- Cada serviço em container separado
- Multi-stage builds para otimização
- Volumes para persistência de dados

### Docker Compose
- Orquestração de todos os serviços
- Networks isoladas
- Dependências entre serviços

## 🔧 DevOps

### 1. Desenvolvimento
- Hot reload em desenvolvimento
- Scripts npm para facilitar uso
- Docker para ambiente consistente

### 2. Produção
- PM2 para process management
- Nginx para proxy reverso
- SSL/TLS configurado
- Backup automático

## 📈 Escalabilidade

### 1. Horizontal
- Múltiplas instâncias de cada serviço
- Load balancing no API Gateway
- Cache distribuído com Redis

### 2. Vertical
- Otimização de queries
- Índices de banco de dados
- Compressão de assets

## 🔄 CI/CD

### GitHub Actions
- Build automático
- Testes automatizados
- Deploy em staging/production
- Notificações de status

## 📋 Próximos Passos

1. **Implementar os demais microsserviços**
2. **Configurar monitoramento completo**
3. **Implementar testes automatizados**
4. **Configurar CI/CD pipeline**
5. **Implementar backup automático**
6. **Configurar SSL/TLS**
7. **Implementar métricas avançadas**
8. **Configurar alertas**
