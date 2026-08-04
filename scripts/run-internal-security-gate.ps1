[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Invoke-Checked {
    param(
        [Parameter(Mandatory)]
        [string]$Label,

        [Parameter(Mandatory)]
        [scriptblock]$Command
    )

    Write-Host "==> $Label"
    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "$Label failed with exit code $LASTEXITCODE."
    }
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw 'Git is required.'
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw 'npm is required.'
}

$repositoryRoot = (& git rev-parse --show-toplevel).Trim()
if ($LASTEXITCODE -ne 0 -or -not $repositoryRoot) {
    throw 'Run this script from inside the MyVault repository.'
}

$repositoryRoot = [System.IO.Path]::GetFullPath($repositoryRoot)
Set-Location -LiteralPath $repositoryRoot

$status = @(& git status --porcelain)
if ($LASTEXITCODE -ne 0) {
    throw 'Unable to inspect the Git worktree.'
}
if ($status.Count -ne 0) {
    throw 'The internal security gate requires a clean worktree.'
}

$cargoCommand = Get-Command cargo -ErrorAction SilentlyContinue
if ($cargoCommand) {
    $cargoPath = $cargoCommand.Source
} else {
    $profileCargo = Join-Path $env:USERPROFILE '.cargo\bin\cargo.exe'
    if (Test-Path -LiteralPath $profileCargo -PathType Leaf) {
        $cargoPath = $profileCargo
    } else {
        throw 'cargo is required.'
    }
}

Invoke-Checked -Label 'Git whitespace check' -Command { git diff --check HEAD^ HEAD }

$workflowProblems = @()
Get-ChildItem -LiteralPath '.github\workflows' -File | ForEach-Object {
    $workflowName = $_.Name
    $lineNumber = 0
    Get-Content -LiteralPath $_.FullName | ForEach-Object {
        $lineNumber += 1
        if ($_ -match '^\s*uses:\s*([^#\s]+)' -and $Matches[1] -notmatch '@[0-9a-f]{40}$') {
            $workflowProblems += "$workflowName`:$lineNumber $($Matches[1])"
        }
    }
}
if ($workflowProblems.Count -ne 0) {
    throw "Workflow Actions are not pinned:`n$($workflowProblems -join "`n")"
}

$trackedSymlinks = @(& git ls-files -s | Where-Object { $_ -match '^120000\s' })
if ($LASTEXITCODE -ne 0) {
    throw 'Unable to inspect tracked file modes.'
}
if ($trackedSymlinks.Count -ne 0) {
    throw "Tracked symlinks require manual review:`n$($trackedSymlinks -join "`n")"
}

Invoke-Checked -Label 'npm high-severity audit' -Command { npm audit --audit-level=high }
Invoke-Checked -Label 'Frontend lint' -Command { npm run lint }
Invoke-Checked -Label 'Frontend types' -Command { npm run typecheck }
Invoke-Checked -Label 'Frontend tests' -Command { npm test }
Invoke-Checked -Label 'Frontend build' -Command { npm run build }
Invoke-Checked -Label 'Rust formatting' -Command {
    & $cargoPath fmt --manifest-path src-tauri/Cargo.toml -- --check
}
Invoke-Checked -Label 'Rust lint' -Command {
    & $cargoPath clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
}
Invoke-Checked -Label 'Rust tests' -Command {
    & $cargoPath test --manifest-path src-tauri/Cargo.toml --lib
}

Write-Host 'Local internal security gate passed.'
Write-Host 'Remote CodeQL, Dependabot, secret scanning and target-specific CI still require review.'
