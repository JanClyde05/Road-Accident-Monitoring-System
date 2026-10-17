# Graphify & Obsidian Knowledge Graph Protocol

## Master Navigation Anchors
Before doing broad grep searches or re-reading entire codebases, the agent MUST consult the system memory maps:
- **Graphify Machine Memory Map**: [`MEMORY_MAP.md`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/MEMORY_MAP.md)
- **Obsidian Memory Map**: [`MD Files/RAMS_OBSIDIAN_MEMORY_MAP.md`](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/MD%20Files/RAMS_OBSIDIAN_MEMORY_MAP.md)

## Navigation Rules
1. **Zero-Scan Lookups**: Check the **AI Agent Fast Query Index** in `MEMORY_MAP.md` first. Symbols, data structures, and file targets are mapped directly with zero token overhead.
2. **Obsidian Wikilink Navigation**: Follow `[[wikilinks]]` to jump directly to authoritative file paths.
3. **Graphify Node Preservation**: Whenever a major subsystem, protocol packet, or hardware module is added or updated, update the Mermaid system graph and node index in `MEMORY_MAP.md` and `RAMS_OBSIDIAN_MEMORY_MAP.md`.
4. **Zero-Emoji Compliance**: Never introduce emojis into production code, variable names, logs, UI elements, or protocol packets. Vector SVGs and bold typography only (see `DESIGN_RULES.md`).
