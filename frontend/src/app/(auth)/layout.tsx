import type { ReactNode } from 'react';
import { AuthBrand } from '@/features/auth/components/AuthBrand';
import { AuthThemeToggle } from '@/features/auth/components/AuthThemeToggle';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col overflow-y-auto bg-muted/40">
      <div className="fixed right-4 top-4 z-10">
        <AuthThemeToggle />
      </div>

      <div className="m-auto w-full max-w-105 px-4 py-10">
        <AuthBrand />
        {children}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} SolCred · Uso exclusivo autorizado
        </p>
      </div>
    </div>
  );
}
