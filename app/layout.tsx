import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yoink!",
  description: "Click to yoink the flag.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-[#F5F0EC]">
      <body className="max-w-screen-sm mx-auto overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
