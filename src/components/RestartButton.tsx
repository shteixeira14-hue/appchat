import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RestartButtonProps {
  onRestart: () => void;
}

export function RestartButton({ onRestart }: RestartButtonProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full bg-secondary rounded-2xl border border-border p-6 flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <RotateCcw className="w-8 h-8 text-primary" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-foreground mb-2">Agendamento Finalizado</h3>
          <p className="text-sm text-muted-foreground">
            Seu agendamento foi concluído com sucesso!
          </p>
        </div>
        <Button
          onClick={onRestart}
          size="lg"
          className="w-full hover:scale-105 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 active:scale-95"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reiniciar Agendamento
        </Button>
      </div>
    </div>
  );
}

