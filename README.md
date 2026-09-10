# solcred

Sistema de solicitudes de crédito.

> Documentación general del proyecto (qué es, cómo funciona, arquitectura,
> estado actual y hoja de ruta): [`DOCUMENTACION.md`](./DOCUMENTACION.md).

| Carpeta | Stack |
|---|---|
| `frontend/` | Next.js 16 (App Router, Turbopack), React 19, TanStack Query. Ver `frontend/AGENTS.md`. |
| `backend/` | Express 5, Prisma 7, TypeScript. |
| `scripts/` | Herramientas de contrato frontend ↔ backend. |

> No es un monorepo con workspaces: `frontend/` y `backend/` mantienen su propio
> `package.json` y su propio `npm install`. El `package.json` de la raíz solo
> expone los scripts de contrato (que reutilizan el toolchain de `frontend/`).

## Contrato de tipos frontend ↔ backend

`backend/prisma/schema.prisma` es la **fuente de verdad** de los enums de dominio.
El frontend no los redefine a mano: se **generan** en
`frontend/src/shared/types/domain.enums.ts` a partir de
`backend/generated/prisma/enums.ts` (que Prisma emite y está versionado).

| Comando (desde la raíz) | Qué hace |
|---|---|
| `npm run gen:enums` | Regenera `domain.enums.ts`. Idempotente. Corre solo en `predev` / `prebuild` del frontend. |
| `npm run check:contract` | `tsc` a nivel de tipos que **falla nombrando los valores** si los enums del front divergen de Prisma. |

### Hook de pre-push (una vez por clon)

```sh
git config core.hooksPath githooks
```

`githooks/pre-push` regenera los enums, verifica que `domain.enums.ts` esté al día
respecto a `schema.prisma` y corre `check:contract` antes de cada `git push`.

## Pruebas

Runner: **Vitest** en ambos proyectos. Cada uno con su `npm test`.

### Frontend (`cd frontend`)

| Comando | Qué corre |
|---|---|
| `npm test` | Lógica pura: cálculo financiero de Análisis (amortización, criterios, ajustes) y flujo de pasos del formulario. Sin infraestructura. |
| `npm run test:watch` | Lo mismo, en watch. |

### Backend (`cd backend`)

| Comando | Qué corre |
|---|---|
| `npm test` | Suite **unit**: máquinas de estado (solicitud, ticket), SLA, métricas de expediente, comparadores de reglas de asignación. Sin BD. |
| `npm run test:int` | Suite **integración**: transiciones de estatus, asignación automática, validación de documentos, creación de solicitud. |
| `npm run test:all` | Ambas. |
| `npm run test:types` | Typecheck de todo (incluye los tests). |

**La integración no necesita Docker ni un Postgres aparte.** Corre contra
**PGlite** — Postgres real compilado a WASM, en memoria, dentro del proceso de
test (`test/integration/pglite-client.ts`). El esquema se aplica ejecutando los
`prisma/migrations/*` reales, y `vitest.config.mts` aliasa `@config/db` a esa
instancia para que los servicios usen la misma BD.

## CI/CD

**CI** — `.github/workflows/ci.yml`. Corre en cada `pull_request` y en `push` a
`main` / `desarrollo`. Dos jobs en paralelo:

| Job | Pasos |
|---|---|
| `backend` | `npm ci` · `prisma generate` + verificar que `generated/prisma` está commiteado al día · `npm run build` (tsc) · `test:types` · `npm run test:all` (unit + integración con PGlite) · `npm run check:contract` |
| `frontend` | `npm ci` · `gen:enums` + verificar `domain.enums.ts` al día · `npm run lint` · `npm test` · `npm run build` (next build) |

Para que sean **obligatorios**, activar en GitHub → *Settings → Branches →
Branch protection rule* sobre `main` (y `desarrollo` si se quiere): *Require
status checks to pass* → marcar `backend` y `frontend`.

**CD** — pendiente. Bloqueado por dos cosas del backend que hay que resolver
antes de un deploy limpio:

1. **Storage en disco local** (`uploads/`) — no sobrevive en plataformas
   efímeras. Se resuelve en la actividad 3 del plan (migrar a un bucket).
2. **Puppeteer** necesita Chromium en el runtime → plataforma con imagen
   propia / buildpack que lo soporte (Railway, Render, Fly, un contenedor)
   o `@sparticuz/chromium` si se va serverless.

Plan cuando eso esté: workflow `deploy.yml` con `on: push: branches: [main]`
que corra migraciones (`prisma migrate deploy` contra la BD de prod) y
despliegue front y back al proveedor elegido con sus secrets en *Actions
secrets*.

## Deuda conocida

Ver [`KNOWN-ISSUES.md`](./KNOWN-ISSUES.md) — paginación no unificada en el backend,
doble forma de `Programa`.
