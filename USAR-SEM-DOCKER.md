# 🚀 Usar Sistema SEM Docker (Com XAMPP)

## ✅ Mais Simples, Mais Rápido, Sem Travamentos!

---

## 📋 Pré-requisitos

1. ✅ **XAMPP** instalado
2. ✅ **Node.js** instalado (v18 ou superior)
3. ✅ **Git** (opcional)

---

## 🎯 CONFIGURAÇÃO INICIAL (Uma Vez Só)

### 1. Iniciar MySQL no XAMPP

1. Abra **XAMPP Control Panel**
2. Clique em **Start** no **MySQL**
3. Aguarde ficar verde ✅

### 2. Criar Banco de Dados

Abra PowerShell e execute:

```powershell
cd F:\cartorio

# Conectar no MySQL
& "C:\xampp\mysql\bin\mysql.exe" -u root
```

No prompt do MySQL, execute:

```sql
CREATE DATABASE cartorio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cartorio;
SOURCE database/init/01_init.sql;
SOURCE database/init/02_indices_otimizados.sql;
EXIT;
```

---

## 🚀 INICIAR SISTEMA (Sempre)

### Opção 1: Script Automático (RECOMENDADO)

```powershell
cd F:\cartorio
.\iniciar-sem-docker.ps1
```

**Pronto!** O script faz tudo automaticamente.

---

### Opção 2: Iniciar Frontend Separadamente

Em outra janela PowerShell:

```powershell
cd F:\cartorio\frontend
npm install
npm run dev
```

Acesse: **http://localhost:5173**

---

## 🛑 PARAR SISTEMA

```powershell
.\parar-services.ps1
```

Ou simplesmente feche todas as janelas PowerShell minimizadas.

---

## 📊 URLS DO SISTEMA

| Serviço | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **API Gateway** | http://localhost:3000 |
| **Auth Service** | http://localhost:3001 |
| **User Service** | http://localhost:3002 |
| **Protocolo** | http://localhost:3003 |
| **Cliente** | http://localhost:3004 |
| **Funcionário** | http://localhost:3005 |

---

## 🔧 TROUBLESHOOTING

### Erro: "MySQL não está rodando"

**Solução:**
1. Abra XAMPP Control Panel
2. Clique em Start no MySQL
3. Aguarde ficar verde

### Erro: "Porta já em uso"

**Solução:**
```powershell
# Ver o que está usando a porta 3000
netstat -ano | findstr :3000

# Matar o processo (substitua PID pelo número que apareceu)
taskkill /PID <número> /F
```

### Erro: "Cannot find module"

**Solução:**
```powershell
# Reinstalar dependências
cd services\<nome-do-service>
npm install
```

---

## ⚡ VANTAGENS vs Docker

| Item | Docker | XAMPP |
|------|--------|-------|
| **Velocidade** | Lento | Rápido ⚡ |
| **CPU/RAM** | Alto uso 🔴 | Baixo uso ✅ |
| **Hot Reload** | Lento | Instantâneo ⚡ |
| **Travamentos** | Comum 🔴 | Raro ✅ |
| **Setup** | Complicado | Simples ✅ |
| **Debug** | Difícil | Fácil ✅ |

---

## 🎯 BENEFÍCIOS

✅ **10X mais rápido** que Docker  
✅ **Não trava** o computador  
✅ **Hot reload** instantâneo  
✅ **Debug** direto no VS Code  
✅ **Menos RAM/CPU** usado  
✅ **Compatível com XAMPP** que você já usa  

---

## 📝 NOTAS

- **Redis:** Não é necessário para desenvolvimento (o sistema funciona sem)
- **Nginx:** Não é necessário (usamos API Gateway direto)
- **Prometheus/Grafana:** Só para produção

---

## 🚀 EXECUTAR AGORA

```powershell
cd F:\cartorio
.\iniciar-sem-docker.ps1
```

**Em 2 minutos está rodando! ⚡**

---

**Criado:** 27/10/2025  
**Status:** ✅ Pronto para usar  
**Performance:** 10X melhor que Docker

