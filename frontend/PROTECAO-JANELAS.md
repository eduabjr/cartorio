# 🔒 Sistema de Proteção de Janelas

## Problema Identificado

Quando uma 2ª janela era aberta, as janelas existentes:
- ❌ Perdiam suas informações
- ❌ Voltavam para a posição original
- ❌ Sofria re-render desnecessário

## Causa Raiz

### 1. **WindowContext - Dependências que causavam re-criação de callbacks**

```typescript
// ❌ ANTES (PROBLEMÁTICO):
const [nextZIndex, setNextZIndex] = useState(2000)
const [windowCounter, setWindowCounter] = useState(0)

const openWindow = useCallback((windowData) => {
  // ... usa nextZIndex e windowCounter ...
}, [nextZIndex, windowCounter]) // ⚠️ Função recriada a cada mudança!
```

**Problema**: 
- Toda vez que `nextZIndex` ou `windowCounter` mudavam, a função `openWindow` era recriada
- Como a função está no contexto, **todos os componentes que usam o contexto re-renderizavam**
- Isso incluía todas as janelas abertas!

### 2. **BasePage - useEffect com dependências instáveis**

```typescript
// ❌ ANTES (PROBLEMÁTICO):
const [position, setPosition] = useState(initialPosition)

useEffect(() => {
  if (resetToOriginalPosition) {
    setPosition(initialPosition) // ⚠️ Reseta a posição
  }
}, [resetToOriginalPosition, initialPosition, ...]) 
// ⚠️ initialPosition muda = reset!
```

**Problema**:
- `initialPosition` era um objeto criado a cada render
- Mesmo com os mesmos valores `{x: 100, y: 150}`, era um novo objeto
- React via como mudança e triggava o useEffect
- Posição era resetada!

---

## Solução Implementada

### ✅ WindowContext - useRef para valores mutáveis

```typescript
// ✅ DEPOIS (CORRETO):
const nextZIndexRef = useRef(2000)       // Não causa re-render
const windowCounterRef = useRef(0)      // Não causa re-render

const openWindow = useCallback((windowData) => {
  setWindows(prev => {
    // Incrementar usando ref
    nextZIndexRef.current += 1
    const zIndex = nextZIndexRef.current
    
    windowCounterRef.current += 1
    // ... resto do código ...
  })
}, []) // ✅ Array vazio - função NUNCA é recriada!
```

**Benefícios**:
- ✅ Função `openWindow` é criada apenas uma vez
- ✅ Não causa re-render de componentes que usam o contexto
- ✅ Janelas existentes mantêm posição e estado

### ✅ BasePage - Posição inicial imutável

```typescript
// ✅ DEPOIS (CORRETO):
// 🔒 Armazenar posição inicial apenas UMA VEZ, nunca mudar
const initialPositionRef = useRef(initialPosition)
const initialZIndexRef = useRef(initialZIndex)

const [position, setPosition] = useState(() => initialPositionRef.current)

useEffect(() => {
  if (resetToOriginalPosition) { // Apenas se EXPLICITAMENTE solicitado
    setPosition(initialPositionRef.current)
  }
}, [resetToOriginalPosition]) // ✅ Apenas uma dependência estável!
```

**Benefícios**:
- ✅ Posição inicial é "congelada" na primeira montagem
- ✅ Mudanças em props não resetam a posição
- ✅ Apenas `resetToOriginalPosition=true` causa reset

### ✅ Sincronização de zIndex sem resetar posição

```typescript
// 🔒 Sincronizar zIndex do WindowManager SEM resetar posição
useEffect(() => {
  if (initialZIndex !== zIndex && !resetToOriginalPosition) {
    setZIndex(initialZIndex) // Apenas zIndex, posição intacta!
  }
}, [initialZIndex])
```

**Benefícios**:
- ✅ Janela é trazida para frente corretamente
- ✅ Posição não muda
- ✅ Conteúdo não é perdido

---

## Garantias do Sistema

### ✅ Proteções Implementadas

1. **Janelas mantêm informações**
   - Formulários não perdem dados
   - Estado interno é preservado
   - Props são mantidos

2. **Janelas mantêm posição**
   - Posição só muda ao arrastar
   - Abrir nova janela não afeta janelas existentes
   - Reset só ocorre se explicitamente solicitado

3. **Janelas podem se mover**
   - Drag & drop funciona normalmente
   - Não ficam travadas
   - Movimentação é fluida

4. **Toolbar e menus não são afetados**
   - zIndex dos menus: `1001`
   - zIndex das janelas: `2000+`
   - Hierarquia respeitada (veja `Z-INDEX-HIERARCHY.md`)

5. **Performance otimizada**
   - Callbacks estáveis (não recriam)
   - Re-renders minimizados
   - Refs para valores mutáveis

---

## Testes Recomendados

### ✅ Teste 1: Abrir múltiplas janelas
1. Abra "Funcionário"
2. Mova para posição X
3. Abra "Cliente"
4. Verifique: Funcionário está na mesma posição X ✅

### ✅ Teste 2: Editar formulário
1. Abra "Funcionário"
2. Digite "João" no campo Nome
3. Abra "Cliente"
4. Volte para "Funcionário"
5. Verifique: "João" ainda está lá ✅

### ✅ Teste 3: Movimentar janelas
1. Abra 3 janelas diferentes
2. Arraste cada uma para posições diferentes
3. Abra uma 4ª janela
4. Verifique: As 3 primeiras não se moveram ✅

### ✅ Teste 4: Trazer para frente
1. Abra "Funcionário" e "Cliente"
2. Clique no header de "Funcionário"
3. Verifique: Vem para frente SEM mudar posição ✅

### ✅ Teste 5: Menus e toolbar
1. Abra várias janelas
2. Clique nos menus
3. Verifique: Menus aparecem sobre as janelas ✅

---

## Arquitetura de Proteção

```
┌─────────────────────────────────────────────────────┐
│  WindowContext (Provider)                           │
│  ┌───────────────────────────────────────────────┐  │
│  │  nextZIndexRef (useRef)  ← Não causa re-render│  │
│  │  windowCounterRef (useRef) ← Não causa re-render│ │
│  │                                               │  │
│  │  openWindow (useCallback, deps: [])          │  │
│  │  bringToFront (useCallback, deps: [])        │  │
│  │  ↓ Funções ESTÁVEIS, nunca recriam          │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                      ↓ Contexto
┌─────────────────────────────────────────────────────┐
│  BasePage (Componente)                              │
│  ┌───────────────────────────────────────────────┐  │
│  │  initialPositionRef ← Posição "congelada"    │  │
│  │  initialZIndexRef ← zIndex "congelado"       │  │
│  │                                               │  │
│  │  useEffect com deps: [resetToOriginalPosition]│ │
│  │  ↓ Apenas reseta se explicitamente pedido   │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Comparação: Antes vs Depois

| Aspecto | ❌ Antes | ✅ Depois |
|---------|---------|-----------|
| **Abrir nova janela** | Todas re-renderizam | Apenas a nova renderiza |
| **Posição mantida** | ❌ Volta ao original | ✅ Mantém onde estava |
| **Dados do formulário** | ❌ Pode perder | ✅ Sempre preserva |
| **Performance** | ❌ Callbacks recriam | ✅ Callbacks estáveis |
| **Movimentação** | ✅ Funciona | ✅ Funciona |
| **Trazer para frente** | ⚠️ Pode resetar | ✅ Sem resetar |

---

## Logs de Debug

Para monitorar o comportamento:

```typescript
// WindowContext
🆕 Nova janela 'funcionario' aberta com zIndex 2001
🔄 Janela do tipo 'cliente' já está aberta, trazendo para frente...
✅ Janela 'cliente' trazida para frente com zIndex 2002

// BasePage
🔄 RESET EXPLÍCITO: Funcionário voltando para posição inicial
🎯 SINCRONIZAÇÃO: Atualizando zIndex de Cliente de 2001 para 2002
```

---

## Manutenção Futura

### ⚠️ Cuidados ao modificar

1. **Não adicione dependências aos callbacks**
   - `openWindow`, `bringToFront` devem ter `deps: []`
   - Use refs ou setState funcional

2. **Não mude initialPosition/initialZIndex após montagem**
   - Use refs para armazenar valores iniciais
   - Apenas sincronize zIndex se necessário

3. **Evite useEffect desnecessários**
   - Pense 2x antes de adicionar dependências
   - Prefira event handlers diretos

### ✅ Checklist para novos recursos

- [ ] Callbacks usam `deps: []` ou deps estáveis?
- [ ] Valores mutáveis usam `useRef`?
- [ ] useEffect tem apenas deps necessárias?
- [ ] Teste: abrir múltiplas janelas mantém posição?
- [ ] Teste: formulários não perdem dados?

---

## Conclusão

O sistema de proteção garante que:

✅ **Janelas são isoladas** - mudanças em uma não afetam outras  
✅ **Estado é preservado** - dados e posição mantidos  
✅ **Performance otimizada** - re-renders minimizados  
✅ **Experiência fluida** - janelas se movem naturalmente  
✅ **Hierarquia respeitada** - menus sempre visíveis  

**A arquitetura é robusta, escalável e à prova de futuro!** 🚀

