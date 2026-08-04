[CmdletBinding()]
param(
    [Parameter()]
    [ValidateNotNullOrEmpty()]
    [string]$Commit = 'HEAD',

    [Parameter()]
    [ValidateNotNullOrEmpty()]
    [string]$OutputDirectory = 'audit-artifacts'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Invoke-GitCapture {
    param(
        [Parameter(Mandatory)]
        [string]$RepositoryRoot,

        [Parameter(Mandatory)]
        [string[]]$Arguments
    )

    $output = & git -C $RepositoryRoot @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw 'Git command failed while building the audit bundle.'
    }

    return @($output)
}

function Write-Utf8Lf {
    param(
        [Parameter(Mandatory)]
        [string]$Path,

        [Parameter(Mandatory)]
        [AllowEmptyString()]
        [string]$Content
    )

    $normalized = $Content.Replace("`r`n", "`n").Replace("`r", "`n")
    [System.IO.File]::WriteAllText(
        $Path,
        $normalized,
        [System.Text.UTF8Encoding]::new($false)
    )
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw 'Git is required to build the audit bundle.'
}

$repositoryRoot = (& git rev-parse --show-toplevel).Trim()
if ($LASTEXITCODE -ne 0 -or -not $repositoryRoot) {
    throw 'Run this script from inside the MyVault repository.'
}

$repositoryRoot = [System.IO.Path]::GetFullPath($repositoryRoot)
$commitExpression = "${Commit}^{commit}"
$resolvedCommit = (Invoke-GitCapture -RepositoryRoot $repositoryRoot -Arguments @(
        'rev-parse',
        '--verify',
        $commitExpression
    ) | Select-Object -First 1).Trim()

if ($resolvedCommit -notmatch '^[0-9a-f]{40}$') {
    throw 'The requested commit did not resolve to a full Git object ID.'
}

$shortCommit = $resolvedCommit.Substring(0, 12)
$treeHash = (Invoke-GitCapture -RepositoryRoot $repositoryRoot -Arguments @(
        'show',
        '-s',
        '--format=%T',
        $resolvedCommit
    ) | Select-Object -First 1).Trim()
$commitTimestamp = (Invoke-GitCapture -RepositoryRoot $repositoryRoot -Arguments @(
        'show',
        '-s',
        '--format=%cI',
        $resolvedCommit
    ) | Select-Object -First 1).Trim()

$outputRootCandidate = if ([System.IO.Path]::IsPathRooted($OutputDirectory)) {
    $OutputDirectory
} else {
    Join-Path $repositoryRoot $OutputDirectory
}
$outputRoot = [System.IO.Path]::GetFullPath($outputRootCandidate)
$bundleDirectory = Join-Path $outputRoot "myvault-audit-$shortCommit"

if (Test-Path -LiteralPath $outputRoot) {
    if (-not (Get-Item -LiteralPath $outputRoot).PSIsContainer) {
        throw 'The output path exists and is not a directory.'
    }
} else {
    [void](New-Item -ItemType Directory -Path $outputRoot)
}

if (Test-Path -LiteralPath $bundleDirectory) {
    throw "Audit bundle already exists for $shortCommit; choose an empty output directory."
}

[void](New-Item -ItemType Directory -Path $bundleDirectory)
$incompleteMarker = Join-Path $bundleDirectory 'INCOMPLETE.txt'
Write-Utf8Lf -Path $incompleteMarker -Content "Bundle generation did not finish.`n"

$sourceArchiveName = "myvault-source-$shortCommit.tar"
$sourceArchivePath = Join-Path $bundleDirectory $sourceArchiveName
$treePath = Join-Path $bundleDirectory 'SOURCE-TREE.txt'
$metadataPath = Join-Path $bundleDirectory 'BUNDLE-METADATA.json'
$checksumsPath = Join-Path $bundleDirectory 'BUNDLE-SHA256SUMS.txt'

& git -C $repositoryRoot archive --format=tar --output=$sourceArchivePath $resolvedCommit
if ($LASTEXITCODE -ne 0) {
    throw 'Git could not create the source archive. The partial bundle was preserved.'
}

$treeLines = Invoke-GitCapture -RepositoryRoot $repositoryRoot -Arguments @(
    'ls-tree',
    '-r',
    '--full-tree',
    $resolvedCommit
)
Write-Utf8Lf -Path $treePath -Content (($treeLines -join "`n") + "`n")

$archiveSha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $sourceArchivePath).Hash.ToLowerInvariant()
$metadata = [ordered]@{
    schemaVersion       = 1
    project             = 'MyVault'
    repository          = 'https://github.com/johnnymeunome/MyVault'
    commit              = $resolvedCommit
    tree                = $treeHash
    commitTimestamp     = $commitTimestamp
    sourceArchive       = $sourceArchiveName
    sourceArchiveSha256 = $archiveSha256
    auditPlan           = 'docs/AUDIT-PLAN.md'
    scopeTemplate       = 'docs/audit/SCOPE-TEMPLATE.md'
    realCredentialsUsed = $false
}
$metadataJson = ($metadata | ConvertTo-Json -Depth 3).Replace("`r`n", "`n") + "`n"
Write-Utf8Lf -Path $metadataPath -Content $metadataJson

$filesToHash = @(
    'BUNDLE-METADATA.json',
    'SOURCE-TREE.txt',
    $sourceArchiveName
)
$checksumLines = foreach ($name in $filesToHash) {
    $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $bundleDirectory $name)).Hash.ToLowerInvariant()
    "$hash  $name"
}
Write-Utf8Lf -Path $checksumsPath -Content (($checksumLines -join "`n") + "`n")

Remove-Item -LiteralPath $incompleteMarker
Write-Output $bundleDirectory
