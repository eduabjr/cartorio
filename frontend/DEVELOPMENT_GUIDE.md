# 📘 Guia de Desenvolvimento - Sistema de Cartório

## 🎯 Objetivo
Este guia estabelece padrões e práticas para garantir **consistência** e **robustez** em todo o sistema, evitando quebras ao fazer alterações.

---

## 📁 Estrutura de Arquivos Compartilhados

### **Estilos e Temas**
```
frontend/src/
├── styles/
│   └── formStyles.ts          # Estilos padronizados para formulários
├── constants/
│   ├── selectOptions.ts       # Opções de UF e País
│   └── theme.ts               # Cores, dimensões e configurações globais
```

### **Componentes Reutilizáveis**
```
frontend/src/components/
├── CustomSelect.tsx           # Dropdown com overlay e 5 itens visíveis
├── BasePage.tsx               # Container padrão para todas as janelas
└── form/
    ├── FormField.tsx          # Campo de formulário padronizado
    └── FormRow.tsx            # Linha de formulário
```

### **Utilitários**
```
frontend/src/utils/
├── validators.ts              # Validações centralizadas (CPF, email, etc)
└── cpfValidator.ts            # Validação específica de CPF
```

---

## 🎨 Padrões de Estilos

### **1. Usar Estilos Compartilhados**

❌ **EVITE:**
```tsx
const inputStyles = {
  padding: '3px 10px',
  border: `1px solid ${theme.border}`,
  // ... mais 20 linhas
}
```

✅ **FAÇA:**
```tsx
import { getFormStyles } from '../styles/formStyles'

const { inputStyles, selectStyles, labelStyles } = getFormStyles({
  theme,
  currentTheme,
  focusedField
})
```

### **2. Usar Constantes de Tema**

❌ **EVITE:**
```tsx
const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'
```

✅ **FAÇA:**
```tsx
import { HEADER_COLORS } from '../constants/theme'

const headerColor = HEADER_COLORS[currentTheme]
```

### **3. Usar Dimensões Padronizadas**

❌ **EVITE:**
```tsx
<BasePage width="800px" height="600px" minWidth="800px" minHeight="600px">
```

✅ **FAÇA:**
```tsx
import { WINDOW_DIMENSIONS } from '../constants/theme'

<BasePage {...WINDOW_DIMENSIONS.medium}>
```

---

## 🔧 Padrões de Componentes

### **1. Dropdowns de UF e País**

✅ **SEMPRE USE CustomSelect:**
```tsx
import { CustomSelect } from '../components/CustomSelect'
import { UF_OPTIONS, PAIS_OPTIONS } from '../constants/selectOptions'

<CustomSelect
  value={formData.uf}
  onChange={(value) => handleChange('uf', value)}
  options={UF_OPTIONS}
  maxVisibleItems={5}
/>
```

### **2. Campos de Formulário**

✅ **USE FormField para consistência:**
```tsx
import { FormField } from '../components/form/FormField'

<FormField label="Nome" required>
  <input
    type="text"
    value={formData.nome}
    onChange={(e) => handleChange('nome', e.target.value)}
    style={inputStyles}
  />
</FormField>
```

### **3. Linhas de Formulário**

✅ **USE FormRow:**
```tsx
import { FormRow } from '../components/form/FormRow'

<FormRow>
  <FormField label="CPF" required>
    <input ... />
  </FormField>
  <FormField label="RG">
    <input ... />
  </FormField>
</FormRow>
```

---

## ✅ Padrões de Validação

### **1. Validar CPF**

✅ **USE validators.ts:**
```tsx
import { validateCPF, formatCPF } from '../utils/validators'

onBlur={(e) => {
  const result = validateCPF(e.target.value)
  if (!result.isValid) {
    alert(`❌ CPF INVÁLIDO!\n\n${result.error}`)
    handleChange('cpf', '')
  }
}}
```

### **2. Validar Email**

✅ **USE validators.ts:**
```tsx
import { validateEmail } from '../utils/validators'

onBlur={(e) => {
  const result = validateEmail(e.target.value)
  if (!result.isValid) {
    alert(`⚠️ E-mail inválido!\n\n${result.error}`)
    e.target.focus()
  }
}}
```

### **3. Validar Campos Obrigatórios**

✅ **USE validateRequiredFields:**
```tsx
import { validateRequiredFields } from '../utils/validators'

const requiredFields = [
  { campo: 'nome', label: 'Nome' },
  { campo: 'cpf', label: 'CPF' }
]

const validation = validateRequiredFields(formData, requiredFields)
if (!validation.isValid) {
  alert(validation.error)
  return
}
```

---

## 🚫 Evitar Duplicação

### **NÃO Duplique:**
- ❌ Listas de UF/País em cada página
- ❌ Estilos de input/select/button
- ❌ Lógica de validação de CPF/email
- ❌ Cores de header
- ❌ Dimensões de janela

### **SEMPRE Reutilize:**
- ✅ `UF_OPTIONS` e `PAIS_OPTIONS` de `constants/selectOptions.ts`
- ✅ Estilos de `styles/formStyles.ts`
- ✅ Validações de `utils/validators.ts`
- ✅ Cores de `constants/theme.ts`
- ✅ Componentes de `components/`

---

## 🎯 Checklist Antes de Criar Nova Página

- [ ] Importar `getFormStyles` ao invés de criar estilos locais
- [ ] Usar `CustomSelect` para UF e País
- [ ] Usar `HEADER_COLORS` para cor do header
- [ ] Usar `WINDOW_DIMENSIONS` para tamanho da janela
- [ ] Importar validadores de `utils/validators.ts`
- [ ] Usar `FormField` e `FormRow` quando apropriado
- [ ] Verificar se já existe um componente reutilizável antes de criar novo

---

## 🔄 Padrão de Auto-incremento

### **Códigos Sequenciais:**

✅ **PADRÃO:**
```tsx
// Gera código apenas ao gravar
const handleGravar = () => {
  let codigoFinal = formData.codigo
  
  if (formData.codigo === '0') {
    const ultimoCodigo = localStorage.getItem('ultimoCodigo[ENTIDADE]')
    const proximoCodigo = ultimoCodigo ? parseInt(ultimoCodigo) + 1 : 1
    
    codigoFinal = proximoCodigo.toString()
    localStorage.setItem('ultimoCodigo[ENTIDADE]', codigoFinal)
    
    setFormData(prev => ({ ...prev, codigo: codigoFinal }))
  }
  
  // ... resto da lógica de gravação
}
```

---

## 🎨 Padrão de Cores

### **Headers de Janelas:**
```tsx
import { HEADER_COLORS } from '../constants/theme'

const headerColor = HEADER_COLORS[currentTheme]
```

### **Status:**
```tsx
import { STATUS_COLORS } from '../constants/theme'

// Sucesso
style={{ color: STATUS_COLORS.success }}

// Erro
style={{ color: STATUS_COLORS.error }}
```

---

## 📋 Manutenção

### **Adicionar Novo Estado (UF):**
1. Editar **APENAS** `frontend/src/constants/selectOptions.ts`
2. Todas as páginas atualizam automaticamente

### **Adicionar Novo País:**
1. Editar **APENAS** `frontend/src/constants/selectOptions.ts`
2. Todas as páginas atualizam automaticamente

### **Alterar Cores do Tema:**
1. Editar **APENAS** `frontend/src/constants/theme.ts`
2. Todas as páginas atualizam automaticamente

### **Alterar Estilos de Input:**
1. Editar **APENAS** `frontend/src/styles/formStyles.ts`
2. Todas as páginas atualizam automaticamente

---

## ⚠️ REGRAS DE OURO

1. **DRY (Don't Repeat Yourself):** Se você copiar/colar código, PARE e crie um componente ou função reutilizável
2. **Single Source of Truth:** Cada configuração deve ter UMA única fonte
3. **Imports Centralizados:** Sempre importar de arquivos compartilhados
4. **Validação no onBlur:** Validar campos ao sair, não ao digitar
5. **Feedback Visual:** Sempre dar feedback claro ao usuário (alertas, cores, disabled)
6. **Acessibilidade:** Sempre usar `useAccessibility` hook para temas
7. **TypeScript:** Sempre tipar props e estados
8. **Comentários:** Documentar lógica complexa

---

## 🛠️ Ferramentas de Desenvolvimento

### **Verificar Duplicação:**
```bash
# Procurar estilos duplicados
grep -r "const.*Styles.*=" frontend/src/pages/ | wc -l

# Procurar UF_OPTIONS duplicado
grep -r "UF_OPTIONS" frontend/src/pages/
```

### **Verificar Imports:**
```bash
# Listar todos os imports
grep -h "^import" frontend/src/pages/*.tsx | sort | uniq
```

---

## 📚 Recursos

- **Estilos:** `frontend/src/styles/formStyles.ts`
- **Constantes:** `frontend/src/constants/`
- **Validadores:** `frontend/src/utils/validators.ts`
- **Componentes:** `frontend/src/components/`
- **Hooks:** `frontend/src/hooks/useAccessibility.ts`

---

## ✨ Exemplo Completo de Página Padronizada

```tsx
import React, { useState } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { CustomSelect } from '../components/CustomSelect'
import { FormField } from '../components/form/FormField'
import { FormRow } from '../components/form/FormRow'
import { UF_OPTIONS, PAIS_OPTIONS } from '../constants/selectOptions'
import { HEADER_COLORS, WINDOW_DIMENSIONS } from '../constants/theme'
import { getFormStyles } from '../styles/formStyles'
import { validateCPF, validateEmail, validateRequiredFields } from '../utils/validators'

export function MinhaPage({ onClose }: { onClose: () => void }) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  const [focusedField, setFocusedField] = useState<string | null>(null)
  
  const { inputStyles, selectStyles, buttonStyles, getInputStyles } = getFormStyles({
    theme,
    currentTheme,
    focusedField
  })
  
  const headerColor = HEADER_COLORS[currentTheme]
  
  const [formData, setFormData] = useState({
    codigo: '0',
    nome: '',
    uf: ''
  })
  
  return (
    <BasePage
      title="Minha Página"
      onClose={onClose}
      headerColor={headerColor}
      {...WINDOW_DIMENSIONS.medium}
    >
      <FormRow>
        <FormField label="Nome" required>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            style={inputStyles}
          />
        </FormField>
        
        <FormField label="UF" required>
          <CustomSelect
            value={formData.uf}
            onChange={(value) => setFormData({ ...formData, uf: value })}
            options={UF_OPTIONS}
            maxVisibleItems={5}
          />
        </FormField>
      </FormRow>
    </BasePage>
  )
}
```

---

**Última Atualização:** 30/10/2025  
**Versão:** 1.0

