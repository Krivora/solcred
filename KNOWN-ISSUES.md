# Deuda conocida

Cosas que sabemos que están mal o inconsistentes y decidimos **no** arreglar
todavía (cambiarlas toca el backend y varios consumidores a la vez). Documentadas
para que nadie las "descubra" en producción.

---

## 1. Paginación no unificada en el backend

El backend responde con dos formas distintas según el módulo:

| Endpoint | Envoltura | Campo de tamaño |
|---|---|---|
| `GET /clientes/solicitudes` | `{ items, pagination }` | `pagination.pageSize` |
| `GET /admin/promocion/*` (listados) | `{ data, meta }` | `meta.limit` |

Además `clientes/solicitudes` usa `items` en el controller aunque el service
devuelve `data` (`solicitudes.controller.ts` lo renombra).

**Frontend:** `src/shared/types/api.ts` modela las dos formas explícitamente
(`PaginacionData` con `pageSize`, `PaginacionMeta` con `limit`;
`RespuestaPaginada<T>` vs `RespuestaConMeta<T>`). El componente `Paginacion`
consume `PaginacionData`; los listados de promoción adaptan `meta.limit` en el
borde (`SolicitudesTable.tsx`).

**Arreglo futuro:** unificar el backend en `{ data, pagination: { page, pageSize,
total, totalPages } }` y colapsar los tipos del front a uno solo.

---

## 2. `Programa` tiene dos formas en el frontend

- **`admin/programas` (settings) y el backend**: el requerimiento de cada sección
  (aval, garantía, etc.) vive en `secciones: ProgramaSeccion[]`
  (`{ seccion, requerimiento }`).
- **Histórico (respuestas viejas de promoción)**: existía un `Programa` con
  `aval` / `garantia` escalares (`'NO_REQUIERE' | 'OPCIONAL' | 'OBLIGATORIO'`).

Se eliminó `features/solicitudes/types/programa.types.ts` (sus campos escalares
no se usaban) y todo el front usa ahora el `Programa` de
`features/settings/types/programa.types.ts`. Pero `ProgramaDetalle` en
`features/promocion/types/solicitud.types.ts` **todavía** expone `aval` /
`garantia` escalares porque así responde `GET /admin/promocion/:id`.

**Arreglo futuro:** que el endpoint de detalle de promoción devuelva `secciones[]`
y borrar los escalares.

---

## 3. Enums: fuente única generada

`frontend/src/shared/types/domain.enums.ts` se **genera** desde
`backend/generated/prisma/enums.ts` (`npm run gen:enums`, también en
`predev`/`prebuild`). No editarlo a mano. El chequeo de contrato
(`npm run check:contract` desde la raíz) falla si el front y Prisma divergen.
