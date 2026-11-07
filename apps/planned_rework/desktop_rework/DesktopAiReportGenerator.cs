/*
 * Road Accident Monitoring System (RAMS) - Desktop AI Incident Report Generator
 * ==============================================================================
 * Connects to local offline LLM runtime (Ollama / LlamaSharp / ONNX GenAI)
 * running Llama-3.2-3B-Instruct or Qwen2.5-3B-Instruct.
 *
 * Automatically generates formal Emergency Operations Center (EOC) Intelligence
 * Briefs, hotspot prevention advisories, and municipal safety reports.
 */

using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;

namespace RamsRescuerDesktop.AI
{
    public class DesktopAiReportGenerator
    {
        private readonly string _ollamaEndpoint;
        private readonly string _modelName;

        public DesktopAiReportGenerator(string endpoint = "http://127.0.0.1:11434/api/generate", string model = "llama3.2:3b")
        {
            _ollamaEndpoint = endpoint;
            _modelName = model;
        }

        public string GenerateExecutiveReport(List<AccidentCluster> hotspots, int totalIncidentsAnalyzed)
        {
            if (hotspots == null || hotspots.Count == 0)
            {
                return "# RAMS COMMAND CENTER REPORT\n\nNo active accident hotspots detected in the analyzed incident window.";
            }

            // Build structured prompt for the local LLM
            var promptBuilder = new StringBuilder();
            promptBuilder.AppendLine("You are the RAMS Emergency Dispatch Safety Analyst at the Municipal Command Center.");
            promptBuilder.AppendLine("Review the following mathematically clustered accident blackspots in Tuguegarao City:");
            promptBuilder.AppendLine();

            foreach (var hs in hotspots)
            {
                promptBuilder.AppendFormat("Cluster: {0}\n", hs.ClusterId);
                promptBuilder.AppendFormat("Coordinates: Lat {0:F4}, Lon {1:F4} (Radius: {2}m)\n", hs.CenterLat, hs.CenterLon, hs.RadiusMeters);
                promptBuilder.AppendFormat("Incidents: {0} events | Hotspot Danger Index: {1} ({2})\n", hs.IncidentCount, hs.HotspotDangerIndex, hs.RiskTier);
                promptBuilder.AppendFormat("Mean Deceleration: {0}G | Mean Speed: {1} km/h\n", hs.MeanImpactG, hs.MeanPreCrashSpeedKmh);
                if (hs.PeakRiskHours.Count > 0)
                {
                    promptBuilder.AppendFormat("Peak Danger Window: {0}\n", string.Join(", ", hs.PeakRiskHours.ToArray()));
                }
                promptBuilder.AppendLine();
            }

            promptBuilder.AppendLine("Task: Draft a formal Emergency Operations Center (EOC) Intelligence Brief with:");
            promptBuilder.AppendLine("1. Executive Hazard Assessment");
            promptBuilder.AppendLine("2. Primary Infrastructure / Environmental Risk Factors");
            promptBuilder.AppendLine("3. Actionable Directives for CDRRMO Medical Dispatch, PNP Highway Patrol, and City Engineering");
            promptBuilder.AppendLine("Keep the tone clinical, authoritative, and strictly professional with zero emojis.");

            string responseText = QueryLocalLlm(promptBuilder.ToString());
            return responseText;
        }

        private string QueryLocalLlm(string prompt)
        {
            try
            {
                var request = (HttpWebRequest)WebRequest.Create(_ollamaEndpoint);
                request.Method = "POST";
                request.ContentType = "application/json";
                request.Timeout = 25000; // 25s timeout for local 3B model inference

                // Escape prompt for JSON
                string escapedPrompt = prompt.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\r", "").Replace("\n", "\\n");
                string jsonBody = string.Format("{{\"model\": \"{0}\", \"prompt\": \"{1}\", \"stream\": false}}", _modelName, escapedPrompt);

                byte[] bodyBytes = Encoding.UTF8.GetBytes(jsonBody);
                request.ContentLength = bodyBytes.Length;

                using (var stream = request.GetRequestStream())
                {
                    stream.Write(bodyBytes, 0, bodyBytes.Length);
                }

                using (var response = (HttpWebResponse)request.GetResponse())
                using (var reader = new StreamReader(response.GetResponseStream(), Encoding.UTF8))
                {
                    string rawJson = reader.ReadToEnd();
                    return ParseOllamaResponse(rawJson);
                }
            }
            catch (Exception ex)
            {
                // Fallback deterministic brief if local LLM service is offline
                return BuildOfflineDeterministicFallback(ex.Message);
            }
        }

        private static string ParseOllamaResponse(string json)
        {
            // Simple string extraction without requiring bulky JSON packages
            int respIdx = json.IndexOf("\"response\":\"", StringComparison.Ordinal);
            if (respIdx >= 0)
            {
                int start = respIdx + 12;
                var sb = new StringBuilder();
                bool escape = false;

                for (int i = start; i < json.Length; i++)
                {
                    char c = json[i];
                    if (escape)
                    {
                        if (c == 'n') sb.Append('\n');
                        else if (c == 'r') sb.Append('\r');
                        else if (c == 't') sb.Append('\t');
                        else sb.Append(c);
                        escape = false;
                    }
                    else if (c == '\\')
                    {
                        escape = true;
                    }
                    else if (c == '"')
                    {
                        break;
                    }
                    else
                    {
                        sb.Append(c);
                    }
                }
                return sb.ToString();
            }

            return json;
        }

        private static string BuildOfflineDeterministicFallback(string errorMsg)
        {
            var sb = new StringBuilder();
            sb.AppendLine("# RAMS COMMAND CENTER INCIDENT INTELLIGENCE BRIEF");
            sb.AppendLine("**Status**: Offline Deterministic Generation (Local LLM Daemon Standby)");
            sb.AppendFormat("**System Notice**: Local LLM bridge notice: {0}\n\n", errorMsg);
            sb.AppendLine("### 1. Executive Hazard Assessment");
            sb.AppendLine("High-risk clusters indicate concentrated kinetic deceleration events exceeding 4.0G along primary arterial corridors.");
            sb.AppendLine();
            sb.AppendLine("### 2. Immediate Directives");
            sb.AppendLine("- Forward emergency incident coordinates to local rescue dispatch patrol.");
            sb.AppendLine("- Direct traffic safety division to deploy speed enforcement along identified blackspot coordinates.");
            return sb.ToString();
        }
    }
}

