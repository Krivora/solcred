import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Registro — SolCred',
  description: 'Crea tu cuenta en el sistema de solicitudes de crédito SolCred',
};

export default function RegistroPage() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#1C2833]">Crear cuenta</h2>
        <p className="text-sm text-[#7F8C8D] mt-1">Completa tus datos para registrarte</p>
      </div>
      <RegisterForm />
    </>
  );
}