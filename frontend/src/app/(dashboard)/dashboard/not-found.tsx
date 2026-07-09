'use client';

import { FileQuestion } from 'lucide-react';
import { useAuthStore } from '@/shared/lib/store/auth.store';
import { getDefaultRouteForRole } from '@/shared/config/route-permissions';
import { ErrorState } from '@/shared/components/ui/ErrorState';

export default function DashboardNotFound() {
    const usuario = useAuthStore((state) => state.usuario);
    const inicioHref = usuario ? getDefaultRouteForRole(usuario.rol) : '/login';

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