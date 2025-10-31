# 📚 Constantes Compartilhadas

## 🎯 Objetivo

Centralizar todas as constantes do sistema para evitar duplicação e garantir consistência.

---

## 📁 Arquivos

### **selectOptions.ts**
Opções para dropdowns de UF e País.

**Uso:**
```tsx
import { UF_OPTIONS, PAIS_OPTIONS } from '../constants/selectOptions'

<CustomSelect options={UF_OPTIONS} maxVisibleItems={5} />
```

**Conteúdo:**
- `UF_OPTIONS`: 27 estados brasileiros
- `PAIS_OPTIONS`: 246 países do mundo

---

### **theme.ts**
Cores, dimensões e configurações visuais.

**Uso:**
```tsx
import { HEADER_COLORS, WINDOW_DIMENSIONS, STATUS_COLORS } from '../constants/theme'

const headerColor = HEADER_COLORS[currentTheme]
<BasePage {...WINDOW_DIMENSIONS.medium} headerColor={headerColor} />
```

**Conteúdo:**
- `HEADER_COLORS`: Cores de header por tema
- `WINDOW_DIMENSIONS`: Tamanhos padrão de janelas
- `STATUS_COLORS`: Cores de status (sucesso, erro, etc)
- `Z_INDEX`: Camadas de sobreposição
- `SPACING`: Espaçamentos padronizados
- `BORDERS`: Raios e larguras de borda
- `FONT_SIZES`: Tamanhos de fonte
- `COMPONENT_HEIGHTS`: Alturas de componentes

---

### **localStorage.ts**
Chaves e helpers para localStorage.

**Uso:**
```tsx
import { STORAGE_KEYS, getNextCode, saveLastCode } from '../constants/localStorage'

const codigo = getNextCode(STORAGE_KEYS.ULTIMO_CODIGO_CLIENTE)
saveLastCode(STORAGE_KEYS.ULTIMO_CODIGO_CLIENTE, codigo)
```

**Conteúdo:**
- `STORAGE_KEYS`: Chaves padronizadas
- `getFromStorage()`: Ler com segurança
- `saveToStorage()`: Salvar com tratamento de erro
- `getNextCode()`: Gerar código sequencial
- `saveLastCode()`: Salvar último código

---

## ⚠️ IMPORTANTE

### **NUNCA faça:**
❌ Criar listas de UF/País localmente em páginas  
❌ Hardcode de cores ou dimensões  
❌ Duplicar chaves de localStorage  

### **SEMPRE faça:**
✅ Importar de `constants/`  
✅ Usar helpers para localStorage  
✅ Centralizar configurações  

---

## 🔄 Manutenção

### **Adicionar novo estado:**
Editar **APENAS** `selectOptions.ts`:
```tsx
export const UF_OPTIONS = [
  // ... estados existentes
  { value: 'XX', label: 'XX - Novo Estado' }
]
```

### **Adicionar nova cor:**
Editar **APENAS** `theme.ts`:
```tsx
export const STATUS_COLORS = {
  // ... cores existentes
  newStatus: '#hexcode'
}
```

### **Adicionar nova chave de storage:**
Editar **APENAS** `localStorage.ts`:
```tsx
export const STORAGE_KEYS = {
  // ... chaves existentes
  NOVA_CHAVE: 'novaChave'
}
```

---

**Mantido por:** Equipe de Desenvolvimento

