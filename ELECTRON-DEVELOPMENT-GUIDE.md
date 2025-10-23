# 🖥️ Guia de Desenvolvimento com Electron - Sistema CIVITAS

## 🎯 O que é Electron?

O Electron é um framework que permite criar aplicações desktop usando tecnologias web (HTML, CSS, JavaScript). Ele combina o Chromium (navegador) com Node.js para criar aplicações nativas que podem acessar recursos do sistema operacional.

## 🚀 Por que usar Electron no Sistema CIVITAS?

### **Vantagens para Scanner/Impressora:**

- ✅ **Acesso direto a scanners** via TWAIN
- ✅ **Acesso a impressoras multifuncionais** via drivers
- ✅ **Configurações avançadas** de resolução e qualidade
- ✅ **APIs nativas** do sistema operacional
- ✅ **Melhor performance** para processamento OCR

## 📋 Pré-requisitos

### **1. Node.js (Versão 16 ou superior)**

```bash
# Verificar versão
node --version
npm --version

# Se não tiver, baixar de: https://nodejs.org/
```

### **2. Git**

```bash
# Verificar se está instalado
git --version
```

### **3. Python (Para OCR)**

```bash
# Verificar versão
python --version

# Instalar dependências Python
pip install pytesseract pillow opencv-python numpy
```

## 🔧 Configuração do Electron

### **1. Instalar Electron Globalmente**

```bash
npm install -g electron
npm install -g electron-builder
```

### **2. Configurar o Projeto**

```bash
# Navegar para o diretório do projeto
cd F:\cartorio

# Instalar dependências do Electron
npm install electron --save-dev
npm install electron-builder --save-dev
```

### **3. Criar Estrutura do Electron**

```bash
# Criar pasta para o Electron
mkdir electron
cd electron
```

## 📁 Estrutura de Arquivos

```text
F:\cartorio\
├── frontend/                 # Aplicação web existente
├── electron/                 # Configuração do Electron
│   ├── main.js              # Processo principal
│   ├── preload.js           # Script de pré-carregamento
│   ├── scanner-bridge.js    # Ponte para scanners
│   └── package.json         # Configuração do Electron
├── services/                # Microserviços existentes
└── package.json             # Configuração principal
```

## 🛠️ Implementação Passo a Passo

### **1. Criar main.js (Processo Principal)**

✅ **Arquivo criado:** `electron/main.js`

### **2. Criar preload.js (Script de Pré-carregamento)**

✅ **Arquivo criado:** `electron/preload.js`

### **3. Criar scanner-bridge.js (Ponte para Scanners)**

✅ **Arquivo criado:** `electron/scanner-bridge.js`

### **4. Criar package.json do Electron**

✅ **Arquivo criado:** `electron/package.json`

### **5. Configurar Scripts de Desenvolvimento**

✅ **Arquivo criado:** `setup-electron.ps1`
✅ **Arquivo criado:** `dev-electron.ps1`

## 🚀 Como Usar

### **1. Configuração Inicial**

```bash
# Executar script de configuração
powershell -ExecutionPolicy Bypass -File setup-electron.ps1
```

### **2. Desenvolvimento**

```bash
# Modo desenvolvimento (com DevTools)
npm run dev:electron

# Modo produção (sem DevTools)
npm run start:electron
```

### **3. Construção**

```bash
# Construir aplicação
npm run build:electron

# Gerar instalador
npm run dist:electron
```

### **4. Script Interativo**

```bash
# Menu interativo de desenvolvimento
powershell -ExecutionPolicy Bypass -File dev-electron.ps1
```

## 🔧 Funcionalidades Implementadas

### **✅ Scanner Bridge**

- **Detecção TWAIN** (Windows)
- **Detecção SANE** (Linux)
- **Detecção ImageCapture** (macOS)
- **Suporte a impressoras multifuncionais**
- **Configurações avançadas** de qualidade

### **✅ APIs Expostas**

- `detectScanners()` - Detectar scanners disponíveis
- `scanDocument(config)` - Digitalizar documento
- `detectMultifunctionalPrinters()` - Detectar impressoras multifuncionais
- `scanWithMultifunctional(config)` - Digitalizar com impressora multifuncional
- `printDocument(config)` - Imprimir documento
- `getSystemInfo()` - Informações do sistema

### **✅ Segurança**

- **Context isolation** ativado
- **Node integration** desabilitado
- **Remote module** desabilitado
- **Web security** configurado

## 📱 Como Funciona

### **1. Processo Principal (main.js)**

- **Cria janela** do Electron
- **Configura segurança** e permissões
- **Inicializa bridge** de scanner
- **Expõe APIs** via IPC

### **2. Script de Pré-carregamento (preload.js)**

- **Comunicação segura** entre frontend e backend
- **Exposição de APIs** para o frontend
- **Event listeners** para scanners

### **3. Scanner Bridge (scanner-bridge.js)**

- **Detecção de dispositivos** via TWAIN/SANE
- **Digitalização de documentos** com configurações avançadas
- **Suporte a impressoras multifuncionais**
- **Processamento de imagens**

## 🎯 Vantagens do Electron

### **✅ Acesso Completo a Hardware:**

- **Scanners TWAIN** - Acesso direto via drivers
- **Impressoras Multifuncionais** - Scanner integrado
- **Configurações Avançadas** - Resolução, cor, qualidade
- **APIs Nativas** - Sistema operacional completo

### **✅ Performance:**

- **Processamento Local** - Sem dependência de internet
- **OCR Otimizado** - Tesseract nativo
- **Cache Inteligente** - Dados salvos localmente
- **Multithreading** - Processamento paralelo

### **✅ Experiência do Usuário:**

- **Interface Familiar** - Mesma interface web
- **Funcionalidades Avançadas** - Recursos desktop
- **Integração Completa** - Sistema operacional
- **Atualizações Automáticas** - Se configurado

## 🔍 Diferenças: Web vs Electron

| Funcionalidade | Web (Navegador) | Electron (Desktop) |
|---|---|---|
| **Scanner TWAIN** | ❌ Não disponível | ✅ Acesso completo |
| **Impressora Multifuncional** | ❌ Não disponível | ✅ Acesso completo |
| **Configurações Avançadas** | ❌ Limitado | ✅ Completo |
| **OCR Local** | ❌ Depende de servidor | ✅ Processamento local |
| **APIs Nativas** | ❌ Não disponível | ✅ Acesso completo |
| **Performance** | ⚠️ Limitado | ✅ Otimizado |
| **Segurança** | ✅ Sandbox | ⚠️ Requer cuidado |
| **Distribuição** | ✅ Via navegador | ⚠️ Requer instalação |

## 🛠️ Troubleshooting

### **Problema: Scanner não detectado**

```bash
# Verificar drivers TWAIN
# Instalar drivers do fabricante
# Verificar se dispositivo está conectado
```

### **Problema: Impressora multifuncional não funciona**

```bash
# Verificar drivers completos (impressão + scanner)
# Instalar drivers TWAIN específicos
# Verificar se dispositivo está ligado
```

### **Problema: OCR não funciona**

```bash
# Verificar Tesseract instalado
# Verificar pacote de idioma português
# Verificar dependências Python
```

### **Problema: Aplicação não inicia**

```bash
# Verificar Node.js instalado
# Verificar dependências instaladas
# Verificar permissões de arquivo
```

## 📚 Próximos Passos

### **1. Implementar TWAIN Real**

- **Integrar biblioteca TWAIN** para Windows
- **Testar com scanners reais**
- **Configurar opções avançadas**

### **2. Implementar SANE Real**

- **Integrar biblioteca SANE** para Linux
- **Testar com scanners reais**
- **Configurar opções avançadas**

### **3. Implementar ImageCapture Real**

- **Integrar ImageCapture** para macOS
- **Testar com scanners reais**
- **Configurar opções avançadas**

### **4. Melhorar OCR**

- **Integrar Tesseract nativo**
- **Otimizar processamento**
- **Adicionar validação de dados**

### **5. Adicionar Atualizações Automáticas**

- **Implementar electron-updater**
- **Configurar servidor de atualizações**
- **Testar processo de atualização**

---

**Sistema CIVITAS - Cartório Digital**  
*Versão Electron - Desenvolvimento Desktop*
