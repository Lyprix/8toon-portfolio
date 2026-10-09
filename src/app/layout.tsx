import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "8Toon's Portfolio",
  description: "A Windows XP retrowave portfolio OS. Double-click icons to explore.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
