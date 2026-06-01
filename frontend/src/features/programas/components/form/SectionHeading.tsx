import type { ElementType } from "react";

interface Props {
    icon: ElementType;
    title: string;
    description: string;
}

export function SectionHeading({ icon: Icon, title, description }: Props) {
    return (
        <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}