param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ArgsFromUser
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$EnvFile = "C:\Users\DrYam\.secrets\destiny2\bungie.env"
$Script = Join-Path $ProjectRoot "scripts\sync_manifest.py"

if (-not (Test-Path -LiteralPath $EnvFile)) {
    throw "Env file not found: $EnvFile"
}

python $Script --env-file $EnvFile @ArgsFromUser
