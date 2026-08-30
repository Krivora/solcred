"use client";

import * as React from "react";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/cn";
import { limpiarCodigoPostal } from "@/shared/lib/masks";

interface CodigoPostalInputProps
  extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type"> {
  value: string;
  onChange: (value: string) => void;
}

/** Input de código postal: máximo 5 dígitos, solo numérico. */
export const CodigoPostalInput = React.forwardRef<HTMLInputElement, CodigoPostalInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="postal-code"
        placeholder={props.placeholder ?? "83000"}
        value={value}
        maxLength={5}
        className={cn(className)}
        onChange={(e) => onChange(limpiarCodigoPostal(e.target.value))}
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
          if (!/^\d$/.test(e.key)) {
            e.preventDefault();
          }
        }}
        onPaste={(e) => {
          e.preventDefault();
          const texto = e.clipboardData.getData("text");
          onChange(limpiarCodigoPostal(texto));
        }}
      />
    );
  }
);
CodigoPostalInput.displayName = "CodigoPostalInput";