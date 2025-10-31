# 🚀 Frontend - Sistema de Cartório

## 📖 Documentação

- **[Guia de Desenvolvimento](../DEVELOPMENT_GUIDE.md)** - Padrões e práticas
- **[Arquitetura](../ARCHITECTURE.md)** - Visão geral do sistema
- **[Constantes](./constants/README.md)** - Documentação de constantes

---

## 🎯 Quick Start

### **Criar nova página seguindo padrões:**

```tsx
import { 
  BasePage, 
  CustomSelect, 
  FormField, 
  FormRow,
  UF_OPTIONS,
  HEADER_COLORS,
  WINDOW_DIMENSIONS,
  getFormStyles,
  useAccessibility,
  validateCPF,
  validateEmail
} from '../shared'

export function NovaPage({ onClose }: { onClose: () => void }) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  const [focusedField, setFocusedField] = useState<string | null>(null)
  
  const styles = getFormStyles({ theme, currentTheme, focusedField })
  const headerColor = HEADER_COLORS[currentTheme]
  
  // ... resto do código
}
```

---

## 📦 Imports Centralizados

**Ao invés de:**
```tsx
import { BasePage } from '../components/BasePage'
import { CustomSelect } from '../components/CustomSelect'
import { UF_OPTIONS } from '../constants/selectOptions'
import { HEADER_COLORS } from '../constants/theme'
// ... 10 linhas de imports
```

**Faça:**
```tsx
import {
  BasePage,
  CustomSelect,
  UF_OPTIONS,
  HEADER_COLORS,
  getFormStyles,
  useAccessibility,
  validateCPF
} from '../shared'
```

---

## 🎨 Padrões Visuais

### **Dropdowns:**
- **SEMPRE** usar `CustomSelect` para UF e País
- **SEMPRE** configurar `maxVisibleItems={5}`
- **SEMPRE** importar opções de `selectOptions.ts`

### **Inputs:**
- Altura: 24px
- Border-radius: 3px
- Font-size: 12px
- Usar `getFormStyles()` para estilos

### **Buttons:**
- Altura mínima: 36px
- Border-radius: 6px
- Font-size: 13px
- Usar `primaryButtonStyles`, `secondaryButtonStyles`, `dangerButtonStyles`

### **Headers:**
- Teal (#008080) no light
- Laranja (#FF8C00) no dark
- Usar `HEADER_COLORS[currentTheme]`

---

## 🔍 Checklist de Qualidade

Antes de fazer commit:

- [ ] Imports otimizados (sem duplicados ou não utilizados)
- [ ] Estilos usando `getFormStyles()`
- [ ] UF/País usando `CustomSelect` + `UF_OPTIONS`/`PAIS_OPTIONS`
- [ ] Validações usando `validators.ts`
- [ ] localStorage usando `STORAGE_KEYS`
- [ ] Header usando `HEADER_COLORS`
- [ ] Dimensões usando `WINDOW_DIMENSIONS`
- [ ] TypeScript sem erros
- [ ] Linter sem warnings

---

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Lint
npm run lint

# Verificar tipos
npx tsc --noEmit
```

---

## 📞 Suporte

Dúvidas? Consulte:
1. `DEVELOPMENT_GUIDE.md` - Padrões de código
2. `ARCHITECTURE.md` - Visão geral do sistema
3. `constants/README.md` - Documentação de constantes

