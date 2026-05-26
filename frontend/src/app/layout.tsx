import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sileo";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema de Crédito",
  description: "Plataforma de gestión de crédito",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-hidden`}
      > 
        <Toaster
          position="top-right"
          theme="system"
          options={{
              styles: {
                  title: "text-[--foreground]!",
                  description: "text-[--muted-foreground]!",
                  badge: "bg-[--primary]/15!",
                  button: "bg-[--primary]/10! hover:bg-[--primary]/20!",
              },
          }}
        />
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}