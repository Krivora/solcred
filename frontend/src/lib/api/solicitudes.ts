import {
    Solicitud,
    CrearSolicitudPayload,
    ActualizarDatosPersonaPayload,
} from '@/lib/types/solicitudes.types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function getHeaders(): HeadersInit {
    const token =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function handleResponse<T>(res: Response): Promise<T> {
    const body = await res.json();
    if (!res.ok || !body.success) {
        throw new Error(body.message ?? 'Error desconocido');
    }
    return body.data as T;
}

// ─── Listar mis solicitudes ────────────────────────────────────────────────────

export async function getMisSolicitudes(): Promise<Solicitud[]> {
    const res = await fetch(`${BASE}/api/solicitudes`, {
        headers: getHeaders(),
    });
    return handleResponse<Solicitud[]>(res);
}

// ─── Obtener solicitud por ID ──────────────────────────────────────────────────

export async function getSolicitud(id: string): Promise<Solicitud> {
    const res = await fetch(`${BASE}/api/solicitudes/${id}`, {
        headers: getHeaders(),
    });
    return handleResponse<Solicitud>(res);
}

// ─── Crear solicitud (Step 1) ─────────────────────────────────────────────────

export async function crearSolicitud(
    payload: CrearSolicitudPayload
): Promise<Solicitud> {
    const res = await fetch(`${BASE}/api/solicitudes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse<Solicitud>(res);
}

// ─── Actualizar datos del solicitante (Step 2) ────────────────────────────────

export async function actualizarDatosSolicitante(
    id: string,
    payload: ActualizarDatosPersonaPayload
): Promise<Solicitud> {
    const res = await fetch(`${BASE}/api/solicitudes/${id}/solicitante`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse<Solicitud>(res);
}

// ─── Actualizar datos del aval (Step 3) ───────────────────────────────────────

export async function actualizarDatosAval(
    id: string,
    payload: ActualizarDatosPersonaPayload
): Promise<Solicitud> {
    const res = await fetch(`${BASE}/api/solicitudes/${id}/aval`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse<Solicitud>(res);
}

// ─── Enviar solicitud (BORRADOR → PENDIENTE) ──────────────────────────────────

export async function enviarSolicitud(id: string): Promise<Solicitud> {
    const res = await fetch(`${BASE}/api/solicitudes/${id}/enviar`, {
        method: 'PATCH',
        headers: getHeaders(),
    });
    return handleResponse<Solicitud>(res);
}