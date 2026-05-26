'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronRight, Info, Loader2, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { getProgramas } from '@/lib/api/programas';
import { ProgramaResumen, TipoPersona, Sector, TamanoEmpresa } from '@/lib/types/solicitudes.types';
import { cn } from '@/lib/utils/cn';

const schema = z.object({
    programaId: z.string().min(1, 'Selecciona un programa'),
    tipoPersona: z.enum(['FISICA', 'MORAL']),
    sector: z.enum(['AGROPECUARIO', 'INDUSTRIAL', 'COMERCIAL', 'SERVICIOS', 'TECNOLOGIA', 'OTRO']),
    tamanoEmpresa: z.enum(['MICRO', 'PEQUENA', 'MEDIANA', 'GRANDE']).optional(),
    montoSolicitado: z.coerce
        .number({ error: 'Ingresa un monto válido' })
        .positive('El monto debe ser mayor a 0'),
    plazoSolicitado: z.coerce
        .number({ error: 'Ingresa un plazo válido' })
        .int()
        .positive('El plazo debe ser mayor a 0'),
});

type FormValues = z.infer<typeof schema>;

const SECTORES: { value: Sector; label: string }[] = [
    { value: 'AGROPECUARIO', label: 'Agropecuario' },
    { value: 'INDUSTRIAL', label: 'Industrial' },
    { value: 'COMERCIAL', label: 'Comercial' },
    { value: 'SERVICIOS', label: 'Servicios' },
    { value: 'TECNOLOGIA', label: 'Tecnología' },
    { value: 'OTRO', label: 'Otro' },
];

const TAMANOS: { value: TamanoEmpresa; label: string }[] = [
    { value: 'MICRO', label: 'Micro (1–10 empleados)' },
    { value: 'PEQUENA', label: 'Pequeña (11–50 empleados)' },
    { value: 'MEDIANA', label: 'Mediana (51–250 empleados)' },
    { value: 'GRANDE', label: 'Grande (más de 250 empleados)' },
];

interface Props {
    defaultValues?: Partial<FormValues>;
    onSubmit: (values: FormValues & { programa: ProgramaResumen }) => Promise<void>;
    loading?: boolean;
}

export function StepDatosGenerales({ defaultValues, onSubmit, loading }: Props) {
    const [programas, setProgramas] = useState<ProgramaResumen[]>([]);
    const [loadingProgramas, setLoadingProgramas] = useState(true);
    const [selectedPrograma, setSelectedPrograma] = useState<ProgramaResumen | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            tipoPersona: 'FISICA',
            ...defaultValues,
        },
    });

    const programaId = watch('programaId');
    const tipoPersona = watch('tipoPersona');
    const montoSolicitado = watch('montoSolicitado');
    const plazoSolicitado = watch('plazoSolicitado');

    // Cargar programas activos
    useEffect(() => {
        getProgramas()
            .then((data) => {
                const activos = data.filter((p) => p.activo);
                // Filtrar por tipo de persona
                setProgramas(activos);
            })
            .catch(console.error)
            .finally(() => setLoadingProgramas(false));
    }, []);

    // Actualizar programa seleccionado y filtrar por tipo de persona
    useEffect(() => {
        if (programaId) {
            const prog = programas.find((p) => p.id === programaId) ?? null;
            setSelectedPrograma(prog);
        }
    }, [programaId, programas]);

    // Filtrar programas según tipo de persona
    const programasFiltrados = programas.filter((p) =>
        tipoPersona === 'FISICA' ? p.permitePersonaFisica : p.permitePersonaMoral
    );

    const handleFormSubmit = async (values: FormValues) => {
        if (!selectedPrograma) return;

        // Validar monto contra programa
        if (values.montoSolicitado < selectedPrograma.montoMinimo) {
            return;
        }
        if (values.montoSolicitado > selectedPrograma.montoMaximo) {
            return;
        }

        await onSubmit({ ...values, programa: selectedPrograma });
    };

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">

            {/* Tipo de persona */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">Tipo de persona</Label>
                <div className="grid grid-cols-2 gap-3">
                    {(['FISICA', 'MORAL'] as TipoPersona[]).map((tipo) => (
                        <button
                            key={tipo}
                            type="button"
                            onClick={() => {
                                setValue('tipoPersona', tipo);
                                setValue('programaId', ''); // reset programa al cambiar tipo
                                setSelectedPrograma(null);
                            }}
                            className={cn(
                                'flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
                                tipoPersona === tipo
                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                            )}
                        >
                            {tipo === 'FISICA' ? (
                                <User className={cn('w-5 h-5 shrink-0', tipoPersona === tipo ? 'text-blue-600' : 'text-gray-400')} />
                            ) : (
                                <Building2 className={cn('w-5 h-5 shrink-0', tipoPersona === tipo ? 'text-blue-600' : 'text-gray-400')} />
                            )}
                            <div>
                                <p className="font-semibold text-sm">
                                    {tipo === 'FISICA' ? 'Persona Física' : 'Persona Moral'}
                                </p>
                                <p className="text-xs opacity-70 mt-0.5">
                                    {tipo === 'FISICA' ? 'Individuo o profesional independiente' : 'Empresa o sociedad'}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Programa */}
            <div className="space-y-2">
                <Label htmlFor="programaId" className="text-sm font-semibold text-gray-700">
                    Programa de crédito <span className="text-red-500">*</span>
                </Label>
                {loadingProgramas ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Cargando programas…
                    </div>
                ) : (
                    <Select
                        value={programaId}
                        onValueChange={(val) => setValue('programaId', val)}
                    >
                        <SelectTrigger
                            id="programaId"
                            className={cn(errors.programaId && 'border-red-500')}
                        >
                            <SelectValue placeholder="Selecciona un programa" />
                        </SelectTrigger>
                        <SelectContent>
                            {programasFiltrados.length === 0 ? (
                                <div className="py-3 px-3 text-sm text-gray-500">
                                    No hay programas disponibles para este tipo de persona.
                                </div>
                            ) : (
                                programasFiltrados.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.nombre}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                )}
                {errors.programaId && (
                    <p className="text-xs text-red-500">{errors.programaId.message}</p>
                )}

                {/* Info del programa seleccionado */}
                {selectedPrograma && (
                    <div className="mt-3 p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-2">
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-700">{selectedPrograma.descripcion}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3 pt-1">
                            <div className="text-center">
                                <p className="text-xs text-gray-500">Monto</p>
                                <p className="text-xs font-semibold text-gray-700">
                                    {formatCurrency(selectedPrograma.montoMinimo)} – {formatCurrency(selectedPrograma.montoMaximo)}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-500">Plazo</p>
                                <p className="text-xs font-semibold text-gray-700">
                                    {selectedPrograma.plazoMinimoMeses}–{selectedPrograma.plazoMaximoMeses} meses
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-500">Tasa anual</p>
                                <p className="text-xs font-semibold text-gray-700">
                                    {selectedPrograma.tasaAnual}%
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sector */}
            <div className="space-y-2">
                <Label htmlFor="sector" className="text-sm font-semibold text-gray-700">
                    Sector económico <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={watch('sector')}
                    onValueChange={(val) => setValue('sector', val as Sector)}
                >
                    <SelectTrigger id="sector" className={cn(errors.sector && 'border-red-500')}>
                        <SelectValue placeholder="Selecciona un sector" />
                    </SelectTrigger>
                    <SelectContent>
                        {SECTORES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.sector && <p className="text-xs text-red-500">{errors.sector.message}</p>}
            </div>

            {/* Tamaño de empresa */}
            <div className="space-y-2">
                <Label htmlFor="tamanoEmpresa" className="text-sm font-semibold text-gray-700">
                    Tamaño de empresa
                </Label>
                <Select
                    value={watch('tamanoEmpresa') ?? ''}
                    onValueChange={(val) => setValue('tamanoEmpresa', val as TamanoEmpresa)}
                >
                    <SelectTrigger id="tamanoEmpresa">
                        <SelectValue placeholder="Selecciona (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                        {TAMANOS.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Monto y plazo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="montoSolicitado" className="text-sm font-semibold text-gray-700">
                        Monto solicitado (MXN) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="montoSolicitado"
                        type="number"
                        placeholder={
                            selectedPrograma
                                ? `${selectedPrograma.montoMinimo.toLocaleString('es-MX')} – ${selectedPrograma.montoMaximo.toLocaleString('es-MX')}`
                                : 'Ej. 50000'
                        }
                        className={cn(errors.montoSolicitado && 'border-red-500')}
                        {...register('montoSolicitado')}
                    />
                    {errors.montoSolicitado && (
                        <p className="text-xs text-red-500">{errors.montoSolicitado.message}</p>
                    )}
                    {selectedPrograma && montoSolicitado > 0 && (
                        <>
                            {montoSolicitado < selectedPrograma.montoMinimo && (
                                <p className="text-xs text-amber-600">
                                    El monto mínimo para este programa es {formatCurrency(selectedPrograma.montoMinimo)}
                                </p>
                            )}
                            {montoSolicitado > selectedPrograma.montoMaximo && (
                                <p className="text-xs text-red-500">
                                    El monto máximo para este programa es {formatCurrency(selectedPrograma.montoMaximo)}
                                </p>
                            )}
                        </>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="plazoSolicitado" className="text-sm font-semibold text-gray-700">
                        Plazo solicitado (meses) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="plazoSolicitado"
                        type="number"
                        placeholder={
                            selectedPrograma
                                ? `${selectedPrograma.plazoMinimoMeses} – ${selectedPrograma.plazoMaximoMeses}`
                                : 'Ej. 12'
                        }
                        className={cn(errors.plazoSolicitado && 'border-red-500')}
                        {...register('plazoSolicitado')}
                    />
                    {errors.plazoSolicitado && (
                        <p className="text-xs text-red-500">{errors.plazoSolicitado.message}</p>
                    )}
                    {selectedPrograma && plazoSolicitado > 0 && (
                        <>
                            {plazoSolicitado < selectedPrograma.plazoMinimoMeses && (
                                <p className="text-xs text-amber-600">
                                    Plazo mínimo: {selectedPrograma.plazoMinimoMeses} meses
                                </p>
                            )}
                            {plazoSolicitado > selectedPrograma.plazoMaximoMeses && (
                                <p className="text-xs text-red-500">
                                    Plazo máximo: {selectedPrograma.plazoMaximoMeses} meses
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={loading} className="gap-2 min-w-[160px]">
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            Guardar y continuar
                            <ChevronRight className="w-4 h-4" />
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}