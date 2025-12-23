import { useRef, useEffect, useState } from "react";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { RestartButton } from "@/components/RestartButton";
import { TypingIndicator } from "@/components/TypingIndicator";
import { EmptyState } from "@/components/EmptyState";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

const Index = () => {
  const { messages, isLoading, isFinished, sendMessage, sendInitialMessage, restartChat, viewFlowData } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showInitialOverlay, setShowInitialOverlay] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);

  // Expõe viewFlowData no console do navegador para fácil acesso
  useEffect(() => {
    (window as any).viewFlowData = viewFlowData;
    console.log("💡 Dica: Use viewFlowData() no console para ver os dados do fluxo agrupados");
  }, [viewFlowData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleStart = async () => {
    console.log("Botão Iniciar clicado!");
    setIsInitializing(true);
    try {
      console.log("Chamando sendInitialMessage...");
      await sendInitialMessage();
      console.log("Mensagem inicial enviada com sucesso!");
      setShowInitialOverlay(false);
    } catch (error) {
      console.error("Erro ao iniciar:", error);
      // Mesmo com erro, esconde o overlay para não travar o usuário
      setShowInitialOverlay(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleServiceClick = (serviceId: string) => {
    if (isFinished) return;
    console.log("Serviço selecionado:", serviceId);
    // Envia o ID do serviço como mensagem com o parâmetro "serviço" = true
    sendMessage(serviceId, true);
  };

  const handleTimeSlotClick = (date: string, time: string) => {
    if (isFinished) return;
    console.log("Horário selecionado - Data recebida:", date, "Hora:", time);
    // Envia a data e hora no formato "YYYY-MM-DD HH:MM" com o parâmetro "horario" = true
    // Garante que a data está no formato correto (sem conversão de timezone)
    const dateTime = `${date} ${time}`;
    console.log("Data/Hora que será enviada:", dateTime);
    sendMessage(dateTime, false, true);
  };

  const handleOptionClick = (optionId: string) => {
    if (isFinished) return;
    console.log("Opção selecionada:", optionId);
    // Mapeia o ID da opção para o valor que será enviado no parâmetro "opcao"
    let opcaoValue = optionId;
    if (optionId === "meus_agendamentos") {
      opcaoValue = "meus";
    } else if (optionId === "agendar") {
      opcaoValue = "agendar";
    }
    // Envia o ID da opção como mensagem com o parâmetro "opcao" = valor mapeado
    sendMessage(optionId, false, false, true, opcaoValue);
  };

  const handleProfessionalClick = (professionalId: string, professionalName: string) => {
    if (isFinished) return;
    console.log("Profissional selecionado:", professionalId, professionalName);
    // Envia o ID do profissional como mensagem com o parâmetro "professional" = id e armazena o nome
    sendMessage(professionalId, false, false, false, undefined, true, professionalName);
  };

  const handleRestart = () => {
    console.log("Reiniciando chat...");
    restartChat();
    // Após reiniciar, envia a mensagem inicial automaticamente
    sendInitialMessage();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

      {/* Overlay inicial com botão "Iniciar" */}
      {showInitialOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md">
          <div className="bg-card rounded-2xl border border-border shadow-2xl p-8 max-w-md w-full mx-4 flex flex-col items-center gap-6 animate-fade-in hover:shadow-primary/10 transition-shadow duration-300">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Bem-vindo!</h2>
            <p className="text-muted-foreground text-center">
              Clique no botão abaixo para iniciar o agendamento
            </p>
            <Button
              onClick={handleStart}
              disabled={isInitializing}
              size="lg"
              className="w-full hover:scale-105 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 active:scale-95"
            >
              {isInitializing ? "Iniciando..." : "Iniciar"}
            </Button>
          </div>
        </div>
      )}

      {/* Main container */}
      <div className={`relative flex flex-col h-screen max-w-4xl mx-auto w-full ${showInitialOverlay ? 'blur-sm pointer-events-none' : ''}`}>
        <ChatHeader
          title="Serviço de Agendamento"
          subtitle="HNEX - Agenda"
        />

        {/* Messages area */}
        <main className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  content={message.content}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                  servicesData={message.servicesData}
                  calendarData={message.calendarData}
                  optionsData={message.optionsData}
                  professionalsData={message.professionalsData}
                  onServiceClick={handleServiceClick}
                  onTimeSlotClick={handleTimeSlotClick}
                  onOptionClick={handleOptionClick}
                  onProfessionalClick={handleProfessionalClick}
                />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Input area */}
        <footer className="border-t border-border bg-card/50 backdrop-blur-xl px-4 py-4">
          {isFinished ? (
            <RestartButton onRestart={handleRestart} />
          ) : (
            <ChatInput
              onSend={sendMessage}
              disabled={isLoading || isFinished}
              placeholder="Digite sua mensagem..."
            />
          )}
        </footer>
      </div>
    </div>
  );
};

export default Index;
