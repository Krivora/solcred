import { redirect } from 'next/navigation'

// La página vive ahora en /dashboard/historico (visible también para
// Financiamiento, no solo Promoción). Se deja este redirect para no romper
// enlaces/favoritos existentes a la ruta anterior.
export default function HistoricoRedirectPage() {
    redirect('/dashboard/historico')
}
