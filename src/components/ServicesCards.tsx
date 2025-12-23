import { Service } from "@/hooks/useChat";
import { Clock, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServicesCardsProps {
  services: Service[];
  onServiceClick: (serviceId: string) => void;
}

export function ServicesCards({ services, onServiceClick }: ServicesCardsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <div className="overflow-x-auto mt-3 -mx-3 px-3 sm:-mx-4 sm:px-4 scrollbar-thin">
      <div className="flex gap-3 pb-2 md:gap-4" style={{ minWidth: "max-content" }}>
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => onServiceClick(service.id)}
            className={cn(
              "bg-card border border-border rounded-xl p-3 sm:p-4 text-left",
              "hover:border-primary/60 hover:bg-accent/80 transition-all duration-300",
              "hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.03] hover:-translate-y-1",
              "active:scale-[0.98] active:translate-y-0",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
              // largura mais amigável em mobile, maior em telas médias
              "flex-shrink-0 w-[220px] xs:w-[240px] sm:w-[260px] md:w-[280px] group"
            )}
          >
            <h3 className="font-semibold text-foreground mb-2 text-sm group-hover:text-primary transition-colors duration-300">{service.nome}</h3>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1 group-hover:text-foreground transition-colors duration-300">
                <DollarSign className="w-3.5 h-3.5 group-hover:text-primary transition-colors duration-300" />
                <span className="font-medium text-foreground">{formatPrice(service.preco)}</span>
              </div>
              <div className="flex items-center gap-1 group-hover:text-foreground transition-colors duration-300">
                <Clock className="w-3.5 h-3.5 group-hover:text-primary transition-colors duration-300" />
                <span>{service.duracao}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

