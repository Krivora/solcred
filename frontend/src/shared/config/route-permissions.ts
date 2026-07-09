import { navConfig, settingsNavItem, type NavItem } from './nav.config';
import type { Rol } from '@/shared/lib/types/auth.types';

interface RoutePermission {
    pattern: string; // puede contener :param como comodín de un segmento
    roles: Rol[];
}

// Aplana navConfig (padres + hijos) en pares { pattern, roles }
function flattenNavConfig(items: NavItem[]): RoutePermission[] {
    return items.flatMap((item) => {
        const own: RoutePermission[] = item.href
            ? [{ pattern: item.href, roles: item.roles }]
            : [];
        const children = item.children ? flattenNavConfig(item.children) : [];
        return [...own, ...children];
    });
}

// Rutas dinámicas / de flujo que no viven en el sidebar
const EXTRA_ROUTES: RoutePermission[] = [
    { pattern: '/dashboard/admin/promocion/expediente/:id', roles: ['ADMIN', 'GESTOR'] },
    { pattern: '/dashboard/usuarios/expediente/:id', roles: ['CLIENTE'] },
    { pattern: '/dashboard/usuarios/solicitudes/:id', roles: ['CLIENTE'] },
    { pattern: '/dashboard/usuarios/solicitudes/nueva', roles: ['CLIENTE'] },
    { pattern: '/dashboard/admin/configuracion', roles: ['ADMIN'] },
    { pattern: '/dashboard/admin/configuracion/:section', roles: ['ADMIN'] },
    { pattern: '/dashboard/admin/configuracion/programas/:id', roles: ['ADMIN'] },
    { pattern: '/dashboard/admin/configuracion/programas/:id/editar', roles: ['ADMIN'] },
];

const DEFAULT_ROUTE_BY_ROLE: Record<Rol, string> = {
    ADMIN: '/dashboard',
    GESTOR: '/dashboard/admin/promocion/mis-casos',
    ANALISTA: '/dashboard/financiamiento/mis-casos',
    CLIENTE: '/dashboard/usuarios/solicitudes',
};

export function getDefaultRouteForRole(role: Rol): string {
    return DEFAULT_ROUTE_BY_ROLE[role];
}
export const ROUTE_PERMISSIONS: RoutePermission[] = [
    ...flattenNavConfig(navConfig),
    { pattern: settingsNavItem.href!, roles: settingsNavItem.roles },
    ...EXTRA_ROUTES,
];

function patternToRegex(pattern: string): RegExp {
    const escaped = pattern
        .split('/')
        .map((segment) => (segment.startsWith(':') ? '[^/]+' : segment))
        .join('/');
    return new RegExp(`^${escaped}$`);
}

// Devuelve los roles permitidos para un pathname exacto, o null si la ruta
// no está registrada (en ese caso se deja pasar: no todo requiere rol,
// ej. /dashboard raíz para roles sin item "Inicio" propio).
export function getRolesForPath(pathname: string): Rol[] | null {
    const match = ROUTE_PERMISSIONS.find((r) => patternToRegex(r.pattern).test(pathname));
    return match ? match.roles : null;
}