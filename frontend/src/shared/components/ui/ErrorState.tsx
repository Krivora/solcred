import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface ErrorStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionHref: string;
    actionLabel: string;
    /** Si es true, ocupa toda la pantalla (usar fuera del dashboard). Si es false, solo llena su contenedor padre. */
    fullScreen?: boolean;
}

export function ErrorState({
    icon: Icon,
    title,
    description,
    actionHref,
    actionLabel,
    fullScreen = false,
}: ErrorStateProps) {
    return (
        <div
            className={
                fullScreen
                    ? 'flex h-screen flex-col items-center justify-center gap-4 bg-background text-center px-6'
                    : 'flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center px-6'
            }
        >
            <Icon className="h-12 w-12 text-muted-foreground" />
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="max-w-md text-sm text-muted-foreground">{description}</p>
            <Link
                href={actionHref}
                className="mt-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
            >
                {actionLabel}
            </Link>
        </div>
    );
}