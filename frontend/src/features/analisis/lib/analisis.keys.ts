export const analisisKeys = {
  all: ['analisis'] as const,
  detalle: (solicitudId: string) => [...analisisKeys.all, solicitudId] as const,
}
