# Revisión de seguridad — SolCred

> Corresponde a la actividad 6 del plan de trabajo (`documentacion.md` §9):
> "Cerrar solo lectura de `SUPERVISOR` y revisión de seguridad".
>
> Última revisión: 2 de septiembre de 2026.

Este documento registra el estado de los puntos de seguridad revisados: qué se
implementó en esta pasada y qué queda pendiente (con su justificación), para que
nadie lo "descubra" en producción.

---

## 1. Modo solo lectura de `SUPERVISOR`

**Estado: cerrado.**

`SUPERVISOR` es un "ADMIN de solo lectura": ve lo mismo que un administrador pero
no ejecuta ninguna acción.

| Capa | Mecanismo |
|---|---|
| Backend (raíz) | Middleware `soloLecturaSupervisor` montado en todos los routers de escritura: rechaza `POST/PUT/PATCH/DELETE` con `403 SOLO_LECTURA`, salvo un allowlist explícito (previsualizar/exportar reporte, informe ejecutivo, y auto-servicio de sus propios tickets de Soporte). |
| Backend (endpoint) | `autorizar(...)` por ruta: las de escritura no incluyen `SUPERVISOR`. |
| Frontend (ruta) | `middleware.ts` + `route-permissions.config.ts`: `SUPERVISOR` se deriva a toda ruta de `ADMIN` **excepto** las de acción registradas en `STRICT_ROUTES` (`/dashboard/admin/configuracion/programas/nuevo` y `/programas/:id/editar`), que lo redirigen a `/unauthorized`. |
| Frontend (UI) | Banner global `ModoSoloLecturaBanner` + helper `useEsSoloLectura()` para ocultar/deshabilitar controles. |

### Residual cerrado en esta pasada

- **Detalle de programa** (`configuracion/programas/[id]/page.tsx`): los botones
  "Activar/Desactivar" y "Editar" ahora se ocultan para `SUPERVISOR`.
- **`DocumentosPrograma`**: el panel de alta de documento, los botones de quitar
  y el diálogo de nuevo tipo se ocultan en modo solo lectura (se usa tanto en el
  detalle como en el formulario).
- **`ProgramaForm`**: la ruta ya redirige a `SUPERVISOR`; además el formulario
  queda inerte (`<fieldset disabled>` + `onSubmit` early-return + submit
  deshabilitado) como defensa en profundidad.
- **Herramienta de análisis**: ya era de solo lectura para `SUPERVISOR` — el
  backend devuelve `editable: false` (no es el analista asignado) y todos los
  campos/botones de mutación penden de esa bandera. Lo único visible es el
  Informe Ejecutivo (permitido a `SUPERVISOR` por el allowlist, no muta) y los
  export CSV (client-side).

---

## 2. Rate limiting

**Estado: implementado en los endpoints sensibles de auth; el resto ya tenía límite propio.**

| Endpoint | Límite | Nota |
|---|---|---|
| Global (toda la API) | 1000 / 15 min / IP | `index.ts` |
| `POST /api/auth/login` | **10 / 15 min / IP**, `skipSuccessfulRequests` | **nuevo** — fuerza bruta de credenciales |
| `POST /api/auth/registro` | **5 / 1 h / IP** | **nuevo** — alta masiva de cuentas |
| `POST /api/auth/refresh` | 60 / 15 min / IP | ya existía |
| `POST /api/admin/reportes/solicitudes/exportar` | 20 / 15 min / IP | ya existía — datos personales en bloque |
| `GET /api/uploads/:solicitudId/:documentoId` | 30 / 5 min / IP | ya existía |
| `GET /api/soporte/tickets/:id/adjuntos/:adjuntoId` | 40 / 5 min / IP | ya existía |

- **`app.set("trust proxy", N)`** añadido en `index.ts` (`TRUST_PROXY`, por
  defecto `1`). Sin esto, detrás de un proxy todas las peticiones comparten la
  IP del proxy y el rate-limit por IP es inútil (o, peor, `express-rate-limit`
  falla su validación). Se usa un número de saltos, nunca `true`.

---

## 3. Política de contraseñas

**Estado: centralizada.**

- `backend/src/modules/auth/auth.schema.ts` expone `contrasenaSchema` como fuente
  única: **≥ 8 y ≤ 128 caracteres, con minúscula, mayúscula, número y símbolo**.
  La consume `registroSchema` y la consumirá cualquier flujo futuro de
  alta/cambio de contraseña.
- Está en **paridad** con la del frontend
  (`frontend/src/shared/schemas/auth.schema.ts`, `PASSWORD_REGEX`).
- `loginSchema` **no** aplica la política (solo exige que venga una contraseña):
  endurecer la política no debe dejar fuera a cuentas creadas antes.
- Hashing: `bcryptjs`, coste 10 (`utils/bcrypt.ts`, seed).

---

## 4. Expiración de sesión configurable por rol

**Estado: implementado.**

`backend/src/config/sesion.config.ts` — `ttlSesion(rol)`:

| Perfil | Access token | Refresh (ventana deslizante) | Env override |
|---|---|---|---|
| `CLIENTE` | 15 min | 30 días | `REFRESH_TTL_DIAS_CLIENTE` |
| Staff operativo (`GESTOR`, `ANALISTA`, `MESA_CONTROL`, `SOPORTE`) | 15 min | 7 días | `REFRESH_TTL_DIAS` |
| Staff sensible (`ADMIN`, `SUPERVISOR`, `ENCARGADO_PROMOCION`, `ENCARGADO_FINANCIAMIENTO`) | 15 min | 2 días | `REFRESH_TTL_DIAS_SENSIBLE` |

- El access token dura lo mismo para todos (se renueva de forma transparente);
  lo que varía es la ventana de refresh: a más poder del rol, antes caduca una
  sesión inactiva.
- El TTL se aplica tanto a la fila `SesionRefresh.expiraEn` como al `maxAge` de
  la cookie `sc_refresh`. `auth.service` propaga el `rol` efectivo al emitir y al
  rotar.

---

## 5. Pendientes evaluados (no implementados)

| Punto | Riesgo | Por qué no ahora |
|---|---|---|
| **Lockout por cuenta** tras N intentos fallidos (además del rate-limit por IP) | Fuerza bruta distribuida (rotando IP) contra una cuenta concreta | Requiere columna/tabla nueva en Prisma + migración + lógica de desbloqueo. El rate-limit por IP + contraseñas fuertes cubren el caso común. Candidato a una pasada futura junto con notificaciones (avisar al usuario del bloqueo). |
| **Enumeración de usuarios en `POST /registro`** | Responde `409 "El correo ya está registrado"`, revela qué correos tienen cuenta | Cambiarlo a una respuesta genérica + correo de "ya tienes cuenta" depende del servicio de notificaciones (plan §1). El `login` **sí** es genérico (`"Credenciales inválidas"` para usuario inexistente y contraseña mala). |
| **CSP explícita** (`helmet` va con defaults) | Bajo: la API sólo devuelve JSON, no HTML | El frontend (Next.js) es quien sirve HTML y define su propia CSP. |
| **`COOKIE_SECURE=true` en producción** | La cookie de refresh viajaría por HTTP si se despliega mal | Es config de despliegue, no de código. **Checklist de deploy:** `COOKIE_SECURE=true`, `FRONTEND_URL` real, `JWT_SECRET` fuerte, `TRUST_PROXY` acorde a la topología. |
| **Rotar `JWT_SECRET`** | Sin `kid`/versión, rotar invalida todas las sesiones de golpe | Aceptable para el tamaño actual; el refresh token opaco ya permite revocación fina. |

---

## 6. Checklist de despliegue (seguridad)

- [ ] `JWT_SECRET` — cadena aleatoria larga, distinta por ambiente.
- [ ] `COOKIE_SECURE=true` (HTTPS).
- [ ] `TRUST_PROXY` — número de proxies delante del backend (`1` para un Nginx).
- [ ] `FRONTEND_URL` — origen exacto del front (CORS con `credentials`).
- [ ] `REFRESH_TTL_DIAS*` — ajustar si la política de la organización difiere.
- [ ] Revisar que `uploads/` no sea servible directamente por el proxy (las
      descargas pasan por endpoint autenticado con verificación de propiedad).

---

## 7. Trazabilidad de documentos

**Estado: implementado (mejora C.11).**

- Todo PDF servido por la API (documentos del expediente + los 5 generados)
  lleva **marca de agua** con `folio + nombre y rol de quien consulta + fecha/
  hora`, estampada en el servidor con `pdf-lib` (`shared/pdf/watermark.ts`).
  Sobrevive a descargar y reenviar el archivo. Es *best-effort* — ver
  `KNOWN-ISSUES.md` §3.
- La consulta de cada documento del expediente ya quedaba en `LogAuditoria`
  (`CONSULTAR` / `SOLICITUDES`); la marca añade el rastro *dentro* del archivo.
- Es una medida disuasoria/forense, no un control de acceso: no cifra ni impide
  la edición del PDF.

---

## 8. Auditoría de accesos de lectura y exportación del log

**Estado: implementado (mejora C.13).**

- `GET /admin/logs/exportar` (`ADMIN`/`SUPERVISOR`, rate-limit propio de 20/15
  min — mismo criterio que `admin/reportes`) exporta a Excel **todo** lo que
  cumpla los filtros activos, no solo la página cargada en pantalla como hacía
  antes el botón del frontend. Tope de `MAX_FILAS_EXPORT_LOGS` (20,000) con
  aviso de truncado, igual que el reporte de negocio — el log también trae
  datos personales en bloque (correo, IP).
- El filtro por `modulo` del endpoint de logs (`filtrosLogSchema`) estaba
  desactualizado (le faltaban `SOPORTE`/`CRM`, agregados después al enum de
  Prisma); ahora se deriva con `z.nativeEnum(...)` para que no vuelva a
  divergir.
- El historial de comunicaciones del CRM (`GET /crm/comunicaciones`, `GET
  /crm/comunicaciones/resumen/:solicitudId`) no dejaba ningún rastro de
  auditoría al leerse — a diferencia del expediente, los documentos y el
  detalle de solicitud, que ya registraban `CONSULTAR`. Ahora sí, con el
  mismo patrón (`registrarLog`, módulo `CRM`).
