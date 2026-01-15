
# 1. Clean Slate
Write-Host "Limpiando configuración anterior de Git..."
if (Test-Path .git) { Remove-Item -Path .git -Recurse -Force }
git init
git config http.postBuffer 524288000
git remote add origin https://github.com/abnerjhn/dashboard-seguridad.git

# 2. Push Core App (Lightweight)
Write-Host "--------------------------------------------------"
Write-Host "Fase 1: Subiendo Código Fuente (Src + Config)..."
Write-Host "--------------------------------------------------"

# Add everything EXCEPT large data files
git add .
git reset public/data/*_part*.csv

git commit -m "Core: Source code, configs, and small assets"
git branch -M main
git push -u origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al subir el código base. Verifique su conexión." -ForegroundColor Red
    exit
}

# 3. Push Data Chunks (One by One)
$files = Get-ChildItem "public/data" -Filter "*_part*.csv"

foreach ($file in $files) {
    Write-Host "--------------------------------------------------"
    Write-Host "Fase 2: Subiendo datos - $($file.Name)..."
    Write-Host "--------------------------------------------------"
    
    git add $file.FullName
    git commit -m "Data: $($file.Name)"
    git push origin main
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error subiendo $($file.Name). Reintentando..." -ForegroundColor Yellow
        git push origin main
    }
}

Write-Host "--------------------------------------------------"
Write-Host "¡Despliegue incremental completado!" -ForegroundColor Green
