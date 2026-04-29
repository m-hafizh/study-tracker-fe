import { IconType } from "react-icons";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    title: string;
    description: string;
    icon: IconType;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({ title, description, icon: Icon, action, className }: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center rounded-2xl bg-card p-12 text-center shadow-sm", className)}>
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Icon className="h-8 w-8" />
            </div>
            <h3 className="mb-2 text-xl font-bold tracking-tight text-foreground">{title}</h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
            {action}
        </div>
    );
}
