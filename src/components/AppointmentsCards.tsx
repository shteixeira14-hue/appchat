import { cn } from "@/lib/utils";

export interface AppointmentService {
  id: string;
  nome: string;
  data: string;
  profissional: string;
  status: string;
}

interface AppointmentsCardsProps {
  services: AppointmentService[];
}

export function AppointmentsCards({ services }: AppointmentsCardsProps) {
  return (
    <div className="overflow-x-auto mt-3 -mx-3 px-3 sm:-mx-4 sm:px-4 scrollbar-thin">
      <div className="flex gap-3 pb-2 md:gap-4" style={{ minWidth: "max-content" }}>
        {services.map((service) => (
          <div
            key={service.id}
            className={cn(
              "bg-card border border-border rounded-xl p-3 sm:p-4 text-left flex-shrink-0 w-[260px] xs:w-[280px] sm:w-[300px]",
              "hover:border-primary/60 hover:bg-accent/80 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
            )}
          >
            <h3 className="font-semibold text-foreground mb-1 text-sm line-clamp-2">
              {service.nome}
            </h3>
            <p className="text-xs text-muted-foreground mb-1">
              <span className="font-medium">Data:</span> {service.data}
            </p>
            <p className="text-xs text-muted-foreground mb-1">
              <span className="font-medium">Profissional:</span> {service.profissional}
            </p>
            <p className="text-xs mt-1">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                  service.status.toLowerCase() === "confirmado"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : service.status.toLowerCase() === "cancelado"
                    ? "bg-red-500/10 text-red-400 border border-red-500/30"
                    : "bg-yellow-500/10 text-yellow-300 border border-yellow-500/30"
                )}
              >
                {service.status}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}