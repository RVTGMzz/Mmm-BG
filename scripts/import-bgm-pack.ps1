param(
  [string]$BundlePath = ".\MeMeMe_Audio_Pack_0.1.16.2.zip"
)

$ErrorActionPreference = "Stop"

$expectedBundleSha = "be197ee02d1cfcbed458e3ea6e002f6293dc3062a98a44fba315d629f3886744"
$expectedTracks = @(
  @{ File = "01_Menu_MeMeMe_LOOP.ogg"; Sha = "df2a94fcd34c016ada23481c8f027d8088b608e1d9ebd46dcd2b5986fe41e36e" },
  @{ File = "02_City_Bubble_LOOP.ogg"; Sha = "c7b94b5bc698d1a86f1ffb4ba3504841167700734dcdb1d346be9fa0a352b6e5" },
  @{ File = "03_City_Silly_LOOP_EXTENDED.ogg"; Sha = "53c00c6d5a5d199555522e99f1ba17f6e978c092b3ea9988734e35b3f52a1b0d" },
  @{ File = "04_Final_Round_LOOP.ogg"; Sha = "3e11e5292d38485d8e8c299a54c3582a2b3c6f11b622edc15af3cd66d26e4e83" }
)

if (-not (Test-Path -LiteralPath $BundlePath)) {
  throw "BGM bundle not found: $BundlePath"
}

$bundleSha = (Get-FileHash -LiteralPath $BundlePath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($bundleSha -ne $expectedBundleSha) {
  throw "BGM bundle checksum mismatch. Expected $expectedBundleSha but got $bundleSha"
}

$tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("mememe-bgm-" + [System.Guid]::NewGuid().ToString("N"))
$targetDir = Join-Path (Get-Location) "public\audio\bgm"

try {
  New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
  Expand-Archive -LiteralPath $BundlePath -DestinationPath $tempDir -Force
  New-Item -ItemType Directory -Path $targetDir -Force | Out-Null

  foreach ($track in $expectedTracks) {
    $match = Get-ChildItem -LiteralPath $tempDir -Recurse -File | Where-Object { $_.Name -eq $track.File } | Select-Object -First 1
    if (-not $match) {
      throw "Missing expected track in bundle: $($track.File)"
    }

    $trackSha = (Get-FileHash -LiteralPath $match.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($trackSha -ne $track.Sha) {
      throw "Track checksum mismatch for $($track.File). Expected $($track.Sha) but got $trackSha"
    }

    Copy-Item -LiteralPath $match.FullName -Destination (Join-Path $targetDir $track.File) -Force
    Write-Host "[BGM] verified + imported $($track.File)"
  }

  Write-Host "[BGM] PASS bundle=$expectedBundleSha"
  Write-Host "[BGM] Runtime assets copied to public/audio/bgm"
}
finally {
  if (Test-Path -LiteralPath $tempDir) {
    Remove-Item -LiteralPath $tempDir -Recurse -Force
  }
}
