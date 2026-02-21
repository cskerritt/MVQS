param(
  [Parameter(Mandatory = $true)]
  [Alias('front-end-paths')]
  [string[]]$FrontEndPaths,

  [Parameter(Mandatory = $true)]
  [Alias('registry-json')]
  [string]$RegistryJson,

  [Parameter(Mandatory = $false)]
  [Alias('out-dir')]
  [string]$OutDir = "output/analysis/parity",

  [Parameter(Mandatory = $false)]
  [Alias('snapshot-id')]
  [string]$SnapshotId,

  [Parameter(Mandatory = $false)]
  [Alias('module-entrypoints-json')]
  [string]$ModuleEntrypointsJson,

  [switch]$FailOnErrors = $true
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function New-TimestampId {
  return [DateTime]::UtcNow.ToString("yyyyMMddTHHmmssZ")
}

function New-IsoUtc {
  return [DateTime]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
}

function Resolve-InputPath {
  param(
    [Parameter(Mandatory = $true)]
    [string]$PathValue
  )

  if ([string]::IsNullOrWhiteSpace($PathValue)) {
    throw "Path value cannot be empty."
  }

  if (Test-Path -LiteralPath $PathValue) {
    return (Resolve-Path -LiteralPath $PathValue).Path
  }

  $cwd = (Resolve-Path -LiteralPath ".").Path
  $home = [Environment]::GetFolderPath("UserProfile")
  $name = [System.IO.Path]::GetFileName($PathValue)

  $searchRoots = @(
    $cwd,
    (Join-Path $cwd "MVQS_Database 2"),
    (Join-Path (Split-Path $cwd -Parent) "MVQS_Database 2"),
    (Join-Path $home "Downloads"),
    (Join-Path $home "Downloads\\MVQS"),
    (Join-Path $home "Downloads\\MVQS_Database 2"),
    (Join-Path $home "Downloads\\MVQS\\MVQS_Database 2")
  )

  foreach ($root in $searchRoots) {
    $candidateA = Join-Path $root $PathValue
    if (Test-Path -LiteralPath $candidateA) {
      return (Resolve-Path -LiteralPath $candidateA).Path
    }

    $candidateB = Join-Path $root $name
    if (Test-Path -LiteralPath $candidateB) {
      return (Resolve-Path -LiteralPath $candidateB).Path
    }
  }

  throw "Path not found: $PathValue"
}

function Get-DeterministicParameterValue {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [Parameter(Mandatory = $false)]
    [object]$TypeCode
  )

  $lower = $Name.ToLowerInvariant()

  if ($lower -match "date|dt|from|to") { return [DateTime]::Parse("2000-01-01") }
  if ($lower -match "id|count|num|year|month|day") { return 1 }
  if ($lower -match "state|county") { return 1 }
  if ($lower -match "flag|is_|has_|active") { return $false }

  if ($null -ne $TypeCode) {
    switch ([int]$TypeCode) {
      1 { return $false } # dbBoolean
      2 { return 1 } # dbByte
      3 { return 1 } # dbInteger
      4 { return 1 } # dbLong
      5 { return 1.0 } # dbCurrency
      6 { return 1.0 } # dbSingle
      7 { return 1.0 } # dbDouble
      8 { return [DateTime]::Parse("2000-01-01") } # dbDate
      10 { return "X" } # dbText
      12 { return "X" } # dbMemo
      default { return "X" }
    }
  }

  return "X"
}

function Load-ModuleEntrypoints {
  param(
    [Parameter(Mandatory = $false)]
    [string]$Path
  )

  if ([string]::IsNullOrWhiteSpace($Path)) {
    return @{}
  }

  if (-not (Test-Path -LiteralPath $Path)) {
    throw "Module entrypoints file not found: $Path"
  }

  $raw = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
  $json = $raw | ConvertFrom-Json -Depth 64
  $map = @{}
  if ($null -ne $json.modules) {
    foreach ($prop in $json.modules.PSObject.Properties) {
      $moduleName = [string]$prop.Name
      $entryList = @()
      if ($prop.Value -is [string]) {
        $entryList = @([string]$prop.Value)
      } elseif ($prop.Value -is [System.Collections.IEnumerable]) {
        foreach ($v in $prop.Value) {
          if ($null -ne $v -and -not [string]::IsNullOrWhiteSpace([string]$v)) {
            $entryList += [string]$v
          }
        }
      }
      $map[$moduleName] = $entryList
    }
  }
  return $map
}

function Invoke-QueryDef {
  param(
    [Parameter(Mandatory = $true)]
    [object]$Database,
    [Parameter(Mandatory = $true)]
    [string]$QueryName
  )

  $result = [ordered]@{
    query_name = $QueryName
    status = "PASS"
    query_type = $null
    row_count = $null
    affected_rows = $null
    error = $null
    parameter_bindings = @()
  }

  try {
    $queryDef = $Database.QueryDefs.Item($QueryName)

    foreach ($param in @($queryDef.Parameters)) {
      $pname = [string]$param.Name
      $ptype = $null
      try { $ptype = $param.Type } catch { $ptype = $null }
      $value = Get-DeterministicParameterValue -Name $pname -TypeCode $ptype
      try {
        $param.Value = $value
        $result.parameter_bindings += [ordered]@{ name = $pname; value = [string]$value }
      } catch {
        $result.parameter_bindings += [ordered]@{ name = $pname; value = "<bind-failed>" }
      }
    }

    $sql = ""
    try { $sql = [string]$queryDef.SQL } catch { $sql = "" }

    if ($sql -match "(?is)^\s*(SELECT|TRANSFORM)") {
      $result.query_type = "select"
      $recordset = $queryDef.OpenRecordset()
      try {
        if (-not ($recordset.BOF -and $recordset.EOF)) {
          $recordset.MoveLast()
          $result.row_count = [int]$recordset.RecordCount
        } else {
          $result.row_count = 0
        }
      } finally {
        $recordset.Close()
      }
    } else {
      $result.query_type = "action"
      $queryDef.Execute(128)
      $result.affected_rows = [int]$Database.RecordsAffected
    }
  } catch {
    $result.status = "FAIL"
    $result.error = $_.Exception.Message
  }

  return $result
}

function Invoke-ReportRender {
  param(
    [Parameter(Mandatory = $true)]
    [object]$AccessApp,
    [Parameter(Mandatory = $true)]
    [string]$ReportName
  )

  $row = [ordered]@{
    report_name = $ReportName
    status = "PASS"
    error = $null
  }

  try {
    $AccessApp.DoCmd.OpenReport($ReportName, 2)
    $AccessApp.DoCmd.Close(3, $ReportName)
  } catch {
    $row.status = "FAIL"
    $row.error = $_.Exception.Message
  }

  return $row
}

function Invoke-ModuleEntrypointEvidence {
  param(
    [Parameter(Mandatory = $true)]
    [object]$AccessApp,
    [Parameter(Mandatory = $true)]
    [string]$ModuleName,
    [Parameter(Mandatory = $true)]
    [hashtable]$EntrypointMap
  )

  $rows = @()

  $candidates = @()
  if ($EntrypointMap.ContainsKey($ModuleName)) {
    $candidates += @($EntrypointMap[$ModuleName])
  }

  $candidates += @(
    "$ModuleName.Main",
    "$ModuleName.AutoExec",
    "$ModuleName.Init",
    "$ModuleName.Initialize",
    "Main",
    "AutoExec"
  )

  $seen = @{}
  $orderedCandidates = @()
  foreach ($candidate in $candidates) {
    if ([string]::IsNullOrWhiteSpace($candidate)) { continue }
    if ($seen.ContainsKey($candidate)) { continue }
    $seen[$candidate] = $true
    $orderedCandidates += $candidate
  }

  foreach ($procedure in $orderedCandidates) {
    $attempt = [ordered]@{
      module_name = $ModuleName
      procedure = $procedure
      status = "PASS"
      error = $null
    }

    try {
      $null = $AccessApp.Run($procedure)
    } catch {
      $attempt.status = "FAIL"
      $attempt.error = $_.Exception.Message
    }

    $rows += $attempt

    if ($attempt.status -eq "PASS") {
      break
    }
  }

  if ($rows.Count -eq 0) {
    $rows += [ordered]@{
      module_name = $ModuleName
      procedure = "<none>"
      status = "FAIL"
      error = "No entrypoint candidates available"
    }
  }

  return $rows
}

function Build-MarkdownReport {
  param(
    [Parameter(Mandatory = $true)]
    [hashtable]$Payload
  )

  $lines = @()
  $lines += "# Access Parity Execution"
  $lines += ""
  $lines += "- Generated UTC: $($Payload.generated_at_utc)"
  $lines += "- Snapshot ID: $($Payload.snapshot_id)"
  $lines += ""
  $lines += "## Gate Summary"
  $lines += ""
  $lines += "- query_execution_failures: $($Payload.summary.query_execution_failures)"
  $lines += "- report_execution_failures: $($Payload.summary.report_execution_failures)"
  $lines += "- module_compile_failures: $($Payload.summary.module_compile_failures)"
  $lines += "- module_uninvoked_count: $($Payload.summary.module_uninvoked_count)"
  $lines += ""
  $lines += "## Front-End Results"

  foreach ($frontend in $Payload.front_ends) {
    $lines += ""
    $lines += "### $($frontend.front_end_path)"
    $lines += "- compile_status: $($frontend.compile.status)"
    $lines += "- query_failures: $($frontend.summary.query_failures)"
    $lines += "- report_failures: $($frontend.summary.report_failures)"
    $lines += "- module_uninvoked: $($frontend.summary.module_uninvoked)"
  }

  return ($lines -join "`n") + "`n"
}

if (-not $IsWindows) {
  throw "Windows host is required for Access COM runtime execution."
}

$RegistryJson = Resolve-InputPath -PathValue $RegistryJson

$registry = (Get-Content -LiteralPath $RegistryJson -Raw -Encoding UTF8) | ConvertFrom-Json -Depth 100
$moduleEntrypoints = Load-ModuleEntrypoints -Path $ModuleEntrypointsJson

$canonicalQueries = @($registry.queries.canonical_names)
$reportNames = @($registry.objects.reports | ForEach-Object { $_.name })
$moduleNames = @($registry.objects.modules | ForEach-Object { $_.name })

if ([string]::IsNullOrWhiteSpace($SnapshotId)) {
  if ($null -ne $registry.snapshot_id -and -not [string]::IsNullOrWhiteSpace([string]$registry.snapshot_id)) {
    $SnapshotId = [string]$registry.snapshot_id
  } else {
    $SnapshotId = New-TimestampId
  }
}

$resolvedOutDir = (Resolve-Path -LiteralPath ".").Path
$resolvedOutDir = [System.IO.Path]::GetFullPath((Join-Path $resolvedOutDir $OutDir))
New-Item -ItemType Directory -Path $resolvedOutDir -Force | Out-Null

$access = $null
$frontEndResults = @()

try {
  $access = New-Object -ComObject Access.Application
  $access.Visible = $false
  $access.UserControl = $false

  foreach ($frontEndPathRaw in $FrontEndPaths) {
    $frontEndPath = [System.IO.Path]::GetFullPath($frontEndPathRaw)
    $frontEndPath = Resolve-InputPath -PathValue $frontEndPath

    $frontResult = [ordered]@{
      front_end_path = $frontEndPath
      compile = [ordered]@{ status = "PASS"; error = $null }
      queries = @()
      reports = @()
      module_entrypoints = @()
      summary = [ordered]@{
        query_failures = 0
        report_failures = 0
        module_uninvoked = 0
      }
    }

    try {
      $access.OpenCurrentDatabase($frontEndPath, $true)

      try {
        $access.DoCmd.RunCommand(125)
      } catch {
        $frontResult.compile.status = "FAIL"
        $frontResult.compile.error = $_.Exception.Message
      }

      $database = $access.DBEngine.Workspaces(0).Databases(0)

      foreach ($q in $canonicalQueries) {
        $qResult = Invoke-QueryDef -Database $database -QueryName ([string]$q)
        $frontResult.queries += $qResult
      }

      foreach ($report in $reportNames) {
        $reportResult = Invoke-ReportRender -AccessApp $access -ReportName ([string]$report)
        $frontResult.reports += $reportResult
      }

      foreach ($module in $moduleNames) {
        $attempts = Invoke-ModuleEntrypointEvidence -AccessApp $access -ModuleName ([string]$module) -EntrypointMap $moduleEntrypoints
        foreach ($attempt in $attempts) {
          $frontResult.module_entrypoints += $attempt
        }
      }

      $frontResult.summary.query_failures = @($frontResult.queries | Where-Object { $_.status -ne "PASS" }).Count
      $frontResult.summary.report_failures = @($frontResult.reports | Where-Object { $_.status -ne "PASS" }).Count

      $invokedModules = @{}
      foreach ($attempt in $frontResult.module_entrypoints) {
        if ($attempt.status -eq "PASS") {
          $invokedModules[[string]$attempt.module_name] = $true
        }
      }
      $frontResult.summary.module_uninvoked = @($moduleNames | Where-Object { -not $invokedModules.ContainsKey([string]$_) }).Count
    }
    finally {
      try { $access.CloseCurrentDatabase() } catch { }
    }

    $frontEndResults += $frontResult
  }
}
finally {
  if ($null -ne $access) {
    try { $access.Quit() } catch { }
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($access) | Out-Null
  }
  [gc]::Collect()
  [gc]::WaitForPendingFinalizers()
}

$queryFailures = 0
$reportFailures = 0
$compileFailures = 0
$moduleUninvoked = 0

foreach ($front in $frontEndResults) {
  $queryFailures += [int]$front.summary.query_failures
  $reportFailures += [int]$front.summary.report_failures
  if ($front.compile.status -ne "PASS") {
    $compileFailures += 1
  }
  $moduleUninvoked += [int]$front.summary.module_uninvoked
}

$payload = [ordered]@{
  generated_at_utc = New-IsoUtc
  snapshot_id = $SnapshotId
  inputs = [ordered]@{
    front_end_paths = @($FrontEndPaths)
    registry_json = $RegistryJson
    module_entrypoints_json = $ModuleEntrypointsJson
  }
  summary = [ordered]@{
    query_execution_failures = $queryFailures
    report_execution_failures = $reportFailures
    module_compile_failures = $compileFailures
    module_uninvoked_count = $moduleUninvoked
  }
  front_ends = $frontEndResults
  gate = [ordered]@{
    query_execution_pass = ($queryFailures -eq 0)
    report_execution_pass = ($reportFailures -eq 0)
    module_compile_pass = ($compileFailures -eq 0)
    module_invocation_pass = ($moduleUninvoked -eq 0)
  }
}

$jsonPath = Join-Path $resolvedOutDir ("access_execution_{0}.json" -f $SnapshotId)
$mdPath = Join-Path $resolvedOutDir ("access_execution_{0}.md" -f $SnapshotId)

$payload | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath $jsonPath -Encoding UTF8
Build-MarkdownReport -Payload $payload | Set-Content -LiteralPath $mdPath -Encoding UTF8

Write-Output "Wrote Access execution JSON: $jsonPath"
Write-Output "Wrote Access execution Markdown: $mdPath"
Write-Output ($payload.summary | ConvertTo-Json -Depth 10)

$hasFailures =
  ($queryFailures -gt 0) -or
  ($reportFailures -gt 0) -or
  ($compileFailures -gt 0) -or
  ($moduleUninvoked -gt 0)

if ($FailOnErrors -and $hasFailures) {
  exit 2
}

exit 0
