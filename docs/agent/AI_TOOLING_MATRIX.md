# AI Tooling Matrix

One inventory of the requested tools, what each is actually for, how it is
installed once, and how it is verified. The point is parity: OpenCode, Codex, and
Antigravity should see the same skills, the same MCP servers, and the same rules.

Status: proposed. Enforced by `SEC-001` and the `tools/ai-tooling/` installer.

---

## 1. Three surfaces, not one

Agents integrate at different layers. Conflating them is why "install the tool"
turns into three unrelated tasks.

| Surface | What it is | Where it lives | Shared by |
| --- | --- | --- | --- |
| Skills | Markdown instructions loaded on demand | `.agents/skills/<name>/SKILL.md` | OpenCode and Antigravity read the project folder; Codex reads `AGENTS.md` and the skill files it is pointed at |
| MCP servers | External processes or URLs exposing tools | OpenCode `mcp.servers`, Codex `[mcp_servers]`, Antigravity MCP settings | All three, each with its own config file |
| Rules | Always-on constraints | `.agents/rules/*.md`, `AGENTS.md` | All three, via `AGENTS.md` |

`AGENTS.md` is the only file every agent reads. It therefore carries the routing
table and the pointer to `.agents/rules/00-rams-invariants.md`.

## 2. Tool inventory

Legend for Scope: `repo` writes only inside this repository, `user` writes to the
user profile, `none` means the tool runs on demand through `npx` and installs
nothing.

### 2.1 Context and memory

| Tool | Role | Install | Scope | Verify |
| --- | --- | --- | --- | --- |
| Graphify | Persistent code knowledge graph, god nodes, community detection | `python -m pip install --user graphifyy==0.9.109` then `graphify install --project --platform agents` | repo | `graphify --help`, `graphify-out/` exists |
| Obsidian memory map | Human navigation of the same knowledge | none, convention | repo | `docs/MD Files/RAMS_OBSIDIAN_MEMORY_MAP.md` opens |
| ICM rules | Filesystem-as-context routing | already in `.agents/rules/icm_methodology.md` | repo | rule file present |
| Untangle Codebase | Architecture extraction and dependency explanation | `npx skills add caldoai/skills --skill untangle-codebase` | repo | `SKILL.md` under `.agents/skills/` |
| Context7 | Library and API documentation at query time | MCP, `npx -y @upstash/context7-mcp@4.7.0` | none | tool list shows `resolve-library-id` |

Graphify is the one install that touches the machine. It is pinned, and the
installer checks the Python version (3.10-3.14 supported; this machine runs
3.14.4). `graphify-out/` is generated, not tracked.

### 2.2 Design and front-end

| Tool | Role | Install | Scope | Verify |
| --- | --- | --- | --- | --- |
| Impeccable | Design review and polish workflow | `npx impeccable install --providers=opencode,codex,antigravity --scope=project` | repo | `PRODUCT.md` and `DESIGN.md` appear |
| Taste | Visual direction and art direction | `npx skills add h3nryprod01/design-taste` | repo | `SKILL.md` present |
| Emil Kowalski design engineering | Interaction and motion craft | `npx skills add emilkowalski/skills --skill emil-design-eng` | repo | `SKILL.md` present |
| Figma MCP | Read frames, variables, and code connect | remote MCP `https://mcp.figma.com/mcp`, OAuth on first use | none | tool list shows `get_file` |
| Replica | UI reconstruction from references, 11 skills | `npx skills add Jakeschincariol/replica-skill` | repo | 11 `SKILL.md` folders |
| Chrome DevTools MCP | Runtime inspection, performance traces | `npx -y chrome-devtools-mcp@1.13.0` | none | tool list shows `performance_start_trace` |
| Playwright MCP | Browser automation and regression | `npx -y @playwright/mcp@0.0.85` | none | tool list shows `browser_navigate` |
| Chrome MCP (browse) | The user's real browser with logins | already configured as `browse` | user | `status` reports relay connected |
| HyperFrames | Motion and video generation | remote `https://mcp.heygen.com/mcp/hyperframes/`, skill `npx skills add heygen-com/hyperframes` | none | tool list shows a render tool |

The design rules in `DESIGN_RULES.md` are zero-emoji and override any stylistic
default an external skill brings.

### 2.3 Research and agents

| Tool | Role | Install | Scope | Verify |
| --- | --- | --- | --- | --- |
| Perplexity MCP | Web research with citations | `npx -y @perplexity-ai/mcp-server@1.3.0`, `PERPLEXITY_API_KEY` | none | tool list shows `perplexity_ask` |
| Firecrawl MCP | Crawl and extract documentation sites | `npx -y firecrawl-mcp@3.40.0`, `FIRECRAWL_API_KEY` | none | tool list shows `firecrawl_scrape` |
| REA | Reverse-engineer anything, then rebuild it | `npx rea-agents@latest setup` plus `npx skills add morluto/rea --skill reverse-engineer-anything` | repo | skill folder present |
| Ruflo | Multi-agent orchestration | `npx ruflo@latest` | none | CLI starts |
| Agent Reach | Reach external agents and channels | follow `https://raw.githubusercontent.com/Panniantong/Agent-Reach/main/docs/install.md` | user | its own doctor command |

Agent Reach must be installed from the repository instructions. The PyPI package
with a similar name is a different project and is not used here.

## 3. MCP configuration

On-demand `npx` invocation means no global npm installs and no version drift
between agents: the version is pinned in the config string.

### OpenCode

`C:\Users\Jan Clyde Talosig\.config\opencode\opencode.json` uses `mcp.servers`.
The installer merges entries and never rewrites unrelated keys.

```json
{
  "mcp": {
    "servers": {
      "context7": {
        "type": "local",
        "command": ["npx", "-y", "@upstash/context7-mcp@4.7.0"],
        "enabled": true
      },
      "playwright": {
        "type": "local",
        "command": ["npx", "-y", "@playwright/mcp@0.0.85"],
        "enabled": true
      },
      "figma": {
        "type": "remote",
        "url": "https://mcp.figma.com/mcp",
        "enabled": true
      }
    }
  }
}
```

### Codex

`%USERPROFILE%\.codex\config.toml` uses `[mcp_servers.<name>]`.

```toml
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp@4.7.0"]
env_vars = ["CONTEXT7_API_KEY"]

[mcp_servers.firecrawl]
command = "npx"
args = ["-y", "firecrawl-mcp@3.40.0"]
env_vars = ["FIRECRAWL_API_KEY"]
```

`env_vars` forwards named variables from the environment Codex runs in. It does
not copy their values into the config, which is exactly what we want.

### Antigravity

Antigravity imports MCP servers as a JSON fragment with the `mcpServers` shape.
The installer writes `tools/ai-tooling/antigravity.mcp.json`; import it from
the MCP settings pane. Keeping the fragment in the repo means the list is
reviewable, diffable, and identical to what the other two agents use.

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@4.7.0"]
    }
  }
}
```

<a id="secrets"></a>
## 4. Secrets

Never commit a key. Configs either reference environment variables or forward
them by name:

- OpenCode: `"{env:FIRECRAWL_API_KEY}"`.
- Codex: `env_vars = ["FIRECRAWL_API_KEY"]`, resolved from the process
  environment.
- Antigravity: the MCP child inherits the environment Antigravity launches with,
  so set the variable there and import the fragment as-is.

Required variables, only for the tools that need them:

| Variable | Tool |
| --- | --- |
| `CONTEXT7_API_KEY` | Context7, optional, raises rate limits |
| `PERPLEXITY_API_KEY` | Perplexity MCP |
| `FIRECRAWL_API_KEY` | Firecrawl MCP |
| `FIGMA_ACCESS_TOKEN` | Figma, only if OAuth is unavailable |
| `OPENROUTER_API_KEY` | existing local GLM/OpenRouter tooling |

`SEC-001` scans every tracked text file for provider key prefixes and fails the
build if one appears. The checker does not print the value.

## 5. Installer behavior

`tools/ai-tooling/install_ai_tooling.ps1`

- Dry-run by default. Prints every action with the exact command.
- `-Apply` performs them.
- `-SkipNetwork` installs only local skills already present in the repo.
- Backs up every file it edits to `<file>.bak-<timestamp>`.
- Idempotent: re-running reports "already present" instead of duplicating.
- Refuses to write a literal key; only `{env:...}` placeholders.

```powershell
# see the plan
powershell tools/ai-tooling/install_ai_tooling.ps1
# apply
powershell tools/ai-tooling/install_ai_tooling.ps1 -Apply
# apply without touching the network (skills already vendored)
powershell tools/ai-tooling/install_ai_tooling.ps1 -Apply -SkipNetwork
```

## 6. Verification

Each tool has a cheap proof of life. Run the whole set once after install and
record the result in `docs/agent/VERIFICATION_LOG.md`.

| Check | Command | Expected |
| --- | --- | --- |
| Node runtime | `node --version` | v20 or newer |
| Python runtime | `python --version` | 3.10-3.14 |
| Graphify | `graphify --help` | usage text, no traceback |
| Graph output | `Test-Path graphify-out` | true after first index |
| Skills | `Get-ChildItem .agents/skills -Directory` | every expected skill |
| OpenCode MCP | `opencode mcp list` if the CLI is available, otherwise inspect `mcp.servers` | entries present, no literal keys |
| Codex MCP | `codex mcp list` if available, otherwise inspect `[mcp_servers]` | entries present |
| Antigravity MCP | settings pane shows the imported servers | entries present |
| Secrets | `python scripts/verify/check_invariants.py --filter SEC-` | PASS |

## 7. Cost and risk

| Risk | Mitigation |
| --- | --- |
| MCP tool descriptions consume context | Enable only the servers in active use; `enabled: false` is a one-word change |
| Hosted MCP changes its API | Versions are pinned; hosted URLs are isolated to one config entry |
| A skill contradicts `DESIGN_RULES.md` | Project rules win; the skill is guidance, not policy |
| A tool writes outside the repo | Installer default is dry-run; `-Apply` lists every write |
| Secret leaks into a config | `SEC-001` plus environment-only references |

## 8. What was deliberately left out

- npm global installs of every MCP server. `npx -y` is enough and avoids version
  skew across three agents.
- A second knowledge-graph product. Graphify plus the Obsidian map is already two
  views of one corpus; a third adds maintenance with no new signal.
- Auto-installing Agent Reach. Its installer is interactive and fetches from
  GitHub; it stays a documented manual step.
