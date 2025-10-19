# Template para Novas Telas

Este documento explica como criar novas telas seguindo o padrão estabelecido no sistema.

## Estrutura Padrão

Todas as telas devem seguir o mesmo padrão:
- Renderizadas no mesmo plano do sistema (não como modal)
- Menus persistentes (não fecham ao clicar fora)
- Usar o componente `BasePage` como base
- Integração com o sistema de temas

## Como Criar uma Nova Tela

### 1. Criar o Componente da Página

```tsx
// src/pages/MinhaNovaTela.tsx
import React, { useState } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'

interface MinhaNovaTelaProps {
  onClose: () => void
}

export function MinhaNovaTela({ onClose }: MinhaNovaTelaProps) {
  console.log('📺 MinhaNovaTela RENDERIZADO!')
  
  const { getTheme } = useAccessibility()
  const theme = getTheme()
  
  // Seu estado aqui
  const [formData, setFormData] = useState({
    campo1: '',
    campo2: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Estilos usando o tema
  const inputStyles = {
    padding: '8px 12px',
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: theme.background,
    color: theme.text,
    outline: 'none'
  }

  const buttonStyles = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: theme.primary,
    color: 'white'
  }

  return (
    <BasePage 
      title="Título da Minha Tela" 
      onClose={onClose}
      width="900px"  // Opcional, padrão é 900px
      height="700px" // Opcional, padrão é 700px
    >
      {/* Seu conteúdo aqui */}
      <div>
        <input
          type="text"
          value={formData.campo1}
          onChange={(e) => handleInputChange('campo1', e.target.value)}
          style={inputStyles}
          placeholder="Digite algo..."
        />
        
        <button style={buttonStyles}>
          Salvar
        </button>
      </div>
    </BasePage>
  )
}
```

### 2. Adicionar ao App.tsx

```tsx
// 1. Importar o componente
import { MinhaNovaTela } from './pages/MinhaNovaTela'

// 2. Adicionar estado
const [showMinhaNovaTela, setShowMinhaNovaTela] = useState(false)

// 3. Adicionar ao menu (IconMenu ou TextualMenu)
{ 
  id: 'minha-nova-tela', 
  label: 'Minha Nova Tela', 
  icon: '🔧', 
  onClick: () => {
    console.log('✅ MINHA NOVA TELA CLICADO! Abrindo janela...')
    setShowMinhaNovaTela(true)
  } 
}

// 4. Adicionar renderização condicional
{showMinhaNovaTela && (
  <MinhaNovaTela onClose={() => {
    console.log('❌ Fechando janela...')
    setShowMinhaNovaTela(false)
  }} />
)}
```

## Componente BasePage

O `BasePage` fornece:
- Layout padrão com header e botão de fechar
- Integração automática com temas
- Posicionamento centralizado
- Z-index apropriado
- Responsividade básica

### Props do BasePage

```tsx
interface BasePageProps {
  title: string           // Título exibido no header
  onClose: () => void     // Função chamada ao fechar
  children: React.ReactNode // Conteúdo da tela
  width?: string          // Largura (padrão: 900px)
  height?: string         // Altura (padrão: 700px)
}
```

## Estilos e Temas

Sempre use o hook `useAccessibility` para obter as cores do tema:

```tsx
const { getTheme } = useAccessibility()
const theme = getTheme()

// Cores disponíveis:
// theme.background    - Cor de fundo
// theme.surface       - Cor de superfície (cards, janelas)
// theme.text          - Cor do texto principal
// theme.textSecondary - Cor do texto secundário
// theme.border        - Cor das bordas
// theme.primary       - Cor primária (botões principais)
// theme.accent        - Cor de destaque
// theme.error         - Cor de erro
// theme.warning       - Cor de aviso
// theme.success       - Cor de sucesso
```

## Exemplos de Estilos Comuns

```tsx
// Input padrão
const inputStyles = {
  padding: '8px 12px',
  border: `1px solid ${theme.border}`,
  borderRadius: '4px',
  fontSize: '14px',
  backgroundColor: theme.background,
  color: theme.text,
  outline: 'none'
}

// Botão primário
const primaryButtonStyles = {
  padding: '8px 16px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  backgroundColor: theme.primary,
  color: 'white',
  transition: 'all 0.2s ease'
}

// Botão secundário
const secondaryButtonStyles = {
  ...primaryButtonStyles,
  backgroundColor: theme.border,
  color: theme.text
}

// Botão de perigo
const dangerButtonStyles = {
  ...primaryButtonStyles,
  backgroundColor: '#ef4444',
  color: 'white'
}

// Container de botões
const buttonsContainerStyles = {
  display: 'flex',
  gap: '12px',
  marginTop: '20px',
  paddingTop: '20px',
  borderTop: `1px solid ${theme.border}`
}
```

## Boas Práticas

1. **Sempre use o BasePage** como wrapper
2. **Use o sistema de temas** para cores
3. **Adicione logs** para debug (console.log)
4. **Mantenha consistência** nos estilos
5. **Teste em ambos os temas** (claro e escuro)
6. **Use nomes descritivos** para estados e funções
7. **Adicione validação** nos formulários
8. **Mantenha a responsividade** em mente
9. **SEMPRE use z-index 70+** para telas (veja `Z-INDEX-HIERARCHY.md`)

## Exemplo Completo

Veja `FirmasPage.tsx` para um exemplo completo de implementação seguindo este padrão.
