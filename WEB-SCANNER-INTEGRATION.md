# 🌐 Integração de Scanner em Ambiente Web - Sistema CIVITAS

## 🎯 Como Funciona em Ambiente Web

Como você está usando uma aplicação web, a integração com impressoras multifuncionais funciona de forma diferente do que em aplicações desktop. Vou explicar como o sistema está configurado:

## 🔧 Arquitetura do Sistema

### 1. **Ambiente Web Puro (Navegador)**
Quando você acessa o sistema via navegador (Chrome, Firefox, Edge), o sistema funciona assim:

#### **Detecção de Dispositivos:**
- **WebUSB API** - Para detectar dispositivos USB conectados
- **MediaDevices API** - Para acessar câmeras do dispositivo
- **Fallback para câmera** - Se não encontrar scanners

#### **Digitalização:**
- **Câmera do dispositivo** - Usa a câmera do celular/tablet/notebook
- **Captura de imagem** - Tira foto do documento
- **Processamento OCR** - Analisa a imagem com Tesseract

### 2. **Ambiente Electron (Desktop)**
Se você estiver usando a versão desktop (Electron), o sistema tem acesso completo:

#### **Detecção de Dispositivos:**
- **TWAIN API** - Para scanners e impressoras multifuncionais
- **SANE API** - Para sistemas Linux
- **WMI (Windows)** - Para detectar impressoras instaladas
- **WebUSB API** - Para dispositivos USB

#### **Digitalização:**
- **Scanner real** - Acesso direto ao hardware
- **Impressora multifuncional** - Usa o scanner da impressora
- **Configurações avançadas** - Resolução, cor, qualidade

## 🚀 Como Usar em Ambiente Web

### **Opção 1: Câmera do Dispositivo (Recomendado para Web)**
1. **Clique no ícone 📷** na tela de cliente
2. **Permita acesso à câmera** quando solicitado
3. **Posicione o documento** na frente da câmera
4. **Tire a foto** do documento RG/CNH
5. **Aguarde o processamento** OCR automático
6. **Verifique os campos** preenchidos

### **Opção 2: Upload de Arquivo**
1. **Clique no ícone 📷** na tela de cliente
2. **Selecione "Upload de arquivo"** se disponível
3. **Escolha uma foto** do documento já tirada
4. **Aguarde o processamento** OCR automático

## 🔍 Limitações em Ambiente Web

### **O que NÃO funciona em navegador:**
- ❌ **Acesso direto a scanners** via TWAIN
- ❌ **Acesso direto a impressoras multifuncionais** via drivers
- ❌ **Configurações avançadas** de resolução/qualidade
- ❌ **Alimentação automática** de documentos

### **O que FUNCIONA em navegador:**
- ✅ **Câmera do dispositivo** para capturar documentos
- ✅ **OCR completo** para extrair dados
- ✅ **Preenchimento automático** dos campos
- ✅ **Validação de dados** (CPF, RG, etc.)
- ✅ **Formatação inteligente** dos dados

## 🛠️ Configuração para Ambiente Web

### **1. Permissões do Navegador:**
```javascript
// O navegador solicitará permissões para:
- Acesso à câmera
- Acesso a dispositivos USB (se disponível)
- Armazenamento local (para cache)
```

### **2. Requisitos Mínimos:**
- **Navegador moderno** (Chrome 80+, Firefox 75+, Edge 80+)
- **Câmera funcional** (webcam, celular, tablet)
- **Conexão com internet** (para processamento OCR)
- **JavaScript habilitado**

### **3. Otimizações para Web:**
- **Compressão de imagem** automática
- **Redimensionamento** para melhor performance
- **Cache local** para evitar reprocessamento
- **Fallback inteligente** para diferentes dispositivos

## 📱 Como Funciona em Diferentes Dispositivos

### **Desktop/Notebook:**
- **Webcam** para capturar documento
- **Mouse/teclado** para navegação
- **Tela grande** para melhor visualização

### **Tablet:**
- **Câmera traseira** (melhor qualidade)
- **Touch screen** para navegação
- **Posicionamento fácil** do documento

### **Celular:**
- **Câmera traseira** (recomendado)
- **Câmera frontal** (alternativa)
- **Interface touch** otimizada

## 🔧 Solução para Impressoras Multifuncionais em Web

### **Problema:**
Navegadores web não podem acessar diretamente impressoras multifuncionais por questões de segurança.

### **Soluções Implementadas:**

#### **1. Câmera como Scanner:**
```javascript
// O sistema usa a câmera para "digitalizar"
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: 'environment', // Câmera traseira
    width: { ideal: 1920 },
    height: { ideal: 1080 }
  }
})
```

#### **2. WebUSB (Futuro):**
```javascript
// Para dispositivos que suportam WebUSB
const devices = await navigator.usb.requestDevice({
  filters: [
    { classCode: 7 }, // Printer class
    { classCode: 6 }  // Still Image class
  ]
})
```

#### **3. Electron Bridge (Recomendado):**
```javascript
// Se usando versão desktop
if (window.electronAPI?.scanWithMultifunctional) {
  const result = await window.electronAPI.scanWithMultifunctional(config)
}
```

## 🎯 Recomendações para Uso em Web

### **Para Melhor Qualidade:**
1. **Use boa iluminação** ao fotografar
2. **Posicione o documento** plano e sem sombras
3. **Mantenha a câmera estável** durante a captura
4. **Use resolução alta** se disponível
5. **Evite reflexos** na superfície do documento

### **Para Melhor Performance:**
1. **Feche outras abas** do navegador
2. **Use conexão estável** com internet
3. **Aguarde o processamento** completo
4. **Verifique os dados** antes de salvar

## 🔄 Alternativas para Impressoras Multifuncionais

### **Opção 1: Versão Desktop (Electron)**
- **Acesso completo** a scanners e impressoras
- **Configurações avançadas** de qualidade
- **Suporte nativo** a TWAIN e SANE

### **Opção 2: Aplicativo Móvel**
- **Câmera otimizada** para documentos
- **Processamento local** (sem internet)
- **Interface touch** intuitiva

### **Opção 3: Serviço Web**
- **Upload de arquivo** via navegador
- **Processamento em servidor** com OCR
- **Download do resultado** processado

## 📞 Suporte Técnico

### **Para Ambiente Web:**
- **Verifique permissões** da câmera
- **Teste em diferentes navegadores**
- **Verifique conexão** com internet
- **Use boa iluminação** para captura

### **Para Impressoras Multifuncionais:**
- **Use versão desktop** (Electron) para acesso completo
- **Instale drivers TWAIN** específicos
- **Configure dispositivo** no sistema operacional
- **Teste funcionalidade** de scanner separadamente

---

**Sistema CIVITAS - Cartório Digital**  
*Versão Web - Scanner Integration*
