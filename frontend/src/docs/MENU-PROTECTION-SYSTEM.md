# Sistema de Proteção de Menus

## 🛡️ Visão Geral

O Sistema de Proteção de Menus foi criado para **GARANTIR** que os menus nunca mais quebrem devido a problemas de z-index. Este sistema é **IMUTÁVEL** e **AUTOMÁTICO**.

## 🔧 Componentes do Sistema

### 1. `useZIndexManager` Hook
- **Localização:** `src/hooks/useZIndexManager.ts`
- **Função:** Gerencia z-index de forma centralizada e segura
- **Características:**
  - Hierarquia fixa e imutável
  - Validação automática
  - Correção forçada quando necessário
  - Detecção de conflitos

### 2. `ProtectedMenu` Component
- **Localização:** `src/components/ProtectedMenu.tsx`
- **Função:** Wrapper que protege automaticamente os menus
- **Características:**
  - Aplica z-index correto automaticamente
  - Monitora mudanças em tempo real
  - Corrige z-index incorretos automaticamente
  - Logs de debug para troubleshooting

### 3. `useMenuProtection` Hook
- **Localização:** `src/components/ProtectedMenu.tsx`
- **Função:** Hook para componentes que precisam de proteção
- **Características:**
  - Estilos protegidos
  - Validação e correção
  - Z-index correto garantido

## 📋 Hierarquia de Z-Index (IMUTÁVEL)

```typescript
const Z_INDEX_HIERARCHY = {
  // Menus principais
  ICON_MENU: 50,           // Menu 2 (ícones)
  TEXTUAL_MENU: 60,        // Menu 1 (textual)
  
  // Submenus
  HOVER_MENU: 61,          // HoverMenu
  SUBMENU_LEVEL_1: 61,     // Submenus nível 1
  SUBMENU_LEVEL_2: 62,     // Submenus nível 2
  
  // Páginas e janelas
  PAGES: 70,               // Todas as páginas
  MOVABLE_TABS_NORMAL: 72, // Abas normais
  MOVABLE_TABS_DRAGGING: 75, // Abas sendo arrastadas
  
  // Controles
  WINDOW_CONTROLS: 100,    // Controles de janela
  
  // Overlays e modais
  SIDE_MENU: 2000,         // Menu lateral
  CONFIG_OVERLAY: 10000,   // Overlay de configurações
  PASSWORD_PROMPT: 10001,  // Prompt de senha
  FEEDBACK_SYSTEM: 10000   // Sistema de feedback
}
```

## 🚀 Como Usar

### 1. Para Novos Menus

```tsx
import { ProtectedMenu } from '../components/ProtectedMenu'

// Envolver o menu com ProtectedMenu
<ProtectedMenu menuType="TEXTUAL_MENU">
  <MeuMenu />
</ProtectedMenu>
```

### 2. Para Componentes Existentes

```tsx
import { useMenuProtection } from '../components/ProtectedMenu'

function MeuMenu() {
  const { getProtectedStyles } = useMenuProtection('TEXTUAL_MENU')
  
  const styles = getProtectedStyles({
    // seus estilos aqui
  })
  
  return <div style={styles}>...</div>
}
```

### 3. Para Validação Manual

```tsx
import { useZIndexManager } from '../hooks/useZIndexManager'

function MeuComponente() {
  const { getZIndex, validateZIndex, checkForConflicts } = useZIndexManager()
  
  // Obter z-index correto
  const correctZIndex = getZIndex('TEXTUAL_MENU')
  
  // Validar z-index
  const isValid = validateZIndex('TEXTUAL_MENU', 60)
  
  // Verificar conflitos
  const conflicts = checkForConflicts({ menu1: 60, menu2: 50 })
}
```

## 🛡️ Proteções Implementadas

### 1. Proteção Automática
- Z-index correto aplicado automaticamente
- Validação em tempo real
- Correção automática de valores incorretos

### 2. Monitoramento Contínuo
- MutationObserver monitora mudanças de estilo
- Detecção de z-index incorretos
- Logs de debug para troubleshooting

### 3. Validação Rigorosa
- Verificação de faixa permitida (50-10001)
- Detecção de duplicatas
- Avisos para valores não ideais

### 4. Fallback Automático
- Se z-index for inválido, usa valor correto
- Se z-index for incorreto, corrige automaticamente
- Sistema nunca falha

## 📊 Logs de Debug

O sistema gera logs detalhados:

```
✅ Z-Index correto aplicado para TEXTUAL_MENU: 60
⚠️ Z-Index não ideal para ICON_MENU: 55. Recomendado: 50
🚨 Z-Index incorreto detectado em TEXTUAL_MENU: 1000. Corrigindo para: 60
🔧 Forçando correção de z-index para HOVER_MENU: 61
```

## 🚫 O Que NÃO Fazer

### ❌ NUNCA:
- Definir z-index manualmente sem usar o sistema
- Usar valores fora da faixa 50-10001
- Ignorar os avisos do sistema
- Modificar a hierarquia sem atualizar o sistema

### ❌ EVITAR:
- Z-index hardcoded nos componentes
- Valores duplicados
- Valores muito altos (acima de 10001)
- Valores muito baixos (abaixo de 50)

## ✅ O Que Fazer

### ✅ SEMPRE:
- Usar `ProtectedMenu` para novos menus
- Usar `useMenuProtection` para componentes existentes
- Seguir a hierarquia definida
- Verificar logs de debug

### ✅ RECOMENDADO:
- Testar mudanças de z-index
- Verificar se não há conflitos
- Documentar novos tipos de menu
- Atualizar este arquivo quando necessário

## 🔄 Manutenção

### Para Adicionar Novo Tipo de Menu:
1. Adicionar na `Z_INDEX_HIERARCHY`
2. Atualizar este documento
3. Testar com `ProtectedMenu`
4. Verificar logs de debug

### Para Modificar Hierarquia:
1. **CUIDADO:** Modificar apenas se absolutamente necessário
2. Atualizar `Z_INDEX_HIERARCHY`
3. Testar todos os menus
4. Atualizar documentação
5. Verificar se não quebrou nada

## 🎯 Objetivo

**GARANTIR QUE OS MENUS NUNCA MAIS QUEBREM!**

Este sistema foi criado especificamente para resolver o problema de submenus aparecendo atrás de outros menus. Com esta proteção, o problema **NUNCA MAIS** deve ocorrer.

---

**Última atualização:** Dezembro 2024  
**Criado por:** Sistema de Proteção Automática  
**Status:** ✅ ATIVO E PROTEGENDO
