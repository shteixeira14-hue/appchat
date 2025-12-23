import { Calendar } from "lucide-react";

interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
}

export function ChatHeader({ title, subtitle }: ChatHeaderProps) {
  return (
    <header className="bg-card/80 backdrop-blur-xl border-b border-border px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center transition-all duration-300 hover:bg-primary/20 hover:scale-105">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-semibold text-foreground flex items-center gap-2">
            {title || "Serviço de Agendamento"}
          </h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
