# 🧪 Como Testar a Comunicação Entre Páginas

## 🎯 Página de Diagnóstico

Acesse: **`http://localhost:3000/teste-comunicacao.html`**

Esta página permite testar a comunicação em tempo real entre todas as abas.

---

## 📋 Teste Passo a Passo

### **Passo 1: Abrir 4 Abas**

1. **Aba 1:** `http://localhost:3000/teste-comunicacao.html` (Diagnóstico)
2. **Aba 2:** `http://localhost:3000/senha-terminal` (Terminal)
3. **Aba 3:** `http://localhost:3000/senha-publica` (Painel Público)
4. **Aba 4:** `http://localhost:3000` (Sistema Principal - Login e Controlador)

### **Passo 2: Abrir Console (F12) em TODAS as abas**

Pressione **F12** em cada aba para ver os logs.

### **Passo 3: Testar Comunicação**

#### **Teste A: Via Página de Diagnóstico**

Na **Aba 1** (Diagnóstico):
1. Clique em "🎫 Emitir Senha Teste"
2. Veja nos consoles das **outras abas**:
   ```
   📨 BroadcastChannel recebeu: senha_emitida
   ou
   📨 localStorage recebeu: senha_emitida
   ```

#### **Teste B: Via Terminal Real**

Na **Aba 2** (Terminal):
1. Clique em "P - Preferencial" para emitir senha
2. Veja no console:
   ```
   📤 EMITINDO evento: senha_emitida de TerminalSenha
   ✅ Enviado via BroadcastChannel: senha_emitida
   ✅ Enviado via localStorage: senha_emitida
   ```

3. Nas **outras abas**, veja:
   ```
   📨 BroadcastChannel recebeu: senha_emitida
   🔔 Nova senha emitida - atualizando lista
   ```

#### **Teste C: Via Controlador**

Na **Aba 4** (Sistema):
1. Faça login
2. Abra "Controlador de Senhas"
3. Clique no botão 📞 para chamar senha
4. Veja no console:
   ```
   📤 EMITINDO evento: senha_chamada de Controlador
   ```

5. Na **Aba 3** (Painel Público), veja:
   ```
   📨 BroadcastChannel recebeu: senha_chamada
   🔔 Tela Pública - Senha chamada: P001
   ```

---

## ✅ Checklist de Funcionamento

Marque conforme testa:

- [ ] **Diagnóstico:** Vejo logs ao clicar nos botões
- [ ] **Terminal emite:** Console mostra "📤 EMITINDO evento: senha_emitida"
- [ ] **Controlador recebe:** Console mostra "📨 recebeu: senha_emitida"
- [ ] **Senha aparece no Controlador:** Lista atualiza
- [ ] **Controlador chama:** Console mostra "📤 EMITINDO evento: senha_chamada"
- [ ] **Painel recebe:** Console mostra "📨 recebeu: senha_chamada"
- [ ] **Senha aparece no Painel:** Destaque visual + voz

---

## 🐛 Problemas Comuns

### ❌ "BroadcastChannel não funciona"

**Solução:** Sistema usa **localStorage como backup**.
- Mesmo sem BroadcastChannel, deve funcionar via storage events
- Verifique se vê "📨 localStorage recebeu" nos logs

### ❌ "Nenhum evento aparece em outras abas"

**Causas possíveis:**
1. Abas em domínios diferentes (`localhost:3000` vs `localhost:5173`)
2. localStorage bloqueado pelo navegador
3. Console não aberto (F12)

**Solução:**
- Certifique-se que TODAS as abas estão em `http://localhost:3000`
- Abra F12 em TODAS as abas ANTES de testar

### ❌ "Senha emitida mas não aparece no Controlador"

**Verifique:**
1. Console do Terminal mostra "📤 EMITINDO"?
2. Console do Controlador mostra "📨 recebeu"?
3. Controlador está aberto?

### ❌ "Senha chamada mas não aparece no Painel"

**Lembre-se:**
- Painel Público só mostra senhas **CHAMADAS**
- Senhas "aguardando" NÃO aparecem
- Precisa chamar via Controlador primeiro

---

## 📊 Logs Esperados

### **Terminal de Senhas:**
```
✅ SenhaEventService inicializado com BroadcastChannel
🔄 Configurando fallback via localStorage
📤 EMITINDO evento: senha_emitida de TerminalSenha
✅ Enviado via BroadcastChannel: senha_emitida
✅ Enviado via localStorage: senha_emitida
🎫 Senha emitida: P001
```

### **Controlador:**
```
✅ SenhaEventService inicializado com BroadcastChannel
📨 BroadcastChannel recebeu: senha_emitida
🔔 Nova senha emitida - atualizando lista
```

### **Painel Público:**
```
✅ SenhaEventService inicializado com BroadcastChannel
📨 BroadcastChannel recebeu: senha_chamada
🔔 Tela Pública - Senha chamada: P001
```

---

## 🔧 Forçar Atualização

Se ainda não funciona:

1. **Limpar localStorage:**
   - F12 → Application → Local Storage → localhost:3000
   - Botão direito → Clear

2. **Recarregar todas as abas** (Ctrl+F5)

3. **Testar novamente**

---

## 📞 Suporte

Se após seguir todos os passos ainda não funcionar, cole os logs do console aqui:
- Terminal (F12)
- Controlador (F12)
- Painel Público (F12)

