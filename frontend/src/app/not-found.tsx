'use client';

import { FileQuestion } from 'lucide-react';
import { useAuthStore } from '@/shared/lib/store/auth.store';
import { getDefaultRouteForRole } from '@/shared/config/route-permissions';
import { ErrorState } from '@/shared/components/ui/ErrorState';

export default function DashboardNotFound() {
    const usuario = useAuthStore((state) => state.usuario);
    const rol = useAuthStore((state) => state.rol);
    const isLoading = useAuthStore((state) => state.isLoading);

    // Mientras el store no termine de rehidratar desde localStorage,
    // usuario/rol están en null aunque haya sesión real — no decidir el
    // destino todavía o siempre "gana" el fallback a /login.
    if (isLoading) {
        return null; // o un spinner/skeleton si prefieres feedback visual
    }

    const inicioHref = usuario && rol ? getDefaultRouteForRole(rol) : '/login';

    return (
        <ErrorState
            icon={FileQuestion}
            title="Página no encontrada"
            description="La página que buscas no existe o fue movida. Verifica la dirección o regresa al inicio."
            actionHref={inicioHref}
            actionLabel="Volver al inicio"
        />
    );
}