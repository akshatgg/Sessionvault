import "./globals.css";

export const metadata = {
  title: "SessionVault — Docs",
  description:
    "Capture a browser tab's cookies + localStorage and export them in Playwright storageState format. Cross-browser extension — copy, download, or POST straight to your own endpoint.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
