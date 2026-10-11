# RAMS Agent Operating Guidelines & Ponytail Token Optimization

## 1. Ponytail Decision Ladder (Token Optimization)
Follow the "lazy senior developer" mindset to minimize token burn and eliminate code bloat:
1. **YAGNI**: Don't build what wasn't requested.
2. **Reuse**: Always inspect existing helpers across `shared/`, `desktop_app/`, `android_app/`, `wearable_withApp/`, and `receiver_withDesktop/`.
3. **Stdlib / Platform First**: Rely on native APIs before creating custom abstractions.
4. **No New Dependencies**: Use existing dependencies already configured in the repo.
5. **Shortest Working Diff**: Concise, correct modifications win over rewriting files.
6. **Safety Invariants**: Never compromise hardware timings (LoRa/SPI/GATT), data validation, or user requirements.

## 2. RAMS Master System Anchors
- **Memory Map & Graphify Reference**: [MEMORY_MAP.md](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/MEMORY_MAP.md)
- **Obsidian Memory Map**: [RAMS_OBSIDIAN_MEMORY_MAP.md](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/MD%20Files/RAMS_OBSIDIAN_MEMORY_MAP.md)
- **System Architecture**: [00_SYSTEM_ARCHITECTURE.md](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/00_SYSTEM_ARCHITECTURE.md)
- **Design Guidelines (Zero-Emoji)**: [DESIGN_RULES.md](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/DESIGN_RULES.md)
- **Shared LoRa Packet Protocol**: [protocol.h](file:///d:/Antigravity/Projects/Danger%20Monitoring%20System%20V2/shared/protocol.h)
