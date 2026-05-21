"use client";

// src/app/(dashboard)/layout.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/lib/store/auth.store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

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
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      {/* Columna derecha: header fijo + contenido con scroll propio */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header no se mueve */}
        <Header />

        {/* Solo este elemento scrollea */}
        <main className="flex-1 overflow-y-auto">
          {/*
            - No hay max-w fijo; el form usa todo el ancho disponible menos la sidebar
            - px-6 py-6 da aire lateral sin desperdiciar espacio
            - En pantallas grandes podés agregar max-w-screen-xl si querés limitar
          */}
          <div className="px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}