import { Professional } from "@/hooks/useChat";
import { User as UserIcon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfessionalsCardsProps {
  professionals: Professional[];
  onProfessionalClick: (professionalId: string, professionalName: string) => void;
}

export function ProfessionalsCards({ professionals, onProfessionalClick }: ProfessionalsCardsProps) {
  const getStatusColor = (status: string) => {
    if (status.toLowerCase().includes("disponível") || status.toLowerCase().includes("disponivel")) {
      return "text-green-600";
    }
    return "text-muted-foreground";
  };

  return (
    <div className="overflow-x-auto mt-3 -mx-3 px-3 sm:-mx-4 sm:px-4 scrollbar-thin">
      <div className="flex gap-3 pb-2 md:gap-4" style={{ minWidth: "max-content" }}>
        {professionals.map((professional) => (
          <button
            key={professional.id}
            onClick={() => onProfessionalClick(professional.id, professional.nome)}
            className={cn(
              "bg-card border border-border rounded-xl p-3 sm:p-4 text-left",
              "hover:border-primary/60 hover:bg-accent/80 transition-all duration-300",
              "hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.03] hover:-translate-y-1",
              "active:scale-[0.98] active:translate-y-0",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
              // Menor em mobile, maior em telas médias
              "flex-shrink-0 w-[200px] xs:w-[220px] sm:w-[240px] group"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                <UserIcon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground mb-1 text-sm truncate group-hover:text-primary transition-colors duration-300">{professional.nome}</h3>
                <div className="flex items-center gap-1 text-xs">
                  <CheckCircle2 className={cn("w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110", getStatusColor(professional.status))} />
                  <span className={cn("truncate", getStatusColor(professional.status))}>{professional.status}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

