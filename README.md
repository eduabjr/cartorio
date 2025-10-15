# Sistema de Cartório - Microsserviços

Sistema robusto e escalável para cartórios baseado em arquitetura de microsserviços.

## 🏗️ Arquitetura

### Microsserviços

1. **Auth Service** (Porta 3001) - Autenticação e autorização
2. **User Service** (Porta 3002) - Gerenciamento de usuários
3. **API Gateway** (Porta 3000) - Gateway de API
4. **Frontend** (Porta 5173) - Interface web

### Infraestrutura Local (XAMPP)

- **MySQL** - Banco de dados relacional (via XAMPP)
- **Apache** - Servidor web (via XAMPP)
- **phpMyAdmin** - Interface de administração do banco

## 🚀 Desenvolvimento Local com XAMPP

### Opção 1: Script Automático (Recomendado)
```bash
# Execute o script para configurar e iniciar tudo
SCRIPTS-AUTOMATIZADOS.bat
# Escolha a opção [7] - Iniciar Todos os Serviços (XAMPP)
```

### Opção 2: Manual
```bash
# 1. Instale e configure o XAMPP
# 2. Inicie o Apache e MySQL no XAMPP Control Panel
# 3. Execute os serviços em terminais separados:

# Terminal 1 - Auth Service
cd services/auth-service && npm run start:dev

# Terminal 2 - User Service  
cd services/user-service && npm run start:dev

# Terminal 3 - Frontend
cd frontend && npm run dev

# 4. Acesse:
# Frontend: http://localhost:5173
# phpMyAdmin: http://localhost/phpmyadmin
```

### Vantagens do Desenvolvimento Local:
- ✅ Ambiente de desenvolvimento estável
- ✅ Acesso direto ao banco MySQL via phpMyAdmin
- ✅ Hot reload e debugging facilitados
- ✅ Sem dependência de Docker
- ✅ Configuração mais simples

### Requisitos:
- Node.js 18+ instalado
- XAMPP instalado (Apache + MySQL)
- Git para controle de versão

## 🚀 Tecnologias

### Backend
- **Node.js** + **TypeScript**
- **NestJS** - Framework para microsserviços
- **Express.js** - Servidor web
- **Prisma** - ORM para MySQL
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **Winston** - Logs

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **React Query** - Gerenciamento de estado
- **React Router** - Roteamento
- **Electron** - Aplicação desktop

### Infraestrutura Local
- **XAMPP** - Ambiente de desenvolvimento
- **MySQL** - Banco de dados
- **Apache** - Servidor web

## 📋 Pré-requisitos

- Node.js 18+
- XAMPP (Apache + MySQL)
- Git

## 🛠️ Instalação e Execução

### 1. Clone o repositório
```bash
git clone https://github.com/eduabjr/cartorio.git
cd cartorio
```

### 2. Configure o XAMPP
```bash
# Execute o script de configuração
SCRIPTS-AUTOMATIZADOS.bat
# Escolha a opção [5] - Configurar XAMPP
```

### 3. Instale as dependências
```bash
npm run install-all
```

### 4. Execute os serviços
```bash
# Execute o script para iniciar tudo
SCRIPTS-AUTOMATIZADOS.bat
# Escolha a opção [7] - Iniciar Todos os Serviços (XAMPP)
```

### 5. Acesse o sistema

#### 🌐 Links de Acesso (Localhost)
- **Frontend (Interface Principal)**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **User Service**: http://localhost:3002
- **phpMyAdmin**: http://localhost/phpmyadmin

#### 🌍 Links de Acesso (Rede Local)
- **Frontend (Interface Principal)**: http://192.168.15.192:5173
- **API Gateway**: http://192.168.15.192:3000
- **Auth Service**: http://192.168.15.192:3001
- **User Service**: http://192.168.15.192:3002
- **phpMyAdmin**: http://192.168.15.192/phpmyadmin

> **💡 Dica**: Use os links de rede local para acessar o sistema de outros dispositivos na mesma rede Wi-Fi (celular, tablet, outros computadores).

#### 🔐 Credenciais de Login
- **Email**: `admin@cartorio.com`
- **Senha**: `admin123` (ou qualquer senha para teste)

#### 📋 Informações do Sistema
- **Nome**: Sistema Cartório
- **Tecnologia**: Tecnologia da Informação
- **Endereço**: Rua Yara, 49 - São João
- **CEP**: 17513-370 - Marília/SP
- **Telefone**: (14) 3216-2611

## 📁 Estrutura do Projeto

```
cartorio/
├── services/
│   ├── auth-service/
│   ├── user-service/
│   └── api-gateway/
├── frontend/
├── shared/
├── env-examples/
├── SCRIPTS-AUTOMATIZADOS.bat
├── SCRIPTS-POWERSHELL.ps1
├── GUIA-COMPLETO.md
└── package.json
```

## 🧪 Como Testar o Sistema

### 1. Configurar o Ambiente
```bash
# Execute o script de configuração
SCRIPTS-AUTOMATIZADOS.bat
# Escolha a opção [5] - Configurar XAMPP
```

### 2. Iniciar os Serviços
```bash
# Execute o script para iniciar tudo
SCRIPTS-AUTOMATIZADOS.bat
# Escolha a opção [7] - Iniciar Todos os Serviços (XAMPP)
```

### 3. Verificar Status
- Verifique se o XAMPP está rodando (Apache + MySQL)
- Verifique se os serviços estão rodando nas portas corretas
- Acesse o phpMyAdmin para verificar o banco de dados

### 4. Acessar o Sistema
1. Abra o navegador
2. Acesse: http://localhost:5173
3. Faça login com as credenciais fornecidas
4. Explore as funcionalidades do sistema

## 🖥️ Aplicação Desktop (Electron)

### Criar Executável (.exe)

Para criar um executável do sistema que pode ser instalado diretamente no Windows:

```bash
# Execute o script de build
build-electron.bat
```

O executável será gerado em `frontend/dist-electron/`

### Executar em Modo Desenvolvimento

Para testar a aplicação desktop em modo desenvolvimento:

```bash
# Execute o script de desenvolvimento
run-electron-dev.bat
```

### Vantagens da Aplicação Desktop:
- ✅ Instalação direta no Windows
- ✅ Não precisa de navegador
- ✅ Acesso offline (com dados locais)
- ✅ Interface nativa do Windows
- ✅ Atalhos no menu iniciar e desktop

## 🔧 Scripts Disponíveis

### Scripts NPM
- `npm run install-all` - Instala dependências de todos os serviços
- `npm run push:quick` - Push automático para GitHub
- `npm run scripts:bat` - Executa scripts .bat consolidados
- `npm run scripts:ps1` - Executa scripts PowerShell consolidados

### Scripts Consolidados
- `SCRIPTS-AUTOMATIZADOS.bat` - Todos os scripts .bat em um só lugar
  - Frontend Web (Desenvolvimento)
  - Frontend Desktop (Electron)
  - Gerar Executável
  - Frontend Estável
  - Configurar XAMPP
  - Desenvolvimento Local
  - Iniciar Todos os Serviços (XAMPP)
- `SCRIPTS-POWERSHELL.ps1` - Todos os scripts PowerShell em um só lugar

## 🗄️ Banco de Dados

### Configuração (XAMPP/MySQL)
- **Host**: localhost:3306
- **Database**: auth_db, user_db, cartorio_db
- **User**: root (padrão XAMPP)
- **Password**: (vazio - padrão XAMPP)

### Migrações
```bash
cd services/[service-name]
npx prisma generate
npx prisma db push
```

## 🔐 Segurança

- Autenticação JWT
- Hash de senhas com bcrypt
- Validação de entrada
- CORS configurado
- Headers de segurança

## 📊 Monitoramento

- Logs estruturados com Winston
- Métricas de performance
- Health checks nos serviços

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão no Frontend
```bash
# Verificar se o container está rodando
docker ps

# Ver logs do frontend
docker logs frontend

# Reiniciar o container
docker restart frontend
```

#### 2. Erro de Tailwind CSS
```bash
# Corrigir erro de border-border
docker exec -it frontend sh -c "cd /app && sed -i 's/@apply border-border;/\/\* @apply border-border; \*\//' src/index.css"
docker restart frontend
```

#### 3. PostgreSQL não Conecta
```bash
# Verificar se o PostgreSQL está rodando
docker ps | grep postgres

# Iniciar o PostgreSQL
docker start postgres-cartorio
```

#### 4. Porta já em Uso
```bash
# Parar todos os containers
docker stop $(docker ps -q)

# Remover containers parados
docker rm $(docker ps -aq)
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato através dos canais oficiais do projeto.