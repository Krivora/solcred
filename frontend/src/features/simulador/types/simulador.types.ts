/** Espejo de `backend/src/modules/public/programas-publico.service.ts`. */
export interface ProgramaPublico {
  id: string
  nombre: string
  descripcion: string
  montoMinimo: number
  montoMaximo: number
  plazoMinimoMeses: number
  plazoMaximoMeses: number
  tasaAnual: number
}
