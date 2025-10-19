# Hierarquia de Z-Index do Sistema Civitas

## 📋 Regras de Z-Index

Para garantir que as janelas/telas nunca invadam os menus, siga **rigorosamente** esta hierarquia:

### Níveis de Z-Index

| Nível | Componente | Z-Index | Descrição |
|-------|------------|---------|-----------|
| **Nível 1** | Páginas/Janelas Base | `70-79` | Todas as telas movíveis (`BasePage`, `ClientePage`, `FirmasPage`, etc) |
| **Nível 2** | Menus Principais | `50-59` | Menu 1 (TextualMenu), Menu 2 (IconMenu) |
| **Nível 3** | Submenus | `60-69` | HoverMenu, submenus aninhados |
| **Nível 4** | Controles de Janela | `100` | WindowControls (minimizar, maximizar, fechar) |
| **Nível 5** | Modais/Overlays | `1000-10000` | ConfigOverlay, PasswordPrompt, FeedbackSystem |

## ⚠️ REGRA IMPORTANTE

**NUNCA** defina `z-index` menor que `70` para:
- Qualquer página criada com `BasePage`
- Qualquer janela movível do sistema
- Qualquer componente que deve ficar "atrás" dos menus

## 📝 Valores Específicos Recomendados

### Páginas e Janelas
```typescript
// BasePage e todas as páginas derivadas
zIndex: 70

// MovableTabs quando arrastando
zIndex: 75

// MovableTabs em estado normal
zIndex: 72
```

### Menus
```typescript
// TextualMenu (Menu 1)
zIndex: 50

// IconMenu (Menu 2)
zIndex: 50

// Submenus nível 1
zIndex: 51

// Submenus nível 2 (aninhados)
zIndex: 52

// HoverMenu
zIndex: 60
```

### Controles
```typescript
// WindowControls
zIndex: 100
```

### Overlays e Modais
```typescript
// ConfigOverlay
zIndex: 10000

// PasswordPrompt
zIndex: 10001

// FeedbackSystem
zIndex: 10000

// SideMenu
zIndex: 2000
```

## 🚀 Exemplo de Uso

### Criando uma Nova Página com BasePage

```tsx
import { BasePage } from '../components/BasePage'

export function MinhaNovaPage({ onClose }: { onClose: () => void }) {
  return (
    <BasePage
      title="Minha Nova Tela"
      onClose={onClose}
      width="1200px"
      height="800px"
    >
      {/* Conteúdo da tela */}
    </BasePage>
  )
}
```

O `BasePage` já tem `zIndex: 70` configurado internamente, então você não precisa se preocupar!

### Criando um Componente Personalizado

```tsx
const myWindowStyle = {
  position: 'absolute' as const,
  // ... outros estilos ...
  zIndex: 70, // ✅ SEMPRE use 70+ para janelas/telas
  // ❌ NUNCA use zIndex: 50 ou menor para telas
}
```

## 🔧 Manutenção

Se você precisar ajustar a hierarquia:
1. Mantenha **sempre** as páginas (70+) acima dos menus (50-69)
2. Modais devem estar acima de tudo (1000+)
3. Documentação para referência rápida, atualize conforme necessário

---

**Última atualização:** Outubro 2025  
**Mantido por:** Equipe de Desenvolvimento Civitas

