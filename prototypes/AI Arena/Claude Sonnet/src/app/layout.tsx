import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAMS · InnovateX 2026 · 3D Presentation",
  description:
    "Fluid 3D presentation deck for RAMS: AI-enabled road accident monitoring, classification and rapid rescue dispatch.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#070A12] text-white antialiased">{children}</body>
    </html>
  );
}
