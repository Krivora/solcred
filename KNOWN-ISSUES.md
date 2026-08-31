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
