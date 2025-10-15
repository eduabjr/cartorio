@echo off
echo ========================================
echo   GERANDO EXECUTAVEL DO FRONTEND
echo ========================================
echo.

echo [1/4] Navegando para o diretorio do frontend...
cd /d "F:\cartorio\frontend"

echo [2/4] Instalando dependencias...
call npm install

echo [3/4] Construindo o frontend...
call npm run build

echo [4/4] Gerando executavel...
echo.
echo O executavel sera criado na pasta: dist-electron
echo Este processo pode demorar alguns minutos...
echo.
call npm run electron-dist

echo.
echo ========================================
echo   EXECUTAVEL GERADO COM SUCESSO!
echo ========================================
echo.
echo O arquivo executavel foi criado em:
echo F:\cartorio\frontend\dist-electron\
echo.
echo Procure por um arquivo .exe ou .msi
echo.

pause
