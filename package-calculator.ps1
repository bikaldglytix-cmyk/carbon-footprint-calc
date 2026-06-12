# ──────────────────────────────────────────────────────────────
# Build the carbon calculator and zip it for STANDALONE upload.
#
#   Run:  npm run package      (or)      ./package-calculator.ps1
#
# Produces ./calculator.zip — upload it INTO public_html/ on the
# server and extract it THERE (it will extract the 'calculator' folder).
# ──────────────────────────────────────────────────────────────
$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$out  = Join-Path $root "calculator"
$zip  = Join-Path $root "calculator.zip"

# Build the static export (also restores excluded routes afterward).
& (Join-Path $root "build-static.ps1")
if (-not (Test-Path (Join-Path $out "index.html"))) { throw "build produced no calculator/index.html" }

if (Test-Path $zip) { Remove-Item $zip -Force }

Write-Host "==> Creating calculator.zip..." -ForegroundColor Cyan
Compress-Archive -Path $out -DestinationPath $zip -Force

$sizeMb = [math]::Round((Get-Item $zip).Length / 1MB, 2)
Write-Host ""
Write-Host "==> Done: calculator.zip ($sizeMb MB)" -ForegroundColor Green
Write-Host "    Upload it INTO public_html/ and Extract it there (it contains the calculator/ folder)." -ForegroundColor Green
