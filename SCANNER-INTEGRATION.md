# 📷 Integração de Scanner com OCR - Sistema CIVITAS

## 🎯 Visão Geral

Este documento descreve a implementação completa da funcionalidade de scanner com OCR para digitalização automática de documentos RG/CNH e preenchimento automático dos campos do formulário de cliente.

## 🚀 Funcionalidades Implementadas

### ✅ ScannerService
- **Detecção automática** de scanners TWAIN, SANE, USB e câmera
- **Suporte específico** para scanners Kodak i2600 e similares
- **Suporte completo** para impressoras multifuncionais (HP, Canon, Epson, Brother, Samsung, etc.)
- **Configuração avançada** de resolução, modo de cor, qualidade
- **Processamento de imagem** com OpenCV para melhor qualidade

### ✅ OCRService
- **Processamento OCR** com Tesseract otimizado para português brasileiro
- **Validação automática** de CPF, RG, datas e outros campos
- **Formatação inteligente** dos dados extraídos
- **Cálculo de confiança** baseado na quantidade de campos extraídos

### ✅ ScannerConfig Component
- **Interface gráfica** para configuração de scanner
- **Seleção de dispositivos** disponíveis
- **Configuração de parâmetros** (resolução, cor, qualidade)
- **Opções avançadas** (recorte automático, correção de inclinação)

## 🔧 Arquivos Implementados

### Serviços
- `frontend/src/services/ScannerService.ts` - Serviço principal de scanner
- `frontend/src/services/OCRService.ts` - Serviço de processamento OCR

### Componentes
- `frontend/src/components/ScannerConfig.tsx` - Modal de configuração de scanner

### Scripts Python
- `scripts/kodak_scanner_ocr.py` - Processador OCR específico para scanners Kodak
- `scripts/multifunctional_scanner_ocr.py` - Processador OCR específico para impressoras multifuncionais
- `scripts/tesseract_kodak_config.txt` - Configuração do Tesseract para documentos brasileiros

### Scripts de Configuração
- `scripts/setup_kodak_scanner.bat` - Script de configuração para Windows
- `scripts/setup_kodak_scanner.ps1` - Script PowerShell de configuração
- `scripts/setup_multifunctional_scanner.ps1` - Script PowerShell para impressoras multifuncionais

## 📋 Como Usar

### 1. Configuração Inicial

Execute o script de configuração para preparar o ambiente:

```bash
# Para scanners Kodak
scripts\setup_kodak_scanner.bat
# ou
powershell -ExecutionPolicy Bypass -File scripts\setup_kodak_scanner.ps1

# Para impressoras multifuncionais
powershell -ExecutionPolicy Bypass -File scripts\setup_multifunctional_scanner.ps1
```

### 2. Conectar Dispositivo

#### Para Scanners Kodak:
1. **Conecte o scanner Kodak i2600** via USB
2. **Instale os drivers TWAIN** específicos do fabricante
3. **Verifique se o dispositivo** é reconhecido pelo sistema

#### Para Impressoras Multifuncionais:
1. **Conecte a impressora multifuncional** via USB ou rede
2. **Instale os drivers completos** (impressão + scanner)
3. **Instale os drivers TWAIN** específicos para scanner
4. **Verifique se o dispositivo** é reconhecido pelo sistema

### 3. Usar no Sistema

1. **Abra a tela de Cliente** no sistema CIVITAS
2. **Clique no ícone 📷** ao lado do campo Código
3. **Configure o scanner** no modal que aparece
4. **Digitalize o documento** RG ou CNH
5. **Aguarde o processamento** OCR automático
6. **Verifique os campos** preenchidos automaticamente

## 🎯 Campos Extraídos Automaticamente

### Informações Pessoais
- **Nome completo** - Extraído do documento
- **CPF** - Validado automaticamente
- **RG** - Formato padronizado
- **Data de nascimento** - Formato DD/MM/AAAA
- **Sexo** - MASCULINO/FEMININO
- **Estado civil** - SOLTEIRO/CASADO/DIVORCIADO/VIUVO

### Filiação
- **Nome do pai** - Se disponível no documento
- **Nome da mãe** - Se disponível no documento

### Localização
- **Naturalidade** - Cidade/Estado de nascimento
- **Endereço** - Logradouro e número
- **CEP** - Formato XXXXX-XXX
- **Cidade/UF** - Se disponível

### Contato
- **Telefone** - Formato (XX) XXXXX-XXXX
- **Email** - Se disponível no documento

## 🔍 Tecnologias Utilizadas

### Frontend
- **React** - Interface do usuário
- **TypeScript** - Tipagem estática
- **OpenCV.js** - Processamento de imagem (via Python)
- **Tesseract.js** - OCR (via Python)

### Backend
- **Python** - Processamento OCR
- **OpenCV** - Processamento de imagem
- **Tesseract** - Reconhecimento de texto
- **PIL (Pillow)** - Manipulação de imagem

### Scanner
- **TWAIN** - Protocolo de scanner (Windows)
- **SANE** - Protocolo de scanner (Linux)
- **WebUSB** - Acesso a dispositivos USB
- **MediaDevices** - Acesso à câmera

## ⚙️ Configurações Avançadas

### Scanner Kodak i2600
- **Resolução**: 150, 300, 600, 1200 DPI
- **Modo de cor**: Colorido, Escala de cinza, Preto e branco
- **Tamanho da página**: A4, Letter, Legal
- **Qualidade**: 50% a 100%

### OCR Tesseract
- **Idioma**: Português brasileiro (por.traineddata)
- **Modo de página**: Segmentação automática
- **Caracteres permitidos**: A-Z, 0-9, acentos brasileiros
- **Configurações específicas** para documentos brasileiros

## 🐛 Solução de Problemas

### Scanner não detectado
1. Verifique se o scanner está conectado e ligado
2. Instale os drivers TWAIN específicos
3. Reinicie o sistema
4. Execute o script de configuração novamente

### OCR com baixa qualidade
1. Ajuste a resolução do scanner para 300 DPI ou superior
2. Use modo colorido ou escala de cinza
3. Certifique-se de que o documento está bem posicionado
4. Verifique se o arquivo `por.traineddata` está instalado

### Campos não preenchidos
1. Verifique a qualidade da digitalização
2. Certifique-se de que o documento está legível
3. Ajuste as configurações de OCR
4. Verifique se o documento é um RG ou CNH válido

## 🎯 Dispositivos Suportados:

### Scanners Kodak i2600:
- **Detecção automática** via TWAIN
- **Processamento otimizado** com OpenCV
- **OCR específico** para documentos brasileiros
- **Configurações avançadas** de qualidade

### Impressoras Multifuncionais:
- **HP**: OfficeJet, LaserJet, DeskJet
- **Canon**: PIXMA, ImageCLASS
- **Epson**: Workforce, EcoTank
- **Brother**: DCP, MFC
- **Samsung**: Xpress, ProXpress
- **Xerox**: WorkCentre
- **Lexmark**: MS, MX

## 📊 Métricas de Qualidade

### Confiança do OCR
- **90-100%**: Excelente qualidade, todos os campos extraídos
- **70-89%**: Boa qualidade, maioria dos campos extraídos
- **50-69%**: Qualidade média, alguns campos podem estar incorretos
- **<50%**: Baixa qualidade, verificação manual necessária

### Campos Obrigatórios
- **Nome**: Sempre necessário
- **CPF ou RG**: Pelo menos um deve ser extraído
- **Data de nascimento**: Recomendado para validação

## 🔄 Atualizações Futuras

### Planejadas
- [ ] Suporte a mais tipos de documentos
- [ ] Integração com APIs de validação de CPF
- [ ] Histórico de digitalizações
- [ ] Backup automático de documentos digitalizados

### Melhorias
- [ ] Interface de configuração mais avançada
- [ ] Suporte a scanners de rede
- [ ] Processamento em lote de documentos
- [ ] Integração com sistemas de arquivo

## 📞 Suporte

Para suporte técnico ou dúvidas sobre a funcionalidade de scanner:

1. **Verifique este documento** primeiro
2. **Execute o script de configuração** se necessário
3. **Consulte os logs** do sistema para erros específicos
4. **Entre em contato** com a equipe de desenvolvimento

---

**Sistema CIVITAS - Cartório Digital**  
*Versão 1.0 - Scanner Integration*
