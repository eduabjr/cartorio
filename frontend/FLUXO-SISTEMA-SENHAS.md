# 🔄 Fluxo do Sistema de Senhas

## 📊 Arquitetura de Comunicação

```
┌─────────────────────────────────────────────────────────────┐
│                  BROADCAST CHANNEL API                       │
│          (Comunicação entre abas/janelas)                   │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
        ┌──────────────────────────────────────┐
        │    SenhaEventService (Singleton)      │
        │  - emit()  - on()  - off()           │
        └──────────────────────────────────────┘
                ↓           ↓           ↓
     ┌──────────┴───────┬───┴───────┬──┴──────────┐
     ↓                  ↓           ↓             ↓
┌─────────┐      ┌──────────┐  ┌────────┐   ┌──────────┐
│Terminal │      │Controlador│  │Painel  │   │Painel    │
│ Senhas  │      │  Senhas   │  │Público │   │Adminis.  │
└─────────┘      └──────────┘  └────────┘   └──────────┘
```

---

## 🔁 Fluxo Completo de Uma Senha

### 1️⃣ **EMISSÃO** (Terminal de Senhas)

```
Cliente chega
    ↓
Seleciona serviço (P ou C)
    ↓
Terminal gera senha (P001, C001, etc.)
    ↓
SenhaService.emitirSenha()
    ↓
📤 Emite evento: senha_emitida
    ↓
Imprime comprovante térmico
```

**Status:** `aguardando`
**Visível em:** Terminal, Controlador

---

### 2️⃣ **CHAMADA** (Controlador de Senhas)

```
Funcionário vê senha na lista
    ↓
Navega com ◀ ▶
    ↓
Clica 📞 para chamar
    ↓
SenhaService.chamarSenha()
    ↓
📤 Emite evento: senha_chamada
    ↓
Painel Público MOSTRA + VOZ
```

**Status:** `chamando` → `atendendo` (3s depois)
**Visível em:** Controlador, Painel Público

---

### 3️⃣ **ATENDIMENTO** (Automático)

```
Após 3 segundos de chamada
    ↓
SenhaService.iniciarAtendimento()
    ↓
📤 Emite evento: senha_atendendo
    ↓
Status muda
```

**Status:** `atendendo`
**Visível em:** Controlador, Painel Público

---

### 4️⃣ **FINALIZAÇÃO** (Controlador de Senhas)

```
Funcionário clica "Finalizar"
    ↓
SenhaService.finalizarAtendimento()
    ↓
📤 Emite evento: senha_finalizada
    ↓
Senha sai do painel
```

**Status:** `finalizado`
**Visível em:** Apenas histórico/relatórios

---

## 📡 Eventos do Sistema

| Evento | Origem | Destinos | Quando |
|--------|--------|----------|--------|
| `senha_emitida` | Terminal | Controlador, Admin | Senha criada |
| `senha_chamada` | Controlador | Painel Público, Admin | Funcionário chama |
| `senha_atendendo` | Controlador | Painel Público, Admin | Auto após 3s |
| `senha_finalizada` | Controlador | Todos | Atendimento completo |
| `senha_cancelada` | Controlador | Todos | Cliente ausente |
| `guiche_atualizado` | Gerenciamento | Todos | Guichê modificado |
| `config_atualizada` | Configuração | Todos | Configs alteradas |

---

## 🖥️ Páginas do Sistema

### 📺 **Painel Público** (`/painel-publico`)
- **Função:** Mostrar senhas chamadas
- **Eventos que escuta:** `senha_chamada`, `senha_finalizada`
- **Características:**
  - Tela cheia
  - Som + Voz
  - Atualização instantânea
  - Destaque para última chamada

### 🖥️ **Terminal de Senhas** (`/senha-terminal`)
- **Função:** Emitir senhas
- **Eventos que emite:** `senha_emitida`
- **Características:**
  - Lista de serviços
  - Impressão térmica
  - Público (não requer login)

### 🎮 **Controlador de Senhas** (Modal)
- **Função:** Chamar e gerenciar senhas
- **Eventos que escuta:** `senha_emitida`, `senha_chamada`, `senha_finalizada`
- **Eventos que emite:** `senha_chamada`, `senha_atendendo`, `senha_finalizada`
- **Características:**
  - Navegação P/C
  - Chamar manual
  - Finalizar atendimento

### 📊 **Painel Administrativo** (Modal)
- **Função:** Monitorar tudo
- **Eventos que escuta:** `*` (todos)
- **Características:**
  - Estatísticas
  - Relatórios
  - Exportação

---

## ⚙️ Configurações

### 🏢 **Gerenciamento de Guichês**
- Criar/editar guichês
- Atribuir funcionários
- Renumerar

### ⚙️ **Configuração de Senhas**
- Criar serviços (P/C)
- Definir cores
- Som/Voz

---

## 🔧 Tecnologias Usadas

- **BroadcastChannel API:** Comunicação entre abas
- **localStorage events:** Fallback para navegadores antigos
- **Web Speech API:** Anúncio por voz
- **React Hooks:** useEffect, useMemo
- **Singleton Pattern:** SenhaEventService

---

## ✅ Como Testar

1. Abra **3 abas**:
   - `http://localhost:5173/senha-terminal`
   - `http://localhost:5173/painel-publico`
   - `http://localhost:5173` (sistema principal)

2. No **Terminal**: Emita senha

3. No **Sistema**: Abra Controlador e chame senha

4. No **Painel Público**: Veja senha aparecer! 🎉

---

**IMPORTANTE:** O Painel Público SÓ mostra senhas **CHAMADAS**, não senhas aguardando!

