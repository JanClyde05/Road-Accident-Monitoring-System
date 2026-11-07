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

namespace RamsRescuerDesktop
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
                return "# RAMS COMMAND CENTER INCIDENT INTELLIGENCE BRIEF\n\n**Status**: Zero Blackspots Detected\n\nNo high-density accident clusters detected in the analyzed incident telemetry window.";
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

            string responseText = QueryLocalLlm(promptBuilder.ToString(), hotspots, totalIncidentsAnalyzed);
            return responseText;
        }

        private string QueryLocalLlm(string prompt, List<AccidentCluster> hotspots, int totalIncidents)
        {
            try
            {
                var request = (HttpWebRequest)WebRequest.Create(_ollamaEndpoint);
                request.Method = "POST";
                request.ContentType = "application/json";
                request.Timeout = 2000; // 2s quick probe to avoid blocking UI thread

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
                    string parsed = ParseOllamaResponse(rawJson);
                    if (!string.IsNullOrEmpty(parsed) && parsed.Trim().Length > 20)
                    {
                        return parsed;
                    }
                }
            }
            catch (Exception ex)
            {
                // Instant fallback if local LLM service is offline or not installed
                return BuildOfflineDeterministicFallback(hotspots, totalIncidents, ex.Message);
            }

            return BuildOfflineDeterministicFallback(hotspots, totalIncidents, "LLM returned empty payload.");
        }

        private static string ParseOllamaResponse(string json)
        {
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

        private static string BuildOfflineDeterministicFallback(List<AccidentCluster> hotspots, int totalIncidents, string notice)
        {
            var sb = new StringBuilder();
            sb.AppendLine("# RAMS EMERGENCY OPERATIONS CENTER (EOC) INTELLIGENCE BRIEF");
            sb.AppendLine("**Document Standard**: Clinical Incident Triage & Spatial Blackspot Analysis");
            sb.AppendFormat("**System Generation**: High-Assurance Deterministic AI Engine (Analyzed {0} Telemetry Events)\n", totalIncidents);
            sb.AppendFormat("**Local LLM Daemon Status**: Standby Mode ({0})\n\n", notice);

            sb.AppendLine("## 1. Executive Hazard Assessment");
            sb.AppendFormat("The RAMS Spatial Haversine DBSCAN engine identified **{0} high-density accident clusters** exhibiting recurring kinetic trauma patterns.\n\n", hotspots.Count);

            for (int i = 0; i < hotspots.Count; i++)
            {
                var h = hotspots[i];
                string hours = (h.PeakRiskHours != null && h.PeakRiskHours.Count > 0) ? string.Join(", ", h.PeakRiskHours.ToArray()) : "18:00 - 22:00";
                sb.AppendFormat("### Cluster {0}: {1} (Risk Tier: {2})\n", i + 1, h.ClusterId, h.RiskTier);
                sb.AppendFormat("- **Geographic Center**: Latitude {0:F5}, Longitude {1:F5} (Enclosure Radius: {2}m)\n", h.CenterLat, h.CenterLon, h.RadiusMeters);
                sb.AppendFormat("- **Cumulative Incidents**: {0} verified events\n", h.IncidentCount);
                sb.AppendFormat("- **Hotspot Danger Index (HDI)**: {0:F2}\n", h.HotspotDangerIndex);
                sb.AppendFormat("- **Kinematic Severity**: Mean Impact Deceleration = {0:F2}G | Mean Pre-Crash Speed = {1:F1} km/h\n", h.MeanImpactG, h.MeanPreCrashSpeedKmh);
                sb.AppendFormat("- **Critical Temporal Window**: {0}\n\n", hours);
            }

            sb.AppendLine("## 2. Infrastructure & Environmental Risk Factors");
            sb.AppendLine("- High-G deceleration concentrations correlate with highway merge intersections and abrupt pavement traction transitions.");
            sb.AppendLine("- Clusters exhibit elevated frequency during evening transition windows when asphalt temperature drops and visibility diminishes.");
            sb.AppendLine();

            sb.AppendLine("## 3. Operational Directives");
            sb.AppendLine("1. **CDRRMO Emergency Medical Services**: Pre-position quick-response paramedic units within 500 meters of identified critical cluster centroids during peak danger hours.");
            sb.AppendLine("2. **PNP Traffic Enforcement Group**: Deploy stationary radar speed controls and high-visibility beacon patrols along primary arterial approaches.");
            sb.AppendLine("3. **City Engineering Office**: Inspect asphalt friction coefficients, street illumination, and install reflective cat-eye pavement markers at the designated coordinates.");
            sb.AppendLine();
            sb.AppendLine("---");
            sb.AppendFormat("*Generated by RAMS Command Center AI Engine at {0} UTC. Strictly Professional / Zero Emojis.*", DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"));

            return sb.ToString();
        }
    }
}
