# Pasta de Logo CIVITAS

Esta pasta é destinada aos arquivos de logo do sistema CIVITAS.

## Como usar:

### **Opção 1: Logo Único (funciona em ambos os temas)**
1. **Coloque seu arquivo de logo** com um dos nomes abaixo
2. **Formatos suportados**: PNG, SVG, JPG, WEBP
3. **Tamanho recomendado**: 200x200px ou maior

**Nomes aceitos:**
- `civitas-logo.png` (recomendado)
- `civitas-logo.svg`
- `logo.png`
- `logo.svg`

### **Opção 2: Logos Específicos por Tema (recomendado)**
1. **Crie dois logos**: um para modo claro e outro para modo escuro
2. **Coloque ambos na pasta** com os nomes específicos

**Nomes para logos específicos:**
- `civitas-logo-light.png` (modo claro)
- `civitas-logo-dark.png` (modo escuro)
- `logo-light.png` / `logo-dark.png`
- `logo-light.svg` / `logo-dark.svg`

## Prioridade de Detecção:
1. **Logo específico do tema** (ex: `logo-light.png`)
2. **Logo genérico** (ex: `logo.png`)
3. **SVG padrão** (se nenhum logo for encontrado)

## Localizações Aceitas:
- `frontend/public/logo.png` (raiz)
- `frontend/public/assets/logo/` (pasta específica)

## Após adicionar o arquivo:
O sistema irá automaticamente detectar e usar o logo apropriado baseado no tema atual.

## Estrutura da pasta:
```
frontend/public/assets/logo/
├── README.md (este arquivo)
├── civitas-logo-light.png (logo para modo claro)
├── civitas-logo-dark.png (logo para modo escuro)
└── logo.png (logo genérico - opcional)
```

## Exemplo de Uso:
- **Modo Claro**: Usa `civitas-logo-light.png` se existir, senão usa `logo.png`
- **Modo Escuro**: Usa `civitas-logo-dark.png` se existir, senão usa `logo.png`
- **Fallback**: Se nenhum logo for encontrado, usa o SVG padrão com cores do tema
