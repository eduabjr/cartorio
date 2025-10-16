@echo off
CHCP 65001 > NUL

echo.
echo ========================================
echo    TESTANDO MENUS DROPDOWN
echo ========================================
echo.

echo Navegando para a pasta frontend...
cd frontend

echo.
echo Verificando se node_modules existe...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
) else (
    echo Dependencias ja instaladas.
)

echo.
echo Iniciando servidor de desenvolvimento...
echo.
echo IMPORTANTE: 
echo 1. O servidor vai abrir em http://localhost:5173
echo 2. MENU SUPERIOR: Ícones (Início, Usuários, Documentos, etc.)
echo 3. MENU INFERIOR: Texto (Cadastros, Processos, Protocolos, etc.)
echo 4. Clique em "Cadastros" para testar o dropdown com permissões
echo 5. NOVO: "Cliente" foi alterado para "Firmas"
echo 6. NOVO: "Sair" foi removido do menu Cadastros
echo 7. NOVO: Itens administrativos aparecem apenas para ADMIN
echo 8. Teste com admin@cartorio.com e funcionario@cartorio.com
echo.
echo Pressione Ctrl+C para parar o servidor quando terminar de testar.
echo.

npm run dev

pause
