import type { Metadata } from 'next';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { SimuladorCredito } from '@/features/simulador/components/SimuladorCredito';

export const metadata: Metadata = {
  title: 'Simula tu crédito — SolCred',
  description: 'Estima el pago mensual de tu crédito antes de crear una cuenta',
};

export default function SimuladorPage() {
  return (
    <AuthCard
      title="Simula tu crédito"
      subtitle="Elige un programa y mira un estimado de tu pago mensual — sin necesidad de crear una cuenta."
    >
      <SimuladorCredito />
    </AuthCard>
  );
}
