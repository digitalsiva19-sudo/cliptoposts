import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClipToPosts - Turn YouTube Videos into Social Posts",
  description: "Repurpose YouTube videos into LinkedIn, Twitter & Reel scripts in seconds.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
