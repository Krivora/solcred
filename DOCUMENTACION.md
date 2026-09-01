# Documentación general — SolCred

> Sistema de gestión de solicitudes de crédito: desde que un cliente llena su
> solicitud hasta que el comité la aprueba o rechaza, pasando por la revisión
> de datos, la carga de documentos y (cuando ese módulo exista) el análisis
> financiero.
>
> Última actualización: 31 de agosto de 2026.

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
| **Cliente** | `CLIENTE` | Llena y envía su solicitud, sube documentos a su expediente, consulta su estatus. |
| **Gestor** | `PERSONAL` / `GESTOR` | Primer filtro ("Promoción"): revisa datos y documentos de las solicitudes que le asignan, las corrige/devuelve o las manda a aprobación. |
| **Analista** | `PERSONAL` / `ANALISTA` | Segundo filtro ("Financiamiento"): recibe casos asignados (Mis Casos), hace el **análisis financiero** (herramienta de 5 pestañas, todas implementadas: Situación Financiera, Ajustes del Crédito, Criterios de Evaluación, Amortización y Comentario) y los envía a validación. |
| **Admin** | `PERSONAL` / `ADMIN` | Ve y hace todo lo anterior, además de administrar el catálogo del sistema: programas de crédito, tipos de documento, usuarios, grupos de gestión y logs de auditoría. |
| **Supervisor** | `PERSONAL` / `SUPERVISOR` | Opera la **Mesa de Control** (revisión de info/docs al recibir el caso de aprobación: lo pasa a asignación o lo regresa) y la etapa de **Validación** de Financiamiento (revisa el análisis del analista antes del comité). Fuera de eso aún sin alcance propio distinto de Admin. |

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
EN_FINANCIAMIENTO         Mesa de Control (SUPERVISOR): revisión adicional de info/docs
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

### 3.4 Generación de documentos (PDF)

El backend genera 4 documentos PDF con Puppeteer a partir de plantillas HTML
propias:

- PDF de la solicitud completa.
- Tarjeta informativa (resumen ejecutivo del crédito).
- Carta de rechazo (cuando la solicitud se rechaza, con motivo).
- Acuse de entrega del expediente.

## 4. Arquitectura y tecnologías

### 4.1 Backend (`backend/`)

| Componente | Tecnología |
|---|---|
| Runtime / lenguaje | Node.js + TypeScript, ejecutado con `tsx` (dev) / compilado con `tsc` (prod) |
| Framework HTTP | Express 5 |
| Base de datos | PostgreSQL, vía Prisma ORM 7 (`@prisma/adapter-pg`) |
| Autenticación | JWT propio (`jsonwebtoken`), sesión de un solo token (por defecto 8h), sin refresh token |
| Contraseñas | `bcryptjs` |
| Subida de archivos | `multer` en memoria + validación de magic bytes antes de escribir a disco (`uploads/expedientes/`, almacenamiento **local**, no en la nube) |
| Generación de PDF | `puppeteer` sobre plantillas HTML propias |
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

Los 20 enums de dominio (estatus, roles, catálogos, etc.) **no se escriben a
mano en el frontend**: se generan desde `backend/generated/prisma/enums.ts`
(que a su vez viene de `schema.prisma`) con
`scripts/gen-domain-enums.ts` → `frontend/src/shared/types/domain.enums.ts`.
Un script de chequeo (`npm run check:contract` desde la raíz) falla si
divergen, y corre automáticamente en un hook de `pre-push`
(`git config core.hooksPath githooks`). El detalle de esto está en
`KNOWN-ISSUES.md`.

Todos los listados paginados del API responden con el mismo envoltorio
(`{ data, pagination: { page, pageSize, total, totalPages } }`) y aceptan los
query params `page` + `pageSize` — ver `backend/src/utils/pagination.ts` y su
espejo `frontend/src/shared/types/api.ts`.

### 4.4 Lo que falta en la infraestructura

No hay contenedores (Docker), pipeline de CI/CD, ni suite de pruebas
automatizadas — ver §8.

## 5. Módulos y funcionalidades actuales

### 5.1 Backend (`backend/src/modules/`)

| Módulo | Qué resuelve |
|---|---|
| `auth` | Registro y login de clientes, perfil autenticado, emisión de JWT. |
| `clientes/solicitudes` | CRUD de la solicitud desde la óptica del cliente: crear, guardar cada sección del formulario (generales, solicitante, aval, crédito, garantía, negocio, mercado, bancarios), enviar, listar las propias, descargar PDF. |
| `expediente` | Expediente digital: consulta de estatus/metricas de documentos, validación (aprobar/rechazar) por parte de gestores/admin. |
| `uploads` | Subida y descarga de los archivos PDF del expediente, con verificación de propiedad (el cliente solo ve las suyas). |
| `admin/promocion` | La cola de trabajo del primer filtro: listar, stats, detalle, y las transiciones de estatus (devolver, enviar a aprobación, regresar al promotor, enviar a financiamiento, cancelar, rechazar). Genera también los PDF de tarjeta informativa, carta de rechazo y acuse de entrega. |
| `admin/asignacion` | Asigna solicitudes a gestores — automática (por reglas de `GrupoGestion`/`ReglaGrupo`) o manual, individual o en lote — y reporta la carga de trabajo por gestor. El listado filtra por estatus, asignado/sin asignar y **por gestor** (para reasignar en bloque todas las de un gestor a otro). |
| `admin/financiamiento` | Segundo filtro. Listados por etapa (Mesa de Control, Asignación, Mis Casos del analista, Validación, Comité), **asignación y reasignación en lote** de analistas (`POST /asignar` con `solicitudIds[]`; reasignar conserva el estatus, la asignación previa queda inactiva con fecha/motivo), carga por analista, y todas las transiciones de estatus del área — hasta `APROBADO` / `RECHAZADO`. Comparte la máquina de estados con Promoción vía `admin/_shared/solicitud-estado.ts`. |
| `admin/analisis` | Análisis financiero del analista. Un `Analisis` por solicitud, con una columna `Json` por pestaña (Situación Financiera, Ajustes del Crédito, Criterios de Evaluación, Amortización, Comentario). `GET /:solicitudId` (lo crea vacío en el primer acceso del analista asignado; devuelve `editable` y un `origen` con lo que pidió el cliente + los límites del programa, para precargar la pestaña Ajustes del Crédito), `PATCH /:solicitudId` upsert por pestaña (con validación de rango del programa para `ajustesCredito`). Edición solo si la solicitud está `EN_ANALISIS` y el caller es el analista asignado (o ADMIN). |
| `admin/grupos` | CRUD de grupos de gestión y sus reglas de asignación automática (por sector, tamaño de empresa, tipo de persona, monto, programa). |
| `admin/programas` | CRUD de programas de crédito (montos, tasas, plazos, qué secciones del formulario aplican y con qué obligatoriedad) y del catálogo de tipos de documento (crear/editar/eliminar — el borrado se bloquea si el tipo está en uso). |
| `admin/usuarios` | Listado y administración de usuarios del staff: cambiar rol, revocar acceso, desactivar. |
| `admin/logs` | Consulta del log de auditoría (quién hizo qué, cuándo, desde dónde). |

### 5.2 Frontend (`frontend/src/features/`)

| Feature | Qué cubre |
|---|---|
| `auth` | Login, registro, perfil, store de sesión. |
| `solicitudes` | Todo el flujo del cliente: formulario multi-paso homologado (mismo header ícono+título+contexto en los 10 pasos), edición de borradores, listado con paginación y animaciones de transición entre vistas. |
| `expediente` | Vista de expediente digital (cliente y personal comparten el mismo componente de tabla de documentos, con permisos distintos), historial de versiones, validación. |
| `promocion` | Cola de solicitudes, asignación (con paginación y columna de gestores de tamaño fijo), aprobación, mis casos, histórico, detalle de solicitud con timeline. |
| `financiamiento` | Segundo filtro: las 5 pantallas (Mesa de Control, Asignación de analistas, Mis Casos, Validación, Comité) + detalle. La Asignación replica la de Promoción (dos columnas, selección múltiple, panel de analistas con carga, sheet de asignación, diálogo de progreso) y permite reasignar en lote. Reusa `SolicitudesTable`, `FilterBar`, `SolicitudTimeline`, `AsignacionMasivaDialog` y `useListadoPromocion` de `promocion`. |
| `analisis` | Herramienta de análisis financiero del analista (desde "Mis Casos" → "Realizar Análisis"). Shell de 5 pestañas, **todas implementadas**: **Situación Financiera** (captura del Balance General y el Estado de Resultados a 4 periodos —Año-2, Año-1, Parcial anualizable, Proyección—, con totales/subtotales automáticos, indicador de cuadre por periodo, autoguardado con debounce y export CSV); **Ajustes del Crédito** (precarga lo que pidió el cliente y deja al analista ajustar condiciones —plazo, gracia, tasa—, conceptos y garantías con CRUD completo; valida contra los límites del programa y muestra cobertura de garantía); **Criterios de Evaluación** (razones financieras —liquidez, endeudamiento, rentabilidad, cobertura de intereses— calculadas en vivo desde Situación Financiera por periodo, con semáforo bien/atención/riesgo; bloqueada con aviso hasta que haya Situación Financiera capturada); **Amortización** (tabla de pagos a sistema francés —pago fijo, con o sin periodo de gracia— calculada en vivo desde Ajustes del Crédito, con resumen, export CSV y su propio aviso/salto si aún no hay ajustes guardados); **Comentario** (5 secciones independientes, cada una autoguardada por separado: Antecedentes, Buró de Crédito, Situación Financiera, Visita y Opinión del Analista — `Analisis.comentario` es `Json`, no texto plano). En Criterios de Evaluación y Amortización solo persiste la observación escrita del analista — las cifras siempre se recalculan desde su fuente, nunca quedan guardadas y desincronizadas. |
| `settings` | Programas de crédito (alta/edición con documentos requeridos y secciones), catálogo de tipos de documento (grid de tarjetas, editar/eliminar), usuarios, grupos de gestión, logs. |

No existe todavía una feature `soporte` en el frontend — ver §6.

## 6. Estado actual del proyecto

### 6.1 Terminado y funcional

- Autenticación y control de acceso por rol (rutas protegidas cliente ↔
  staff, permisos por sección).
- Flujo completo del cliente: crear solicitud → llenar los 8 pasos → enviar →
  subir documentos → ver estatus.
- Flujo de Promoción (primer filtro) completo: cola, asignación (automática y
  manual), revisión, devolución al cliente, envío a aprobación, aprobación /
  rechazo / cancelación, generación de PDFs.
- **Flujo de Financiamiento (segundo filtro) completo**: backend
  (`admin/financiamiento`) + las 5 pantallas (Mesa de Control, Asignación de
  analistas, Mis Casos, Validación, Comité). Una solicitud recorre todo el ciclo
  hasta `APROBADO` / `RECHAZADO` desde la UI. El rol `SUPERVISOR` opera la etapa
  de Validación.
- Catálogo de configuración: programas de crédito (con documentos y
  secciones requeridas configurables), tipos de documento (con
  edición/borrado protegido), usuarios, grupos de gestión, logs de
  auditoría.
- Contrato de tipos front↔back automatizado (generación + chequeo en
  pre-push).
- Consistencia visual reciente: modo oscuro corregido en las vistas que ve el
  cliente, headers de los pasos del formulario homologados, tabla de
  documentos y catálogo de tipos de documento rediseñados.

### 6.2 A medio construir / con huecos conocidos

- **Financiamiento — Fase 3 pendiente:** no se captura un dictamen financiero
  estructurado (monto/plazo/tasa aprobados, capacidad de pago, observaciones);
  hoy cada transición solo lleva un motivo de texto libre.
- El rol `SUPERVISOR` ya opera la etapa de Validación (backend + nav + ruta por
  defecto `/dashboard/financiamiento/validacion` + badge), pero fuera de eso
  sigue sin un alcance propio distinto de Admin (actividad #10 del plan).
- Hay una duplicidad histórica de rutas (`/unauthorized` y
  `/dashboard/unauthorized`) pendiente de limpiar.

### 6.3 No construido todavía

- **Módulo de Soporte** (tickets, reportes de problema, base de
  conocimiento). Mismo caso: está en el menú, no hay nada construido detrás.
- Notificaciones al cliente (correo o push) cuando cambia el estatus de su
  solicitud o le rechazan un documento — hoy solo se entera si entra a
  revisar.
- Pruebas automatizadas (no hay ni una) y pipeline de CI/CD.
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
   (`EN_REVISION`), mandarla a financiamiento (`EN_FINANCIAMIENTO`, hoy sin
   salida — ver §6.1/§6.3), **rechazarla** (`RECHAZADO`, se genera carta de
   rechazo) o **cancelarla** (`CANCELADO`).
6. En cada paso queda un registro en el **historial de estatus** (quién,
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
3. **Cero pruebas automatizadas.** Cualquier cambio en las transiciones de
   estatus, la asignación automática o la validación de documentos se
   verifica solo a mano.
4. **Sin CI/CD.** `tsc`, `eslint`, `check:contract` y el build corren en la
   máquina de quien programa, no en cada Pull Request.
5. **Almacenamiento de archivos en disco local.** No escala a múltiples
   instancias del backend, no tiene backup ni CDN, y complica un despliegue
   en contenedores.
6. **Sesión de un solo JWT de 8 horas, sin refresh.** A las 8 horas el
   usuario tiene que volver a iniciar sesión sin aviso previo.
7. **Sin reportes/analítica de negocio**: no hay forma de ver, por ejemplo,
   tiempo promedio de resolución, tasa de aprobación por programa o carga
   por gestor, más allá de las stats puntuales que ya expone Promoción.
8. **Rol `SUPERVISOR` sin definir.** Está en el modelo pero nadie ha decidido
   qué debe poder ver/hacer que un Admin no.
9. **Deuda de tipos ya documentada pero no resuelta** (Fase 4 declarada
   pendiente en su momento): los DTOs de respuesta del backend no están
   verificados contra los tipos `Prisma.XGetPayload<...>` reales, solo los
   enums lo están.

## 9. Plan de trabajo

Diez actividades concretas, en el orden en que aportan más valor si se
ejecutan en secuencia (aunque varias pueden correr en paralelo por equipos
distintos: negocio/back vs. calidad/infra).

### 1. Construir el módulo de Financiamiento (segundo filtro)

- **Fase 1 — COMPLETADA (backend + máquina de estados).** 4 estatus nuevos
  (`EN_ASIGNACION`, `EN_ANALISIS`, `EN_VALIDACION`, `EN_COMITE`) + modelo
  `AsignacionFinanciamiento`. Helpers de estado extraídos a
  `admin/_shared/solicitud-estado.ts` (compartidos con Promoción). Módulo
  `admin/financiamiento`: listados por etapa, asignación de analista, y las
  transiciones — incluyendo `EN_COMITE → APROBADO` y `→ RECHAZADO` desde
  validación/comité. Actor de la etapa de Validación: rol `SUPERVISOR`.
- **Fase 2 — COMPLETADA (frontend).** Feature `financiamiento` con las 5
  pantallas (Mesa de Control, Asignación, Mis Casos, Validación, Comité) + página
  de detalle, reusando `SolicitudesTable`, `FilterBar`, `SolicitudTimeline` y
  `useListadoPromocion` de `promocion`. "Validación" agregada a `nav.config.ts`;
  `SUPERVISOR` con ruta por defecto `/dashboard/financiamiento/validacion` y
  badge. Diálogo de asignación de analista con carga por analista.
- **Fase 3 — OPCIONAL / PENDIENTE.** Captura de dictamen financiero (monto/plazo/
  tasa aprobados, capacidad de pago, observaciones) — otra migración.
- **Resultado esperado — ALCANZADO:** una solicitud recorre todo el flujo hasta
  `APROBADO`/`RECHAZADO` desde la UI, sin intervención manual fuera del sistema.

### 2. Notificaciones al solicitante

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

### 3. Suite de pruebas automatizadas

- **Descripción:** Pruebas unitarias/de integración en el backend para los
  servicios críticos (transiciones de estatus, asignación automática,
  validación de documentos, cálculo de métricas) y pruebas de componente/e2e
  en el frontend para los flujos de cliente y de Promoción.
- **Objetivo:** Poder cambiar código sin depender solo de verificación
  manual.
- **Beneficio/impacto:** Menos regresiones silenciosas, más confianza para
  refactorizar (por ejemplo, al construir Financiamiento sobre las mismas
  bases que Promoción).
- **Prioridad:** Alta.
- **Resultado esperado:** Cobertura de pruebas sobre las transiciones de
  estatus y el flujo de creación/envío de solicitud, corriendo en local con
  un solo comando.

### 4. Pipeline de CI/CD

- **Descripción:** GitHub Actions (u equivalente) que en cada Pull Request
  corra `tsc`, `eslint`, `npm run check:contract` y el build de ambos
  proyectos; y que despliegue automáticamente a un ambiente al hacer merge a
  `main`.
- **Objetivo:** Que ningún cambio roto llegue a `main` sin que alguien lo
  note antes de revisar el PR a mano.
- **Beneficio/impacto:** Reduce el tiempo de revisión y evita que la
  responsabilidad de "correr todo antes de pushear" recaiga solo en la
  disciplina de cada quien.
- **Prioridad:** Alta.
- **Resultado esperado:** Checks obligatorios en cada PR y despliegue
  automatizado sin pasos manuales.

### 5. Migrar el almacenamiento de documentos a un proveedor cloud

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

### 6. Construir el módulo de Soporte

- **Descripción:** Backend y frontend para las 4 pantallas ya anunciadas en
  el menú (Mis Tickets, Nuevo Ticket, Reportar Problema, Base de
  Conocimiento): un CRUD de tickets con estatus e historial, visible para
  cliente y para staff.
- **Objetivo:** Dar un canal formal de soporte dentro del propio sistema en
  vez de fuera de él (correo, WhatsApp, etc.).
- **Beneficio/impacto:** Centraliza la atención a dudas/incidencias y deja
  rastro de ellas, igual que ya pasa con las solicitudes de crédito.
- **Prioridad:** Media.
- **Resultado esperado:** Un cliente puede levantar un ticket y darle
  seguimiento dentro del sistema; el staff lo ve y responde desde el panel.

### 7. Sesión más robusta (refresh token)

- **Descripción:** Agregar un refresh token de vida más larga junto al JWT
  de acceso (corto), con renovación transparente desde el frontend antes de
  que expire.
- **Objetivo:** Evitar que la sesión se corte de golpe a las 8 horas.
- **Beneficio/impacto:** Mejora la experiencia de uso prolongado (por
  ejemplo, un gestor trabajando toda la jornada) sin sacrificar seguridad.
- **Prioridad:** Media.
- **Resultado esperado:** La sesión se mantiene activa mientras el usuario
  sigue usando el sistema, y expira de forma segura cuando deja de hacerlo.

### 8. Dashboard de KPIs y reportes de negocio

- **Descripción:** Panel con métricas agregadas: tiempo promedio por etapa
  del flujo, tasa de aprobación/rechazo por programa, carga de trabajo por
  gestor/analista, cartera solicitada vs. aprobada — con exportación a
  PDF/Excel.
- **Objetivo:** Dar visibilidad de negocio más allá de las stats puntuales
  que ya existen en Promoción.
- **Beneficio/impacto:** Permite tomar decisiones (redistribuir carga,
  ajustar reglas de asignación, detectar cuellos de botella) con datos en
  vez de percepción.
- **Prioridad:** Media.
- **Resultado esperado:** Un tablero con los indicadores clave del negocio,
  filtrable por periodo y programa.

### 9. Reconciliar los DTOs de respuesta del backend

- **Descripción:** Continuar el trabajo de contrato de tipos (que hoy cubre
  los 20 enums) a los shapes de respuesta completos, tipándolos contra
  `Prisma.XGetPayload<...>`. (La paginación ya quedó unificada en
  `{ data, pagination }` — ver §4.3.)
- **Objetivo:** Que un cambio en el `include`/`select` de una consulta de
  Prisma se note en `tsc` del frontend en vez de romperse en producción en
  silencio.
- **Beneficio/impacto:** Menos bugs de "el campo que esperaba el frontend ya
  no viene del backend", que es justo el tipo de error que ya se corrigió
  una vez en el timeline de la solicitud (§6.1 de la bitácora del
  proyecto).
- **Prioridad:** Media.
- **Resultado esperado:** Los tipos de respuesta de, al menos, los endpoints
  de solicitud y expediente, están verificados contra el modelo real de
  Prisma.

### 10. Definir y completar el rol Supervisor

- **Descripción:** Decidir el alcance real del rol `SUPERVISOR` (¿qué ve/
  aprueba que un Admin no delega?) y completarlo: ruta por defecto con
  sentido, permisos de navegación, color de badge en la UI, y — de paso —
  una revisión de seguridad general (rate limiting por endpoint sensible,
  política de contraseñas, expiración de sesión configurable por rol).
- **Objetivo:** Que ningún rol del modelo de datos quede a medias en la capa
  de aplicación.
- **Beneficio/impacto:** Cierra un hueco de UX/seguridad antes de que alguien
  intente usar ese rol en producción y se encuentre con una experiencia
  incompleta.
- **Prioridad:** Baja-Media.
- **Resultado esperado:** Un usuario con rol Supervisor tiene una
  navegación, permisos y apariencia coherentes en todo el sistema.

---

*Este documento describe el estado del proyecto en la fecha indicada arriba.
Para la lista viva de deuda técnica ya identificada (no la hoja de ruta, sino
los detalles de implementación) ver [`KNOWN-ISSUES.md`](./KNOWN-ISSUES.md).
Para las instrucciones de desarrollo (scripts, contrato de tipos, hook de
pre-push) ver [`README.md`](./README.md).*
