# API de Integração NVDA

## Visão Geral

A API de integração NVDA fornece comunicação direta com o leitor de tela NonVisual Desktop Access (NVDA), permitindo anúncios personalizados, comandos e configurações específicas.

## Funcionalidades

### 1. Detecção Automática
- Detecta se o NVDA está instalado e ativo
- Verifica capacidades disponíveis
- Obtém configurações atuais

### 2. Anúncios Personalizados
- Anúncios com diferentes prioridades (low, normal, high, urgent)
- Categorias de mensagem (information, warning, error, success)
- Controle de interrupção de fala

### 3. Comandos NVDA
- Execução de comandos específicos do NVDA
- Obtenção de status do leitor
- Configuração de parâmetros

## Uso Básico

### Importação
```typescript
import { nvdaService } from '../services/NVDAService'
```

### Verificar Disponibilidade
```typescript
if (nvdaService.isNVDAAvailable()) {
  console.log('NVDA está disponível')
}
```

### Anunciar Texto
```typescript
// Anúncio normal
await nvdaService.announce('Mensagem normal')

// Anúncio urgente
await nvdaService.announce('ATENÇÃO! Mensagem urgente!', {
  priority: 'urgent',
  interrupt: true,
  category: 'warning'
})
```

### Obter Status
```typescript
const status = await nvdaService.getStatus()
console.log('Status do NVDA:', status)
```

## Tipos de Anúncio

### Prioridades
- `low`: Baixa prioridade, não interrompe fala atual
- `normal`: Prioridade normal (padrão)
- `high`: Alta prioridade, pode interromper fala atual
- `urgent`: Prioridade urgente, sempre interrompe

### Categorias
- `information`: Informação geral
- `warning`: Aviso importante
- `error`: Erro ou problema
- `success`: Sucesso ou confirmação

## Capacidades Detectadas

O serviço detecta automaticamente as seguintes capacidades:

- **speech**: Síntese de voz
- **braille**: Display braille
- **keyboard**: Navegação por teclado
- **mouse**: Navegação por mouse
- **objectNavigation**: Navegação por objetos
- **documentNavigation**: Navegação em documentos
- **webNavigation**: Navegação web

## Configurações

### Obter Configurações
```typescript
const settings = nvdaService.getSettings()
console.log('Configurações do NVDA:', settings)
```

### Atualizar Configurações
```typescript
await nvdaService.updateSettings({
  speechRate: 60,
  speechVolume: 80
})
```

## Integração com useAccessibility

O hook `useAccessibility` integra automaticamente com o NVDA:

```typescript
const { announceToScreenReader } = useAccessibility()

// Usa NVDA se disponível, senão usa método padrão
await announceToScreenReader('Mensagem para leitor de tela')
```

## CSS Otimizado

Quando o NVDA é detectado, a classe `.nvda-optimized` é aplicada ao body, fornecendo:

- Indicadores de foco aprimorados
- Melhor navegação por teclado
- Anúncios de mudanças de estado
- Otimizações para tabelas e formulários

## Fallback

Se o NVDA não estiver disponível, o sistema usa métodos padrão:

- Elementos `aria-live` para anúncios
- Atributos ARIA para navegação
- Classes CSS para otimização

## Exemplo Completo

```typescript
import { nvdaService } from '../services/NVDAService'

// Verificar se NVDA está disponível
if (nvdaService.isNVDAAvailable()) {
  // Obter capacidades
  const capabilities = nvdaService.getCapabilities()
  console.log('Capacidades:', capabilities)
  
  // Anunciar mensagem
  await nvdaService.announce('Sistema carregado com sucesso', {
    priority: 'normal',
    category: 'success'
  })
  
  // Executar comando
  const status = await nvdaService.getStatus()
  console.log('Status:', status)
} else {
  console.log('NVDA não disponível, usando métodos padrão')
}
```

## Limitações

1. **Dependência do NVDA**: Requer que o NVDA esteja instalado e ativo
2. **Permissões**: Algumas funcionalidades podem requerer permissões específicas
3. **Compatibilidade**: Funciona melhor com versões recentes do NVDA
4. **Fallback**: Sempre tem fallback para métodos padrão

## Troubleshooting

### NVDA não detectado
- Verificar se o NVDA está instalado
- Verificar se está ativo
- Verificar permissões do navegador

### Anúncios não funcionam
- Verificar se o NVDA está configurado para síntese de voz
- Verificar volume e configurações de voz
- Testar com anúncios simples primeiro

### Comandos falham
- Verificar se o NVDA suporta o comando
- Verificar logs do console para erros
- Usar fallback quando necessário
