"use client";

import * as React from "react";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/cn";
import { formatearMonto, limpiarMonto } from "@/shared/lib/masks";

interface MontoInputProps
  extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type"> {
  /** valor crudo sin formato, ej "1234.5" (lo que espera el schema/backend) */
  value: string;
  onChange: (value: string) => void;
}

/**
 * Input de monto en pesos: muestra "$1,234.50" mientras el usuario escribe,
 * pero el valor que se propaga (onChange) es el crudo "1234.5" sin signo
 * de peso ni comas — lo que espera z.coerce.number() o crearMontoSchema.
 * Bloquea letras y más de un punto decimal.
 */
export const MontoInput = React.forwardRef<HTMLInputElement, MontoInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const displayValue = formatearMonto(value);

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="decimal"
        placeholder={props.placeholder ?? "$0.00"}
        value={displayValue}
        className={cn("text-right", className)}
        onChange={(e) => {
          const limpio = limpiarMonto(e.target.value);
          onChange(limpio);
        }}
        onKeyDown={(e) => {
          const teclasPermitidas = [
            "Backspace",
            "Delete",
            "Tab",
            "ArrowLeft",
            "ArrowRight",
            "Home",
            "End",
          ];
          if (teclasPermitidas.includes(e.key) || e.metaKey || e.ctrlKey) return;

          // permite un solo punto decimal
          if (e.key === "." && value.includes(".")) {
            e.preventDefault();
            return;
          }
          if (!/^[\d.]$/.test(e.key)) {
            e.preventDefault();
          }
        }}
        onPaste={(e) => {
          e.preventDefault();
          const texto = e.clipboardData.getData("text");
          onChange(limpiarMonto(texto));
        }}
      />
    );
  }
);
MontoInput.displayName = "MontoInput";