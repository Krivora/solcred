# Deuda conocida

Cosas que sabemos que están mal o inconsistentes y decidimos **no** arreglar
todavía (cambiarlas toca el backend y varios consumidores a la vez). Documentadas
para que nadie las "descubra" en producción.

---

## 1. Contrato de tipos front↔back

### 1.1 Enums: fuente única generada

`frontend/src/shared/types/domain.enums.ts` se **genera** desde
`backend/generated/prisma/enums.ts` (`npm run gen:enums`, también en
`predev`/`prebuild`). No editarlo a mano. El chequeo de contrato
(`npm run check:contract` desde la raíz) falla si el front y Prisma divergen.

### 1.2 Shapes de respuesta: solicitud y expediente

`npm run check:contract` (que compila `scripts/check-contract.ts` con
`scripts/tsconfig.json`, **desde `backend/`** para que resuelva el cliente de
Prisma) verifica además que la respuesta del backend de los endpoints de
**solicitud** (`clientes/solicitudes`) y **expediente** satisface lo que el
frontend espera.

- El backend define sus `include`/`select` y los tipos derivados en
  `*.contract.ts` por módulo (`solicitudes.contract.ts`,
  `expediente.contract.ts`), con `Prisma.*GetPayload<{ include: typeof … }>`.
  Estos archivos **no tienen dependencias de runtime** (`import type` de
  Prisma) para poder importarse desde el script.
- Los servicios anotan su tipo de retorno con esos tipos → un `include`/`select`
  cambiado rompe `tsc` del backend.
- `check-contract.ts` compara `Wire<Backend>` (normaliza `Date → string`) con
  `WireLoose<Front>` (cada `?:` acepta además `null`). El chequeo es
  **direccional**: el backend puede mandar campos de más; no puede faltar
  ninguno que el front declare ni cambiar su tipo.

Pendiente: extender el patrón `*.contract.ts` al resto de módulos (promoción,
financiamiento, análisis, soporte, dashboard, reportes).

---

## 2. `validate(schema, "query")` no funciona en Express 5

`src/middlewares/validate.middleware.ts` reasigna `req[source]`. En Express 5
`req.query` es un *getter* de solo lectura, así que `validate(schema, "query")`
lanza `TypeError: Cannot set property query`. `"body"` y `"params"` sí funcionan.

Workaround usado en el módulo `soporte`: validar la query **dentro del service**
con `schema.parse(rawQuery)` en vez de en el router. Si se quiere arreglar de
raíz, el middleware debería mutar el objeto en sitio (`Object.assign`) o guardar
lo parseado en `res.locals` en vez de reasignar `req.query`.
