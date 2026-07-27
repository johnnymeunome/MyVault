param(
    [string]$FixtureRoot = (Join-Path $PSScriptRoot '..\src-tauri\tests\fixtures\kdbx')
)

$ErrorActionPreference = 'Stop'
$fixtureDirectory = [System.IO.Path]::GetFullPath($FixtureRoot)
$sourcePath = Join-Path $fixtureDirectory 'kdbx41-aes-aeskdf-password.kdbx'

if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
    throw "Source fixture not found: $sourcePath"
}

function Find-Kdbx4HeaderEnd([byte[]]$Bytes) {
    $offset = 12
    while ($offset + 5 -le $Bytes.Length) {
        $fieldType = $Bytes[$offset]
        $length = [BitConverter]::ToUInt32($Bytes, $offset + 1)
        $offset += 5 + $length
        if ($fieldType -eq 0) {
            return [int]$offset
        }
    }
    throw 'Could not locate the KDBX4 outer-header terminator.'
}

$source = [System.IO.File]::ReadAllBytes($sourcePath)
$headerEnd = Find-Kdbx4HeaderEnd $source

$badHeader = [byte[]]$source.Clone()
$badHeader[0] = $badHeader[0] -bxor 0xFF
[System.IO.File]::WriteAllBytes((Join-Path $fixtureDirectory 'corrupt-header.kdbx'), $badHeader)

$badBlockHmac = [byte[]]$source.Clone()
$firstBlockHmac = $headerEnd + 64
if ($firstBlockHmac -ge $badBlockHmac.Length) {
    throw 'Fixture does not contain a KDBX4 HMAC block stream.'
}
$badBlockHmac[$firstBlockHmac] = $badBlockHmac[$firstBlockHmac] -bxor 0x80
[System.IO.File]::WriteAllBytes((Join-Path $fixtureDirectory 'corrupt-hmac.kdbx'), $badBlockHmac)

$truncatedLength = [Math]::Max(12, $source.Length - 8)
$truncated = [byte[]]::new($truncatedLength)
[Array]::Copy($source, $truncated, $truncatedLength)
[System.IO.File]::WriteAllBytes((Join-Path $fixtureDirectory 'truncated.kdbx'), $truncated)

$unsupported = [byte[]]$source.Clone()
$unsupported[8] = 2
$unsupported[9] = 0
[System.IO.File]::WriteAllBytes((Join-Path $fixtureDirectory 'unsupported-version.kdbx'), $unsupported)

Write-Output "Generated four deterministic negative fixtures in $fixtureDirectory"
