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
| `npm run test:int` | Suite **integración**: transiciones de estatus, asignación automática, validación de documentos, creación/envío de solicitud, contra un Postgres real. Levanta el contenedor (`pretest:int`) y aplica el esquema automáticamente. |
| `npm run test:all` | Ambas. |
| `npm run test:db:down` | Borra el contenedor de pruebas y su volumen. |

La integración usa `docker-compose.test.yml` (Postgres efímero en el puerto
`55432`) y `.env.test`. **Requiere Docker corriendo.** Un candado en
`test/integration/env.ts` impide que los tests toquen cualquier BD que no sea
`solcred_test`.

## Deuda conocida

Ver [`KNOWN-ISSUES.md`](./KNOWN-ISSUES.md) — paginación no unificada en el backend,
doble forma de `Programa`.
