'use client';

import type { Metadata } from "next";
import "./globals.css";
import { SelectionsProvider } from "@/context/SelectionsContext";

export const metadata: Metadata = {
  title: "Next.js Microfrontend",
  description: "Microfrontend application with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SelectionsProvider>
          {children}
        </SelectionsProvider>
      </body>
    </html>
  );
}
