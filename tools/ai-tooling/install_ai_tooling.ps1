<#
.SYNOPSIS
    Installs and wires RAMS AI tooling for OpenCode, Codex, and Antigravity.

.DESCRIPTION
    Dry-run by default. Every action is printed before it happens.
    -Apply performs the work. Re-running is safe: existing entries are reported,
    not duplicated. Files that are edited are backed up first.

    Secrets are never written. Config entries use environment placeholders
    ({env:VAR} for OpenCode, ${VAR} for Codex); the operator supplies values.

.PARAMETER Apply
    Perform the actions. Without it, only prints the plan.

.PARAMETER SkipNetwork
    Skip anything that downloads (graphify, npx skills). Local skills already
    vendored in .agents/skills are left untouched.

.PARAMETER MergeCodex
    Append the generated [mcp_servers] blocks to %USERPROFILE%\.codex\config.toml
    when they are absent. Backs the file up first.

.PARAMETER MergeOpenCode
    Merge the MCP entries into %USERPROFILE%\.config\opencode\opencode.json.
    Without this switch the installer only writes out/opencode.mcp.json and
    leaves the global config untouched.

.EXAMPLE
    powershell tools/ai-tooling/install_ai_tooling.ps1
    powershell tools/ai-tooling/install_ai_tooling.ps1 -Apply -SkipNetwork
#>
[CmdletBinding()]
param(
    [switch]$Apply,
    [switch]$SkipNetwork,
    [switch]$MergeCodex,
    [switch]$MergeOpenCode
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot  = Split-Path -Parent (Split-Path -Parent $scriptDir)
$outDir    = $scriptDir
$stamp     = Get-Date -Format "yyyyMMdd-HHmmss"

function Write-Step([string]$Text) { Write-Host "  $Text" }
function Write-Action([string]$Text) { Write-Host "  [apply] $Text" -ForegroundColor Yellow }
function Write-Skip([string]$Text) { Write-Host "  [skip]  $Text" -ForegroundColor DarkGray }
function Write-Ok([string]$Text) { Write-Host "  [ok]    $Text" -ForegroundColor Green }

function Backup-File([string]$Path) {
    $backup = "$Path.bak-$stamp"
    Copy-Item -LiteralPath $Path -Destination $backup -Force
    Write-Action "backup $Path -> $backup"
}

function Format-JsonFile([string]$Path) {
    # ConvertTo-Json indents with PS 5.1 spacing; normalize before committing.
    # Set-Content writes a BOM on PS 5.1, so the reader must accept utf-8-sig.
    $python = Get-Command python -ErrorAction SilentlyContinue
    if (-not $python) { return }
    $tmp = "$Path.tmp"
    $code = "import io,json,sys;d=json.load(io.open(sys.argv[1],encoding='utf-8-sig'));io.open(sys.argv[2],'w',encoding='utf-8',newline='\n').write(json.dumps(d,indent=2)+'\n')"
    & python -c $code $Path $tmp 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0 -and (Test-Path $tmp)) {
        Move-Item -LiteralPath $tmp -Destination $Path -Force
    } elseif (Test-Path $tmp) {
        Remove-Item -LiteralPath $tmp -Force
    }
}

Write-Host "======================================================================"
Write-Host "  RAMS AI TOOLING INSTALLER"
Write-Host "======================================================================"
Write-Step "repo:      $repoRoot"
Write-Step "mode:      $(if ($Apply) { 'APPLY' } else { 'DRY RUN (use -Apply)' })"
Write-Step "network:   $(if ($SkipNetwork) { 'disabled' } else { 'allowed' })"
Write-Host ""

# --------------------------------------------------------------------------
# 1. Runtime preconditions
# --------------------------------------------------------------------------
Write-Host "[1/6] Runtimes"

$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
    $nodeVersion = (& node --version) -replace '^v', ''
    $nodeMajor = [int]($nodeVersion.Split('.')[0])
    if ($nodeMajor -lt 20) { Write-Warning "node $nodeVersion is older than 20; MCP servers may fail." }
    Write-Ok "node $nodeVersion"
} else {
    Write-Warning "node not found; MCP servers that use npx will not start."
}

$python = Get-Command python -ErrorAction SilentlyContinue
if ($python) {
    Write-Ok ("python " + (& python --version))
} else {
    Write-Warning "python not found; graphify and the verifier need it."
}
Write-Host ""

# --------------------------------------------------------------------------
# 2. MCP definitions (single source of truth)
# --------------------------------------------------------------------------
Write-Host "[2/6] MCP server definitions"

$mcpServers = @(
    @{ Name = "context7";     Kind = "local";  Command = @("npx", "-y", "@upstash/context7-mcp@4.7.0"); Env = @{ CONTEXT7_API_KEY = "{env:CONTEXT7_API_KEY}" } },
    @{ Name = "chrome-devtools"; Kind = "local"; Command = @("npx", "-y", "chrome-devtools-mcp@1.13.0"); Env = @{} },
    @{ Name = "playwright";   Kind = "local";  Command = @("npx", "-y", "@playwright/mcp@0.0.85"); Env = @{} },
    @{ Name = "firecrawl";    Kind = "local";  Command = @("npx", "-y", "firecrawl-mcp@3.40.0"); Env = @{ FIRECRAWL_API_KEY = "{env:FIRECRAWL_API_KEY}" } },
    @{ Name = "perplexity";   Kind = "local";  Command = @("npx", "-y", "@perplexity-ai/mcp-server@1.3.0"); Env = @{ PERPLEXITY_API_KEY = "{env:PERPLEXITY_API_KEY}" } },
    @{ Name = "figma";        Kind = "remote"; Url = "https://mcp.figma.com/mcp" },
    @{ Name = "hyperframes";  Kind = "remote"; Url = "https://mcp.heygen.com/mcp/hyperframes/" }
)

foreach ($s in $mcpServers) {
    if ($s.Kind -eq "remote") { Write-Step ("{0,-16} remote {1}" -f $s.Name, $s.Url) }
    else { Write-Step ("{0,-16} {1}" -f $s.Name, ($s.Command -join " ")) }
}
Write-Host ""

# --------------------------------------------------------------------------
# 3. OpenCode config
# --------------------------------------------------------------------------
Write-Host "[3/6] OpenCode"

$openCodeConfig = Join-Path $env:USERPROFILE ".config\opencode\opencode.json"

$serverEntries = [ordered]@{}
foreach ($s in $mcpServers) {
    $entry = [ordered]@{ type = $s.Kind }
    if ($s.Kind -eq "remote") {
        $entry.url = $s.Url
    } else {
        $entry.command = @($s.Command)
        if ($s.Env -and $s.Env.Count -gt 0) { $entry.environment = $s.Env }
    }
    $entry.enabled = $true
    $serverEntries[$s.Name] = $entry
}

$ocFragment = Join-Path $outDir "opencode.mcp.json"
$fragmentDoc = [ordered]@{ mcp = [ordered]@{ servers = $serverEntries } }
if ($Apply) {
    $fragmentDoc | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $ocFragment -Encoding UTF8
    Format-JsonFile $ocFragment
    Write-Ok "wrote $ocFragment"
} else {
    Write-Action "would write $ocFragment"
}

if (-not $MergeOpenCode) {
    Write-Skip "global OpenCode config untouched (pass -MergeOpenCode to merge)"
} elseif (-not (Test-Path $openCodeConfig)) {
    Write-Skip "no config at $openCodeConfig"
} else {
    $config = (Get-Content -LiteralPath $openCodeConfig -Raw) | ConvertFrom-Json
    if (-not $config.mcp) {
        $config | Add-Member -NotePropertyName "mcp" -NotePropertyValue ([pscustomobject]@{}) -Force
    }
    if (-not $config.mcp.PSObject.Properties.Name.Contains("servers")) {
        $config.mcp | Add-Member -NotePropertyName "servers" -NotePropertyValue ([pscustomobject]@{}) -Force
    }

    $added = 0
    foreach ($name in $serverEntries.Keys) {
        if ($config.mcp.servers.PSObject.Properties.Name.Contains($name)) {
            Write-Skip "$name already configured"
            continue
        }
        $config.mcp.servers | Add-Member -NotePropertyName $name `
            -NotePropertyValue ([pscustomobject]$serverEntries[$name]) -Force
        $added++
        Write-Step "add $name"
    }

    if ($added -eq 0) {
        Write-Ok "nothing to change"
    } elseif ($Apply) {
        Backup-File $openCodeConfig
        $config | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $openCodeConfig -Encoding UTF8
        Write-Ok "wrote $added server(s); existing keys preserved"
    } else {
        Write-Action "would add $added server(s) to $openCodeConfig"
    }

    foreach ($bad in @("sk-or-v1-", "sk-ant-api03-")) {
        if (Select-String -Path $openCodeConfig -SimpleMatch $bad -Quiet) {
            Write-Warning "config contains a literal key prefix '$bad'. Replace it with an environment placeholder."
        }
    }
}
Write-Host ""

# --------------------------------------------------------------------------
# 4. Codex fragment
# --------------------------------------------------------------------------
Write-Host "[4/6] Codex"

if (-not (Test-Path $outDir)) {
    if ($Apply) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
    else { Write-Action "would create $outDir" }
}

$toml = New-Object System.Text.StringBuilder
[void]$toml.AppendLine("# Generated by tools/ai-tooling/install_ai_tooling.ps1")
[void]$toml.AppendLine("# Merge into %USERPROFILE%\.codex\config.toml")
[void]$toml.AppendLine("")
foreach ($s in $mcpServers) {
    if ($s.Kind -eq "remote") {
        [void]$toml.AppendLine("[mcp_servers.$($s.Name)]")
        [void]$toml.AppendLine("url = `"$($s.Url)`"")
    } else {
        [void]$toml.AppendLine("[mcp_servers.$($s.Name)]")
        [void]$toml.AppendLine("command = `"$($s.Command[0])`"")
        $args = ($s.Command | Select-Object -Skip 1 | ForEach-Object { "`"$_`"" }) -join ", "
        [void]$toml.AppendLine("args = [$args]")
        if ($s.Env -and $s.Env.Count -gt 0) {
            # Codex forwards named variables from its own environment; values are
            # never written to the config file.
            $names = ($s.Env.Keys | ForEach-Object { "`"$_`"" }) -join ", "
            [void]$toml.AppendLine("env_vars = [$names]")
        }
    }
    [void]$toml.AppendLine("")
}

$codexFragment = Join-Path $outDir "codex.mcp.toml"
if ($Apply) {
    # TOML parsers reject a BOM; PS 5.1 Set-Content adds one.
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($codexFragment, $toml.ToString(), $utf8NoBom)
    Write-Ok "wrote $codexFragment"
} else {
    Write-Action "would write $codexFragment"
}

$codexConfig = Join-Path $env:USERPROFILE ".codex\config.toml"
if ($MergeCodex) {
    if (-not (Test-Path $codexConfig)) {
        Write-Skip "no Codex config at $codexConfig"
    } elseif (-not $Apply) {
        Write-Action "would merge the fragment into $codexConfig"
    } else {
        $existing = Get-Content -LiteralPath $codexConfig -Raw
        if ($existing -match "(?m)^\[mcp_servers\.context7\]") {
            Write-Skip "Codex already has the RAMS MCP block"
        } else {
            Backup-File $codexConfig
            Add-Content -LiteralPath $codexConfig -Value ("`r`n" + $toml.ToString()) -Encoding UTF8
            Write-Ok "merged MCP blocks into $codexConfig"
        }
    }
} else {
    Write-Skip "Codex config not modified (pass -MergeCodex to merge)"
}
Write-Host ""

# --------------------------------------------------------------------------
# 5. Antigravity fragment
# --------------------------------------------------------------------------
Write-Host "[5/6] Antigravity"

$anti = [ordered]@{ mcpServers = [ordered]@{} }
foreach ($s in $mcpServers) {
    $entry = [ordered]@{}
    if ($s.Kind -eq "remote") {
        $entry.url = $s.Url
    } else {
        $entry.command = $s.Command[0]
        $entry.args = @($s.Command | Select-Object -Skip 1)
        # No env block: MCP children inherit the parent environment, and the
        # placeholder syntax differs between Antigravity builds. Set the
        # variable in the environment Antigravity launches with.
    }
    $anti.mcpServers[$s.Name] = $entry
}

$antiFile = Join-Path $outDir "antigravity.mcp.json"
if ($Apply) {
    $anti | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $antiFile -Encoding UTF8
    Format-JsonFile $antiFile
    Write-Ok "wrote $antiFile (import from the MCP settings pane)"
} else {
    Write-Action "would write $antiFile"
}
Write-Host ""

# --------------------------------------------------------------------------
# 6. Skills and graphify
# --------------------------------------------------------------------------
Write-Host "[6/6] Skills and knowledge graph"

$skillsDir = Join-Path $repoRoot ".agents\skills"
if (Test-Path $skillsDir) {
    $present = (Get-ChildItem -LiteralPath $skillsDir -Directory | Select-Object -ExpandProperty Name) -join ", "
    Write-Ok "vendored skills: $present"
} else {
    Write-Skip "no .agents/skills directory"
}

$skillInstalls = @(
    @{ Id = "untangle-codebase";       Cmd = @("npx", "skills", "add", "caldoai/skills", "--skill", "untangle-codebase") },
    @{ Id = "design-taste";            Cmd = @("npx", "skills", "add", "h3nryprod01/design-taste") },
    @{ Id = "emil-design-eng";         Cmd = @("npx", "skills", "add", "emilkowalski/skills", "--skill", "emil-design-eng") },
    @{ Id = "replica-skill";           Cmd = @("npx", "skills", "add", "Jakeschincariol/replica-skill") },
    @{ Id = "reverse-engineer-anything"; Cmd = @("npx", "skills", "add", "morluto/rea", "--skill", "reverse-engineer-anything") },
    @{ Id = "hyperframes";             Cmd = @("npx", "skills", "add", "heygen-com/hyperframes") }
)

foreach ($s in $skillInstalls) {
    if (Test-Path (Join-Path $skillsDir $s.Id)) {
        Write-Skip "$($s.Id) already present"
        continue
    }
    if ($SkipNetwork) {
        Write-Skip "$($s.Id) needs network"
        continue
    }
    if ($Apply) {
        Write-Action ($s.Cmd -join " ")
        & $s.Cmd[0] @($s.Cmd | Select-Object -Skip 1)
        if ($LASTEXITCODE -ne 0) { Write-Warning "$($s.Id) installer exited with $LASTEXITCODE" }
        else { Write-Ok "$($s.Id) installed" }
    } else {
        Write-Action ("would run: " + ($s.Cmd -join " "))
    }
}

$graphify = Get-Command graphify -ErrorAction SilentlyContinue
if ($graphify) {
    Write-Ok "graphify present"
} elseif ($SkipNetwork) {
    Write-Skip "graphify not installed (network disabled)"
} elseif ($Apply) {
    Write-Action "python -m pip install --user graphifyy==0.9.109"
    & python -m pip install --user "graphifyy==0.9.109"
    if ($LASTEXITCODE -eq 0) {
        Write-Ok "graphify installed; run: graphify install --project --platform agents"
    } else {
        Write-Warning "graphify install failed with $LASTEXITCODE"
    }
} else {
    Write-Action "would install graphifyy==0.9.109 and register project skills"
}

Write-Host ""
Write-Host "======================================================================"
if ($Apply) { Write-Host "  Done. Fragments are in tools/ai-tooling/. Restart the agents." }
else { Write-Host "  Dry run complete. Re-run with -Apply to perform these actions." }
Write-Host "======================================================================"
