# 🏛️ Sistema CIVITAS - Cartório Digital

Sistema completo de gerenciamento de cartório com arquitetura de microserviços, interface web moderna e versão desktop com Electron para acesso completo a scanners e impressoras multifuncionais.

## 🚀 Tecnologias Utilizadas

### **Backend (Microserviços)**

- **Node.js** `v18.0.0+` - Runtime JavaScript
- **NestJS** `v10.0.0` - Framework para microserviços
- **TypeScript** `v5.0.0` - Superset JavaScript com tipagem
- **Prisma** `v5.0.0` - ORM para banco de dados
- **MySQL** `v8.0.0` - Banco de dados relacional
- **Redis** `v7.0.0` - Cache e filas de mensagens
- **Docker** `v24.0.0` - Containerização
- **Docker Compose** `v2.20.0` - Orquestração de containers

### **Frontend (Web)**

- **React** `v18.2.0` - Biblioteca UI
- **TypeScript** `v5.0.0` - Tipagem estática
- **Vite** `v4.4.0` - Build tool
- **Tailwind CSS** `v3.3.0` - Framework CSS
- **Axios** `v1.5.0` - Cliente HTTP
- **React Query** `v4.0.0` - Gerenciamento de estado
- **QRCode** `v1.5.3` - Geração de QR Codes
- **Tesseract.js** `v6.0.1` - OCR em JavaScript

### **Frontend (Desktop - Electron)**

- **Electron** `v27.0.0` - Framework desktop
- **Electron Builder** `v24.6.4` - Construtor de aplicações
- **Node-Tesseract-OCR** `v2.2.1` - OCR nativo
- **Sharp** `v0.32.6` - Processamento de imagens

### **OCR e Processamento de Imagens**

- **Tesseract OCR** `v5.5.0` - Engine OCR
- **Python** `v3.10.0+` - Scripts de processamento
- **pytesseract** `v0.3.10` - Binding Python para Tesseract
- **Pillow** `v10.0.0` - Manipulação de imagens
- **OpenCV** `v4.8.0` - Processamento de imagens
- **NumPy** `v1.24.0` - Computação científica

### **Monitoramento e Logs**

- **Prometheus** `v2.40.0` - Métricas
- **Grafana** `v9.0.0` - Visualização de métricas
- **Nginx** `v1.25.0` - Proxy reverso e balanceamento

### **DevOps e Automação**

- **PowerShell** `v7.0.0+` - Scripts de automação
- **Bash** `v4.0.0+` - Scripts Unix
- **Git** `v2.40.0+` - Controle de versão

## 📋 Funcionalidades Principais

### **✅ Gestão de Cartório**

- **Protocolos** - Criação, consulta, baixa e cancelamento
- **Clientes** - Cadastro completo com validação
- **Documentos** - Digitalização e OCR automático
- **Relatórios** - Geração de relatórios e estatísticas
- **QR Codes** - Geração automática para protocolos

### **✅ Digitalização e OCR**

- **Scanner TWAIN** (Desktop) - Acesso direto a scanners
- **Impressoras Multifuncionais** (Desktop) - Scanner integrado
- **Câmera** (Web) - Captura via câmera do dispositivo
- **OCR Automático** - Extração de dados de RG/CNH
- **Preenchimento Automático** - Campos preenchidos automaticamente
- **Validação Inteligente** - CPF, RG, datas e outros campos

### **✅ Acessibilidade**

- **Leitor de Tela** - Suporte completo a NVDA
- **Temas** - Light, Dark e Alto Contraste
- **Tamanhos de Fonte** - Ajustáveis (Pequeno, Médio, Grande, Extra Grande)
- **Navegação por Teclado** - Atalhos e navegação completa
- **Anúncios** - Feedback auditivo de ações

### **✅ Microserviços**

- **API Gateway** - Ponto único de entrada
- **Auth Service** - Autenticação e autorização
- **User Service** - Gerenciamento de usuários
- **Protocolo Service** - Gerenciamento de protocolos
- **Cliente Service** - Gerenciamento de clientes

### **✅ Resiliência**

- **Circuit Breaker** - Proteção contra falhas em cascata
- **Retry Pattern** - Tentativas automáticas com exponential backoff
- **Fallback** - Dados alternativos quando serviço indisponível
- **Health Checks** - Monitoramento de saúde dos serviços

## 📁 Estrutura do Projeto

```text
F:\cartorio\
├── frontend/                     # Aplicação web React
│   ├── src/
│   │   ├── components/          # Componentes React
│   │   ├── pages/               # Páginas da aplicação
│   │   ├── services/            # Serviços (API, Scanner, OCR)
│   │   ├── hooks/               # Custom hooks
│   │   ├── contexts/            # Contextos React
│   │   ├── utils/               # Utilitários
│   │   └── types/               # Definições TypeScript
│   ├── public/                  # Arquivos estáticos
│   └── dist/                    # Build de produção
│
├── electron/                     # Aplicação desktop Electron
│   ├── main.js                  # Processo principal
│   ├── preload.js               # Script de pré-carregamento
│   ├── scanner-bridge.js        # Ponte para scanners
│   └── package.json             # Configuração Electron
│
├── services/                     # Microserviços NestJS
│   ├── api-gateway/             # Gateway de API
│   ├── auth-service/            # Serviço de autenticação
│   ├── user-service/            # Serviço de usuários
│   ├── protocolo-service/       # Serviço de protocolos
│   ├── cliente-service/         # Serviço de clientes
│   └── shared/                  # Código compartilhado
│
├── scripts/                      # Scripts de automação
│   ├── ocr_processor.py         # Processador OCR Python
│   ├── kodak_scanner_ocr.py     # OCR para Kodak scanners
│   ├── multifunctional_scanner_ocr.py  # OCR para multifuncionais
│   ├── deploy-production.sh     # Deploy em produção
│   ├── docker-compose-utils.ps1 # Utilitários Docker
│   └── wait-for-services.sh     # Aguardar serviços
│
├── database/                     # Configurações de banco de dados
│   └── init/                    # Scripts de inicialização
│
├── monitoring/                   # Monitoramento
│   ├── prometheus.yml           # Configuração Prometheus
│   └── alert_rules.yml          # Regras de alerta
│
├── nginx/                        # Configurações Nginx
│   └── nginx.prod.conf          # Configuração produção
│
├── docker-compose.yml            # Orquestração principal
├── docker-compose.dev.yml        # Ambiente desenvolvimento
├── docker-compose.prod.yml       # Ambiente produção
├── docker-compose.test.yml       # Ambiente testes
│
├── setup-electron.ps1            # Configuração Electron
├── dev-electron.ps1              # Desenvolvimento Electron
├── push-git.ps1                  # Push rápido Git
├── pull-git.ps1                  # Pull rápido Git
│
└── package.json                  # Configuração raiz
```

## 🚀 Instalação e Configuração

### **1. Pré-requisitos**

#### **Requisitos Mínimos:**

- **Node.js** `v18.0.0+`
- **npm** `v9.0.0+`
- **Docker** `v24.0.0+`
- **Docker Compose** `v2.20.0+`
- **Git** `v2.40.0+`

#### **Requisitos para OCR (Opcional):**

- **Python** `v3.10.0+`
- **Tesseract OCR** `v5.5.0`
- **pytesseract** `v0.3.10`
- **Pillow** `v10.0.0`
- **OpenCV** `v4.8.0`

#### **Requisitos para Electron (Desktop):**

- **Electron** `v27.0.0`
- **Electron Builder** `v24.6.4`

### **2. Instalação Rápida**

```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/cartorio.git
cd cartorio

# 2. Instalar todas as dependências
npm run install-all

# 3. Iniciar ambiente de desenvolvimento
docker-compose up -d
```

### **3. Instalação Manual**

#### **Backend (Microserviços):**

```bash
# Navegar para cada serviço e instalar dependências
cd services/api-gateway && npm install
cd services/auth-service && npm install
cd services/user-service && npm install
cd services/protocolo-service && npm install
cd services/cliente-service && npm install
```

#### **Frontend (Web):**

```bash
# Navegar para o frontend e instalar dependências
cd frontend
npm install
```

#### **Frontend (Desktop - Electron):**

```bash
# Configurar Electron
powershell -ExecutionPolicy Bypass -File setup-electron.ps1

# Ou manualmente
cd electron
npm install
```

#### **OCR (Python):**

```bash
# Instalar dependências Python
pip install pytesseract pillow opencv-python numpy

# Verificar instalação do Tesseract
tesseract --version
```

## 🔧 Desenvolvimento

### **Iniciar Ambiente Web**

```bash
# Modo 1: Docker Compose (Recomendado)
docker-compose -f docker-compose.dev.yml up -d

# Modo 2: Scripts PowerShell
powershell -ExecutionPolicy Bypass -File dev-electron.ps1

# Modo 3: npm scripts
npm run dev:web
```

### **Iniciar Ambiente Desktop (Electron)**

```bash
# Modo desenvolvimento (com DevTools)
npm run dev:electron

# Modo produção (sem DevTools)
npm run start:electron
```

### **Scripts Disponíveis**

```bash
# Instalação
npm run install-all          # Instalar todas as dependências
npm run install:services     # Instalar serviços
npm run install:frontend     # Instalar frontend
npm run install:electron     # Instalar Electron

# Desenvolvimento
npm run dev:web             # Iniciar frontend web
npm run dev:electron        # Iniciar Electron (dev)
npm run start:electron      # Iniciar Electron (prod)

# Build
npm run build:frontend      # Construir frontend
npm run build:electron      # Construir Electron
npm run dist:electron       # Gerar instalador

# Git
npm run push:quick          # Push rápido
npm run pull:quick          # Pull rápido

# Scripts
npm run scripts:bat         # Menu scripts .bat
npm run scripts:ps1         # Menu scripts PowerShell
```

## 🐳 Docker

### **Comandos Principais**

```bash
# Iniciar todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Ver logs
docker-compose logs -f

# Rebuild de serviços
docker-compose up -d --build

# Remover volumes (cuidado!)
docker-compose down -v
```

### **Serviços Disponíveis**

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | <http://localhost> | Interface web |
| **API Gateway** | <http://localhost:3000> | Gateway de API |
| **Auth Service** | <http://localhost:3001> | Autenticação |
| **User Service** | <http://localhost:3002> | Usuários |
| **Protocolo Service** | <http://localhost:3003> | Protocolos |
| **Cliente Service** | <http://localhost:3004> | Clientes |
| **MySQL** | `localhost:3306` | Banco de dados |
| **Redis** | `localhost:6379` | Cache |
| **Prometheus** | <http://localhost:9090> | Métricas |
| **Grafana** | <http://localhost:3001> | Dashboards |

## 📱 Ambiente Web vs Desktop

### **Ambiente Web (Navegador)**

**✅ Funcionalidades:**

- Interface web completa
- Câmera para digitalização
- OCR via servidor
- Todas as funcionalidades de gestão

**❌ Limitações:**

- Sem acesso direto a scanners TWAIN
- Sem acesso a impressoras multifuncionais
- Configurações limitadas de qualidade
- Dependente de conexão com internet

### **Ambiente Desktop (Electron)**

**✅ Funcionalidades:**

- Interface desktop nativa
- Acesso completo a scanners TWAIN
- Acesso a impressoras multifuncionais
- Configurações avançadas de qualidade
- OCR local (sem internet)
- APIs nativas do sistema operacional

**❌ Limitações:**

- Requer instalação
- Atualizações manuais (se não configurado auto-update)

## 🔒 Segurança

### **Autenticação**

- **JWT Tokens** para autenticação
- **Refresh Tokens** para renovação
- **Role-Based Access Control** (RBAC)

### **Electron**

- **Context Isolation** ativado
- **Node Integration** desabilitado
- **Remote Module** desabilitado
- **Web Security** configurado

### **API**

- **CORS** configurado
- **Rate Limiting** implementado
- **Input Validation** em todas as rotas

## 🧪 Testes

### **Backend**

```bash
# Executar testes unitários
cd services/auth-service
npm test

# Executar testes e2e
npm run test:e2e

# Executar testes com cobertura
npm run test:cov
```

### **Frontend**

```bash
# Executar testes
cd frontend
npm test

# Executar testes com cobertura
npm run test:coverage
```

## 📊 Monitoramento

### **Prometheus**

- **URL**: <http://localhost:9090>
- **Métricas** de todos os microserviços
- **Alertas** configurados

### **Grafana**

- **URL**: <http://localhost:3001>
- **Dashboards** pré-configurados
- **Visualização** de métricas

## 📚 Documentação

### **Guias Principais**

- [ELECTRON-DEVELOPMENT-GUIDE.md](ELECTRON-DEVELOPMENT-GUIDE.md) - Guia de desenvolvimento Electron
- [WEB-SCANNER-INTEGRATION.md](WEB-SCANNER-INTEGRATION.md) - Integração de scanner em web
- [SCANNER-INTEGRATION.md](SCANNER-INTEGRATION.md) - Integração de scanner geral
- [DOCKER-COMPOSE-GUIDE.md](DOCKER-COMPOSE-GUIDE.md) - Guia Docker Compose
- [MICROSERVICES-BEST-PRACTICES.md](MICROSERVICES-BEST-PRACTICES.md) - Boas práticas

### **Documentação de Componentes**

- [frontend/src/docs/MENU-PROTECTION-SYSTEM.md](frontend/src/docs/MENU-PROTECTION-SYSTEM.md) - Sistema de proteção de menu
- [frontend/src/docs/NVDA-API.md](frontend/src/docs/NVDA-API.md) - API NVDA
- [frontend/src/docs/TEMPLATE-TELAS.md](frontend/src/docs/TEMPLATE-TELAS.md) - Template de telas
- [frontend/src/docs/Z-INDEX-HIERARCHY.md](frontend/src/docs/Z-INDEX-HIERARCHY.md) - Hierarquia Z-Index

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

**Sistema CIVITAS** - Cartório Digital

## 🙏 Agradecimentos

- Comunidade NestJS
- Comunidade React
- Comunidade Electron
- Tesseract OCR Team
- Docker Team

## 📞 Suporte

Para suporte, envie um email para [suporte@civitas.com](mailto:suporte@civitas.com) ou abra uma issue no GitHub.

---

**Sistema CIVITAS - Cartório Digital**  
*Versão 1.0.0 - 2024*
