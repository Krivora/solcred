import { toast } from 'sonner'

// ============================================
// Auth
// ============================================
export const authToast = {
    loginSuccess: () =>
        toast.info('Bienvenido de vuelta'),

    loginError: (message?: string) =>
        toast.error('Error al iniciar sesión', {
            description: message ?? 'Credenciales inválidas',
        }),

    registerSuccess: () =>
        toast.success('Cuenta creada correctamente', {
            description: 'Ya puedes iniciar sesión',
        }),

    registerError: (message?: string) =>
        toast.error('Error al crear cuenta', {
            description: message ?? 'Intenta nuevamente',
        }),

    logoutSuccess: () =>
        toast.info('Sesión cerrada', {
            description: 'Has cerrado sesión correctamente',
        }),

    unauthorized: () =>
        toast.error('Sesión expirada', {
            description: 'Vuelve a iniciar sesión',
        }),
}

// ============================================
// DOCUMENTOS
// ============================================
export const documentoToast = {
    subidaExitosa: (version: number) =>
        toast.success('Documento cargado', {
            description: `Versión ${version} cargada correctamente`,
        }),
    subidaError: (message?: string) =>
        toast.error('Error al subir documento', {
            description: message ?? 'Intenta nuevamente',
        }),
    downloadError: (message?: string) =>
        toast.error('Error al descargar documento', {
            description: message ?? 'Intenta nuevamente',
        }),
    eliminacionExitosa: () =>
        toast.success('Documento eliminado'),
    eliminacionError: (message?: string) =>
        toast.error('Error al eliminar documento', {
            description: message ?? 'Intenta nuevamente',
        }),
    actualizacionExitosa: () =>
        toast.success('Documento actualizado'),
    actualizacionError: (message?: string) =>
        toast.error('Error al actualizar documento', {
            description: message ?? 'Intenta nuevamente',
        }),
}

// ============================================
// EXPEDIENTE
// ============================================
export const expedienteToast = {
    cargaError: (message?: string) =>
        toast.error('Error al cargar el expediente', {
            description: message ?? 'Intenta nuevamente',
        }),
    historialError: (message?: string) =>
        toast.error('Error al cargar el historial', {
            description: message ?? 'Intenta nuevamente',
        }),
    documentoAprobado: () =>
        toast.success('Documento aprobado', {
            description: 'El documento fue aprobado correctamente',
        }),
    documentoRechazado: () =>
        toast.warning('Documento rechazado', {
            description: 'El documento fue rechazado',
        }),
    validacionError: (message?: string) =>
        toast.error('Error al validar el documento', {
            description: message ?? 'Intenta nuevamente',
        }),
    historialVacio: () =>
        toast.info('Sin historial', {
            description: 'No existen versiones previas del documento',
        }),
}

// ============================================
// SOLICITUDES
// ============================================
export const solicitudToast = {
    devuelta: () =>
        toast.success('Solicitud devuelta al solicitante'),
    devolverError: (message?: string) =>
        toast.error('Error al devolver la solicitud', {
            description: message ?? 'Intenta nuevamente',
        }),

    regresada: () =>
        toast.success('Solicitud regresada al promotor'),
    regresarError: (message?: string) =>
        toast.error('Error al regresar la solicitud', {
            description: message ?? 'Intenta nuevamente',
        }),

    enviadaAAprobacion: () =>
        toast.success('Solicitud enviada a aprobación'),
    enviarAAprobacionError: (message?: string) =>
        toast.error('Error al enviar a aprobación', {
            description: message ?? 'Intenta nuevamente',
        }),

    enviadaAFinanciamiento: () =>
        toast.success('Solicitud enviada a financiamiento'),
    enviarAFinanciamientoError: (message?: string) =>
        toast.error('Error al enviar a financiamiento', {
            description: message ?? 'Intenta nuevamente',
        }),

    cancelada: () =>
        toast.success('Solicitud cancelada'),
    cancelarError: (message?: string) =>
        toast.error('Error al cancelar la solicitud', {
            description: message ?? 'Intenta nuevamente',
        }),

    rechazada: () =>
        toast.success('Solicitud rechazada'),
    rechazarError: (message?: string) =>
        toast.error('Error al rechazar la solicitud', {
            description: message ?? 'Intenta nuevamente',
        }),
    cargarSolicitudesError: (message?: string) =>
        toast.error('Error al cargar solicitudes', {
            description: message ?? 'Intenta nuevamente',
        }),

    cargarGestoresError: (message?: string) =>
        toast.error('Error al cargar gestores', {
            description: message ?? 'Intenta nuevamente',
        }),

    asignadaManualmente: () =>
        toast.success('Solicitud asignada correctamente'),
    asignadaAutomaticamente: () =>
        toast.success('Solicitud asignada automáticamente'),
    asignarError: (message?: string) =>
        toast.error('Error al asignar solicitud', {
            description: message ?? 'Intenta nuevamente',
        }),
}

// ============================================
// GRUPOS
// ============================================
export const grupoToast = {
    creado: () =>
        toast.success('Grupo creado correctamente'),
    crearError: (message?: string) =>
        toast.error('Error al crear grupo', {
            description: message ?? 'Intenta nuevamente',
        }),

    actualizado: () =>
        toast.success('Grupo actualizado correctamente'),
    actualizarError: (message?: string) =>
        toast.error('Error al actualizar grupo', {
            description: message ?? 'Intenta nuevamente',
        }),

    desactivado: () =>
        toast.success('Grupo desactivado correctamente'),
    eliminarError: (message?: string) =>
        toast.error('Error al eliminar grupo', {
            description: message ?? 'Intenta nuevamente',
        }),
}

// ============================================
// PROGRAMAS
// ============================================
export const programaToast = {
    creado: (nombre: string) =>
        toast.success('Programa creado', {
            description: `El programa "${nombre}" ya está disponible en el sistema`,
        }),
    crearError: (message?: string) =>
        toast.error('Error al crear el programa', {
            description: message ?? 'Ocurrió un error inesperado, intenta de nuevo',
        }),

    actualizado: (nombre: string) =>
        toast.success('Programa actualizado', {
            description: `Los cambios en "${nombre}" se guardaron correctamente`,
        }),
    actualizarError: (message?: string) =>
        toast.error('Error al actualizar el programa', {
            description: message ?? 'Ocurrió un error inesperado, intenta de nuevo',
        }),

    documentosParciales: (fallidos: number) =>
        toast.warning('Algunos documentos no se adjuntaron', {
            description: `El programa se creó, pero ${fallidos} documento(s) quedaron pendientes. Agrégalos desde la edición.`,
        }),

    activado: () =>
        toast.success('Programa activado'),
    desactivado: () =>
        toast.success('Programa desactivado'),
    cambiarEstadoError: (message?: string) =>
        toast.error('Error al cambiar el estado del programa', {
            description: message ?? 'Intenta nuevamente',
        }),

    tipoDocumentoCreado: () =>
        toast.success('Tipo de documento creado', {
            description: 'El tipo de documento se ha creado correctamente',
        }),
    tipoDocumentoActualizado: () =>
        toast.success('Tipo de documento actualizado'),
    tipoDocumentoEliminado: () =>
        toast.success('Tipo de documento eliminado'),
    tipoDocumentoError: (message?: string) =>
        toast.error('Error al guardar', {
            description: message ?? 'Ocurrió un error inesperado, intenta de nuevo',
        }),

    documentoAgregado: () =>
        toast.success('Documento agregado al programa'),
    documentoAgregarError: (message?: string) =>
        toast.error('Error al agregar documento', {
            description: message ?? 'Intenta nuevamente',
        }),

    documentoQuitado: () =>
        toast.success('Documento quitado del programa'),
    documentoQuitarError: (message?: string) =>
        toast.error('Error al quitar documento', {
            description: message ?? 'Intenta nuevamente',
        }),

    cargarError: (message?: string) =>
        toast.error('Error al cargar programas', {
            description: message ?? 'Intenta nuevamente',
        }),

    faltaTipoSolicitante: () =>
        toast.warning('Selecciona al menos un tipo de solicitante'),
}

// ============================================
// USUARIOS
// ============================================
export const usuarioToast = {
    cargarError: () =>
        toast.error('Error al cargar usuarios'),

    actualizado: () =>
        toast.success('Usuario actualizado correctamente'),
    actualizarError: () =>
        toast.error('Error al actualizar el usuario'),

    rolActualizado: () =>
        toast.success('Rol actualizado correctamente'),
    cambiarRolError: () =>
        toast.error('Error al cambiar el rol'),

    // ── NUEVO ──
    accesoRevocado: () =>
        toast.success('Acceso de personal revocado, el usuario ahora es CLIENTE'),
    revocarAccesoError: () =>
        toast.error('Error al revocar el acceso de personal'),

    desactivado: () =>
        toast.success('Usuario desactivado'),
    desactivarError: () =>
        toast.error('Error al desactivar el usuario'),
}
const POSICION_FORM = 'top-center' as const

export const solicitudesToast = {
  creada: () =>
    toast.success('Solicitud creada', {
      description: 'Continuemos con los datos generales',
      position: POSICION_FORM,
    }),

  generalesGuardados: () =>
    toast.success('Datos generales guardados', { position: POSICION_FORM }),

  solicitanteGuardado: () =>
    toast.success('Datos del solicitante guardados', { position: POSICION_FORM }),

  avalGuardado: () =>
    toast.success('Datos del aval guardados', { position: POSICION_FORM }),

  avalOmitido: () =>
    toast.info('Aval omitido', {
      description: 'Podrás agregarlo más adelante',
      position: POSICION_FORM,
    }),

  creditoGuardado: () =>
    toast.success('Datos del crédito guardados', { position: POSICION_FORM }),

  garantiaGuardada: () =>
    toast.success('Datos de garantía guardados', { position: POSICION_FORM }),

  negocioGuardado: () =>
    toast.success('Datos del negocio guardados', { position: POSICION_FORM }),

  mercadoGuardado: () =>
    toast.success('Datos de mercado guardados', { position: POSICION_FORM }),

  bancariosGuardados: () =>
    toast.success('Datos bancarios guardados', { position: POSICION_FORM }),

  solicitudEnviada: () =>
    toast.success('Solicitud enviada', {
      description: 'Te notificaremos sobre el avance',
      position: POSICION_FORM,
    }),

  error: (titulo: string, message?: string) =>
    toast.error(titulo, {
      description: message,
      position: POSICION_FORM,
    }),
}