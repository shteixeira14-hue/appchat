import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { ServicesCards } from "./ServicesCards";
import { CalendarCards } from "./CalendarCards";
import { OptionsCards } from "./OptionsCards";
import { ProfessionalsCards } from "./ProfessionalsCards";
import { AppointmentsData, ServicesData, CalendarData, OptionsData, ProfessionalsData } from "@/hooks/useChat";
import { AppointmentsCards } from "./AppointmentsCards";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp?: Date;
  servicesData?: ServicesData;
  calendarData?: CalendarData;
  optionsData?: OptionsData;
  professionalsData?: ProfessionalsData;
  appointmentsData?: AppointmentsData;
  onServiceClick?: (serviceId: string) => void;
  onTimeSlotClick?: (date: string, time: string) => void;
  onOptionClick?: (optionId: string) => void;
  onProfessionalClick?: (professionalId: string) => void;
}

export function ChatMessage({ 
  content, 
  isUser, 
  timestamp, 
  servicesData,
  calendarData,
  optionsData,
  professionalsData,
  appointmentsData,
  onServiceClick,
  onTimeSlotClick,
  onOptionClick,
  onProfessionalClick
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
          isUser
            ? "bg-primary glow-primary hover:scale-110 hover:shadow-lg hover:shadow-primary/30"
            : "bg-secondary border border-border hover:border-primary/30 hover:scale-110 hover:shadow-md"
        )}
      >
        {isUser ? (
          <User className="w-5 h-5 text-primary-foreground" />
        ) : (
          <Bot className="w-5 h-5 text-foreground" />
        )}
      </div>

      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 transition-all duration-300",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md hover:shadow-lg hover:shadow-primary/20"
            : "bg-secondary text-secondary-foreground rounded-bl-md border border-border hover:border-primary/30 hover:shadow-md",
          (servicesData && servicesData.services) ||
          (calendarData && calendarData.days) ||
          (optionsData && optionsData.options) ||
          (professionalsData && professionalsData.professionals) ||
          (appointmentsData && appointmentsData.services)
            ? "overflow-hidden"
            : ""
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        
        {servicesData && servicesData.services && onServiceClick && (
          <ServicesCards 
            services={servicesData.services} 
            onServiceClick={onServiceClick}
          />
        )}
        
        {calendarData && calendarData.days && onTimeSlotClick && (
          <CalendarCards 
            days={calendarData.days} 
            onTimeSlotClick={onTimeSlotClick}
          />
        )}
        
        {optionsData && optionsData.options && onOptionClick && (
          <OptionsCards 
            options={optionsData.options} 
            onOptionClick={onOptionClick}
          />
        )}
        
        {professionalsData && professionalsData.professionals && onProfessionalClick && (
          <ProfessionalsCards 
            professionals={professionalsData.professionals} 
            onProfessionalClick={onProfessionalClick}
          />
        )}
        
        {appointmentsData && appointmentsData.services && (
          <AppointmentsCards services={appointmentsData.services} />
        )}
        
        {timestamp && (
          <span className="text-xs opacity-60 mt-1 block">
            {timestamp.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    </div>
  );
}
