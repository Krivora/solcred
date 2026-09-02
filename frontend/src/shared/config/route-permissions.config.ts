import { navConfig, settingsNavItem, type NavItem } from './nav.config';
import type { RolAplicacion } from '@/shared/types/auth.types';

interface RoutePermission {
    pattern: string; // puede contener :param como comodín de un segmento
    roles: RolAplicacion[];
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

// SUPERVISOR ve lo mismo que ADMIN (solo lectura): se añade a toda ruta que
// permita ADMIN, igual que en nav.config.
const conSupervisor = (roles: RolAplicacion[]): RolAplicacion[] =>
    roles.includes('ADMIN') && !roles.includes('SUPERVISOR')
        ? [...roles, 'SUPERVISOR']
        : roles;

// Rutas de acción (alta / edición) que NO deben abrirse a SUPERVISOR aunque
// las permita ADMIN: el rol es de solo lectura. Se registran aparte para que
// `conSupervisor` no vuelva a inyectar 'SUPERVISOR', y de primeras en la lista
// para ganarle al patrón genérico `/programas/:id`.
const STRICT_ROUTES: RoutePermission[] = [
    { pattern: '/dashboard/admin/configuracion/programas/nuevo', roles: ['ADMIN'] },
    { pattern: '/dashboard/admin/configuracion/programas/:id/editar', roles: ['ADMIN'] },
];

// Rutas dinámicas / de flujo que no viven en el sidebar
const EXTRA_ROUTES: RoutePermission[] = [
    { pattern: '/dashboard/admin/promocion/expediente/:id', roles: ['ADMIN', 'GESTOR', 'ANALISTA', 'SUPERVISOR', 'ENCARGADO_PROMOCION', 'ENCARGADO_FINANCIAMIENTO', 'MESA_CONTROL'] },
    { pattern: '/dashboard/financiamiento/solicitud/:id', roles: ['ADMIN', 'ANALISTA', 'SUPERVISOR', 'ENCARGADO_FINANCIAMIENTO', 'MESA_CONTROL'] },
    { pattern: '/dashboard/financiamiento/analisis/:id', roles: ['ADMIN', 'ANALISTA', 'SUPERVISOR', 'ENCARGADO_FINANCIAMIENTO'] },
    { pattern: '/dashboard/usuarios/expediente/:id', roles: ['CLIENTE'] },
    { pattern: '/dashboard/usuarios/solicitudes/:id', roles: ['CLIENTE'] },
    { pattern: '/dashboard/usuarios/solicitudes/nueva', roles: ['CLIENTE'] },
    // Detalle de ticket: cualquiera puede navegar; la API valida la pertenencia.
    {
        pattern: '/dashboard/soporte/tickets/:id',
        roles: ['ADMIN', 'GESTOR', 'ANALISTA', 'SUPERVISOR', 'ENCARGADO_PROMOCION', 'ENCARGADO_FINANCIAMIENTO', 'MESA_CONTROL', 'SOPORTE', 'CLIENTE'],
    },
    { pattern: '/dashboard/admin/configuracion', roles: ['ADMIN', 'SUPERVISOR'] },
    { pattern: '/dashboard/admin/configuracion/:section', roles: ['ADMIN', 'SUPERVISOR'] },
    { pattern: '/dashboard/admin/configuracion/programas/:id', roles: ['ADMIN', 'SUPERVISOR'] },
];

const DEFAULT_ROUTE_BY_ROLE: Record<RolAplicacion, string> = {
    ADMIN: '/dashboard',
    GESTOR: '/dashboard/admin/promocion/mis-casos',
    ANALISTA: '/dashboard/financiamiento/mis-casos',
    SUPERVISOR: '/dashboard',
    ENCARGADO_PROMOCION: '/dashboard/admin/promocion/solicitudes',
    ENCARGADO_FINANCIAMIENTO: '/dashboard/financiamiento/validacion',
    MESA_CONTROL: '/dashboard/financiamiento/mesa-control',
    SOPORTE: '/dashboard/soporte/mis-tickets',
    CLIENTE: '/dashboard/usuarios/solicitudes',
};

export function getDefaultRouteForRole(role: RolAplicacion): string {
    return DEFAULT_ROUTE_BY_ROLE[role];
}
export const ROUTE_PERMISSIONS: RoutePermission[] = [
    // STRICT_ROUTES primero y sin derivación de SUPERVISOR.
    ...STRICT_ROUTES,
    ...[
        ...flattenNavConfig(navConfig),
        { pattern: settingsNavItem.href!, roles: settingsNavItem.roles },
        ...EXTRA_ROUTES,
    ].map((r) => ({ ...r, roles: conSupervisor(r.roles) })),
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
export function getRolesForPath(pathname: string): RolAplicacion[] | null {
    const match = ROUTE_PERMISSIONS.find((r) => patternToRegex(r.pattern).test(pathname));
    return match ? match.roles : null;
}