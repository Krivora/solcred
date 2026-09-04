import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export const metadata: Metadata = {
  title: 'Registro — SolCred',
  description: 'Crea tu cuenta en el sistema de solicitudes de crédito SolCred',
};

export default function RegistroPage() {
  return (
    <>
      <AuthCard title="Crear cuenta" subtitle="Registra tus datos para solicitar un crédito.">
        <RegisterForm />
      </AuthCard>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        ¿No sabes cuánto podrías pedir?{' '}
        <Link href="/simulador" className="font-medium text-primary hover:underline">
          Simula tu crédito
        </Link>
      </p>
    </>
  );
}
