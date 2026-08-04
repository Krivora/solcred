'use client';

import { ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/shared/lib/store/auth.store';
import { getDefaultRouteForRole } from '@/shared/config/route-permissions';
import { ErrorState } from '@/shared/components/ui/ErrorState';

export default function UnauthorizedPage() {
    const usuario = useAuthStore((state) => state.usuario);
    const rol = useAuthStore((state) => state.rol);
    const isLoading = useAuthStore((state) => state.isLoading);
    console.log('UnauthorizedPage render', { usuario, rol, isLoading });
    if (isLoading) {
        return null;
    }

    const inicioHref = usuario && rol ? getDefaultRouteForRole(rol) : '/login';

    return (
        <ErrorState
            fullScreen
            icon={ShieldAlert}
            title="No tienes acceso a esta página"
            description="Tu rol actual no cuenta con los permisos necesarios para ver este contenido. Si crees que esto es un error, contacta a un administrador."
            actionHref={inicioHref}
            actionLabel="Volver al inicio"
        />
    );
}