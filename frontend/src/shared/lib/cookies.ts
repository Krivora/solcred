// shared/lib/utils/cookies.ts
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días, ajusta según tu JWT expiry

export function setCookie(name: string, value: string, maxAge = COOKIE_MAX_AGE_SECONDS): void {
    if (typeof document === 'undefined') return; // guard SSR

    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

export function deleteCookie(name: string): void {
    if (typeof document === 'undefined') return;

    document.cookie = `${name}=; path=/; max-age=0`;
}