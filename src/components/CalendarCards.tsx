import { CalendarDay } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

interface CalendarCardsProps {
  days: CalendarDay[];
  onTimeSlotClick: (date: string, time: string) => void;
}

export function CalendarCards({ days, onTimeSlotClick }: CalendarCardsProps) {
  const formatDate = (dateString: string) => {
    // Parse a data no formato YYYY-MM-DD sem conversão de timezone
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  return (
    <div className="overflow-x-auto mt-3 -mx-3 px-3 sm:-mx-4 sm:px-4 scrollbar-thin">
      <div className="flex gap-3 pb-2 md:gap-4" style={{ minWidth: "max-content" }}>
        {days.map((day) => (
          <div
            key={day.date}
            className={cn(
              "bg-card border border-border rounded-xl p-3 sm:p-4 flex-shrink-0 w-[180px] xs:w-[190px] sm:w-[200px]",
              "hover:border-primary/30 transition-all duration-300"
            )}
          >
            <div className="mb-3">
              <div className="font-semibold text-foreground text-sm">
                {day.weekday}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(day.date)}
              </div>
              {day.label && (
                <div className="text-xs font-medium text-primary mt-1">
                  {day.label}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto scrollbar-thin">
              {day.slots.map((slot) => (
                <button
                  key={`${day.date}-${slot.time}`}
                  onClick={() => slot.enabled && onTimeSlotClick(day.date, slot.time)}
                  disabled={!slot.enabled}
                  className={cn(
                    "text-xs py-2 px-3 rounded-lg border transition-all duration-300",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1",
                    slot.enabled
                      ? "bg-card border-border hover:border-primary/60 hover:bg-accent/80 hover:scale-110 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/10 active:scale-100 active:translate-y-0 cursor-pointer group"
                      : "bg-muted border-muted-foreground/20 text-muted-foreground cursor-not-allowed opacity-50"
                  )}
                >
                  <span className="group-hover:text-primary transition-colors duration-300 font-medium">{slot.time}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

