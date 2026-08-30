"use client";

import * as React from "react";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/cn";
import { formatearTelefono, limpiarTelefono } from "@/shared/lib/masks";

interface TelefonoInputProps
  extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type"> {
  /** valor crudo (solo dígitos), como lo maneja el form/schema */
  value: string;
  /** recibe el valor YA limpio (solo dígitos) */
  onChange: (value: string) => void;
}

/**
 * Input de teléfono: el usuario ve "(331) 234-5678" mientras escribe,
 * pero lo que se propaga al form (onChange) son solo los 10 dígitos.
 * Bloquea cualquier tecleo que no sea numérico y limita a 10 dígitos.
 */
export const TelefonoInput = React.forwardRef<HTMLInputElement, TelefonoInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const displayValue = formatearTelefono(value);

    return (
      <Input
        {...props}
        ref={ref}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder={props.placeholder ?? "(331) 234-5678"}
        value={displayValue}
        maxLength={14} // "(XXX) XXX-XXXX"
        className={cn(className)}
        onChange={(e) => {
          const limpio = limpiarTelefono(e.target.value);
          onChange(limpio);
        }}
        onKeyDown={(e) => {
          // Permite teclas de control (borrar, tab, flechas, etc.)
          const teclasPermitidas = [
            "Backspace",
            "Delete",
            "Tab",
            "ArrowLeft",
            "ArrowRight",
            "ArrowUp",
            "ArrowDown",
            "Home",
            "End",
          ];
          if (teclasPermitidas.includes(e.key) || e.metaKey || e.ctrlKey) return;
          if (!/^\d$/.test(e.key)) {
            e.preventDefault();
          }
        }}
      />
    );
  }
);
TelefonoInput.displayName = "TelefonoInput";