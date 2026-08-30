"use client";

// src/app/(dashboard)/layout.tsx
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/shared/components/layout/sidebar/Sidebar";
import { Header } from "@/shared/components/layout/Header";
import { useAuthStore } from "@/shared/stores/auth.store";
import { QueryProvider } from '@/shared/providers/QueryProvider'
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Cierra el drawer mobile al navegar a otra ruta (patrón de React, sin efecto)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    // h-screen + overflow-hidden en el root: nada se desborda del viewport
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />

      {/* Columna derecha: header fijo + contenido con scroll propio */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header no se mueve */}
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        {/* Solo este elemento scrollea */}
        <main className="flex-1 overflow-y-auto">
          {/*
            - No hay max-w fijo; el form usa todo el ancho disponible menos la sidebar
            - Padding responsivo: menos aire en mobile, más en desktop
            - En pantallas grandes podés agregar max-w-screen-xl si querés limitar
          */}
          <QueryProvider>
            <div className="px-3 py-4 sm:px-6 sm:py-6">
              {children}
            </div>
          </QueryProvider>

        </main>
      </div>
    </div>
  );
}