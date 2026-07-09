// Helpers mínimos para cookies client-side, sin dependencias extra.
// Se usan solo para exponer sesión/rol al middleware (Edge Runtime),
// que no tiene acceso a localStorage. La seguridad real de los datos
// la sigue dando Express validando el Bearer token en cada request.

const MAX_AGE_DAYS = 7;

export function setCookie(name: string, value: string): void {
    const maxAge = MAX_AGE_DAYS * 24 * 60 * 60;
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function deleteCookie(name: string): void {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}