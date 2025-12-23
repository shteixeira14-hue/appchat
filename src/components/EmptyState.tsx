import { MessageSquare, Zap, Shield, Clock } from "lucide-react";

export function EmptyState() {
  const features = [
    {
      icon: Zap,
      title: "Respostas Rápidas",
      description: "Obtenha informações instantâneas",
    },
    {
      icon: Shield,
      title: "Seguro",
      description: "Seus dados estão protegidos",
    },
    {
      icon: Clock,
      title: "24/7",
      description: "Disponível a qualquer momento",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 transition-all duration-300 hover:bg-primary/20 hover:scale-110 hover:shadow-lg hover:shadow-primary/20">
        <MessageSquare className="w-10 h-10 text-primary transition-transform duration-300" />
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-2">
        Bem-vindo ao Agendamento
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Este espaço foi criado para facilitar seus agendamentos. Clique em "Iniciar" para começar!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-secondary/50 border border-border rounded-xl p-4 hover:bg-secondary/80 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:scale-105 transition-all duration-300 group"
          >
            <feature.icon className="w-6 h-6 text-primary mb-2 mx-auto group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">
              {feature.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 group-hover:text-foreground/80 transition-colors duration-300">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
