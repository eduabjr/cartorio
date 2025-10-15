# 🚀 **Guia Completo - Frontend Local do Sistema de Cartório**

## 📋 **Opções de Execução**

Você tem **3 opções** para usar o frontend localmente:

### **Opção 1: Frontend Web (Recomendado para desenvolvimento)**
- **Arquivo:** `iniciar-frontend.bat`
- **Acesso:** `http://localhost:5173`
- **Uso:** Duplo clique no arquivo `.bat`
- **Vantagem:** Atualização automática durante desenvolvimento

### **Opção 2: Aplicação Desktop (Electron)**
- **Arquivo:** `iniciar-frontend-desktop.bat`
- **Uso:** Duplo clique no arquivo `.bat`
- **Vantagem:** Interface nativa do Windows

### **Opção 3: Gerar Executável**
- **Arquivo:** `gerar-executavel.bat`
- **Uso:** Duplo clique no arquivo `.bat`
- **Resultado:** Arquivo `.exe` ou `.msi` para distribuição

---

## 🛠️ **Como Usar**

### **Passo 1: Preparação**
1. Certifique-se de que o **Node.js** está instalado
2. Navegue até a pasta `F:\cartorio`
3. Escolha uma das opções acima

### **Passo 2: Execução**
1. **Duplo clique** no arquivo `.bat` escolhido
2. Aguarde a instalação das dependências (primeira vez)
3. O frontend será iniciado automaticamente

### **Passo 3: Acesso**
- **Web:** Abra o navegador em `http://localhost:5173`
- **Desktop:** A janela da aplicação será aberta automaticamente

---

## ⚙️ **Configuração do Backend (Opcional)**

Para que o frontend se conecte ao backend, você precisa:

### **1. Configurar Variáveis de Ambiente**
Crie o arquivo `frontend/.env` com:
```
VITE_API_URL=http://localhost:3000/api
```

### **2. Iniciar Serviços Backend**
Em terminais separados:

```bash
# Auth Service
cd F:\cartorio\services\auth-service
npm install
npm run start:dev

# User Service  
cd F:\cartorio\services\user-service
npm install
npm run start:dev

# API Gateway
cd F:\cartorio\services\api-gateway
npm install
npm run start:dev
```

---

## 🔧 **Comandos Manuais (Alternativa aos Scripts)**

Se preferir usar comandos manuais:

### **Frontend Web:**
```bash
cd F:\cartorio\frontend
npm install
npm run dev
```

### **Frontend Desktop:**
```bash
cd F:\cartorio\frontend
npm install
npm run build
npm run electron
```

### **Gerar Executável:**
```bash
cd F:\cartorio\frontend
npm install
npm run build
npm run electron-dist
```

---

## 📁 **Estrutura de Arquivos**

```
F:\cartorio\
├── iniciar-frontend.bat          # Script para frontend web
├── iniciar-frontend-desktop.bat  # Script para aplicação desktop
├── gerar-executavel.bat         # Script para gerar executável
├── GUIA-FRONTEND-LOCAL.md       # Este guia
└── frontend/
    ├── package.json             # Configurações do projeto
    ├── .env                     # Variáveis de ambiente (criar manualmente)
    ├── dist/                    # Build do frontend
    └── dist-electron/           # Executável gerado
```

---

## 🚨 **Solução de Problemas**

### **Erro: "npm não é reconhecido"**
- Instale o Node.js: https://nodejs.org/
- Reinicie o computador após a instalação

### **Erro: "Porta 5173 já está em uso"**
- Feche outras instâncias do frontend
- Ou use: `npm run dev -- --port 5174`

### **Frontend não carrega**
- Verifique se o Node.js está instalado
- Execute `npm install` manualmente
- Verifique se não há erros no terminal

### **Backend não conecta**
- Verifique se os serviços backend estão rodando
- Confirme a URL no arquivo `.env`
- Teste a URL manualmente no navegador

---

## 📞 **Suporte**

Se encontrar problemas:
1. Verifique se o Node.js está instalado
2. Execute os comandos manualmente para ver erros específicos
3. Verifique se a porta 5173 está livre
4. Confirme se as dependências foram instaladas corretamente

---

## 🎯 **Resumo Rápido**

**Para usar o frontend localmente:**

1. **Duplo clique** em `iniciar-frontend.bat`
2. **Aguarde** a instalação das dependências
3. **Acesse** `http://localhost:5173` no navegador
4. **Pronto!** O frontend está funcionando localmente

**Para gerar um executável:**

1. **Duplo clique** em `gerar-executavel.bat`
2. **Aguarde** o processo de build
3. **Encontre** o executável em `frontend/dist-electron/`
4. **Execute** o arquivo `.exe` ou `.msi`

---

*Este guia foi criado para facilitar o uso do frontend localmente, contornando os problemas de permissão do PowerShell.*
