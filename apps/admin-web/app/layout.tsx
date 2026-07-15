import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../lib/auth";

export const metadata: Metadata = {
  title: "CIS Operations Console",
  description: "Central Sync Hub administration console",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-theme="light" lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: "try { document.documentElement.dataset.theme = localStorage.getItem('cis-admin-theme') === 'dark' ? 'dark' : 'light'; } catch (_) {}" }} /></head>
      <body suppressHydrationWarning><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
