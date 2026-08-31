import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { RegisteredNotice } from '@/features/auth/components/RegisteredNotice';

export const metadata: Metadata = {
  title: 'Iniciar sesión — SolCred',
  description: 'Acceso al sistema de solicitudes de crédito SolCred',
};

export default function LoginPage() {
  return (
    <AuthCard title="Iniciar sesión" subtitle="Ingresa con tu cuenta para acceder al sistema.">
      <Suspense fallback={null}>
        <RegisteredNotice />
      </Suspense>
      <LoginForm />
    </AuthCard>
  );
}
