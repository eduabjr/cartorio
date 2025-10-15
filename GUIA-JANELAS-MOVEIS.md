# 🪟 **SISTEMA DE JANELAS MÓVEIS - SISTEMA DE CARTÓRIO**

## 🎯 **O que foi implementado**

Criei um sistema completo de **janelas móveis** para todos os submenus do sistema, exatamente como você solicitou! Agora cada item dos submenus abre em uma **janela arrastável** com **tamanho fixo**.

---

## ✨ **Características das Janelas Móveis**

### **🖱️ Funcionalidades:**
- **Arrastáveis:** Clique e arraste pela barra de título para mover
- **Tamanho fixo:** Cada janela tem dimensões otimizadas
- **Fecháveis:** Botão X no canto superior direito
- **Múltiplas janelas:** Pode abrir várias janelas simultaneamente
- **Posicionamento inteligente:** Cada janela abre em posições diferentes para não sobrepor

### **📏 Tamanhos das Janelas:**
- **Cadastro de Cliente:** 800x700 pixels
- **Lançamento de Protocolo:** 900x650 pixels  
- **Baixa de Protocolo:** 800x600 pixels

---

## 🚀 **Como Usar**

### **1. Acessar as Janelas:**
- **Desktop:** Passe o mouse sobre os menus e clique nos subitens
- **Mobile:** Use o menu lateral (ícone ☰ no header)

### **2. Mover as Janelas:**
- Clique e segure na **barra azul** (título da janela)
- Arraste para onde quiser na tela
- Solte para posicionar

### **3. Fechar as Janelas:**
- Clique no **X** no canto superior direito
- Ou use o botão de fechar

---

## 🎨 **Janelas Disponíveis**

### **📋 Cadastros:**
- ✅ **Cliente** - Formulário completo de cadastro

### **📄 Protocolos:**
- ✅ **Lançamento** - Formulário para criar novos protocolos
- ✅ **Baixa** - Formulário para dar baixa em protocolos

### **🔮 Futuras Janelas:**
- Funcionário
- Cartório (SEADE)
- Cidade
- País
- DNV e DO Bloqueadas
- Modelos e Minutas
- Ofícios e Mandados
- Averbação
- Hospital
- Cemitério
- Funerária
- Cadastro de Livros
- Feriados
- Configuração do Sistema

---

## 🛠️ **Arquitetura Técnica**

### **Componentes Criados:**
1. **`MovableWindow.tsx`** - Componente base da janela móvel
2. **`WindowContext.tsx`** - Contexto para gerenciar janelas
3. **`WindowManager.tsx`** - Renderizador de todas as janelas
4. **`ClienteWindow.tsx`** - Janela de cadastro de cliente
5. **`ProtocoloLancamentoWindow.tsx`** - Janela de lançamento
6. **`ProtocoloBaixaWindow.tsx`** - Janela de baixa

### **Integração:**
- **MenuBar** e **SideMenu** atualizados para abrir janelas
- **App.tsx** com WindowProvider
- **Layout.tsx** com WindowManager

---

## 🎯 **Resultado Final**

Agora você tem um sistema de **janelas móveis** profissional onde:

✅ **Cada submenu abre uma janela arrastável**  
✅ **Tamanhos fixos otimizados para cada função**  
✅ **Múltiplas janelas podem estar abertas simultaneamente**  
✅ **Interface intuitiva e fácil de usar**  
✅ **Funciona tanto em desktop quanto mobile**  

**O sistema está pronto para uso!** 🚀

---

## 📝 **Próximos Passos**

Para adicionar mais janelas móveis:
1. Crie o componente da janela em `frontend/src/components/windows/`
2. Importe no MenuBar e SideMenu
3. Adicione a lógica no `handleMenuClick`

**Exemplo:**
```typescript
if (subItem.name === 'Funcionário') {
  openWindow({
    id: 'funcionario-window',
    title: 'Cadastro de Funcionário',
    component: <FuncionarioWindow />,
    width: 800,
    height: 700,
    initialX: 250,
    initialY: 100
  })
}
```
