# Documentación general — SolCred

> Sistema de gestión de solicitudes de crédito: desde que un cliente llena su
> solicitud hasta que el comité la aprueba o rechaza, pasando por la revisión
> de datos, la carga de documentos y (cuando ese módulo exista) el análisis
> financiero.
>
> Última actualización: 2 de septiembre de 2026.

---

## 1. Descripción general del proyecto

SolCred es una plataforma web para digitalizar el ciclo completo de una
solicitud de crédito de una institución financiera: el cliente la llena en
línea, adjunta su expediente digital (identificaciones, comprobantes,
garantías, etc.), y el personal interno la revisa, la valida y decide si se
aprueba.

El sistema tiene dos caras:

- **Portal del cliente** (`CLIENTE`): formulario guiado por pasos para crear
  la solicitud, tablero de "mis solicitudes" y expediente digital para subir
  y dar seguimiento a sus documentos.
- **Panel administrativo** (personal interno: `ADMIN`, `GESTOR`, `ANALISTA`,
  `SUPERVISOR`): cola de solicitudes, asignación a gestores, validación de
  documentos, aprobación/rechazo, y configuración del catálogo (programas de
  crédito, tipos de documento, usuarios, grupos de gestión).

Es un monorepo con `backend/` (API REST) y `frontend/` (aplicación web), cada
uno con su propio `package.json` — no es un monorepo con workspaces.

## 2. Objetivo del proyecto

Reemplazar un proceso de solicitud de crédito hecho en papel/Excel/correo por
uno digital, trazable y auditable, que:

- Reduzca el tiempo entre que un cliente solicita un crédito y recibe una
  respuesta, al eliminar idas y vueltas manuales de documentos.
- Dé visibilidad en tiempo real del estatus de cada solicitud, tanto al
  cliente como al personal interno.
- Reparta la carga de trabajo entre gestores de forma controlada (por reglas
  o manualmente) en vez de por asignación ad hoc.
- Dexe un rastro de auditoría de quién hizo qué y cuándo (cambios de estatus,
  validaciones de documentos, acciones administrativas).
- Sirva de base para, más adelante, incorporar el análisis financiero
  (capacidad de pago) como una etapa formal del proceso, no un paso informal
  fuera del sistema.

## 3. Funcionamiento del sistema

### 3.1 Roles y qué ve cada uno

| Rol | Tipo de usuario | Qué hace en el sistema |
|---|---|---|
| *(todos los roles)* | — | Además de lo suyo, **cualquier usuario** puede abrir tickets de **Soporte** y darles seguimiento en "Mis Tickets". Los **agentes** que resuelven tickets son los `ADMIN`. |
| **Cliente** | `CLIENTE` | Llena y envía su solicitud, sube documentos a su expediente, consulta su estatus. |
| **Gestor** | `PERSONAL` / `GESTOR` | Primer filtro ("Promoción"): revisa datos y documentos de las solicitudes que le asignan, las corrige/devuelve o las manda a aprobación. |
| **Analista** | `PERSONAL` / `ANALISTA` | Segundo filtro ("Financiamiento"): recibe casos asignados (Mis Casos), hace el **análisis financiero** (herramienta de 5 pestañas, todas implementadas: Situación Financiera, Ajustes del Crédito, Criterios de Evaluación, Amortización y Comentario) y los envía a validación. |
| **Admin** | `PERSONAL` / `ADMIN` | Ve y hace todo lo anterior, además de administrar el catálogo del sistema (programas de crédito, tipos de documento, usuarios, grupos de gestión, logs) y de **atender los tickets de Soporte** como agente: asignar, priorizar, responder, resolver y cerrar. |
| **Encargado de Promoción** | `PERSONAL` / `ENCARGADO_PROMOCION` | Jefatura del área de Promoción: ve **todas** las solicitudes (no solo las asignadas a él), opera Asignación y toda la etapa de **Aprobación** (aprobar/enviar a financiamiento, rechazar, regresar al promotor). No trabaja una cola propia de "Mis Casos". |
| **Encargado de Financiamiento** | `PERSONAL` / `ENCARGADO_FINANCIAMIENTO` | Jefatura del área de Financiamiento: asigna analistas y opera **Validación** y **Comité de Crédito** (hasta `APROBADO` / `RECHAZADO`). No opera Mesa de Control ni el análisis en sí. |
| **Mesa de Control** | `PERSONAL` / `MESA_CONTROL` | Solo la etapa **Mesa de Control** de Financiamiento: revisa info/docs del caso al llegar de aprobación y lo pasa a asignación o lo regresa. Sin acceso al resto del sistema. |
| **Supervisor** | `PERSONAL` / `SUPERVISOR` | **ADMIN de solo lectura**: ve exactamente lo mismo que un administrador (todo Promoción, Financiamiento, Reportes, panorama y configuración) pero **no puede ejecutar ninguna acción**. El backend lo bloquea de raíz (middleware `soloLecturaSupervisor`: rechaza todo `POST/PUT/PATCH/DELETE` salvo previsualizar/exportar reporte e informe ejecutivo, que no mutan). El frontend muestra un banner de "modo solo lectura" y oculta los controles de acción. |
| **Soporte** (usuario interno) | `PERSONAL` / `SOPORTE` | Usuario interno con acceso **únicamente** a "Mis Tickets" (`/dashboard/soporte/*`) — abre y sigue sus propios tickets. No es agente; sin acceso a Promoción, Financiamiento, Reportes ni configuración. |

### 3.2 Ciclo de vida de una solicitud

Una solicitud avanza por una máquina de estados controlada por el backend
(`EstatusSolicitud`). Los cambios quedan registrados uno por uno en
`HistorialEstatus` (quién, cuándo, de qué estatus a cuál y por qué), y ese
historial es lo que arma el timeline que se ve en el detalle de la
solicitud.

```
─── PROMOCIÓN ──────────────────────────────────────────────────────────
BORRADOR                  el cliente va llenando los pasos del formulario
   │  (cliente envía)
   ▼
PENDIENTE                 enviada, esperando que se le asigne un gestor
   │  (se asigna un gestor — automática por reglas, o manual)
   ▼
EN_REVISION  ─────────────────────┐
   │  (el gestor manda a          │ (el gestor detecta algo mal y
   │   aprobación)                │  la devuelve al cliente)
   ▼                              ▼
EN_APROBACION                EN_CORRECCION  → el cliente corrige y reenvía
   │        │        │                        → EN_REVISION
   │        │        └──(comité regresa al promotor)──► EN_REVISION
   │        └──(comité rechaza)──► RECHAZADO   [final]
   │  (comité envía a financiamiento)
   ▼
─── FINANCIAMIENTO ─────────────────────────────────────────────────────
EN_FINANCIAMIENTO         Mesa de Control (MESA_CONTROL): revisión adicional de info/docs
   │  (mesa pasa a asignación)         └──(regresa a aprobación)──► EN_APROBACION
   ▼
EN_ASIGNACION             cola de asignación de analista
   │  (se asigna un analista)
   ▼
EN_ANALISIS               el analista trabaja el caso (Mis Casos)
   │  (analista envía a validación)
   ▼
EN_VALIDACION  ───────────► (regresa a analista)──► EN_ANALISIS
   │  (validación envía a comité)      └──(rechaza)──► RECHAZADO [final]
   ▼
EN_COMITE      ───────────► (regresa a validación)──► EN_VALIDACION
   │  (comité aprueba)                 └──(rechaza)──► RECHAZADO [final]
   ▼
APROBADO   [estatus final]

En cualquier etapa no-final → CANCELADO [final]
```

El flujo de Financiamiento está **completo** (backend `admin/financiamiento` + 5
pantallas). Cada salto queda en `HistorialEstatus` con su motivo, y el timeline
del detalle también muestra la asignación de analista.

### 3.3 Expediente digital y validación de documentos

Cada programa de crédito define qué tipos de documento requiere (obligatorios
u opcionales, y si aplican a persona física, moral o ambas). Al crear una
solicitud, el expediente se arma automáticamente con esa lista. El cliente
sube un PDF por cada tipo; un gestor (o admin) lo aprueba o rechaza con un
motivo. Si lo rechaza, el cliente puede volver a subir una nueva versión —
el historial de versiones queda completo (quién subió qué, quién validó,
cuándo, con qué resultado).

Los documentos se consultan en un **visor embebido** dentro de la app (modal
con el PDF, más botones de descargar y abrir en pestaña), no en una pestaña
suelta del navegador. Cada consulta queda en el log de auditoría y el PDF que
se sirve lleva **marca de agua de trazabilidad** — ver §3.4.

### 3.4 Generación de documentos (PDF)

> **Marca de agua de trazabilidad.** Todo PDF que sirve la API —los 5 generados
> de esta sección **y** los documentos del expediente que sube el cliente— pasa
> por `shared/pdf/watermark.ts` antes de salir: cada página recibe una diagonal
> tenue y una línea al pie con `folio + nombre y rol de quien consulta + fecha/
> hora`. Se estampa con `pdf-lib` (JS puro). Es *best-effort*: si `pdf-lib` no
> puede parsear el archivo se sirve el original sin marca (ver `KNOWN-ISSUES.md`).

El backend genera 5 documentos PDF con Puppeteer a partir de plantillas HTML
propias:

- PDF de la solicitud completa.
- Tarjeta informativa (resumen ejecutivo del crédito).
- Carta de rechazo (cuando la solicitud se rechaza, con motivo).
- Acuse de entrega del expediente.
- **Informe Ejecutivo de Crédito** (financiamiento): forma de una plana para el
  comité con identificación del solicitante, términos y condiciones ajustados,
  programa de inversión, situación financiera mensual (actual/proyectado + pago y
  capacidad de pago), garantías, comentarios del analista y firmas del comité.
  El frontend calcula los números (reusando los `lib/` de las pestañas) y los
  manda a `POST /admin/analisis/:id/informe-ejecutivo`; el backend arma el resto
  y renderiza. Los firmantes son configurables en
  `analisis/informe-firmas.config.ts`.

## 4. Arquitectura y tecnologías

### 4.1 Backend (`backend/`)

| Componente | Tecnología |
|---|---|
| Runtime / lenguaje | Node.js + TypeScript, ejecutado con `tsx` (dev) / compilado con `tsc` (prod) |
| Framework HTTP | Express 5 |
| Base de datos | PostgreSQL, vía Prisma ORM 7 (`@prisma/adapter-pg`) |
| Autenticación | JWT propio (`jsonwebtoken`) de vida corta (access token, 15 min) + **refresh token** opaco en cookie `httpOnly` (`sc_refresh`, ámbito `/api/auth`), con rotación en cada uso, detección de reuso por familia y **ventana deslizante configurable por rol** (`config/sesion.config.ts`: 30 d cliente, 7 d staff operativo, 2 d staff sensible —ADMIN/SUPERVISOR/ENCARGADO_*—; overridable por env). Persistido en `SesionRefresh` (solo el hash SHA-256). El front renueva el access token de forma transparente al recibir un 401 `TOKEN_EXPIRADO`. Rate-limit dedicado en `login` (10/15 min, solo fallidos) y `registro` (5/h). |
| Contraseñas | `bcryptjs` |
| Subida de archivos | `multer` en memoria + validación de magic bytes antes de escribir a disco (`uploads/expedientes/`, almacenamiento **local**, no en la nube) |
| Generación de PDF | `puppeteer` sobre plantillas HTML propias; `pdf-lib` para estampar la marca de agua de trazabilidad al servir |
| Validación de entrada | `zod` en cada endpoint de escritura |
| Seguridad de transporte | `helmet`, `cors`, `express-rate-limit` |
| Logs de auditoría | Módulo propio (`registrarLog`) que persiste cada acción sensible en `LogAuditoria` |

Estructura: `src/modules/<dominio>/{*.routes,*.controller,*.service,*.schema}.ts`
por módulo, más `src/middlewares/`, `src/shared/` (PDF), `src/utils/`
(jwt, bcrypt, respuesta estándar, auditoría).

### 4.2 Frontend (`frontend/`)

| Componente | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Datos remotos | TanStack Query v5 (cache, invalidación, mutaciones) |
| Estado de cliente | Zustand (con `persist` para la sesión) |
| Formularios | React Hook Form + Zod (`@hookform/resolvers`) |
| UI | shadcn/ui sobre Radix (`radix-ui`), Tailwind CSS v4 |
| Notificaciones in-app | `sonner` (toasts) |
| Tema | `next-themes` (claro/oscuro, con paridad de color revisada en las vistas del cliente) |

Estructura por *features* (`src/features/<dominio>/{api,components,hooks,
types,schemas,lib}/`) + una capa `src/shared/` (api client, componentes
comunes, config, stores, tipos). Las rutas viven en `src/app/` con dos grupos:
`(auth)` (login/registro) y `(dashboard)` (todo lo autenticado).

### 4.3 Contrato de tipos front↔back

Los 25 enums de dominio (estatus, roles, catálogos, tickets, etc.) **no se
escriben a mano en el frontend**: se generan desde `backend/generated/prisma/enums.ts`
(que a su vez viene de `schema.prisma`) con
`scripts/gen-domain-enums.ts` → `frontend/src/shared/types/domain.enums.ts`.

El chequeo de contrato (`npm run check:contract` desde la raíz — corre en
`tsc` sin emitir, y en el hook de `pre-push`,
`git config core.hooksPath githooks`) cubre además los **shapes de respuesta**
de los endpoints de **solicitud** y **expediente**: el backend deriva sus tipos
de respuesta de `Prisma.*GetPayload<…>` en archivos `*.contract.ts` (fuente
única de los `include`/`select`), y `scripts/check-contract.ts` verifica —de
forma direccional, normalizando `Date → string`— que la respuesta del backend
satisface lo que el frontend espera. Un cambio en un `include`/`select` rompe
`tsc` en ambos lados. El detalle está en `KNOWN-ISSUES.md`.

Todos los listados paginados del API responden con el mismo envoltorio
(`{ data, pagination: { page, pageSize, total, totalPages } }`) y aceptan los
query params `page` + `pageSize` — ver `backend/src/utils/pagination.ts` y su
espejo `frontend/src/shared/types/api.ts`.

### 4.4 Pruebas automatizadas

**Vitest** en ambos proyectos (`npm test` en cada uno):

- **Frontend** — lógica pura: cálculo financiero de Análisis (amortización a
  sistema francés, razones financieras / semáforos, validación de rango de los
  ajustes) y el flujo de pasos del formulario.
- **Backend `unit`** — sin BD: máquinas de estado (solicitud y ticket), cálculo
  de SLA de soporte, métricas de expediente, comparadores de reglas de
  asignación.
- **Backend `integration`** (`npm run test:int`) — contra **PGlite** (Postgres
  real en WASM, en memoria; sin Docker ni servidor), con el esquema aplicado
  desde los `prisma/migrations/*` reales: transiciones de estatus de Promoción
  (+ escritura en `HistorialEstatus`), asignación automática (match de reglas,
  grupo general de respaldo, balanceo por carga, omisión de ya-asignadas),
  validación de documentos (autorización + estado + motivo) y creación de
  solicitud (una activa por cliente, folio). En CI correrá contra un Postgres
  de verdad.

Detalle en [`README.md`](./README.md) y `backend/test/`.

### 4.5 CI/CD

**CI** — `.github/workflows/ci.yml` (GitHub Actions). En cada `pull_request` y
en `push` a `main` / `desarrollo`, dos jobs en paralelo:

- `backend`: `npm ci`, `prisma generate` + chequeo de sync de
  `generated/prisma`, `tsc`, `test:types`, `npm run test:all` (unit +
  integración con PGlite), `check:contract`.
- `frontend`: `npm ci`, `gen:enums` + chequeo de sync de `domain.enums.ts`,
  `lint`, `npm test`, `next build`.

Falta activarlos como *required status checks* en la protección de rama de
`main` (setting de GitHub, no del repo). Ver [`README.md`](./README.md).

**CD** — pendiente. Bloqueado por el storage en disco local del backend
(actividad 3) y por que Puppeteer necesita Chromium en runtime; se define el
`deploy.yml` cuando se resuelva y se elija proveedor.

### 4.6 Lo que falta en la infraestructura

No hay contenedores para producción (Docker) ni despliegue automatizado (CD) —
ver §8.

## 5. Módulos y funcionalidades actuales

### 5.1 Backend (`backend/src/modules/`)

| Módulo | Qué resuelve |
|---|---|
| `auth` | Registro y login de clientes, perfil autenticado, emisión de JWT. Access token corto (15 min) + `POST /auth/refresh` (rota el refresh token de la cookie `httpOnly`, detecta reuso) y `POST /auth/logout` (revoca la familia de sesión). |
| `clientes/solicitudes` | CRUD de la solicitud desde la óptica del cliente: crear, guardar cada sección del formulario (generales, solicitante, aval, crédito, garantía, negocio, mercado, bancarios), enviar, listar las propias, descargar PDF. |
| `expediente` | Expediente digital: consulta de estatus/metricas de documentos, validación (aprobar/rechazar) por parte de gestores/admin. |
| `uploads` | Subida y descarga de los archivos PDF del expediente, con verificación de propiedad (el cliente solo ve las suyas). |
| `admin/promocion` | La cola de trabajo del primer filtro: listar, stats, detalle, y las transiciones de estatus (devolver, enviar a aprobación, regresar al promotor, enviar a financiamiento, cancelar, rechazar). Genera también los PDF de tarjeta informativa, carta de rechazo y acuse de entrega. |
| `admin/asignacion` | Asigna solicitudes a gestores — automática (por reglas de `GrupoGestion`/`ReglaGrupo`) o manual, individual o en lote — y reporta la carga de trabajo por gestor. El listado filtra por estatus, asignado/sin asignar y **por gestor** (para reasignar en bloque todas las de un gestor a otro). |
| `admin/financiamiento` | Segundo filtro. Listados por etapa (Mesa de Control, Asignación, Mis Casos del analista, Validación, Comité), **asignación y reasignación en lote** de analistas (`POST /asignar` con `solicitudIds[]`; reasignar conserva el estatus, la asignación previa queda inactiva con fecha/motivo), carga por analista, y todas las transiciones de estatus del área — hasta `APROBADO` / `RECHAZADO`. Comparte la máquina de estados con Promoción vía `admin/_shared/solicitud-estado.ts`. |
| `admin/analisis` | Análisis financiero del analista. Un `Analisis` por solicitud, con una columna `Json` por pestaña (Situación Financiera, Ajustes del Crédito, Criterios de Evaluación, Amortización, Comentario). `GET /:solicitudId` (lo crea vacío en el primer acceso del analista asignado; devuelve `editable` y un `origen` con lo que pidió el cliente + los límites del programa, para precargar la pestaña Ajustes del Crédito), `PATCH /:solicitudId` upsert por pestaña (con validación de rango del programa para `ajustesCredito`), `POST /:solicitudId/informe-ejecutivo` (PDF del informe para el comité, ver §3.4). Edición solo si la solicitud está `EN_ANALISIS` y el caller es el analista asignado (o ADMIN); el informe lo puede generar ADMIN/ANALISTA/SUPERVISOR. |
| `admin/grupos` | CRUD de grupos de gestión y sus reglas de asignación automática (por sector, tamaño de empresa, tipo de persona, monto, programa). |
| `admin/programas` | CRUD de programas de crédito (montos, tasas, plazos, qué secciones del formulario aplican y con qué obligatoriedad) y del catálogo de tipos de documento (crear/editar/eliminar — el borrado se bloquea si el tipo está en uso). |
| `admin/usuarios` | Listado y administración de usuarios del staff: cambiar rol, revocar acceso, desactivar. |
| `admin/logs` | Consulta del log de auditoría (quién hizo qué, cuándo, desde dónde). |
| `admin/dashboard` | Panorama ejecutivo (solo `ADMIN`): una sola llamada arma KPIs con variación contra el periodo anterior, embudo por etapa, resolución, tendencia, tiempo por etapa (cuellos de botella), cartera por programa, composición de la demanda, carga del equipo, alertas y actividad reciente. Montos desde `ConceptoCredito`, tiempos desde `HistorialEstatus`. |
| `admin/reportes` | Reportes de negocio (solo `ADMIN`): catálogos de filtro, previsualización paginada y exportación a Excel (`.xlsx`, con `exceljs`) del listado de solicitudes filtrado por estatus, sector, tamaño, tipo de persona, programa, gestor, analista, grupo, rangos de fecha/monto y búsqueda. La exportación tiene un límite de tasa propio por llevar datos personales en bloque. |
| `soporte` | Módulo de tickets — montado en `/api/soporte` (no bajo `/api/admin`, lo consumen también clientes). Solicitante (cualquier `Usuario`): crear ticket con adjuntos (imagen/PDF, mismo pipeline de *magic bytes* que `uploads`, en `uploads/soporte/`), listar los propios, detalle, comentar, cerrar/reabrir (ventana 7 días), calificar (CSAT). Agente (= `ADMIN`): listar todos + `stats` + `agentes`, asignar/reasignar, cambiar prioridad/categoría/estatus, cancelar, editar políticas de SLA. Máquina de estados en `soporte.estado.ts`; cálculo de SLA (arranque al asignar, pausa en `ESPERANDO_CLIENTE`, incumplimiento perezoso, recálculo por prioridad) en `soporte.sla.ts`. `SUPERVISOR` ve todo pero solo actúa sobre sus propios tickets (allowlist en `soloLecturaSupervisor`). Folio `TKT-2026-0007` (secuencia PG). |

### 5.2 Frontend (`frontend/src/features/`)

| Feature | Qué cubre |
|---|---|
| `auth` | Login, registro, perfil, store de sesión. |
| `solicitudes` | Todo el flujo del cliente: formulario multi-paso homologado (mismo header ícono+título+contexto en los 10 pasos), edición de borradores, listado con paginación y animaciones de transición entre vistas. |
| `expediente` | Vista de expediente digital (cliente y personal comparten el mismo componente de tabla de documentos, con permisos distintos), historial de versiones, validación y **visor de PDF embebido** (`VisorDocumentoDialog`) con descargar / abrir en pestaña. |
| `promocion` | Cola de solicitudes, asignación (con paginación y columna de gestores de tamaño fijo), aprobación, mis casos, histórico, detalle de solicitud con timeline. |
| `financiamiento` | Segundo filtro: las 5 pantallas (Mesa de Control, Asignación de analistas, Mis Casos, Validación, Comité) + detalle. La Asignación replica la de Promoción (dos columnas, selección múltiple, panel de analistas con carga, sheet de asignación, diálogo de progreso) y permite reasignar en lote. Reusa `SolicitudesTable`, `FilterBar`, `SolicitudTimeline`, `AsignacionMasivaDialog` y `useListadoPromocion` de `promocion`. |
| `analisis` | Herramienta de análisis financiero del analista (desde "Mis Casos" → "Realizar Análisis"). Shell de 5 pestañas, **todas implementadas**: **Situación Financiera** (captura del Balance General y el Estado de Resultados a 4 periodos —Año-2, Año-1, Parcial anualizable, Proyección—, con totales/subtotales automáticos, indicador de cuadre por periodo, autoguardado con debounce y export CSV); **Ajustes del Crédito** (precarga lo que pidió el cliente y deja al analista ajustar condiciones —plazo, gracia, tasa—, conceptos y garantías con CRUD completo; valida contra los límites del programa y muestra cobertura de garantía); **Criterios de Evaluación** (razones financieras —liquidez, endeudamiento, rentabilidad, cobertura de intereses— calculadas en vivo desde Situación Financiera por periodo, con semáforo bien/atención/riesgo; bloqueada con aviso hasta que haya Situación Financiera capturada); **Amortización** (tabla de pagos a sistema francés —pago fijo, con o sin periodo de gracia— calculada en vivo desde Ajustes del Crédito, con resumen, export CSV y su propio aviso/salto si aún no hay ajustes guardados); **Comentario** (5 secciones independientes, cada una autoguardada por separado: Antecedentes, Buró de Crédito, Situación Financiera, Visita y Opinión del Analista — `Analisis.comentario` es `Json`, no texto plano). En Criterios de Evaluación y Amortización solo persiste la observación escrita del analista — las cifras siempre se recalculan desde su fuente, nunca quedan guardadas y desincronizadas. Desde el header (y como acción de fila en Mis Casos / Validación / Comité) se descarga el **Informe Ejecutivo** en PDF: el front arma el payload con los mismos `lib/` y el back lo renderiza. |
| `settings` | Programas de crédito (alta/edición con documentos requeridos y secciones), catálogo de tipos de documento (grid de tarjetas, editar/eliminar), usuarios, grupos de gestión, logs. |
| `dashboard` | Panorama ejecutivo de Inicio (solo `ADMIN`): banda de KPIs con sparkline, embudo del proceso, donut de resolución, tendencia de flujo, tiempo por etapa, cartera por programa, composición de la demanda, carga del equipo, panel de alertas y actividad reciente, con selector de periodo (7d/30d/90d/12m). |
| `reportes` | Módulo de Reportes (solo `ADMIN`, `/dashboard/admin/reportes`): panel de filtros con multi-selección, resumen y tabla de previsualización, y botón de exportación a Excel. |
| `soporte` | Módulo de tickets. Dos vistas: **Mis Tickets** (todos los roles — sus propios tickets + alta de nuevos con título, categoría, prioridad sugerida y adjuntos PNG/JPEG/PDF) y **Tickets** (`ADMIN`/`SUPERVISOR` — cola completa con filtros y tiles de SLA en riesgo/vencido). Detalle con hilo de conversación (respuestas públicas + notas internas, miniaturas de imagen inline), panel lateral (solicitante, agente, prioridad/categoría editables, chips de SLA con cuenta regresiva, timeline de eventos) y barra de acciones según rol y estatus. `SUPERVISOR` solo ve; sobre sus propios tickets actúa como cualquier solicitante. |

## 6. Estado actual del proyecto

### 6.1 Terminado y funcional

- Autenticación y control de acceso por rol (rutas protegidas cliente ↔
  staff, permisos por sección). Modelo de 9 roles con navegación, ruta por
  defecto, badge y `autorizar` en cada endpoint: `ADMIN`, `GESTOR`,
  `ANALISTA`, `ENCARGADO_PROMOCION`, `ENCARGADO_FINANCIAMIENTO`,
  `MESA_CONTROL`, `SOPORTE`, `SUPERVISOR` (ADMIN de solo lectura) y
  `CLIENTE` — ver §3.1.
- **Solo lectura de `SUPERVISOR` + revisión de seguridad** (ver
  [`SECURITY-REVIEW.md`](./SECURITY-REVIEW.md)): `SUPERVISOR` ve lo mismo que
  un `ADMIN` pero no ejecuta ninguna acción — bloqueo de raíz en el backend
  (middleware `soloLecturaSupervisor`) y ocultación completa de controles en
  el frontend (incluye detalle/formulario de programa, `DocumentosPrograma` y
  bloqueo de las rutas de alta/edición). Además: rate-limit dedicado en
  `POST /auth/login` y `/auth/registro`, `app.set("trust proxy")`, política de
  contraseñas centralizada (`auth.schema.ts` → `contrasenaSchema`) y
  expiración de sesión configurable por rol (`config/sesion.config.ts`).
- Flujo completo del cliente: crear solicitud → llenar los 8 pasos → enviar →
  subir documentos → ver estatus.
- Flujo de Promoción (primer filtro) completo: cola, asignación (automática y
  manual), revisión, devolución al cliente, envío a aprobación, aprobación /
  rechazo / cancelación, generación de PDFs.
- **Flujo de Financiamiento (segundo filtro) completo**: backend
  (`admin/financiamiento`) + las 5 pantallas (Mesa de Control, Asignación de
  analistas, Mis Casos, Validación, Comité). Una solicitud recorre todo el ciclo
  hasta `APROBADO` / `RECHAZADO` desde la UI. Cada etapa la operan los roles de
  área (`MESA_CONTROL`, `ENCARGADO_FINANCIAMIENTO`, `ANALISTA`) o `ADMIN` — ver
  §3.1.
- Catálogo de configuración: programas de crédito (con documentos y
  secciones requeridas configurables), tipos de documento (con
  edición/borrado protegido), usuarios, grupos de gestión, logs de
  auditoría.
- Contrato de tipos front↔back automatizado (generación + chequeo en
  pre-push).
- **Sesión con refresh token:** access token JWT de 15 min + refresh token
  opaco en cookie `httpOnly` (`SesionRefresh`, solo hash), con rotación en
  cada uso, detección de reuso por familia, ventana deslizante de 7 días y
  revocación en `logout`. El front renueva el access token de forma
  transparente ante un 401 (`apiAuth` en `shared/api/client.ts`); si la
  renovación falla, cierra sesión y avisa en `/login?expired=true`.
- **Dashboard de KPIs y reportes de negocio** (solo `ADMIN`): panorama
  ejecutivo en Inicio (KPIs con variación contra el periodo anterior, embudo
  por etapa, resolución, tendencia, tiempo por etapa / cuellos de botella,
  cartera por programa, composición de la demanda, carga del equipo, alertas
  y actividad reciente; filtrable por periodo 7d/30d/90d/12m) y módulo de
  Reportes (`admin/reportes`) con filtros multi-selección —estatus, sector,
  tamaño, tipo de persona, programa, gestor, analista, grupo, rangos de fecha
  y monto, búsqueda—, previsualización y exportación a Excel (`.xlsx`, con
  límite de tasa propio por llevar datos personales en bloque).
- **Módulo de Soporte (tickets)** completo: modelo (`Ticket` + comentarios,
  adjuntos, eventos, políticas de SLA), máquina de estados, cálculo de SLA por
  prioridad (arranque al asignar, pausa en `ESPERANDO_CLIENTE`, incumplimiento
  perezoso), adjuntos imagen/PDF con validación de *magic bytes*, hilo de
  conversación con notas internas, y las dos vistas de frontend (Mis Tickets /
  Tickets) + detalle. Ver §5.1 / §5.2. Pendiente para más adelante: correo
  (depende de las notificaciones), auto-cierre de resueltos y CSAT en la UI.
- Consistencia visual reciente: modo oscuro corregido en las vistas que ve el
  cliente, headers de los pasos del formulario homologados, tabla de
  documentos y catálogo de tipos de documento rediseñados.

### 6.2 A medio construir / con huecos conocidos

- **Financiamiento — Fase 3 pendiente:** no se captura un dictamen financiero
  estructurado (monto/plazo/tasa aprobados, capacidad de pago, observaciones);
  hoy cada transición solo lleva un motivo de texto libre.
- Seguridad — pendientes evaluados y **no** implementados (ver
  [`SECURITY-REVIEW.md`](./SECURITY-REVIEW.md) §5): lockout por cuenta tras N
  intentos fallidos, respuesta genérica en `POST /registro` (hoy `409` revela
  si el correo existe), CSP explícita de la API, y verificación de
  `COOKIE_SECURE=true` en el despliegue de producción.
- Soporte — pendientes menores (fase de pulido): auto-cierre de tickets
  `RESUELTO` sin respuesta (necesita un cron externo o evaluación perezosa),
  CSAT en la UI al cerrar, contador de "no leídos" en el nav, y el enganche de
  correo cuando exista el servicio de notificaciones.
- Hay una duplicidad histórica de rutas (`/unauthorized` y
  `/dashboard/unauthorized`) pendiente de limpiar.

### 6.3 No construido todavía

- **Base de conocimiento** (artículos / FAQ). Se sacó del alcance del módulo
  de Soporte; sería un submódulo aparte.
- Notificaciones al cliente (correo o push) cuando cambia el estatus de su
  solicitud o le rechazan un documento — hoy solo se entera si entra a
  revisar.
- Pipeline de CI/CD (las pruebas ya existen — ver §4.4 — pero corren en local,
  no en cada PR).
- Pruebas de componente / e2e del frontend (hoy solo se prueba lógica pura).
- Almacenamiento de archivos en la nube (hoy es disco local del servidor).

## 7. Flujo general de operación

De punta a punta, una solicitud atraviesa el sistema así:

1. **Cliente** se registra/inicia sesión → elige un programa de crédito →
   llena el formulario multi-paso (los pasos activos dependen de las
   secciones que ese programa requiera) → guarda como borrador o continúa →
   **envía** la solicitud (`BORRADOR → PENDIENTE`).
2. El módulo de **asignación** la coloca con un gestor — por reglas
   automáticas del grupo que le corresponda (sector, tamaño, tipo de
   persona, programa, monto) o manualmente por un admin — y pasa a
   `EN_REVISION`.
3. El **cliente** sube sus documentos al expediente digital (uno por cada
   tipo requerido por el programa).
4. El **gestor asignado** revisa datos y documentos: aprueba o rechaza cada
   documento (con motivo si rechaza); si algo del formulario está mal,
   **devuelve** la solicitud (`EN_CORRECCION`) y el cliente corrige y
   reenvía. Cuando todo está en orden, la **envía a aprobación**
   (`EN_APROBACION`).
5. El **comité/admin** en aprobación decide: regresarla al gestor
   (`EN_REVISION`), mandarla a **financiamiento** (`EN_FINANCIAMIENTO`),
   **rechazarla** (`RECHAZADO`, se genera carta de rechazo) o **cancelarla**
   (`CANCELADO`).
6. En **Financiamiento** (segundo filtro, ver §3.2) la solicitud pasa por
   Mesa de Control (`MESA_CONTROL`), asignación de analista, análisis financiero
   (`EN_ANALISIS`), validación (`EN_VALIDACION`) y comité (`EN_COMITE`) hasta
   quedar `APROBADO` o `RECHAZADO`.
7. En cada paso queda un registro en el **historial de estatus** (quién,
   cuándo, de dónde a dónde, por qué) y, cuando aplica, en el **log de
   auditoría** general — ambos alimentan el timeline que se ve en el detalle
   de la solicitud.

Todo el tiempo, el **admin** puede entrar por la vía de "Configuración" a
ajustar el catálogo (programas, documentos, usuarios, grupos) que determina
las reglas con las que corre todo lo anterior.

## 8. Áreas de oportunidad

1. **El ciclo de negocio ya cierra de punta a punta** (Promoción +
   Financiamiento, backend y UI). Falta la **Fase 3** de Financiamiento: captura
   de un dictamen financiero estructurado en vez de solo un motivo de texto.
2. **El cliente no se entera de nada si no entra a revisar.** No hay
   notificaciones — un rechazo de documento o una devolución para corrección
   puede pasar inadvertido días.
3. **Pruebas automatizadas — base cubierta, falta ampliar.** Ya hay suite de
   Vitest (unit + integración con BD) sobre transiciones de estatus, asignación
   automática, validación de documentos, SLA y cálculo financiero de Análisis
   (ver §4.4). Pendiente: componente / e2e del frontend y sumar módulos.
4. **CI listo, CD pendiente.** El CI (`.github/workflows/ci.yml`) corre `tsc`,
   `lint`, `check:contract`, `npm test` y los builds en cada PR y push a
   `main`/`desarrollo`. Falta marcarlos como *required checks* en la protección
   de rama y definir el despliegue automatizado (ver §4.5).
5. **Almacenamiento de archivos en disco local.** No escala a múltiples
   instancias del backend, no tiene backup ni CDN, y complica un despliegue
   en contenedores.
6. **Deuda de tipos — parcialmente resuelta.** Los DTOs de respuesta de
   **solicitud** y **expediente** ya están derivados de `Prisma.*GetPayload<…>`
   y verificados contra el frontend en `check:contract` (ver §4.3). Falta
   extender el mismo patrón al resto de módulos (promoción, financiamiento,
   análisis, soporte, dashboard, reportes).

## 9. Plan de trabajo

Tres actividades concretas, en el orden en que aportan más valor si se
ejecutan en secuencia (aunque varias pueden correr en paralelo por equipos
distintos: negocio/back vs. calidad/infra).

> Ya completadas y retiradas de esta lista: el **módulo de Financiamiento**
> (segundo filtro — backend + las 5 pantallas; solo queda como opcional la
> Fase 3, captura de dictamen financiero estructurado, ver §6.2/§8); el
> **dashboard de KPIs y reportes de negocio** (panorama ejecutivo de Inicio +
> módulo de Reportes con filtros multi-selección y exportación a Excel); la
> **sesión con refresh token** (access token de 15 min + refresh token opaco
> en cookie `httpOnly` con rotación, detección de reuso y ventana deslizante
> configurable por rol; renovación transparente en el front, ver §4.1); el
> **módulo de Soporte / tickets** (modelo + SLA + adjuntos + conversación +
> dos vistas de frontend, ver §5.1/§5.2 — solo quedan pendientes de pulido:
> correo, auto-cierre y CSAT en la UI); y el **cierre de solo lectura de
> `SUPERVISOR` + revisión de seguridad** (ocultación de controles completa en
> el frontend, rate-limit en `login`/`registro`, `trust proxy`, política de
> contraseñas centralizada y expiración de sesión por rol; hallazgos no
> implementados listados en [`SECURITY-REVIEW.md`](./SECURITY-REVIEW.md)); y la
> **reconciliación de los DTOs de respuesta** de solicitud y expediente
> (derivados de `Prisma.*GetPayload` en `*.contract.ts` y verificados
> front↔back en `check:contract`, ver §4.3 — falta extenderlo al resto de
> módulos, ver §8); y la **suite de pruebas automatizadas** (Vitest: unit sin
> BD + integración contra PGlite sobre transiciones de estatus, asignación
> automática, validación de documentos, SLA y cálculo financiero de Análisis,
> ver §4.4 — pendiente componente/e2e del frontend).

### 1. Notificaciones al solicitante

- **Descripción:** Servicio de notificaciones (correo, y opcionalmente
  push/in-app) disparado en los eventos clave: solicitud recibida, gestor
  asignado, documento rechazado, solicitud devuelta para corrección,
  solicitud aprobada/rechazada.
- **Objetivo:** Que el cliente se entere de cambios en su solicitud sin tener
  que entrar a revisar por su cuenta.
- **Beneficio/impacto:** Reduce el tiempo de respuesta del cliente ante
  correcciones pendientes y mejora la percepción de transparencia del
  proceso.
- **Prioridad:** Alta.
- **Resultado esperado:** Correo automático en cada evento relevante, con
  copia de los eventos disparados quedando en el log de auditoría.

### 2. Pipeline de CI/CD — *CI hecho, CD pendiente*

- **CI (hecho):** `.github/workflows/ci.yml` corre en cada `pull_request` y en
  `push` a `main`/`desarrollo`: job `backend` (`tsc`, `test:types`,
  `test:all` con PGlite, `check:contract`, sync de `generated/prisma`) y job
  `frontend` (`gen:enums` + sync de `domain.enums.ts`, `lint`, `test`,
  `next build`). Falta un paso manual una sola vez: marcarlos como *required
  status checks* en la protección de rama de `main` (setting de GitHub).
- **CD (pendiente):** bloqueado por el storage en disco local del backend
  (actividad 3) y por Puppeteer/Chromium en runtime. Se define `deploy.yml`
  (`on: push: [main]` → `prisma migrate deploy` + deploy de front y back) al
  resolver eso y elegir proveedor. Ver §4.5.
- **Prioridad:** Alta.
- **Resultado esperado:** Checks obligatorios en cada PR (falta el toggle de
  GitHub) y despliegue automatizado sin pasos manuales (CD pendiente).

### 3. Migrar el almacenamiento de documentos a un proveedor cloud

- **Descripción:** Reemplazar `uploads/expedientes/` (disco local) por un
  bucket (S3, Cloud Storage o similar), manteniendo la validación de magic
  bytes ya existente antes de subir.
- **Objetivo:** Que el almacenamiento de archivos no dependa de un solo
  servidor ni de su disco.
- **Beneficio/impacto:** Habilita escalar el backend a más de una instancia,
  agrega backups y prepara el sistema para un despliegue en contenedores.
- **Prioridad:** Media-Alta.
- **Resultado esperado:** Los documentos del expediente se suben y descargan
  desde el proveedor cloud sin cambios visibles para el usuario, con los
  archivos ya existentes migrados.

---

*Este documento describe el estado del proyecto en la fecha indicada arriba.
Para la lista viva de deuda técnica ya identificada (no la hoja de ruta, sino
los detalles de implementación) ver [`KNOWN-ISSUES.md`](./KNOWN-ISSUES.md).
Para la revisión de seguridad (solo lectura de `SUPERVISOR`, rate limiting,
contraseñas, sesión por rol y pendientes evaluados) ver
[`SECURITY-REVIEW.md`](./SECURITY-REVIEW.md). Para las instrucciones de
desarrollo (scripts, contrato de tipos, hook de pre-push) ver
[`README.md`](./README.md).*
