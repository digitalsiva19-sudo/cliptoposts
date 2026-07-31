import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ClipToPosts - Turn YouTube Videos into Viral Content",
  description: "Repurpose videos into LinkedIn posts, Twitter threads, and Reels scripts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-900 text-white min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
