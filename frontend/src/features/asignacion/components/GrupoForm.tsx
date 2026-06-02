// components/admin/asignacion/GrupoForm.tsx
'use client'

import { useState } from 'react'
import { Plus, Trash2, AlertCircle, Info } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Switch } from '@/shared/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select'
import type {
    GrupoGestion,
    CrearGrupoDto,
    ActualizarGrupoDto,
    ReglaDto,
    CampoRegla,
    OperadorRegla,
    GestorResumen,
} from '../types/asignacion.types'
import {
    CAMPO_LABELS,
    OPERADOR_LABELS,
    CAMPOS_NUMERICOS,
    CAMPOS_LISTA,
} from '../types/asignacion.types'

// Opciones de valor según el campo
const VALORES_POR_CAMPO: Partial<Record<CampoRegla, { label: string; value: string }[]>> = {
    TIPO_PERSONA: [
        { label: 'Persona Física', value: 'FISICA' },
        { label: 'Persona Moral', value: 'MORAL' },
    ],
    SECTOR: [
        { label: 'Agropecuario', value: 'AGROPECUARIO' },
        { label: 'Industrial', value: 'INDUSTRIAL' },
        { label: 'Comercial', value: 'COMERCIAL' },
        { label: 'Servicios', value: 'SERVICIOS' },
        { label: 'Tecnología', value: 'TECNOLOGIA' },
        { label: 'Otro', value: 'OTRO' },
    ],
    TAMANO_EMPRESA: [
        { label: 'Micro', value: 'MICRO' },
        { label: 'Pequeña', value: 'PEQUENA' },
        { label: 'Mediana', value: 'MEDIANA' },
        { label: 'Grande', value: 'GRANDE' },
    ],
}

// Operadores disponibles según tipo de campo
const OPERADORES_POR_TIPO = {
    lista: ['IGUAL', 'DIFERENTE', 'EN_LISTA'] as OperadorRegla[],
    numerico: ['IGUAL', 'MAYOR_QUE', 'MENOR_QUE', 'MAYOR_IGUAL', 'MENOR_IGUAL'] as OperadorRegla[],
    texto: ['IGUAL', 'DIFERENTE'] as OperadorRegla[],
}

function getOperadoresPorCampo(campo: CampoRegla): OperadorRegla[] {
    if (CAMPOS_NUMERICOS.includes(campo)) return OPERADORES_POR_TIPO.numerico
    if (CAMPOS_LISTA.includes(campo)) return OPERADORES_POR_TIPO.lista
    return OPERADORES_POR_TIPO.texto
}

interface ReglaRowProps {
    regla: ReglaDto
    index: number
    onChange: (index: number, regla: ReglaDto) => void
    onEliminar: (index: number) => void
}

function ReglaRow({ regla, index, onChange, onEliminar }: ReglaRowProps) {
    const operadoresDisponibles = regla.campo
        ? getOperadoresPorCampo(regla.campo)
        : []

    const opcionesValor = regla.campo ? VALORES_POR_CAMPO[regla.campo] : null
    const esNumerico = CAMPOS_NUMERICOS.includes(regla.campo)
    const esEnLista = regla.operador === 'EN_LISTA'

    const handleCampoChange = (campo: CampoRegla) => {
        onChange(index, { campo, operador: '' as OperadorRegla, valor: '' })
    }

    const handleOperadorChange = (operador: OperadorRegla) => {
        onChange(index, { ...regla, operador, valor: '' })
    }

    return (
        <div className="flex items-start gap-2 p-3 rounded-lg border border-border/60 bg-muted/20">
            <div className="flex-1 grid grid-cols-3 gap-2">

                {/* Campo */}
                <Select
                    value={regla.campo || ''}
                    onValueChange={(v) => handleCampoChange(v as CampoRegla)}
                >
                    <SelectTrigger className="h-8 text-xs border-border/60">
                        <SelectValue placeholder="Campo..." />
                    </SelectTrigger>
                    <SelectContent>
                        {(Object.keys(CAMPO_LABELS) as CampoRegla[]).map((campo) => (
                            <SelectItem key={campo} value={campo}>
                                {CAMPO_LABELS[campo]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Operador */}
                <Select
                    value={regla.operador || ''}
                    onValueChange={(v) => handleOperadorChange(v as OperadorRegla)}
                    disabled={!regla.campo}
                >
                    <SelectTrigger className="h-8 text-xs border-border/60">
                        <SelectValue placeholder="Operador..." />
                    </SelectTrigger>
                    <SelectContent>
                        {operadoresDisponibles.map((op) => (
                            <SelectItem key={op} value={op}>
                                {OPERADOR_LABELS[op]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Valor */}
                {opcionesValor && !esEnLista ? (
                    <Select
                        value={regla.valor}
                        onValueChange={(v) => onChange(index, { ...regla, valor: v })}
                        disabled={!regla.operador}
                    >
                        <SelectTrigger className="h-8 text-xs border-border/60">
                            <SelectValue placeholder="Valor..." />
                        </SelectTrigger>
                        <SelectContent>
                            {opcionesValor.map((op) => (
                                <SelectItem key={op.value} value={op.value}>
                                    {op.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : esEnLista && opcionesValor ? (
                    // EN_LISTA: selector múltiple simplificado (checkboxes en select)
                    <Select
                        value=""
                        onValueChange={(v) => {
                            const lista: string[] = regla.valor
                                ? JSON.parse(regla.valor)
                                : []
                            const nueva = lista.includes(v)
                                ? lista.filter((x) => x !== v)
                                : [...lista, v]
                            onChange(index, { ...regla, valor: JSON.stringify(nueva) })
                        }}
                        disabled={!regla.operador}
                    >
                        <SelectTrigger className="h-8 text-xs border-border/60">
                            <span className="truncate text-xs">
                                {regla.valor && JSON.parse(regla.valor).length > 0
                                    ? `${JSON.parse(regla.valor).length} seleccionados`
                                    : 'Seleccionar...'}
                            </span>
                        </SelectTrigger>
                        <SelectContent>
                            {opcionesValor.map((op) => {
                                const lista: string[] = regla.valor
                                    ? JSON.parse(regla.valor)
                                    : []
                                return (
                                    <SelectItem key={op.value} value={op.value}>
                                        <span className="flex items-center gap-2">
                                            <span
                                                className={`w-3 h-3 rounded border flex items-center justify-center text-[8px] ${lista.includes(op.value)
                                                        ? 'bg-primary border-primary text-primary-foreground'
                                                        : 'border-border'
                                                    }`}
                                            >
                                                {lista.includes(op.value) ? '✓' : ''}
                                            </span>
                                            {op.label}
                                        </span>
                                    </SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                ) : (
                    <Input
                        value={regla.valor}
                        onChange={(e) => onChange(index, { ...regla, valor: e.target.value })}
                        placeholder={esNumerico ? '0.00' : 'Valor...'}
                        type={esNumerico ? 'number' : 'text'}
                        className="h-8 text-xs border-border/60"
                        disabled={!regla.operador}
                    />
                )}
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => onEliminar(index)}
                type="button"
            >
                <Trash2 className="h-3.5 w-3.5" />
            </Button>
        </div>
    )
}

interface Props {
    grupo?: GrupoGestion
    gestoresDisponibles: GestorResumen[]
    onSubmit: (dto: CrearGrupoDto | ActualizarGrupoDto) => Promise<boolean>
    onCancel: () => void
    cargando?: boolean
}

const REGLA_VACIA: ReglaDto = {
    campo: '' as CampoRegla,
    operador: '' as OperadorRegla,
    valor: '',
}

export function GrupoForm({
    grupo,
    gestoresDisponibles,
    onSubmit,
    onCancel,
    cargando,
}: Props) {
    const esEdicion = !!grupo

    const [nombre, setNombre] = useState(grupo?.nombre ?? '')
    const [descripcion, setDescripcion] = useState(grupo?.descripcion ?? '')
    const [prioridad, setPrioridad] = useState(grupo?.prioridad ?? 0)
    const [activo, setActivo] = useState(grupo?.activo ?? true)
    const [reglas, setReglas] = useState<ReglaDto[]>(
        grupo?.reglas.map(({ campo, operador, valor }) => ({ campo, operador, valor })) ?? []
    )
    const [gestorIds, setGestorIds] = useState<string[]>(
        grupo?.gestores.map((g) => g.gestorId) ?? []
    )
    const [errores, setErrores] = useState<string[]>([])

    const agregarRegla = () => {
        setReglas((prev) => [...prev, { ...REGLA_VACIA }])
    }

    const actualizarRegla = (index: number, regla: ReglaDto) => {
        setReglas((prev) => prev.map((r, i) => (i === index ? regla : r)))
    }

    const eliminarRegla = (index: number) => {
        setReglas((prev) => prev.filter((_, i) => i !== index))
    }

    const toggleGestor = (id: string) => {
        setGestorIds((prev) =>
            prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
        )
    }

    const validar = (): boolean => {
        const nuevosErrores: string[] = []

        if (!nombre.trim()) nuevosErrores.push('El nombre es requerido')
        if (gestorIds.length === 0) nuevosErrores.push('Selecciona al menos un gestor')

        const reglaIncompleta = reglas.some(
            (r) => !r.campo || !r.operador || !r.valor
        )
        if (reglaIncompleta) nuevosErrores.push('Completa todos los campos de las reglas')

        setErrores(nuevosErrores)
        return nuevosErrores.length === 0
    }

    const handleSubmit = async () => {
        if (!validar()) return

        const dto = {
            nombre: nombre.trim(),
            descripcion: descripcion.trim() || undefined,
            prioridad,
            ...(esEdicion && { activo }),
            reglas,
            gestorIds,
        }

        await onSubmit(dto)
    }

    return (
        <div className="flex flex-col gap-6">

            {/* Errores */}
            {errores.length > 0 && (
                <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-destructive/25 bg-destructive/5">
                    {errores.map((e, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-destructive">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {e}
                        </div>
                    ))}
                </div>
            )}

            {/* Información básica */}
            <div className="flex flex-col gap-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Información del grupo
                </p>

                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 flex flex-col gap-1.5">
                        <Label className="text-xs">Nombre</Label>
                        <Input
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej. Grupo Agropecuario"
                            className="h-8 text-sm border-border/60 focus-visible:border-primary/50"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">Prioridad</Label>
                        <Input
                            type="number"
                            min={0}
                            value={prioridad}
                            onChange={(e) => setPrioridad(Number(e.target.value))}
                            className="h-8 text-sm border-border/60 focus-visible:border-primary/50"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Descripción <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                    <Textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Describe qué tipo de solicitudes maneja este grupo..."
                        className="resize-none text-sm border-border/60 focus-visible:border-primary/50 focus-visible:ring-primary/20"
                        rows={2}
                    />
                </div>

                {esEdicion && (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
                        <div>
                            <p className="text-sm font-medium">Grupo activo</p>
                            <p className="text-xs text-muted-foreground">
                                Los grupos inactivos no reciben nuevas asignaciones
                            </p>
                        </div>
                        <Switch checked={activo} onCheckedChange={setActivo} />
                    </div>
                )}
            </div>

            {/* Reglas */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                            Reglas de asignación
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Todas las reglas deben cumplirse (AND)
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={agregarRegla}
                        type="button"
                        className="h-7 gap-1.5 text-xs border-border/60 hover:border-primary/30"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Agregar regla
                    </Button>
                </div>

                {reglas.length === 0 ? (
                    <div className="flex items-center gap-2.5 p-3 rounded-lg border border-dashed border-border/60 bg-muted/10">
                        <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                        <p className="text-xs text-muted-foreground">
                            Sin reglas este grupo actuará como <strong>grupo general</strong> y recibirá todas las solicitudes que no encajen en otros grupos
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {reglas.map((regla, i) => (
                            <ReglaRow
                                key={i}
                                regla={regla}
                                index={i}
                                onChange={actualizarRegla}
                                onEliminar={eliminarRegla}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Gestores */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                        Gestores asignados
                    </p>
                    <span className="text-xs text-muted-foreground">
                        {gestorIds.length} seleccionados
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {gestoresDisponibles.map((gestor) => {
                        const seleccionado = gestorIds.includes(gestor.id)
                        const iniciales = `${gestor.nombre[0]}${gestor.apellidoPaterno[0]}`.toUpperCase()

                        return (
                            <button
                                key={gestor.id}
                                type="button"
                                onClick={() => toggleGestor(gestor.id)}
                                className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all duration-150 ${seleccionado
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border/60 hover:border-primary/30 hover:bg-accent/30'
                                    }`}
                            >
                                <div
                                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold ${seleccionado
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground'
                                        }`}
                                >
                                    {iniciales}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">
                                        {gestor.nombre} {gestor.apellidoPaterno}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground truncate">
                                        {gestor.correo}
                                    </p>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-3 pt-2 border-t border-border/60">
                <Button
                    variant="outline"
                    className="flex-1 border-border/60"
                    onClick={onCancel}
                    disabled={cargando}
                    type="button"
                >
                    Cancelar
                </Button>
                <Button
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={handleSubmit}
                    disabled={cargando}
                    type="button"
                >
                    {cargando
                        ? 'Guardando...'
                        : esEdicion
                            ? 'Guardar cambios'
                            : 'Crear grupo'}
                </Button>
            </div>
        </div>
    )
}