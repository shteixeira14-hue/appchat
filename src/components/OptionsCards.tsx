import { Option } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

interface OptionsCardsProps {
  options: Option[];
  onOptionClick: (optionId: string) => void;
}

export function OptionsCards({ options, onOptionClick }: OptionsCardsProps) {
  return (
    <div className="overflow-x-auto mt-3 -mx-4 px-4 scrollbar-thin">
      <div className="flex gap-3 pb-2" style={{ minWidth: "max-content" }}>
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onOptionClick(option.id)}
            className={cn(
              "bg-card border border-border rounded-xl p-4 text-center",
              "hover:border-primary/60 hover:bg-accent/80 transition-all duration-300",
              "hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.03] hover:-translate-y-1",
              "active:scale-[0.98] active:translate-y-0",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
              "flex-shrink-0 min-w-[180px] group"
            )}
          >
            <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors duration-300">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

