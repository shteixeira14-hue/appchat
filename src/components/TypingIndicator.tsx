import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-secondary border border-border hover:border-primary/30 transition-colors duration-300">
        <Bot className="w-5 h-5 text-foreground" />
      </div>

      <div className="bg-secondary text-secondary-foreground rounded-2xl rounded-bl-md border border-border px-4 py-3 hover:border-primary/30 transition-colors duration-300">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-primary typing-dot" />
          <span className="w-2 h-2 rounded-full bg-primary typing-dot" />
          <span className="w-2 h-2 rounded-full bg-primary typing-dot" />
        </div>
      </div>
    </div>
  );
}
