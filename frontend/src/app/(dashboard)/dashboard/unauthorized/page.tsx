'use client';

import { ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/shared/stores/auth.store';
import { getDefaultRouteForRole } from '@/shared/config/route-permissions.config';
import { ErrorState } from '@/shared/components/common/ErrorState';

export default function DashboardUnauthorizedPage() {
    const rol = useAuthStore((state) => state.rol);
    const inicioHref = rol ? getDefaultRouteForRole(rol) : '/login';

    return (
        <ErrorState
            icon={ShieldAlert}
            title="No tienes acceso a esta página"
            description="Tu rol actual no cuenta con los permisos necesarios para ver este contenido. Si crees que esto es un error, contacta a un administrador."
            actionHref={inicioHref}
            actionLabel="Volver al inicio"
        />
    );
}