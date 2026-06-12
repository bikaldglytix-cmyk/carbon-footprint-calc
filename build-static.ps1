# ──────────────────────────────────────────────────────────────
# Build the carbon calculator as a STATIC export for hosting under
# /calculator inside another site's public_html.
#
# The build runs from a temporary copy of the source that omits the server-only
# routes (/api, /admin, /extract) — they need a Node server and aren't part of
# the public calculator. This works even while `npm run dev` is running and
# never modifies your source tree. node_modules is reused via a junction.
#
# Output: ./calculator  (the zip will contain this folder)
# ──────────────────────────────────────────────────────────────
$ErrorActionPreference = "Stop"

$root  = $PSScriptRoot
$stage = Join-Path $root ".static-build"
$out   = Join-Path $root "calculator"

if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
if (Test-Path $out)   { Remove-Item $out -Recurse -Force }
New-Item -ItemType Directory -Path $stage | Out-Null

Write-Host "==> Staging calculator source (excluding server-only routes)..." -ForegroundColor Cyan
$excludeDirs = @(
    (Join-Path $root "node_modules"),
    (Join-Path $root ".next"),
    (Join-Path $root ".git"),
    (Join-Path $root "out"),
    (Join-Path $root "calculator"),
    $stage,
    (Join-Path $root "src\app\api"),
    (Join-Path $root "src\app\admin"),
    (Join-Path $root "src\app\extract"),
    (Join-Path $root "src\app\verify")
)
robocopy $root $stage /E /NFL /NDL /NJH /NJS /NP /XD $excludeDirs | Out-Null
# robocopy exit codes < 8 indicate success (1 = files copied, etc.)
if ($LASTEXITCODE -ge 8) { throw "robocopy failed (exit $LASTEXITCODE)" }

# Reuse the existing dependencies (no reinstall) via a directory junction.
New-Item -ItemType Junction -Path (Join-Path $stage "node_modules") -Target (Join-Path $root "node_modules") | Out-Null

Push-Location $stage
try {
    $env:BUILD_STATIC = "true"
    $env:NEXT_PUBLIC_BASE_PATH = "/calculator"
    # Bundling @react-pdf/renderer (used for the in-browser admin report/cert
    # PDFs) pushes webpack/minify past the default ~2GB heap, so give Node more.
    $env:NODE_OPTIONS = "--max-old-space-size=4096"
    Write-Host "==> Building calculator (static export, basePath=/calculator)..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "calculator 'next build' failed (exit $LASTEXITCODE)" }
}
finally {
    Remove-Item Env:\BUILD_STATIC -ErrorAction SilentlyContinue
    Remove-Item Env:\NEXT_PUBLIC_BASE_PATH -ErrorAction SilentlyContinue
    Remove-Item Env:\NODE_OPTIONS -ErrorAction SilentlyContinue
    Pop-Location
}

if (-not (Test-Path (Join-Path $stage "out"))) { throw "static export produced no ./out" }
Move-Item (Join-Path $stage "out") $out

# Remove the node_modules junction explicitly first, so cleanup can never follow
# the link into (and delete) the real node_modules on older PowerShell versions.
$nmJunction = Join-Path $stage "node_modules"
if (Test-Path $nmJunction) { cmd /c rmdir "$nmJunction" | Out-Null }
Remove-Item $stage -Recurse -Force

Write-Host "==> Calculator built to $out" -ForegroundColor Green
