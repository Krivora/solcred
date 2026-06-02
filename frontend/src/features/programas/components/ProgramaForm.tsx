"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    Loader2, FileText, DollarSign, ShieldCheck,
    Check, User, Building2, BadgeCheck, Calendar,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils/cn";
import { toast } from "@/shared/lib/utils/toast";

import { Card } from "./form/Card";
import { Divider } from "./form/Divider";
import { FieldRow } from "./form/FieldRow";
import { NumberInput } from "./form/NumberInput";
import { RequerimientoSelector } from "./form/RequerimientoSelector";
import { SectionHeading } from "./form/SectionHeading";
import { ToggleCard } from "./form/ToggleCard";

import { crearPrograma, actualizarPrograma } from "../api/programas";
import { Requerimiento, type Programa, type ProgramaFormData } from "../types/programa.types";

interface ProgramaFormProps { programa?: Programa; }

const defaultValues: ProgramaFormData = {
    nombre: "", descripcion: "", objetivo: "",
    permitePersonaFisica: true, permitePersonaMoral: false,
    montoMinimo: 0, montoMaximo: 0,
    tasaOrdinaria: 0, tasaMoratoria: 0, tasaAnual: 0,
    plazoMinimoMeses: 1, plazoMaximoMeses: 12,
    aval: Requerimiento.NO_REQUIERE,
    garantia: Requerimiento.NO_REQUIERE,
    datosFinancierosCompletos: false,
};

export function ProgramaForm({ programa }: ProgramaFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProgramaFormData>({
        defaultValues: programa ?? defaultValues,
        mode: "onTouched",
    });

    const toggle = (name: keyof ProgramaFormData) => ({
        checked: !!watch(name),
        onChange: (v: boolean) => setValue(name, v),
    });

    const onSubmit = async (data: ProgramaFormData) => {
        if (!data.permitePersonaFisica && !data.permitePersonaMoral) {
            toast.warning("Selecciona al menos un tipo de solicitante");
            return;
        }

        setLoading(true);
        try {
            const parsed = {
                ...data,
                montoMinimo:     Number(data.montoMinimo),
                montoMaximo:     Number(data.montoMaximo),
                tasaOrdinaria:   Number(data.tasaOrdinaria),
                tasaMoratoria:   Number(data.tasaMoratoria),
                tasaAnual:       Number(data.tasaAnual),
                plazoMinimoMeses: Number(data.plazoMinimoMeses),
                plazoMaximoMeses: Number(data.plazoMaximoMeses),
            };
            programa
                ? await actualizarPrograma(programa.id, parsed)
                : await crearPrograma(parsed);

           toast.success(programa ? "Programa actualizado" : "Programa creado", 
                programa 
                    ? `Los cambios en "${programa.nombre}" se guardaron correctamente` 
                    : `El programa "${data.nombre}" ya está disponible en el sistema`
            );
            router.push("/dashboard/admin/configuracion/programas");
        } catch (err: unknown) {
           toast.error(
                programa ? "Error al actualizar el programa" : "Error al crear el programa",
                err instanceof Error ? err.message : "Ocurrió un error inesperado, intenta de nuevo"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 max-w-8xl mx-auto">

            {/* Row 1: Info general + Tipo de persona */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <SectionHeading icon={FileText} title="Información General" description="Nombre, descripción y objetivo del programa" />
                    <div className="space-y-4">
                        <FieldRow label="Nombre del programa" required error={errors.nombre?.message}>
                            <Input
                                placeholder="Ej. Crédito PyME Ágil"
                                className={cn("bg-background", errors.nombre && "border-destructive")}
                                {...register("nombre", {
                                    required: "El nombre es obligatorio",
                                    minLength: { value: 4, message: "Mínimo 4 caracteres" },
                                    maxLength: { value: 120, message: "Máximo 120 caracteres" },
                                })}
                            />
                        </FieldRow>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FieldRow label="Descripción" required error={errors.descripcion?.message}>
                                <Textarea
                                    rows={4} placeholder="Descripción del programa..."
                                    className={cn("bg-background resize-none", errors.descripcion && "border-destructive")}
                                    {...register("descripcion", {
                                        required: "La descripción es obligatoria",
                                        minLength: { value: 10, message: "Mínimo 10 caracteres" },
                                    })}
                                />
                            </FieldRow>
                            <FieldRow label="Objetivo" required error={errors.objetivo?.message}>
                                <Textarea
                                    rows={4} placeholder="Objetivo principal del financiamiento..."
                                    className={cn("bg-background resize-none", errors.objetivo && "border-destructive")}
                                    {...register("objetivo", {
                                        required: "El objetivo es obligatorio",
                                        minLength: { value: 10, message: "Mínimo 10 caracteres" },
                                    })}
                                />
                            </FieldRow>
                        </div>
                    </div>
                </Card>

                <Card>
                    <SectionHeading icon={User} title="Tipo de Solicitante" description="¿Quién puede aplicar?" />
                    <div className="space-y-3">
                        <ToggleCard
                            label="Persona Física"
                            description="Individuos con actividad empresarial o profesional independiente"
                            icon={User}
                            {...toggle("permitePersonaFisica")}
                        />
                        <ToggleCard
                            label="Persona Moral"
                            description="Empresas, sociedades y organizaciones legalmente constituidas"
                            icon={Building2}
                            {...toggle("permitePersonaMoral")}
                        />
                    </div>
                    {(watch("permitePersonaFisica") || watch("permitePersonaMoral")) && (
                        <div className="mt-4 flex gap-2 flex-wrap border-t border-border pt-4">
                            {watch("permitePersonaFisica") && (
                                <Badge variant="secondary" className="gap-1 text-xs">
                                    <Check className="h-3 w-3 text-primary" /> PF habilitado
                                </Badge>
                            )}
                            {watch("permitePersonaMoral") && (
                                <Badge variant="secondary" className="gap-1 text-xs">
                                    <Check className="h-3 w-3 text-primary" /> PM habilitado
                                </Badge>
                            )}
                        </div>
                    )}
                </Card>
            </div>

            {/* Row 2: Condiciones financieras */}
            <Card>
                <SectionHeading icon={DollarSign} title="Condiciones Financieras" description="Montos, tasas y plazos del programa" />
                <div className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FieldRow label="Monto mínimo (MXN)" required error={errors.montoMinimo?.message}>
                            <NumberInput prefix="$" min={0} step={1000} error={!!errors.montoMinimo}
                                {...register("montoMinimo", {
                                    required: "Campo requerido",
                                    min: { value: 1, message: "Debe ser mayor a 0" },
                                    validate: v => Number(v) < Number(watch("montoMaximo")) || "Debe ser menor al monto máximo",
                                })}
                            />
                        </FieldRow>
                        <FieldRow label="Monto máximo (MXN)" required error={errors.montoMaximo?.message}>
                            <NumberInput prefix="$" min={0} step={1000} error={!!errors.montoMaximo}
                                {...register("montoMaximo", {
                                    required: "Campo requerido",
                                    validate: v => Number(v) > Number(watch("montoMinimo")) || "Debe ser mayor al monto mínimo",
                                })}
                            />
                        </FieldRow>
                    </div>

                    <Divider label="Tasas de interés" />

                    <div className="grid gap-4 grid-cols-3">
                        <FieldRow label="Tasa ordinaria" error={errors.tasaOrdinaria?.message}>
                            <NumberInput suffix="%" step={0.01} min={0} max={100} error={!!errors.tasaOrdinaria}
                                {...register("tasaOrdinaria", { min: { value: 0, message: "Mín 0" }, max: { value: 100, message: "Máx 100" } })} />
                        </FieldRow>
                        <FieldRow label="Tasa moratoria" error={errors.tasaMoratoria?.message}>
                            <NumberInput suffix="%" step={0.01} min={0} max={100} error={!!errors.tasaMoratoria}
                                {...register("tasaMoratoria", { min: { value: 0, message: "Mín 0" }, max: { value: 100, message: "Máx 100" } })} />
                        </FieldRow>
                        <FieldRow label="Tasa anual (CAT)" error={errors.tasaAnual?.message}>
                            <NumberInput suffix="%" step={0.01} min={0} max={100} error={!!errors.tasaAnual}
                                {...register("tasaAnual", { min: { value: 0, message: "Mín 0" }, max: { value: 100, message: "Máx 100" } })} />
                        </FieldRow>
                    </div>

                    <Divider label="Plazos" />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FieldRow label="Plazo mínimo" required error={errors.plazoMinimoMeses?.message}>
                            <NumberInput suffix="meses" min={1} error={!!errors.plazoMinimoMeses}
                                {...register("plazoMinimoMeses", {
                                    required: "Campo requerido",
                                    min: { value: 1, message: "Mínimo 1 mes" },
                                    validate: v => Number(v) < Number(watch("plazoMaximoMeses")) || "Debe ser menor al plazo máximo",
                                })} />
                        </FieldRow>
                        <FieldRow label="Plazo máximo" required error={errors.plazoMaximoMeses?.message}>
                            <NumberInput suffix="meses" min={1} error={!!errors.plazoMaximoMeses}
                                {...register("plazoMaximoMeses", {
                                    required: "Campo requerido",
                                    validate: v => Number(v) > Number(watch("plazoMinimoMeses")) || "Debe ser mayor al plazo mínimo",
                                })} />
                        </FieldRow>
                    </div>

                    {Number(watch("plazoMaximoMeses")) > Number(watch("plazoMinimoMeses")) && (
                        <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                                Rango activo: <span className="font-semibold text-foreground">{watch("plazoMinimoMeses")} – {watch("plazoMaximoMeses")} meses</span>
                            </span>
                        </div>
                    )}
                </div>
            </Card>

            {/* Row 3: Requisitos */}
            <Card>
                <SectionHeading icon={ShieldCheck} title="Requisitos" description="Garantías, aval e información requerida del solicitante" />
                <div className="space-y-5">
                    <RequerimientoSelector
                        label="Aval"
                        icon={BadgeCheck}
                        value={watch("aval")}
                        onChange={(v) => setValue("aval", v)}
                    />
                    <RequerimientoSelector
                        label="Garantía"
                        icon={ShieldCheck}
                        value={watch("garantia")}
                        onChange={(v) => setValue("garantia", v)}
                    />
                </div>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-border pt-5">
                <p className="text-xs text-muted-foreground">
                    Los campos con <span className="text-destructive font-bold">*</span> son obligatorios
                </p>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => router.back()} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" size="sm" disabled={loading} className="min-w-32">
                        {loading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                        {programa ? "Guardar cambios" : "Crear programa"}
                    </Button>
                </div>
            </div>
        </form>
    );
}