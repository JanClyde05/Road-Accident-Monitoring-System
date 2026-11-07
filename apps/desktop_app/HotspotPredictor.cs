/*
 * Road Accident Monitoring System (RAMS) - Command Center Hotspot Predictor
 * =========================================================================
 * Spatial Accident Cluster Prediction & Hazard Density Analytics Engine.
 *
 * Implements deterministic Haversine DBSCAN (Density-Based Spatial Clustering
 * of Applications with Noise) over compiled emergency incident telemetry
 * (incidents.json), eliminating LLM hallucination for spatial blackspots.
 *
 * Compiles cleanly under standard Windows .NET without third-party GIS packages.
 */

using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace RamsRescuerDesktop
{
    public class IncidentRecord
    {
        public string IncidentId { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double PeakG { get; set; }
        public double SpeedKmh { get; set; }
        public string EventType { get; set; }
        public DateTime TimestampUtc { get; set; }
        public bool IsUnresponsive { get; set; }
        public string StreetName { get; set; }
    }

    public class AccidentCluster
    {
        public string ClusterId { get; set; }
        public double CenterLat { get; set; }
        public double CenterLon { get; set; }
        public double RadiusMeters { get; set; }
        public int IncidentCount { get; set; }
        public double HotspotDangerIndex { get; set; }
        public string RiskTier { get; set; } // LOW, MODERATE, HIGH, CRITICAL
        public double MeanImpactG { get; set; }
        public double MeanPreCrashSpeedKmh { get; set; }
        public List<string> PeakRiskHours { get; set; }
        public List<IncidentRecord> Incidents { get; set; }
        public string DominantAccidentType { get; set; }

        public AccidentCluster()
        {
            PeakRiskHours = new List<string>();
            Incidents = new List<IncidentRecord>();
            DominantAccidentType = "High-G Vehicular Impact";
        }
    }

    public static class HotspotPredictor
    {
        private const double EarthRadiusMeters = 6371000.0;
        private const double DefaultEpsilonMeters = 150.0; // 150-meter intersection / corridor radius
        private const int DefaultMinPoints = 3;            // 3 or more incidents constitute a blackspot

        /// <summary>
        /// Analyzes a list of historical incident records and discovers spatial accident clusters.
        /// </summary>
        public static List<AccidentCluster> ComputeHotspots(
            List<IncidentRecord> incidents,
            double epsilonMeters = DefaultEpsilonMeters,
            int minPts = DefaultMinPoints)
        {
            var clusters = new List<AccidentCluster>();
            if (incidents == null || incidents.Count < minPts)
            {
                return clusters;
            }

            var visited = new HashSet<int>();
            var clustered = new HashSet<int>();
            int clusterCounter = 1;

            for (int i = 0; i < incidents.Count; i++)
            {
                if (visited.Contains(i)) continue;
                visited.Add(i);

                var neighbors = RegionQuery(incidents, i, epsilonMeters);
                if (neighbors.Count >= minPts)
                {
                    var currentClusterIndices = new List<int>();
                    currentClusterIndices.Add(i);
                    clustered.Add(i);

                    // Expand cluster
                    for (int n = 0; n < neighbors.Count; n++)
                    {
                        int neighborIdx = neighbors[n];
                        if (!visited.Contains(neighborIdx))
                        {
                            visited.Add(neighborIdx);
                            var neighborNeighbors = RegionQuery(incidents, neighborIdx, epsilonMeters);
                            if (neighborNeighbors.Count >= minPts)
                            {
                                foreach (var nn in neighborNeighbors)
                                {
                                    if (!neighbors.Contains(nn))
                                    {
                                        neighbors.Add(nn);
                                    }
                                }
                            }
                        }

                        if (!clustered.Contains(neighborIdx))
                        {
                            currentClusterIndices.Add(neighborIdx);
                            clustered.Add(neighborIdx);
                        }
                    }

                    // Build aggregate cluster statistics
                    var cluster = BuildCluster(clusterCounter++, currentClusterIndices, incidents);
                    clusters.Add(cluster);
                }
            }

            // Sort clusters descending by Hotspot Danger Index
            clusters.Sort(delegate(AccidentCluster a, AccidentCluster b) {
                return b.HotspotDangerIndex.CompareTo(a.HotspotDangerIndex);
            });
            return clusters;
        }

        private static List<int> RegionQuery(List<IncidentRecord> points, int centerIdx, double eps)
        {
            var neighbors = new List<int>();
            var center = points[centerIdx];

            for (int i = 0; i < points.Count; i++)
            {
                if (i == centerIdx) continue;
                double dist = CalculateHaversineDistance(
                    center.Latitude, center.Longitude,
                    points[i].Latitude, points[i].Longitude);

                if (dist <= eps)
                {
                    neighbors.Add(i);
                }
            }

            return neighbors;
        }

        /// <summary>
        /// Calculates great-circle distance between two GPS coordinates in meters.
        /// </summary>
        public static double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)
        {
            double dLat = ToRadians(lat2 - lat1);
            double dLon = ToRadians(lon2 - lon1);

            double a = Math.Sin(dLat / 2.0) * Math.Sin(dLat / 2.0) +
                       Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                       Math.Sin(dLon / 2.0) * Math.Sin(dLon / 2.0);

            double c = 2.0 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1.0 - a));
            return EarthRadiusMeters * c;
        }

        private static double ToRadians(double degrees)
        {
            return degrees * (Math.PI / 180.0);
        }

        private static AccidentCluster BuildCluster(int id, List<int> indices, List<IncidentRecord> allIncidents)
        {
            double sumLat = 0.0;
            double sumLon = 0.0;
            double sumG = 0.0;
            double sumSpeed = 0.0;
            double dangerScore = 0.0;
            var hourHistogram = new int[24];
            int fallCount = 0;
            int skidCount = 0;
            int crashCount = 0;

            var cluster = new AccidentCluster();
            cluster.ClusterId = string.Format("HOTSPOT-{0:D2}", id);
            cluster.IncidentCount = indices.Count;

            foreach (var idx in indices)
            {
                var record = allIncidents[idx];
                cluster.Incidents.Add(record);
                sumLat += record.Latitude;
                sumLon += record.Longitude;
                sumG += record.PeakG;
                sumSpeed += record.SpeedKmh;

                string et = (record.EventType ?? "").ToLowerInvariant();
                if (et.Contains("skid") || et.Contains("traction")) skidCount++;
                else if (et.Contains("fall")) fallCount++;
                else crashCount++;

                // Hotspot Danger Index (HDI) Formula:
                // HDI = Base (1.0) + (0.25 * PeakG) + (0.15 * (Speed / 10)) + UnresponsivePenalty
                double incidentDanger = 1.0 + (0.25 * record.PeakG) + (0.15 * (record.SpeedKmh / 10.0));
                if (record.IsUnresponsive) incidentDanger += 2.5;
                dangerScore += incidentDanger;

                hourHistogram[record.TimestampUtc.Hour]++;
            }

            if (indices.Count > 0)
            {
                if (skidCount >= fallCount && skidCount >= crashCount)
                    cluster.DominantAccidentType = string.Format("Skid / Traction Loss ({0}%)", (skidCount * 100) / indices.Count);
                else if (fallCount >= skidCount && fallCount >= crashCount)
                    cluster.DominantAccidentType = string.Format("Rider Fall Detected ({0}%)", (fallCount * 100) / indices.Count);
                else
                    cluster.DominantAccidentType = string.Format("Collision Impact ({0}%)", (crashCount * 100) / indices.Count);
            }

            cluster.CenterLat = sumLat / indices.Count;
            cluster.CenterLon = sumLon / indices.Count;
            cluster.MeanImpactG = Math.Round(sumG / indices.Count, 2);
            cluster.MeanPreCrashSpeedKmh = Math.Round(sumSpeed / indices.Count, 1);
            cluster.HotspotDangerIndex = Math.Round(dangerScore, 2);

            // Calculate max radius from center
            double maxRad = 0.0;
            foreach (var rec in cluster.Incidents)
            {
                double d = CalculateHaversineDistance(cluster.CenterLat, cluster.CenterLon, rec.Latitude, rec.Longitude);
                if (d > maxRad) maxRad = d;
            }
            cluster.RadiusMeters = Math.Round(Math.Max(maxRad, 25.0), 1);

            // Assign Risk Tier
            if (dangerScore >= 25.0 || cluster.MeanImpactG > 5.5)
                cluster.RiskTier = "CRITICAL";
            else if (dangerScore >= 15.0 || cluster.MeanImpactG > 4.0)
                cluster.RiskTier = "HIGH";
            else if (dangerScore >= 8.0)
                cluster.RiskTier = "MODERATE";
            else
                cluster.RiskTier = "LOW";

            // Identify peak danger hours
            int maxHourCount = 0;
            int peakHour = -1;
            for (int h = 0; h < 24; h++)
            {
                if (hourHistogram[h] > maxHourCount)
                {
                    maxHourCount = hourHistogram[h];
                    peakHour = h;
                }
            }
            if (peakHour >= 0)
            {
                cluster.PeakRiskHours.Add(string.Format("{0:D2}:00 - {1:D2}:00", peakHour, (peakHour + 2) % 24));
            }

            return cluster;
        }
    }
}

