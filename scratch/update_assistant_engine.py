import os

path = r"d:\Antigravity\Projects\Danger Monitoring System V2\apps\android_app\app\src\main\java\com\example\ai\RamsAiAssistantEngine.kt"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update FILLER_WORDS
old_filler = """    // Filler words stripped during key normalization for fuzzy cache lookup
    private val FILLER_WORDS = setOf(
        "a", "an", "the", "is", "are", "was", "were", "what", "who", "where",
        "when", "why", "how", "can", "could", "do", "does", "did", "will",
        "would", "should", "tell", "me", "about", "please", "hey", "rams",
        "ok", "okay", "just", "really", "very", "much", "some", "my", "your",
        "i", "you", "it", "that", "this", "to", "of", "in", "for", "on", "with"
    )"""

new_filler = """    // Filler words stripped during key normalization for fuzzy cache lookup
    private val FILLER_WORDS = setOf(
        "a", "an", "the", "is", "are", "was", "were", "what", "who", "where",
        "when", "why", "how", "can", "could", "do", "does", "did", "will",
        "would", "should", "tell", "me", "about", "please", "hey", "rams",
        "ok", "okay", "just", "really", "very", "much", "some", "my", "your",
        "i", "you", "it", "that", "this", "to", "of", "in", "for", "on", "with",
        "ano", "ang", "mga", "ba", "po", "ko", "mo", "ng", "na", "sa", "at", "ay"
    )"""

assert old_filler in content, "old_filler not found"
content = content.replace(old_filler, new_filler)

# 2. Update normalizeQueryKey
old_norm = """    /**
     * Normalizes a query into a canonical cache key:
     * lowercase, strip punctuation, remove filler words, sort remaining tokens alphabetically.
     */
    private fun normalizeQueryKey(query: String): String {
        val tokens = query.lowercase(Locale.US)
            .replace(Regex("[^a-z0-9\\\\s]"), "")
            .split(Regex("\\\\s+"))
            .filter { it.length > 1 && it !in FILLER_WORDS }
            .sorted()
        return tokens.joinToString(" ")
    }"""

new_norm = """    /**
     * Normalizes a query into a canonical cache key:
     * expands arithmetic symbols to spoken words, lowercase, strip punctuation,
     * retains numeric digits and non-filler words, sort remaining tokens alphabetically.
     */
    fun normalizeQueryKey(query: String): String {
        val mathExpanded = query.lowercase(Locale.US)
            .replace("+", " plus ")
            .replace("-", " minus ")
            .replace("*", " times ")
            .replace("/", " divided by ")
            .replace("=", " equals ")
            .replace("%", " percent ")

        val tokens = mathExpanded
            .replace(Regex("[^a-z0-9\\\\s]"), " ")
            .split(Regex("\\\\s+"))
            .filter { token ->
                token.isNotBlank() && (token.length > 1 || token.all { it.isDigit() }) && token !in FILLER_WORDS
            }
            .sorted()
        return tokens.joinToString(" ")
    }"""

assert old_norm in content, "old_norm not found"
content = content.replace(old_norm, new_norm)

# 3. Add evaluateBasicMathExpression, logOnlineConversation, autoCompactDistilledKnowledge
anchor_distilled = """    /** Returns total number of distilled knowledge samples. */
    fun getDistilledSampleCount(): Int = distilledKnowledgeCache.size"""

new_distilled_methods = """    /** Returns total number of distilled knowledge samples. */
    fun getDistilledSampleCount(): Int = distilledKnowledgeCache.size

    /**
     * Evaluates deterministic arithmetic and percentages offline in English, Tagalog, and symbols.
     * Supports +, -, *, /, %, number words (one..twenty, isa..sampu), and division-by-zero guards.
     */
    fun evaluateBasicMathExpression(query: String): String? {
        var q = query.lowercase(Locale.US).trim()

        val prefixes = listOf(
            "what is", "what's", "calculate", "solve", "compute", "tell me", "how much is",
            "ano ang", "paki solve ang", "magkano ang", "paki kwenta ang", "kwentahin mo ang"
        )
        for (prefix in prefixes) {
            if (q.startsWith(prefix)) {
                q = q.removePrefix(prefix).trim()
                break
            }
        }
        q = q.replace("?", "").replace("=", "").trim()

        val numberWords = mapOf(
            "zero" to 0, "one" to 1, "two" to 2, "three" to 3, "four" to 4, "five" to 5,
            "six" to 6, "seven" to 7, "eight" to 8, "nine" to 9, "ten" to 10,
            "eleven" to 11, "twelve" to 12, "thirteen" to 13, "fourteen" to 14, "fifteen" to 15,
            "sixteen" to 16, "seventeen" to 17, "eighteen" to 18, "nineteen" to 19, "twenty" to 20,
            "thirty" to 30, "forty" to 40, "fifty" to 50, "sixty" to 60, "seventy" to 70,
            "eighty" to 80, "ninety" to 90, "hundred" to 100,
            "isa" to 1, "dalawa" to 2, "tatlo" to 3, "apat" to 4, "lima" to 5,
            "anim" to 6, "pito" to 7, "walo" to 8, "siyam" to 9, "sampu" to 10
        )
        for ((word, num) in numberWords) {
            q = q.replace(Regex("\\\\b$word\\\\b"), num.toString())
        }

        val pctMatch = Regex("([\\\\d.]+)\\\\s*(?:%|percent)\\\\s+(?:of|ng)\\\\s+([\\\\d.]+)").find(q)
        if (pctMatch != null) {
            val pct = pctMatch.groupValues[1].toDoubleOrNull() ?: return null
            val base = pctMatch.groupValues[2].toDoubleOrNull() ?: return null
            val res = (pct * base) / 100.0
            val resStr = if (res % 1.0 == 0.0) res.toLong().toString() else "%.2f".format(Locale.US, res)
            return "${pctMatch.groupValues[1]} percent of ${pctMatch.groupValues[2]} is $resStr."
        }

        q = q.replace("multiplied by", "*")
            .replace("times", "*")
            .replace(Regex("(\\\\d+)\\\\s*[xX]\\\\s*(\\\\d+)"), "$1 * $2")
            .replace("divided by", "/")
            .replace("over", "/")
            .replace("hati sa", "/")
            .replace("plus", "+")
            .replace("dagdag", "+")
            .replace("minus", "-")
            .replace("bawas", "-")

        val mathMatch = Regex("([\\\\d.]+)\\\\s*([+\\\\-*/])\\\\s*([\\\\d.]+)").find(q)
        if (mathMatch != null) {
            val a = mathMatch.groupValues[1].toDoubleOrNull() ?: return null
            val op = mathMatch.groupValues[2]
            val b = mathMatch.groupValues[3].toDoubleOrNull() ?: return null

            val res: Double
            val opWord: String
            when (op) {
                "+" -> {
                    res = a + b
                    opWord = "plus"
                }
                "-" -> {
                    res = a - b
                    opWord = "minus"
                }
                "*" -> {
                    res = a * b
                    opWord = "times"
                }
                "/" -> {
                    if (b == 0.0) return "Division by zero is undefined."
                    res = a / b
                    opWord = "divided by"
                }
                else -> return null
            }

            val aStr = if (a % 1.0 == 0.0) a.toLong().toString() else a.toString()
            val bStr = if (b % 1.0 == 0.0) b.toLong().toString() else b.toString()
            val resStr = if (res % 1.0 == 0.0) res.toLong().toString() else "%.2f".format(Locale.US, res)
            return "$aStr $opWord $bStr is $resStr."
        }
        return null
    }

    /**
     * Appends online conversational exchanges to persistent local logs for offline retraining.
     */
    fun logOnlineConversation(query: String, response: String, sys: RamsSystemContext) {
        try {
            val convFile = File(context.filesDir, "rams_conversations.jsonl")
            val obj = JSONObject().apply {
                put("timestamp", System.currentTimeMillis())
                put("query", query)
                put("response", response)
                put("userRole", sys.userType)
                put("speedKmh", sys.speedKmh.toDouble())
                put("latitude", sys.latitude)
                put("longitude", sys.longitude)
                put("source", "gemini-online")
            }
            convFile.appendText(obj.toString() + "\\n")
        } catch (e: Exception) {
            Log.w(TAG, "Failed logging online conversation: ${e.message}")
        }
    }

    /**
     * Auto-compacts distilled knowledge, user voice patterns, and conversation logs:
     * - Deduplicates identical normalized keys, retaining richest responses.
     * - Caps active distilled cache at 400 entries with atomic file rewrite.
     * - Prunes conversation history beyond 200 turns to conserve mobile flash memory.
     */
    fun autoCompactDistilledKnowledge(): Int {
        var totalPruned = 0
        try {
            val file = File(context.filesDir, DISTILLED_FILE_NAME)
            if (file.exists()) {
                val lines = file.readLines().filter { it.isNotBlank() }
                val sampleMap = mutableMapOf<String, DistilledKnowledgeSample>()
                for (line in lines) {
                    try {
                        val obj = JSONObject(line)
                        val s = DistilledKnowledgeSample(
                            query = obj.optString("query", ""),
                            normalizedKey = obj.optString("normalizedKey", ""),
                            response = obj.optString("response", ""),
                            timestamp = obj.optLong("timestamp", 0L),
                            speedKmh = obj.optDouble("speedKmh", 0.0).toFloat(),
                            userRole = obj.optString("userRole", ""),
                            vehicleModel = obj.optString("vehicleModel", ""),
                            source = obj.optString("source", "distilled")
                        )
                        if (s.normalizedKey.isNotBlank() && s.response.isNotBlank()) {
                            val existing = sampleMap[s.normalizedKey]
                            if (existing == null || s.timestamp >= existing.timestamp || s.response.length > existing.response.length) {
                                sampleMap[s.normalizedKey] = s
                            }
                        }
                    } catch (_: Exception) {}
                }

                val capped = if (sampleMap.size > 400) {
                    sampleMap.values.sortedByDescending { it.timestamp }.take(400)
                } else {
                    sampleMap.values.toList()
                }

                val tempFile = File(context.filesDir, "${DISTILLED_FILE_NAME}.tmp")
                tempFile.bufferedWriter().use { writer ->
                    for (s in capped) {
                        val obj = JSONObject().apply {
                            put("query", s.query)
                            put("normalizedKey", s.normalizedKey)
                            put("response", s.response)
                            put("timestamp", s.timestamp)
                            put("speedKmh", s.speedKmh.toDouble())
                            put("userRole", s.userRole)
                            put("vehicleModel", s.vehicleModel)
                            put("source", s.source)
                        }
                        writer.write(obj.toString())
                        writer.newLine()
                    }
                }
                tempFile.renameTo(file)

                for (s in capped) {
                    distilledKnowledgeCache[s.normalizedKey] = s
                }

                totalPruned += (lines.size - capped.size)
            }

            val patternsFile = File(context.filesDir, LEARNED_PATTERNS_FILE)
            if (patternsFile.exists()) {
                val pJson = JSONObject(patternsFile.readText())
                val cleanJson = JSONObject()
                val keys = pJson.keys()
                while (keys.hasNext()) {
                    val k = keys.next()
                    val v = pJson.getString(k).trim()
                    if (k.isNotBlank() && v.isNotBlank()) {
                        cleanJson.put(k.lowercase(Locale.US).trim(), v)
                    }
                }
                patternsFile.writeText(cleanJson.toString(2))
            }

            val convFile = File(context.filesDir, "rams_conversations.jsonl")
            if (convFile.exists()) {
                val convLines = convFile.readLines().filter { it.isNotBlank() }
                if (convLines.size > 200) {
                    val retained = convLines.takeLast(200)
                    val tmpConv = File(context.filesDir, "rams_conversations.jsonl.tmp")
                    tmpConv.writeText(retained.joinToString("\\n") + "\\n")
                    tmpConv.renameTo(convFile)
                    totalPruned += (convLines.size - retained.size)
                }
            }

            Log.i(TAG, "Distilled knowledge and conversations auto-compacted. Total entries pruned: $totalPruned")
        } catch (e: Exception) {
            Log.w(TAG, "Auto-compaction error: ${e.message}")
        }
        return totalPruned
    }"""

assert anchor_distilled in content, "anchor_distilled not found"
content = content.replace(anchor_distilled, new_distilled_methods)

# 4. In generateAssistantResponse, insert compaction command, math evaluator, and online conversation logging
target_before_step6 = """        if (lower.contains("sos") || lower.contains("emergency") || lower.contains("crash") || lower.contains("what happens in a crash")) {
            return@withContext "In a verified collision, RAMS sounds an SOS Morse audio beacon, transmits a LoRa packet to base stations, and automatically sends an SMS with your GPS coordinates and medical token to ${if (sys.emergencyContactName.isNotBlank()) sys.emergencyContactName else "your emergency contact"}."
        }

        // 6. DISTILLATION CACHE LOOKUP (Gemini-taught answers, works offline too)"""

new_before_step6 = """        if (lower.contains("sos") || lower.contains("emergency") || lower.contains("crash") || lower.contains("what happens in a crash")) {
            return@withContext "In a verified collision, RAMS sounds an SOS Morse audio beacon, transmits a LoRa packet to base stations, and automatically sends an SMS with your GPS coordinates and medical token to ${if (sys.emergencyContactName.isNotBlank()) sys.emergencyContactName else "your emergency contact"}."
        }

        // 5B. DATA AUTO-COMPACTION & STORAGE OPTIMIZATION COMMANDS
        if (lower.contains("compact data") || lower.contains("auto compact") || lower.contains("optimize storage") ||
            lower.contains("compact cache") || lower.contains("compact memory") || lower.contains("clean memory") || lower.contains("compact storage")) {
            val distPruned = autoCompactDistilledKnowledge()
            val motionPruned = appActionHandler?.compactMotionData() ?: 0
            return@withContext "Data auto-compaction complete. Retained ${distilledKnowledgeCache.size} optimal knowledge entries and purged redundant records. Storage is fully optimized."
        }

        // 5C. DETERMINISTIC OFFLINE MATH EVALUATOR (Zero-Latency Arithmetic & Percentages)
        val mathAnswer = evaluateBasicMathExpression(trimmed)
        if (mathAnswer != null) {
            val normalizedKey = normalizeQueryKey(trimmed)
            if (normalizedKey.isNotBlank()) {
                persistDistilledSample(DistilledKnowledgeSample(
                    query = trimmed,
                    normalizedKey = normalizedKey,
                    response = mathAnswer,
                    timestamp = System.currentTimeMillis(),
                    speedKmh = sys.speedKmh,
                    userRole = sys.userType,
                    vehicleModel = sys.vehicleModel,
                    source = "deterministic-math-evaluator"
                ))
            }
            learnVoicePattern(trimmed, mathAnswer)
            return@withContext mathAnswer
        }

        // 6. DISTILLATION CACHE LOOKUP (Gemini-taught answers, works offline too)"""

assert target_before_step6 in content, "target_before_step6 not found"
content = content.replace(target_before_step6, new_before_step6)

# 5. In Step 7 (online gemini), log conversation and learnVoicePattern and auto-compact trigger
target_step7 = """                if (!geminiReply.isNullOrBlank()) {
                    // Distill: cache this Gemini answer so RAMS can answer offline next time
                    val normalizedKey = normalizeQueryKey(trimmed)
                    if (normalizedKey.isNotBlank()) {
                        persistDistilledSample(DistilledKnowledgeSample(
                            query = trimmed,
                            normalizedKey = normalizedKey,
                            response = geminiReply,
                            timestamp = System.currentTimeMillis(),
                            speedKmh = sys.speedKmh,
                            userRole = sys.userType,
                            vehicleModel = sys.vehicleModel
                        ))
                    }
                    return@withContext geminiReply
                }"""

new_step7 = """                if (!geminiReply.isNullOrBlank()) {
                    // Distill: cache this Gemini answer so RAMS can answer offline next time
                    val normalizedKey = normalizeQueryKey(trimmed)
                    if (normalizedKey.isNotBlank()) {
                        persistDistilledSample(DistilledKnowledgeSample(
                            query = trimmed,
                            normalizedKey = normalizedKey,
                            response = geminiReply,
                            timestamp = System.currentTimeMillis(),
                            speedKmh = sys.speedKmh,
                            userRole = sys.userType,
                            vehicleModel = sys.vehicleModel,
                            source = "gemini-2.0-flash-distillation"
                        ))
                    }
                    learnVoicePattern(trimmed, geminiReply)
                    logOnlineConversation(trimmed, geminiReply, sys)

                    // Auto-compact dynamically when dynamic cache grows
                    if (distilledKnowledgeCache.size % 25 == 0) {
                        autoCompactDistilledKnowledge()
                    }

                    return@withContext geminiReply
                }"""

assert target_step7 in content, "target_step7 not found"
content = content.replace(target_step7, new_step7)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully updated RamsAiAssistantEngine.kt")

