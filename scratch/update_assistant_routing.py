import sys

file_path = "apps/android_app/app/src/main/java/com/example/ai/RamsAiAssistantEngine.kt"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "        // 8. Location Pinning and Routing Execution"
end_marker = '        if (lower.contains("clear route") || lower.contains("remove pin") || lower.contains("cancel route") ||'

idx_start = content.find(start_marker)
idx_end = content.find(end_marker)

if idx_start == -1 or idx_end == -1:
    print(f"Failed to find markers: idx_start={idx_start}, idx_end={idx_end}")
    sys.exit(1)

new_code = '''        // 8. Location Pinning and Routing Execution ("pin X", "route to X", "and route X on my map", "navigate to X", etc.)
        val routeRegex = Regex("(?i).*(?:route to|route|navigate to|navigate|directions to|direction to|take me to|show route to|how to go to|paano pumunta sa|papunta sa|punta sa|dalhin mo ako sa|pin)\\\\s+(.+)")
        val matchResult = routeRegex.find(lower)
        val isPinOrRouteQuery = matchResult != null || lower.contains("ルート") || lower.contains("案内して")

        if (isPinOrRouteQuery) {
            val rawTarget = matchResult?.groupValues?.get(1) ?: lower
                .removePrefix("pin ")
                .removePrefix("route to ")
                .removePrefix("route ")
                .removePrefix("navigate to ")
                .removePrefix("directions to ")
                .removePrefix("take me to ")
                .removePrefix("show route to ")
                .removePrefix("punta sa ")
                .removePrefix("dalhin mo ako sa ")
                .removePrefix("punta tayo sa ")
                .removePrefix("how to go to ")
                .removePrefix("paano pumunta sa ")
                .removePrefix("papunta sa ")
                .replace("ルート", "")
                .replace("へ案内して", "")
                .replace("案内して", "")

            var targetLoc = rawTarget
                .replace(Regex("(?i)\\\\s+(on my map|on the map|on my phone|on map|on the app|please|sa mapa|sa phone|sa app)$"), "")
                .trim()
            targetLoc = TuguegaraoOfflineSpatialEngine.normalizeLocalPhonetics(targetLoc)

            if (targetLoc.isNotBlank()) {
                val matchedLandmark = TuguegaraoOfflineSpatialEngine.findTargetLandmark(targetLoc)
                val displayTarget = matchedLandmark?.name ?: targetLoc.replaceFirstChar { it.uppercase() }

                appActionHandler?.navigateToTab("MAP")
                appActionHandler?.pinAndRouteToLocation(targetLoc)
                val reply = if (lower.contains("ルート") || lower.contains("案内")) {
                    "${displayTarget}へのルートを計算し、マップ上にピン留めしました。案内を開始します。"
                } else if (lower.contains("punta") || lower.contains("sa ") || lower.contains("paano")) {
                    "Na-pin na ang $displayTarget sa mapa at kinakalkula na ang pinakamabilis na ruta. Mag-ingat sa pagmamaneho!"
                } else {
                    "Destination $displayTarget pinned on map. Route polyline plotted and active."
                }
                return@withContext reply
            }
        }

'''

content = content[:idx_start] + new_code + content[idx_end:]

with open(file_path, "w", encoding="utf-8", newline="\n") as f:
    f.write(content)

print("Updated RamsAiAssistantEngine.kt routing successfully.")

