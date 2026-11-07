/**
 * Road Accident Monitoring System (RAMS) — Design System & Tokens
 * ===============================================================
 * Extracted reusable design library for the RAMS Tactical Rescuer ecosystem.
 * Formulated to preserve dark slate aesthetics, high contrast readability,
 * and Philippine disaster management standards.
 */

export const RAMSColors = {
  // Dark Slate Core Palette
  canvas: '#09090b',          // Main application dark canvas background
  surface: '#121214',         // Card, panel & container surface
  surfaceHover: '#151518',    // Interactive surface hover state
  elevated: '#18181b',        // Modals, toolbars, popups, headers
  elevatedHover: '#202024',   // Elevated interactive hover state
  hairline: '#27272a',        // Subdued hairline borders & dividers
  hairlineLight: '#3f3f46',   // High-emphasis borders & active focus rings

  // Light Mode Fallback Tokens
  lightCanvas: '#f4f4f5',
  lightSurface: '#ffffff',
  lightElevated: '#fafafa',
  lightHairline: '#e4e4e7',

  // Typography Contrast Hierarchy
  textPrimary: '#fafafa',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  textInverse: '#09090b',

  // Operational Status Accents
  alertRed: '#ef4444',        // Critical High-G Collision, Active Impact
  alertRedBg: 'rgba(239, 68, 68, 0.12)',
  alertRedGlow: 'rgba(239, 68, 68, 0.45)',

  warningAmber: '#f59e0b',    // Diagnostic Test, Degraded Signal
  warningAmberBg: 'rgba(245, 158, 11, 0.12)',
  warningAmberGlow: 'rgba(245, 158, 11, 0.35)',

  successEmerald: '#10b981',  // Uplink Online, False Alarm Cleared
  successEmeraldBg: 'rgba(16, 185, 129, 0.12)',
  successEmeraldGlow: 'rgba(16, 185, 129, 0.35)',

  techBlue: '#3b82f6',        // Normal Telemetry, GPS Beacon, Info
  techBlueBg: 'rgba(59, 130, 246, 0.12)',
  techBlueGlow: 'rgba(59, 130, 246, 0.35)',
} as const;

export const RAMSTypography = {
  fontSans: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontMono: "'JetBrains Mono', monospace",
  trackingTight: '-0.025em',
  trackingWide: '0.05em',
  trackingWidest: '0.1em',
} as const;

export const RAMSShadows = {
  card: '0 4px 12px rgba(0, 0, 0, 0.25)',
  popup: '0 20px 30px -10px rgba(0, 0, 0, 0.5), 0 10px 15px -5px rgba(0, 0, 0, 0.3)',
  glowRed: '0 0 12px rgba(239, 68, 68, 0.6)',
  glowAmber: '0 0 12px rgba(245, 158, 11, 0.5)',
  glowEmerald: '0 0 12px rgba(16, 185, 129, 0.5)',
  glowBlue: '0 0 12px rgba(59, 130, 246, 0.5)',
} as const;

export const RAMSMapFilters = {
  darkTileFilter: 'invert(100%) hue-rotate(180deg) brightness(0.9) contrast(1.2) grayscale(0.85)',
  lightTileFilter: 'grayscale(0.85) contrast(1.05) brightness(1.02)',
} as const;

export const RAMSAnimation = {
  pulseDuration: '2s',
  pulseEasing: 'cubic-bezier(0.24, 0, 0.38, 1)',
  transitionFast: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
  transitionNormal: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

export default {
  colors: RAMSColors,
  typography: RAMSTypography,
  shadows: RAMSShadows,
  mapFilters: RAMSMapFilters,
  animation: RAMSAnimation,
};
