import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Iniciar sesión — SolCred',
  description: 'Accede a tu cuenta en el sistema de solicitudes de crédito SolCred',
};

export default function LoginPage() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#1C2833]">Bienvenido de vuelta</h2>
        <p className="text-sm text-[#7F8C8D] mt-1">Ingresa tus credenciales para continuar</p>
      </div>
      <LoginForm />
    </>
  );
}