# 🧪 Teste de Comunicação em Tempo Real

## 📋 Passo a Passo para Testar

### 1. Abrir Terminal de Senhas
- Faça login no sistema
- Menu → 🖥️ Terminal de Senhas
- Uma nova aba abre em: `http://localhost:5173/senha-terminal`

### 2. Abrir Painel Público
- Menu → 📺 Painel Público  
- Uma nova aba abre em: `http://localhost:5173/painel-publico`

### 3. Abrir Controlador de Senhas
- Menu → Controlador de Senhas
- Janela modal abre no sistema

### 4. Emitir Senha
- No **Terminal de Senhas**:
  - Clique em "P - Preferencial" ou "C - Comum"
  - Senha será impressa
  
### 5. Verificar Comunicação

✅ **O que deve acontecer:**

| Onde | O que ver |
|------|-----------|
| Terminal | Senha emitida com sucesso |
| Painel Público | Senha NÃO aparece ainda (só quando chamada) |
| Controlador | Senha aparece na lista de aguardando |

### 6. Chamar Senha
- No **Controlador de Senhas**:
  - Use botões ◀ ▶ para navegar
  - Clique no botão 📞 verde para chamar

✅ **O que deve acontecer:**

| Onde | O que ver |
|------|-----------|
| Controlador | Senha muda para "Chamando" depois "Atendendo" |
| Painel Público | 📢 SENHA APARECE COM DESTAQUE + VOZ |
| Console (F12) | Logs `🔔 Senha chamada` |

---

## 🔍 Verificar no Console (F12)

### Terminal de Senhas:
```
✅ SenhaEventService inicializado
🎫 Senha emitida: P001
```

### Controlador:
```
✅ SenhaEventService inicializado
🔔 Nova senha emitida - atualizando lista
🔔 Senha chamada - atualizando lista
```

### Painel Público:
```
✅ SenhaEventService inicializado
🔔 Painel Público - Senha chamada: P001
```

---

## 🐛 Troubleshooting

### Senha não aparece no Controlador após emitir
**Possível causa:** Eventos não estão sendo transmitidos
**Solução:**
1. Abra o Console (F12) em TODAS as abas
2. Verifique se vê `✅ SenhaEventService inicializado`
3. No Terminal, emita senha e veja se aparece `🎫 Senha emitida`
4. No Controlador, veja se aparece `🔔 Nova senha emitida`

### Senha não aparece no Painel Público
**Possível causa:** Senha não foi chamada ainda
**Lembre-se:** 
- Painel Público só mostra senhas **CHAMADAS**
- Senhas aguardando não aparecem no painel
- Use o Controlador para chamar a senha

### BroadcastChannel não funciona
**Possível causa:** Navegador muito antigo
**Solução:** Sistema usa fallback automático via localStorage

---

## 📱 URLs Diretas

- Terminal: http://localhost:5173/senha-terminal
- Painel Público: http://localhost:5173/painel-publico
- Sistema: http://localhost:5173/

---

## ✅ Checklist de Funcionamento

- [ ] Terminal emite senha
- [ ] Console mostra "Senha emitida"
- [ ] Controlador recebe evento
- [ ] Senha aparece na lista do Controlador
- [ ] Controlador pode chamar senha
- [ ] Painel Público recebe evento de chamada
- [ ] Senha aparece destacada no Painel
- [ ] Sistema toca voz/som
- [ ] Finalizar remove do painel

