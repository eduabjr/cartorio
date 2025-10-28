# Script para Parar Todos os Services Node.js

Write-Host ""
Write-Host "Parando todos os services Node.js..." -ForegroundColor Yellow

# Parar todos os processos node.exe
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "OK - Todos os services foram parados" -ForegroundColor Green
Write-Host ""

