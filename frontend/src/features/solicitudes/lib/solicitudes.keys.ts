export const solicitudesKeys = {
    all: ['solicitudes'] as const,
    mias: () => [...solicitudesKeys.all, 'mias'] as const,
    detail: (id: string) => [...solicitudesKeys.all, 'detail', id] as const,
}
