import type { ReactNode } from 'react';
import { Building2, Rocket, CalendarCheck, Banknote, ShieldCheck } from 'lucide-react';

const stats = [
  { icon: Rocket,        num: '+300',    label: 'Emprendimientos financiados'  },
  { icon: CalendarCheck, num: '60 días', label: 'Tiempo máximo de dispersión'  },
  { icon: Banknote,      num: '$50M+',   label: 'En créditos otorgados'        },
  { icon: ShieldCheck,   num: '100%',    label: 'Proceso en línea y seguro'    },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F4F6F7] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-sm border border-[#E8EAF0] flex min-h-[560px]">

        {/* Lado izquierdo */}
        <div className="hidden lg:flex flex-1 bg-[#1B4F72] p-12 flex-col justify-center gap-10">

          <div className="flex items-center gap-2 w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
            <Building2 size={13} className="text-white/80" aria-hidden="true" />
            <span className="text-xs text-white/80">Financiamiento empresarial</span>
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold text-white leading-snug">
              El negocio que<br />imaginas está a<br />una solicitud.
            </h1>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              Accede a programas de crédito diseñados para impulsar
              tu empresa, sin trámites complicados.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ icon: Icon, num, label }) => (
              <div
                key={label}
                className="flex flex-col gap-2 rounded-xl border border-white/[0.14] bg-white/[0.08] p-3.5"
              >
                <Icon size={15} className="text-white/40" aria-hidden="true" />
                <span className="text-xl font-semibold text-white leading-none">{num}</span>
                <span className="text-[11px] text-white/55 leading-snug">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lado derecho */}
        <div className="flex-1 bg-white flex flex-col justify-center px-10 py-12">

          {/* Brand */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#1B4F72] mb-4 shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1M4.22 4.22l.707.707m12.728 12.728.707.707M1 12h1m20 0h1M4.22 19.78l.707-.707M18.657 5.343l.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-[#1C2833] tracking-tight">SolCred</h2>
            <p className="text-xs text-[#7F8C8D] mt-0.5">Sistema de solicitudes de crédito</p>
          </div>

          {children}
        </div>

      </div>
    </div>
  );
}