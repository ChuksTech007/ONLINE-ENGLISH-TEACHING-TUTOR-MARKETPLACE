# Starts the MVP. Run from this folder in PowerShell.
# The project path contains "&", so npm scripts can break on Windows. This script calls Node directly.

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting Merit English API on http://localhost:4000"
Start-Process -FilePath "node" -ArgumentList ".\dist\src\main.js" -WorkingDirectory (Join-Path $root "backend")

Write-Host "Starting website on http://localhost:3000"
Start-Process -FilePath "node" -ArgumentList @(".\node_modules\next\dist\bin\next","dev","--port","3000") -WorkingDirectory (Join-Path $root "frontend")

Write-Host "Open http://localhost:3000"
Write-Host "Demo logins (Password123!): admin@merit.test / amara.okafor@merit.test / nina.chen@merit.test"
