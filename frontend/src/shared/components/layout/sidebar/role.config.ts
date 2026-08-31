export const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
    ADMIN: {
        label: "Admin",
        className:
            "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    },
    GESTOR: {
        label: "Gestor",
        className:
            "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    },
    ANALISTA: {
        label: "Analista",
        className:
            "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    },
    SUPERVISOR: {
        label: "Supervisor",
        className:
            "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
    },
    CLIENTE: {
        label: "Cliente",
        className:
            "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    },
};