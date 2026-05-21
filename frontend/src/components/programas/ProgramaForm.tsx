"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    Loader2, FileText, DollarSign, ShieldCheck,
    AlertCircle, Check, User, Building2,
    BadgeCheck, FileCheck2, Banknote, Calendar,
} from "lucide-react";

import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge }    from "@/components/ui/badge";
import { cn }       from "@/lib/utils/cn";

import { crearPrograma, actualizarPrograma } from "@/lib/api/programas";
import type { Programa, ProgramaFormData }   from "@/lib/types/programa.types";

/* ── Types ────────────────────────────────────────────────────────────────── */
interface ProgramaFormProps { programa?: Programa; }

const defaultValues: ProgramaFormData = {
    nombre: "", descripcion: "", objetivo: "",
    permitePersonaFisica: true, permitePersonaMoral: false,
    montoMinimo: 0, montoMaximo: 0,
    tasaOrdinaria: 0, tasaMoratoria: 0, tasaAnual: 0,
    plazoMinimoMeses: 1, plazoMaximoMeses: 12,
    avalObligatorio: false, avalOpcional: false,
    garantiaObligatoria: false, garantiaOpcional: false,
    datosFinancierosCompletos: false, requiereCurp: true, requiereRfc: true,
};

/* ── Sub-components ───────────────────────────────────────────────────────── */

function SectionHeading({ icon: Icon, title, description }: {
    icon: React.ElementType; title: string; description: string;
}) {
    return (
        <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

function FieldRow({ label, error, hint, required, children }: {
    label: string; error?: string; hint?: string;
    required?: boolean; children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground/75">
                {label}{required && <span className="ml-0.5 text-destructive">*</span>}
            </Label>
            {children}
            {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
            {error && (
                <p className="flex items-center gap-1 text-xs text-destructive font-medium">
                    <AlertCircle className="h-3 w-3 shrink-0" />{error}
                </p>
            )}
        </div>
    );
}

/* Inputs with optional prefix / suffix overlay */
function NumberInput({ prefix, suffix, error, className, ...props }: 
    React.InputHTMLAttributes<HTMLInputElement> & { prefix?: string; suffix?: string; error?: boolean }
) {
    return (
        <div className="relative">
            {prefix && (
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    {prefix}
                </span>
            )}
            <Input
                type="number"
                className={cn(
                    "bg-background",
                    prefix  && "pl-7",
                    suffix  && "pr-14",
                    error   && "border-destructive ring-destructive/20 focus-visible:ring-destructive/30",
                    className
                )}
                {...props}
            />
            {suffix && (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    {suffix}
                </span>
            )}
        </div>
    );
}

/* Toggle card that looks like a proper shadcn-themed option */
function ToggleCard({ label, description, icon: Icon, checked, onChange }: {
    label: string; description: string; icon: React.ElementType;
    checked: boolean; onChange: (v: boolean) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={cn(
                "group flex w-full items-start gap-3 rounded-lg border p-4 text-left",
                "transition-colors duration-150 cursor-pointer",
                checked
                    ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-background hover:border-border hover:bg-muted/40",
            )}
        >
            <div className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                checked ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
            )}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium leading-none", checked ? "text-primary" : "text-foreground")}>
                    {label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
            </div>
            <div className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                checked ? "border-primary bg-primary" : "border-muted-foreground/30"
            )}>
                {checked && <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />}
            </div>
        </button>
    );
}

function Divider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">{label}</span>
            <div className="h-px flex-1 bg-border" />
        </div>
    );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("rounded-xl border border-border bg-card p-6 shadow-sm", className)}>
            {children}
        </div>
    );
}

/* ── Main Component ───────────────────────────────────────────────────────── */
export function ProgramaForm({ programa }: ProgramaFormProps) {
    const router  = useRouter();
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const {
        register, handleSubmit, watch, setValue,
        formState: { errors },
    } = useForm<ProgramaFormData>({
        defaultValues: programa ? { ...programa } : defaultValues,
        mode: "onTouched",
    });

    const toggle = (name: keyof ProgramaFormData) => ({
        checked:  !!watch(name),
        onChange: (v: boolean) => setValue(name, v),
    });

    const onSubmit = async (data: ProgramaFormData) => {
        setLoading(true); setApiError(null);
        try {
            const parsed = {
                ...data,
                montoMinimo:      Number(data.montoMinimo),
                montoMaximo:      Number(data.montoMaximo),
                tasaOrdinaria:    Number(data.tasaOrdinaria),
                tasaMoratoria:    Number(data.tasaMoratoria),
                tasaAnual:        Number(data.tasaAnual),
                plazoMinimoMeses: Number(data.plazoMinimoMeses),
                plazoMaximoMeses: Number(data.plazoMaximoMeses),
            };
            programa ? await actualizarPrograma(programa.id, parsed) : await crearPrograma(parsed);
            router.push("/dashboard/admin/programas");
            router.refresh();
        } catch (err: unknown) {
            setApiError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 max-w-8xl mx-auto">

            {/* ── Row 1: Información general (2/3) + Tipo de persona (1/3) ── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                {/* General — ocupa 2 columnas */}
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
                                    rows={4}
                                    placeholder="Descripción del programa..."
                                    className={cn("bg-background resize-none", errors.descripcion && "border-destructive")}
                                    {...register("descripcion", {
                                        required: "La descripción es obligatoria",
                                        minLength: { value: 10, message: "Mínimo 10 caracteres" },
                                    })}
                                />
                            </FieldRow>
                            <FieldRow label="Objetivo" required error={errors.objetivo?.message}>
                                <Textarea
                                    rows={4}
                                    placeholder="Objetivo principal del financiamiento..."
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

                {/* Tipo de persona — 1 columna */}
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

                    {/* Active badges */}
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
                <Card className="lg:col-span-2">
                    <SectionHeading icon={DollarSign} title="Condiciones Financieras" description="Montos, tasas y plazos del programa" />
                    <div className="space-y-5">

                        {/* Montos */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FieldRow label="Monto mínimo (MXN)" required error={errors.montoMinimo?.message}>
                                <NumberInput
                                    prefix="$" min={0} step={1000}
                                    error={!!errors.montoMinimo}
                                    {...register("montoMinimo", {
                                        required: "Campo requerido",
                                        min: { value: 1, message: "Debe ser mayor a 0" },
                                        validate: v => Number(v) < Number(watch("montoMaximo")) || "Debe ser menor al monto máximo",
                                    })}
                                />
                            </FieldRow>
                            <FieldRow label="Monto máximo (MXN)" required error={errors.montoMaximo?.message}>
                                <NumberInput
                                    prefix="$" min={0} step={1000}
                                    error={!!errors.montoMaximo}
                                    {...register("montoMaximo", {
                                        required: "Campo requerido",
                                        validate: v => Number(v) > Number(watch("montoMinimo")) || "Debe ser mayor al monto mínimo",
                                    })}
                                />
                            </FieldRow>
                        </div>

                        <Divider label="Tasas de interés" />

                        {/* Tasas — 3 iguales */}
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

                        {/* Plazos — 2 iguales + info badge */}
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

                        {/* Inline range hint */}
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
            </div>

            {/* ── Row 3: Requisitos — aval (2 col) + documentación (3 col) ── */}
            <Card>
                <SectionHeading icon={ShieldCheck} title="Requisitos" description="Garantías, aval e información requerida del solicitante" />
                <div className="space-y-5">

                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aval y garantía</p>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <ToggleCard label="Aval Obligatorio"    description="Requisito indispensable"           icon={BadgeCheck}  {...toggle("avalObligatorio")} />
                            <ToggleCard label="Aval Opcional"       description="Puede incluirse voluntariamente"   icon={User}        {...toggle("avalOpcional")} />
                            <ToggleCard label="Garantía Obligatoria" description="Garantía patrimonial requerida"   icon={ShieldCheck} {...toggle("garantiaObligatoria")} />
                            <ToggleCard label="Garantía Opcional"   description="Se puede incluir opcionalmente"   icon={Banknote}    {...toggle("garantiaOpcional")} />
                        </div>
                    </div>

                    <Divider label="Documentación" />

                    <div className="grid gap-3 sm:grid-cols-4">
                        <ToggleCard label="Datos Financieros"   description="Estados financieros e información contable"  icon={DollarSign}   {...toggle("datosFinancierosCompletos")} />
                        <ToggleCard label="Requiere CURP"       description="CURP del solicitante obligatorio"              icon={FileCheck2}   {...toggle("requiereCurp")} />
                        <ToggleCard label="Requiere RFC"        description="RFC del solicitante obligatorio"               icon={FileText}     {...toggle("requiereRfc")} />
                    </div>
                </div>
            </Card>

            {/* ── Error + Actions ───────────────────────────────────────────── */}
            {apiError && (
                <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <p className="text-sm text-destructive">{apiError}</p>
                </div>
            )}

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