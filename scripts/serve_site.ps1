param(
    [int]$Port = 8788
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$SiteRoot = Join-Path $ProjectRoot "site"

if (-not (Test-Path -LiteralPath $SiteRoot)) {
    throw "Site folder not found: $SiteRoot"
}

Write-Host "Serving D2 Monument Archive at http://127.0.0.1:$Port"
python -m http.server $Port --bind 127.0.0.1 --directory $SiteRoot
