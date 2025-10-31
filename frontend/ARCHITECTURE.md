# 🏗️ Arquitetura do Sistema - Cartório

## 📋 Visão Geral

Sistema modular e escalável construído com React + TypeScript, seguindo princípios de **DRY** (Don't Repeat Yourself) e **Single Source of Truth**.

---

## 🗂️ Estrutura de Diretórios

```
frontend/src/
├── components/              # Componentes reutilizáveis
│   ├── BasePage.tsx        # Container base para todas as janelas
│   ├── CustomSelect.tsx    # Dropdown customizado (overlay + 5 itens)
│   ├── CidadeAutocompleteInput.tsx
│   ├── OCRProgress.tsx
│   └── form/               # Componentes de formulário
│       ├── FormField.tsx   # Campo padronizado
│       └── FormRow.tsx     # Linha de formulário
│
├── pages/                  # Páginas da aplicação
│   ├── ClientePage.tsx
│   ├── FuncionarioPage.tsx
│   ├── ProtocoloLancamentoPage.tsx
│   └── ... (26 páginas)
│
├── hooks/                  # React Hooks customizados
│   ├── useAccessibility.ts # Gerencia tema, fonte, auto-logout
│   ├── useAutoLogout.ts    # Lógica de logout automático
│   └── useFieldValidation.ts
│
├── services/               # Camada de serviços (API)
│   ├── NaturezaService.ts
│   ├── ClienteService.ts
│   └── ...
│
├── utils/                  # Utilitários e helpers
│   ├── validators.ts       # Validações centralizadas
│   ├── cpfValidator.ts     # Validação específica de CPF
│   └── ocrUtils.ts
│
├── styles/                 # Estilos compartilhados
│   └── formStyles.ts       # Estilos de formulários
│
├── constants/              # Constantes globais
│   ├── selectOptions.ts    # UF e País
│   ├── theme.ts            # Cores e dimensões
│   └── localStorage.ts     # Chaves de storage
│
└── shared/                 # Exports centralizados
    └── index.ts            # Facilita imports
```

---

## 🎯 Princípios Arquiteturais

### **1. Single Source of Truth (SSOT)**
Cada dado/configuração tem UMA única fonte:

- **UF/País:** `constants/selectOptions.ts`
- **Cores:** `constants/theme.ts`
- **Estilos:** `styles/formStyles.ts`
- **Validações:** `utils/validators.ts`

### **2. Component Reusability**
Componentes pequenos e reutilizáveis:

- `CustomSelect` - Dropdown padronizado
- `FormField` - Campo de formulário
- `FormRow` - Linha de formulário
- `BasePage` - Container de janela

### **3. Separation of Concerns**
Cada módulo tem uma responsabilidade:

- **Components:** UI e apresentação
- **Services:** Comunicação com backend/localStorage
- **Utils:** Lógica de negócio e helpers
- **Hooks:** Estado e efeitos colaterais
- **Constants:** Dados estáticos

### **4. Type Safety**
TypeScript em todos os arquivos:

- Interfaces para props
- Types para dados
- Validação em tempo de compilação

---

## 🔄 Fluxo de Dados

```
┌──────────────┐
│  User Input  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Page      │  ← useState, useEffect
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Validators  │  ← utils/validators.ts
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Service    │  ← API ou localStorage
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Storage    │  ← Backend ou localStorage
└──────────────┘
```

---

## 🎨 Sistema de Temas

### **Temas Disponíveis:**
- **Light:** Fundo claro, texto escuro
- **Dark:** Fundo escuro, texto claro
- **High Contrast:** Alto contraste para acessibilidade

### **Aplicação de Tema:**
```tsx
const { getTheme, currentTheme } = useAccessibility()
const theme = getTheme()

// Usar cores do tema
style={{ backgroundColor: theme.background, color: theme.text }}
```

### **Cores Dinâmicas:**
```tsx
import { HEADER_COLORS } from '../constants/theme'

const headerColor = HEADER_COLORS[currentTheme]
```

---

## 🔐 Sistema de Validação

### **Fluxo de Validação:**

1. **Input onChange:** Formatação básica
2. **Input onBlur:** Validação completa
3. **Form onSubmit:** Validação de campos obrigatórios

### **Validadores Disponíveis:**
- `validateCPF(cpf)` - Valida CPF real
- `validateEmail(email)` - Valida formato de email
- `validateRequired(value, label)` - Campo obrigatório
- `validateRequiredFields(data, fields)` - Múltiplos campos

---

## 💾 Persistência de Dados

### **Estratégia:**
1. **Preferência:** Backend via API
2. **Fallback:** localStorage (quando API indisponível)

### **Padrão de Código Sequencial:**
```tsx
import { STORAGE_KEYS, getNextCode, saveLastCode } from '../constants/localStorage'

// Ao gravar
if (formData.codigo === '0') {
  const codigoFinal = getNextCode(STORAGE_KEYS.ULTIMO_CODIGO_CLIENTE)
  saveLastCode(STORAGE_KEYS.ULTIMO_CODIGO_CLIENTE, codigoFinal)
  setFormData(prev => ({ ...prev, codigo: codigoFinal }))
}
```

---

## 🧩 Componentes Principais

### **BasePage**
Container padrão para todas as janelas:
- Draggable (movível)
- Resizable (redimensionável)
- Z-index gerenciado
- Header colorido por tema

### **CustomSelect**
Dropdown customizado:
- Overlay (não empurra layout)
- 5 itens visíveis
- Scroll automático
- Seta adaptável ao tema

### **FormField**
Campo de formulário padronizado:
- Label automático
- Suporte a asterisco (*)
- Layout consistente

---

## 📊 Estado e Performance

### **Estado Local vs Global:**
- **Local (useState):** Formulários, UI temporária
- **Global (Context):** Tema, autenticação, configurações

### **Otimizações:**
- `React.memo` para componentes pesados
- `useCallback` para funções em props
- `useMemo` para cálculos complexos
- Lazy loading de páginas pesadas

---

## 🐛 Debugging e Logs

### **Padrão de Console Logs:**
```tsx
console.log('✅ Sucesso:', dados)
console.error('❌ Erro:', erro)
console.warn('⚠️ Aviso:', aviso)
console.log('🔍 Debug:', info)
console.log('💾 Salvando:', dados)
console.log('📄 Carregando:', dados)
```

### **Ferramentas de Debug:**
- React DevTools
- Network tab (API calls)
- Console (logs)
- localStorage Inspector

---

## 🚀 Adicionando Nova Página

### **Passo a Passo:**

1. **Criar arquivo:**
```tsx
// frontend/src/pages/MinhaPage.tsx
import { BasePage, CustomSelect, FormField, FormRow } from '../shared'
import { HEADER_COLORS, WINDOW_DIMENSIONS } from '../shared'

export function MinhaPage({ onClose }: { onClose: () => void }) {
  // ... implementação
}
```

2. **Registrar no App.tsx:**
```tsx
import { MinhaPage } from './pages/MinhaPage'

// Adicionar ao menu
{ path: '/minha-pagina', component: MinhaPage, label: 'Minha Página' }
```

3. **Seguir padrões:**
- ✅ Usar `getFormStyles()`
- ✅ Usar `CustomSelect` para UF/País
- ✅ Usar `validateCPF`, `validateEmail`
- ✅ Usar `STORAGE_KEYS` para localStorage
- ✅ Usar `HEADER_COLORS` para header

---

## ⚡ Performance Checklist

- [ ] Evitar re-renders desnecessários
- [ ] Usar `key` em listas
- [ ] Memoizar funções pesadas
- [ ] Lazy load de rotas
- [ ] Otimizar imagens
- [ ] Minimizar bundle size

---

## 🔒 Segurança

### **Frontend:**
- Validação de inputs
- Sanitização de dados
- Proteção contra XSS
- HTTPS obrigatório

### **Backend:**
- JWT para autenticação
- Rate limiting
- CORS configurado
- Validação server-side

---

## 📦 Dependências Principais

- **React 18:** UI framework
- **TypeScript:** Type safety
- **Vite:** Build tool
- **React Router:** Navegação
- **Axios:** HTTP requests

---

## 🔄 CI/CD (Futuro)

1. **Lint:** ESLint + Prettier
2. **Test:** Jest + React Testing Library
3. **Build:** Vite build
4. **Deploy:** Docker + Nginx

---

**Mantido por:** Equipe de Desenvolvimento  
**Última Atualização:** 30/10/2025

