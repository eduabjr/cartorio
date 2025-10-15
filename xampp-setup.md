# Configuração do Projeto com XAMPP

## 1. Instalação do XAMPP

1. Baixe o XAMPP para Windows: https://www.apachefriends.org/download.html
2. Instale com as seguintes opções:
   - ✅ Apache
   - ✅ MySQL
   - ✅ PHP
   - ✅ phpMyAdmin

## 2. Configuração do Banco de Dados

### 2.1. Criar Banco de Dados
1. Abra o XAMPP Control Panel
2. Inicie o MySQL
3. Acesse phpMyAdmin: http://localhost/phpmyadmin
4. Crie os bancos de dados:
   ```sql
   CREATE DATABASE auth_db;
   CREATE DATABASE user_db;
   CREATE DATABASE cartorio_db;
   ```

### 2.2. Configurar Usuário do MySQL
```sql
CREATE USER 'cartorio_user'@'localhost' IDENTIFIED BY 'cartorio_password';
GRANT ALL PRIVILEGES ON *.* TO 'cartorio_user'@'localhost';
FLUSH PRIVILEGES;
```

## 3. Configuração dos Serviços Backend

### 3.1. Auth Service (.env)
```env
PORT=3001
DATABASE_URL="mysql://cartorio_user:cartorio_password@localhost:3306/auth_db"
JWT_SECRET="your_jwt_secret_here"
RABBITMQ_URL="amqp://localhost:5672"
REDIS_URL="redis://localhost:6379"
```

### 3.2. User Service (.env)
```env
PORT=3002
DATABASE_URL="mysql://cartorio_user:cartorio_password@localhost:3306/user_db"
JWT_SECRET="your_jwt_secret_here"
```

### 3.3. API Gateway (.env)
```env
PORT=3000
AUTH_SERVICE_URL="http://localhost:3001"
USER_SERVICE_URL="http://localhost:3002"
JWT_SECRET="your_jwt_secret_here"
```

## 4. Configuração do Frontend

### 4.1. Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_AUTH_URL=http://localhost:3001
VITE_USER_URL=http://localhost:3002
```

## 5. Executando com XAMPP

### 5.1. Iniciar XAMPP
1. Abra o XAMPP Control Panel
2. Inicie:
   - ✅ Apache (porta 80)
   - ✅ MySQL (porta 3306)

### 5.2. Executar Serviços Backend
```bash
# Terminal 1 - Auth Service
cd services/auth-service
npm install
npm run start:dev

# Terminal 2 - User Service
cd services/user-service
npm install
npm run start:dev

# Terminal 3 - API Gateway
cd services/api-gateway
npm install
npm run start:dev
```

### 5.3. Executar Frontend
```bash
# Terminal 4 - Frontend
cd frontend
npm install
npm run dev
```

## 6. Acessos

- **Frontend:** http://localhost:5173
- **API Gateway:** http://localhost:3000
- **Auth Service:** http://localhost:3001
- **User Service:** http://localhost:3002
- **phpMyAdmin:** http://localhost/phpmyadmin
- **Apache:** http://localhost

## 7. Vantagens do XAMPP

✅ **Fácil instalação** - Tudo em um pacote
✅ **Interface gráfica** - XAMPP Control Panel
✅ **phpMyAdmin** - Gerenciamento visual do banco
✅ **Apache** - Servidor web integrado
✅ **MySQL** - Banco de dados robusto
✅ **PHP** - Para futuras integrações

## 8. Alternativa: Usar Apache do XAMPP

Se quiser servir o frontend pelo Apache:

1. Build do frontend:
```bash
cd frontend
npm run build
```

2. Copiar arquivos para htdocs:
```bash
# Copiar conteúdo de frontend/dist/ para C:\xampp\htdocs\cartorio\
```

3. Acessar: http://localhost/cartorio/

## 9. Configuração de Virtual Host (Opcional)

Para usar domínio personalizado:

1. Editar `C:\xampp\apache\conf\extra\httpd-vhosts.conf`:
```apache
<VirtualHost *:80>
    DocumentRoot "C:/xampp/htdocs/cartorio"
    ServerName cartorio.local
    <Directory "C:/xampp/htdocs/cartorio">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

2. Editar `C:\Windows\System32\drivers\etc\hosts`:
```
127.0.0.1 cartorio.local
```

3. Acessar: http://cartorio.local
