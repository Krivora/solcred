# Deuda conocida

Cosas que sabemos que están mal o inconsistentes y decidimos **no** arreglar
todavía (cambiarlas toca el backend y varios consumidores a la vez). Documentadas
para que nadie las "descubra" en producción.

---

## 1. Enums: fuente única generada

`frontend/src/shared/types/domain.enums.ts` se **genera** desde
`backend/generated/prisma/enums.ts` (`npm run gen:enums`, también en
`predev`/`prebuild`). No editarlo a mano. El chequeo de contrato
(`npm run check:contract` desde la raíz) falla si el front y Prisma divergen.

---

## 2. `validate(schema, "query")` no funciona en Express 5

`src/middlewares/validate.middleware.ts` reasigna `req[source]`. En Express 5
`req.query` es un *getter* de solo lectura, así que `validate(schema, "query")`
lanza `TypeError: Cannot set property query`. `"body"` y `"params"` sí funcionan.

Workaround usado en el módulo `soporte`: validar la query **dentro del service**
con `schema.parse(rawQuery)` en vez de en el router. Si se quiere arreglar de
raíz, el middleware debería mutar el objeto en sitio (`Object.assign`) o guardar
lo parseado en `res.locals` en vez de reasignar `req.query`.
