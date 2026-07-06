import { sileo } from 'sileo'
// ============================================
// Auth
// ============================================
export const authToast = {
    loginSuccess: () =>
        sileo.success({
            title: 'Bienvenido de vuelta',
        }),

    loginError: (message?: string) =>
        sileo.error({
            title: 'Error al iniciar sesión',
            description: message ?? 'Credenciales inválidas',
        }),

    registerSuccess: () =>
        sileo.success({
            title: 'Cuenta creada correctamente',
            description: 'Ya puedes iniciar sesión',
        }),

    registerError: (message?: string) =>
        sileo.error({
            title: 'Error al crear cuenta',
            description: message ?? 'Intenta nuevamente',
        }),

    logoutSuccess: () =>
        sileo.info({
            title: 'Sesión cerrada',
            description: 'Has cerrado sesión correctamente',
        }),

    unauthorized: () =>
        sileo.error({
            title: 'Sesión expirada',
            description: 'Vuelve a iniciar sesión',
        }),
}
// ============================================
// DOCUMENTOS
// ============================================
export const documentoToast = {
    subidaExitosa: (version: number) =>
        sileo.success({
            title: 'Documento cargado',
            description: `Versión ${version} cargada correctamente`,
        }),
    subidaError: (message?: string) =>
        sileo.error({
            title: 'Error al subir documento',
            description: message ?? 'Intenta nuevamente',
        }),
    downloadError: (message?: string) =>
        sileo.error({
            title: 'Error al descargar documento',
            description: message ?? 'Intenta nuevamente',
        }),
    eliminacionExitosa: () =>
        sileo.success({
            title: 'Documento eliminado',
        }),
    eliminacionError: (message?: string) =>
        sileo.error({
            title: 'Error al eliminar documento',
            description: message ?? 'Intenta nuevamente',
        }),
    actualizacionExitosa: () =>
        sileo.success({
            title: 'Documento actualizado',
        }),
    actualizacionError: (message?: string) =>
        sileo.error({
            title: 'Error al actualizar documento',
            description: message ?? 'Intenta nuevamente',
        }),
}
// ============================================
// EXPEDIENTE
// ============================================
export const expedienteToast = {
    // Carga
    cargaError: (message?: string) =>
        sileo.error({
            title: 'Error al cargar el expediente',
            description: message ?? 'Intenta nuevamente',
        }),
    historialError: (message?: string) =>
        sileo.error({
            title: 'Error al cargar el historial',
            description: message ?? 'Intenta nuevamente',
        }),
    // Validación
    documentoAprobado: () =>
        sileo.success({
            title: 'Documento aprobado',
            description: 'El documento fue aprobado correctamente',
        }),
    documentoRechazado: () =>
        sileo.warning({
            title: 'Documento rechazado',
            description: 'El documento fue rechazado',
        }),
    validacionError: (message?: string) =>
        sileo.error({
            title: 'Error al validar el documento',
            description: message ?? 'Intenta nuevamente',
        }),
    // Historial
    historialVacio: () =>
        sileo.info({
            title: 'Sin historial',
            description: 'No existen versiones previas del documento',
        }),
}