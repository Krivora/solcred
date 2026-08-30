"use client";

import * as React from "react";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/cn";
import { normalizarCorreo } from "@/shared/lib/masks";

interface CorreoInputProps
  extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type"> {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Input de correo. No restringimos tecleo (el correo puede tener + . _ - etc.)
 * pero normalizamos (trim + lowercase) al salir del campo, para evitar
 * duplicados por mayúsculas/espacios al validar unicidad en backend.
 */
export const CorreoInput = React.forwardRef<HTMLInputElement, CorreoInputProps>(
  ({ value, onChange, onBlur, className, ...props }, ref) => {
    return (
      <Input
        {...props}
        ref={ref}
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder={props.placeholder ?? "correo@ejemplo.com"}
        value={value}
        className={cn(className)}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => {
          onChange(normalizarCorreo(e.target.value));
          onBlur?.(e);
        }}
      />
    );
  }
);
CorreoInput.displayName = "CorreoInput";