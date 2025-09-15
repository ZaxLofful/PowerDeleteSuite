<#
Starts the local test harness server for PowerDeleteSuite.

Behavior:
 - If Node is found on PATH, runs `node .\test\server.js`.
 - Otherwise, if Python is found, runs `python -m http.server 8000` (serves repo root).
 - Otherwise, prints instructions to install Node or Python.

Run from the repository root in PowerShell / pwsh:
    .\test\run.ps1
#>

Push-Location $PSScriptRoot\..\

function Start-NodeServer {
    Write-Host "Starting Node test server (test/server.js)..." -ForegroundColor Cyan
    & node .\test\server.js
}

function Start-PythonServer {
    Write-Host "Node not found. Starting Python simple HTTP server on port 8000..." -ForegroundColor Yellow
    & python -m http.server 8000
}

$node = Get-Command node -ErrorAction SilentlyContinue
$python = Get-Command python -ErrorAction SilentlyContinue

if ($node) {
    Start-NodeServer
} elseif ($python) {
    Start-PythonServer
} else {
    Write-Host "Neither 'node' nor 'python' was found on PATH." -ForegroundColor Red
    Write-Host "Install Node.js (recommended) or Python, then run this script again." -ForegroundColor Red
    Write-Host "Manual alternative: open a terminal in the repo root and run:" -ForegroundColor Gray
    Write-Host "  node .\test\server.js    # requires Node.js" -ForegroundColor Gray
    Write-Host "  python -m http.server 8000  # fallback if you don't have Node" -ForegroundColor Gray
}

Pop-Location
