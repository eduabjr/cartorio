# 🏛️ Sistema de Cartório - Microserviços

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10+-e0234e.svg)](https://nestjs.com/)

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API](#api)
- [Contribuição](#contribuição)
- [Licença](#licença)

## 🎯 Sobre o Projeto

O **Sistema de Cartório** é uma aplicação completa desenvolvida com arquitetura de microserviços, projetada para modernizar e automatizar os processos de um cartório. O sistema oferece uma interface intuitiva e robusta para gerenciamento de clientes, documentos, autenticação e muito mais.

### 🌟 Características Principais

- **Arquitetura de Microserviços**: Sistema modular e escalável
- **Interface Moderna**: Frontend React com design responsivo
- **OCR Integrado**: Reconhecimento óptico de caracteres com Tesseract
- **Sistema de Instância Única**: Controle inteligente de janelas
- **Temas Adaptativos**: Suporte a modo claro, escuro e alto contraste
- **Acessibilidade**: Recursos avançados de acessibilidade
- **Backup Automático**: Sistema de backup para pen drive
- **Robustez**: Sistema resiliente com circuit breaker e fallbacks

## 🚀 Funcionalidades

### 📱 Frontend
- **Sistema de Login**: Autenticação segura com JWT
- **Cadastro de Clientes**: Formulário completo com validação
- **OCR de Documentos**: Extração automática de dados de documentos
- **Gerenciamento de Janelas**: Sistema de instância única
- **Temas Personalizáveis**: Modo claro, escuro e alto contraste
- **Acessibilidade**: Suporte a leitores de tela e navegação por teclado
- **Interface Responsiva**: Adaptável a diferentes tamanhos de tela

### 🔧 Backend (Microserviços)
- **API Gateway**: Roteamento e balanceamento de carga
- **Auth Service**: Autenticação e autorização
- **User Service**: Gerenciamento de usuários
- **Health Check**: Monitoramento de saúde dos serviços
- **Circuit Breaker**: Proteção contra falhas em cascata
- **Fallback Service**: Funcionalidades offline

### 🛡️ Recursos de Segurança
- **Autenticação JWT**: Tokens seguros para sessões
- **Validação de Dados**: Validação rigorosa de entrada
- **Proteção CSRF**: Proteção contra ataques cross-site
- **Sanitização**: Limpeza de dados de entrada

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Auth Service  │
│   (React)       │◄──►│   (NestJS)      │◄──►│   (NestJS)      │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 3002    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   User Service  │
                       │   (NestJS)      │
                       │   Port: 3003    │
                       └─────────────────┘
```

### 🔄 Fluxo de Dados

1. **Frontend** → **API Gateway** → **Microserviços**
2. **Autenticação** via JWT tokens
3. **Validação** de dados em cada camada
4. **Resposta** formatada e segura

## 🛠️ Tecnologias

### Frontend
- **React 18+**: Biblioteca principal
- **TypeScript**: Tipagem estática
- **Vite**: Build tool moderno
- **Tailwind CSS**: Framework CSS utilitário
- **React Router**: Roteamento
- **React Hook Form**: Gerenciamento de formulários
- **Tesseract.js**: OCR no navegador
- **Framer Motion**: Animações
- **Electron**: Aplicação desktop

### Backend
- **NestJS**: Framework Node.js
- **TypeScript**: Tipagem estática
- **Prisma**: ORM para banco de dados
- **JWT**: Autenticação
- **Passport**: Estratégias de autenticação
- **Class Validator**: Validação de DTOs

### Ferramentas
- **Git**: Controle de versão
- **PowerShell**: Scripts de automação
- **Tesseract OCR**: Reconhecimento óptico
- **MySQL**: Banco de dados (via XAMPP)

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** (versão 8 ou superior)
- **Git**
- **XAMPP** (para MySQL)
- **Tesseract OCR** (versão 5.5.0 ou superior)
- **PowerShell** (Windows)

## 🚀 Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/eduabjr/cartorio.git
cd cartorio
```

### 2. Instale as Dependências

```bash
# Instalar todas as dependências (serviços + frontend)
npm run install-all

# Ou instalar separadamente:
npm run install:services
npm run install:frontend
```

### 3. Configuração do Tesseract OCR

#### 3.1. Instalação do Tesseract

1. **Baixe o Tesseract OCR**:
   - Versão: `tesseract-ocr-w64-setup-5.5.0.20241111.exe`
   - Localização: `F:\cartorio\tesseract\`

2. **Instale o Tesseract**:
   - Execute o instalador
   - Instale em: `C:\Program Files\Tesseract-OCR\`

#### 3.2. Configuração do Idioma Português

1. **Copie o arquivo de idioma**:
   ```bash
   # Copie o arquivo por.traineddata de:
   F:\cartorio\tesseract\por.traineddata
   
   # Para:
   C:\Program Files\Tesseract-OCR\tessdata\
   ```

2. **Configure a variável de ambiente**:
   - Abra o **Painel de Controle** → **Sistema** → **Configurações avançadas do sistema**
   - Clique em **Variáveis de Ambiente**
   - Na seção **Variáveis do sistema**, clique em **Novo**
   - **Nome da variável**: `TESSERACT_PATH`
   - **Valor da variável**: `C:\Program Files\Tesseract-OCR\`
   - Clique em **OK** para salvar

3. **Adicione ao PATH**:
   - Na seção **Variáveis do sistema**, encontre a variável **Path**
   - Clique em **Editar**
   - Clique em **Novo** e adicione: `C:\Program Files\Tesseract-OCR\`
   - Clique em **OK** para salvar

#### 3.3. Verificação da Instalação

```bash
# Verifique se o Tesseract está funcionando
tesseract --version

# Teste o reconhecimento em português
tesseract --list-langs
```

### 4. Configuração do Banco de Dados

1. **Inicie o XAMPP**:
   - Abra o XAMPP Control Panel
   - Inicie o **Apache** e **MySQL**

2. **Crie o banco de dados**:
   ```sql
   CREATE DATABASE cartorio_db;
   ```

3. **Execute as migrações**:
   ```bash
   # Para cada serviço que usa Prisma
   cd services/auth-service
   npx prisma migrate dev
   
   cd ../user-service
   npx prisma migrate dev
   ```

### 5. Configuração das Variáveis de Ambiente

1. **Copie os arquivos de exemplo**:
   ```bash
   cp env-examples/*.env .
   ```

2. **Configure cada serviço**:
   - `api-gateway.env`
   - `auth-service.env`
   - `user-service.env`
   - `frontend.env`

## ⚙️ Configuração

### Variáveis de Ambiente

#### API Gateway (`api-gateway.env`)
```env
PORT=3001
AUTH_SERVICE_URL=http://localhost:3002
USER_SERVICE_URL=http://localhost:3003
```

#### Auth Service (`auth-service.env`)
```env
PORT=3002
DATABASE_URL="mysql://root:@localhost:3306/cartorio_db"
JWT_SECRET=seu_jwt_secret_aqui
JWT_EXPIRES_IN=24h
```

#### User Service (`user-service.env`)
```env
PORT=3003
DATABASE_URL="mysql://root:@localhost:3306/cartorio_db"
```

#### Frontend (`frontend.env`)
```env
VITE_API_URL=http://localhost:3001
VITE_TESSERACT_PATH=C:\Program Files\Tesseract-OCR\
```

## 🎮 Uso

### 1. Iniciar os Serviços

```bash
# Iniciar todos os serviços automaticamente
.\iniciar-servicos.bat

# Ou iniciar manualmente:
# Terminal 1 - API Gateway
cd services/api-gateway
npm run start:dev

# Terminal 2 - Auth Service
cd services/auth-service
npm run dev

# Terminal 3 - User Service
cd services/user-service
npm run dev

# Terminal 4 - Frontend
cd frontend
npm run dev
```

### 2. Acessar a Aplicação

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:3001
- **Auth Service**: http://localhost:3002
- **User Service**: http://localhost:3003

### 3. Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev                    # Inicia o frontend
npm run build                  # Build de produção
npm run preview                # Preview do build

# Automação
npm run push:quick             # Push com backup automático
npm run push:quick:no-backup   # Push sem backup
npm run scripts:bat            # Executa scripts .bat
npm run scripts:ps1            # Executa scripts PowerShell

# Electron
npm run electron               # Aplicação desktop
npm run electron-dev           # Desenvolvimento com hot reload
npm run electron-build         # Build da aplicação desktop
```

## 📁 Estrutura do Projeto

```
cartorio/
├── 📁 frontend/                 # Aplicação React
│   ├── 📁 src/
│   │   ├── 📁 components/       # Componentes reutilizáveis
│   │   ├── 📁 pages/           # Páginas da aplicação
│   │   ├── 📁 hooks/           # Hooks customizados
│   │   ├── 📁 services/        # Serviços de API
│   │   ├── 📁 contexts/        # Contextos React
│   │   ├── 📁 utils/           # Utilitários
│   │   └── 📁 types/           # Definições TypeScript
│   ├── 📁 electron/            # Configuração Electron
│   └── 📄 package.json
├── 📁 services/                # Microserviços
│   ├── 📁 api-gateway/         # Gateway de API
│   ├── 📁 auth-service/        # Serviço de autenticação
│   └── 📁 user-service/        # Serviço de usuários
├── 📁 database/                # Scripts de banco
│   └── 📁 init/
│       └── 📄 01_init.sql
├── 📁 tesseract/               # Arquivos OCR
│   └── 📄 por.traineddata
├── 📁 env-examples/            # Exemplos de configuração
├── 📄 push-git.ps1            # Script de push automático
├── 📄 iniciar-servicos.bat    # Script de inicialização
└── 📄 README.md
```

### 🔧 Componentes Principais

#### Frontend
- **App.tsx**: Componente principal da aplicação
- **BasePage.tsx**: Componente base para páginas
- **ClientePage.tsx**: Página de cadastro de clientes
- **LoginPage.tsx**: Página de login
- **NavigationManager.tsx**: Gerenciador de navegação
- **SingleInstanceWindow.tsx**: Sistema de instância única

#### Serviços
- **API Gateway**: Roteamento e balanceamento
- **Auth Service**: Autenticação JWT
- **User Service**: Gerenciamento de usuários
- **Health Check**: Monitoramento de saúde
- **Circuit Breaker**: Proteção contra falhas

## 🔌 API

### Endpoints Principais

#### Autenticação
```http
POST /auth/login
POST /auth/register
POST /auth/refresh
GET  /auth/profile
```

#### Usuários
```http
GET    /users
POST   /users
GET    /users/:id
PUT    /users/:id
DELETE /users/:id
```

#### Clientes
```http
GET    /clients
POST   /clients
GET    /clients/:id
PUT    /clients/:id
DELETE /clients/:id
```

### Exemplo de Uso

```javascript
// Login
const response = await fetch('http://localhost:3001/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'usuario@exemplo.com',
    password: 'senha123'
  })
});

const data = await response.json();
```

## 🎨 Funcionalidades Avançadas

### 🔍 OCR (Reconhecimento Óptico)

O sistema integra OCR para extração automática de dados de documentos:

```javascript
import { extractDocumentData } from './utils/ocrUtils';

// Extrair dados de um documento
const extractedData = await extractDocumentData(imageFile);
console.log(extractedData);
// Output: { nome: 'João Silva', cpf: '123.456.789-00', ... }
```

### 🎭 Sistema de Temas

Suporte a múltiplos temas com persistência:

```javascript
const { currentTheme, setTheme } = useAccessibility();

// Alternar tema
setTheme('dark'); // 'light' | 'dark' | 'highContrast'
```

### 🪟 Instância Única

Sistema inteligente de gerenciamento de janelas:

```javascript
// Abrir tela (se já estiver aberta, faz refresh)
navigateToPage('cliente');

// Fechar tela
closeCurrentPage();
```

### 🛡️ Circuit Breaker

Proteção automática contra falhas:

```javascript
const { circuitState, isHealthy } = useCircuitBreaker('auth-service');

if (isHealthy) {
  // Fazer chamada para o serviço
} else {
  // Usar fallback ou mostrar erro
}
```

## 🚀 Deploy

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm run preview
```

### Electron (Desktop)
```bash
npm run electron-build
```

## 🤝 Contribuição

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

### Padrões de Código

- **TypeScript**: Tipagem rigorosa
- **ESLint**: Linting automático
- **Prettier**: Formatação de código
- **Conventional Commits**: Padrão de commits

## 📝 Changelog

### v1.0.0 (2024-10-20)
- ✅ Sistema de microserviços implementado
- ✅ Frontend React com TypeScript
- ✅ Integração OCR com Tesseract
- ✅ Sistema de instância única
- ✅ Temas adaptativos
- ✅ Acessibilidade avançada
- ✅ Backup automático
- ✅ Circuit breaker e fallbacks
- ✅ Documentação completa

## 🐛 Problemas Conhecidos

- **Tesseract OCR**: Requer configuração manual do PATH
- **XAMPP**: Necessário para MySQL local
- **PowerShell**: Scripts requerem ExecutionPolicy

## 🔧 Solução de Problemas

### Erro de Tesseract
```bash
# Verificar instalação
tesseract --version

# Verificar idiomas disponíveis
tesseract --list-langs
```

### Erro de Banco de Dados
```bash
# Verificar se XAMPP está rodando
# Verificar conexão MySQL
mysql -u root -p
```

### Erro de Porta
```bash
# Verificar portas em uso
netstat -an | findstr ":3000 :3001 :3002 :3003"
```

## 📞 Suporte

Para suporte e dúvidas:

- **Issues**: [GitHub Issues](https://github.com/eduabjr/cartorio/issues)
- **Email**: suporte@cartorio.com
- **Documentação**: [Wiki do Projeto](https://github.com/eduabjr/cartorio/wiki)

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- **React Team** - Framework frontend
- **NestJS Team** - Framework backend
- **Tesseract OCR** - Reconhecimento óptico
- **Tailwind CSS** - Framework CSS
- **Comunidade Open Source** - Inspiração e contribuições

---

**Desenvolvido com ❤️ para modernizar o sistema de cartórios**

[![GitHub stars](https://img.shields.io/github/stars/eduabjr/cartorio?style=social)](https://github.com/eduabjr/cartorio/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/eduabjr/cartorio?style=social)](https://github.com/eduabjr/cartorio/network)
[![GitHub issues](https://img.shields.io/github/issues/eduabjr/cartorio)](https://github.com/eduabjr/cartorio/issues)
