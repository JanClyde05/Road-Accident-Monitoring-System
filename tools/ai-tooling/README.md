# AI Tooling

Scripts and generated fragments that make the same MCP servers and skills
available to OpenCode, Codex, and Antigravity.

- `install_ai_tooling.ps1` - dry-run by default. `-Apply` performs the work.
  `-SkipNetwork` avoids downloads. `-MergeOpenCode` and `-MergeCodex` edit the
  user-level agent configs (each backed up first); without them the script only
  writes the fragments in this folder.
- `opencode.mcp.json` - `mcp.servers` fragment for OpenCode.
- `codex.mcp.toml` - `[mcp_servers]` fragment for Codex.
- `antigravity.mcp.json` - `mcpServers` fragment for the Antigravity settings
  pane.

The fragments are tracked so the server list is reviewable and identical across
agents. The authoritative inventory, including why each tool exists and how to
verify it, is `docs/agent/AI_TOOLING_MATRIX.md`.

No secrets live here. Config entries use `{env:VAR}` (OpenCode) and `${VAR}`
(Codex); `scripts/verify/check_invariants.py --filter SEC-` fails the build if a
provider key prefix appears in a tracked file.
