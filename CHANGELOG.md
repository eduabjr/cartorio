# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2024-10-22

### Adicionado

#### **Arquitetura de Microserviços**

- Implementação completa de arquitetura de microserviços
- API Gateway com Circuit Breaker e Retry Pattern
- Auth Service para autenticação e autorização
- User Service para gerenciamento de usuários
- Protocolo Service para gerenciamento de protocolos
- Cliente Service para gerenciamento de clientes
- Health checks para todos os serviços
- Monitoramento com Prometheus e Grafana

#### **Electron (Versão Desktop)**

- Configuração completa do Electron v27.0.0
- Scanner Bridge para acesso a scanners TWAIN
- Suporte a impressoras multifuncionais
- Detecção automática de dispositivos
- Configurações avançadas de digitalização
- OCR local com Tesseract nativo
- Scripts de configuração e desenvolvimento
- Build e empacotamento para Windows, Linux e macOS

#### **Scanner e OCR**

- Integração com scanners TWAIN (Windows)
- Integração com SANE (Linux)
- Suporte a impressoras multifuncionais (HP, Canon, Epson, Brother, etc.)
- OCR automático com Tesseract v5.5.0
- Processamento de imagens com OpenCV
- Extração automática de dados de RG/CNH
- Validação inteligente de CPF, RG e datas
- Preenchimento automático de campos
- Scripts Python otimizados para Kodak i2600 e multifuncionais

#### **Ambiente Web**

- Detecção automática de ambiente (web vs desktop)
- Componente WebScannerConfig específico para web
- Uso de câmera para digitalização em navegadores
- Fallback inteligente quando scanner não disponível
- Documentação completa para ambiente web

#### **Acessibilidade**

- Suporte completo a leitores de tela (NVDA)
- Temas: Light, Dark e Alto Contraste
- Tamanhos de fonte ajustáveis
- Navegação por teclado
- Anúncios auditivos de ações
- Sistema de proteção de menu com Z-index

#### **Interface de Cliente**

- Formulário completo de cadastro de clientes
- Validação de campos em tempo real
- Integração com scanner para digitalização de documentos
- Geração de QR Code para protocolos
- Tabs para organização de dados (Cadastro, Digitalização, Histórico)
- Campo "Código País/IBGE" para suporte internacional
- Campo "Órgão RG" expandido

#### **Documentação**

- README.md completo com versões de tecnologias
- ELECTRON-DEVELOPMENT-GUIDE.md
- WEB-SCANNER-INTEGRATION.md
- SCANNER-INTEGRATION.md
- DOCKER-COMPOSE-GUIDE.md
- MICROSERVICES-BEST-PRACTICES.md
- Documentação de componentes e hooks
- CHANGELOG.md
- LICENSE (MIT)

#### **Scripts de Automação**

- `setup-electron.ps1` - Configuração do ambiente Electron
- `dev-electron.ps1` - Menu interativo de desenvolvimento
- `push-git.ps1` - Push rápido no Git
- `pull-git.ps1` - Pull rápido do Git
- Scripts Docker Compose utilitários
- Scripts de deploy para produção

#### **Docker e DevOps**

- `docker-compose.yml` - Orquestração completa
- `docker-compose.dev.yml` - Ambiente de desenvolvimento
- `docker-compose.prod.yml` - Ambiente de produção
- `docker-compose.test.yml` - Ambiente de testes
- Dockerfiles para todos os serviços
- Configuração Nginx para proxy reverso
- Health checks para todos os containers

### Modificado

#### **Frontend**

- Atualização do `App.tsx` para usar componente correto de login
- Implementação de tema dinâmico (light/dark) no login
- Ajuste de cores baseado no tema atual
- Remoção de reload forçado ao mudar tema
- Correção de re-renderização de menus (TextualMenu e IconMenu)

#### **Hooks**

- `useAccessibility.ts` - Retorno de cópia do tema para forçar re-render
- Remoção de logs excessivos
- Otimização de detecção de tema do sistema

#### **Serviços**

- `ScannerService.ts` - Adição de suporte a multifuncionais
- `OCRService.ts` - Novo serviço para processamento OCR
- Métodos de validação e formatação de dados
- Detecção inteligente de tipo de dispositivo

#### **Componentes**

- `ScannerConfig.tsx` - Labels descritivos para tipos de scanner
- `ClientePage.tsx` - Integração completa com scanner e OCR
- Ajustes de layout e responsividade

#### **Package.json**

- Adição de scripts para Electron
- Scripts para desenvolvimento web e desktop
- Scripts de build e distribuição
- Script de pull do Git

### Corrigido

- Correção de tema no login (logo e cor de texto)
- Correção de re-renderização de menus ao mudar tema
- Correção de cliques em menus após mudança de tema
- Correção de linting em arquivos Markdown
- Correção de paths e imports
- Correção de validação de CPF
- Correção de formatação de dados extraídos

### Removido

- Logs excessivos de debug
- Código duplicado de detecção de tema
- Reload forçado da página ao mudar tema
- Estados temporários de forceUpdate nos menus

## [0.1.0] - 2024-10-01

### 🎉 Versão Inicial

- Estrutura inicial do projeto
- Frontend básico com React
- Configuração inicial de microserviços
- Dockerização básica

---

## 📝 Tipos de Mudanças

- `Adicionado` para novas funcionalidades.
- `Modificado` para mudanças em funcionalidades existentes.
- `Descontinuado` para funcionalidades que serão removidas em breve.
- `Removido` para funcionalidades removidas.
- `Corrigido` para correções de bugs.
- `Segurança` para vulnerabilidades corrigidas.
