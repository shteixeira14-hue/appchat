import { useState, useCallback } from "react";

export interface Service {
  id: string;
  nome: string;
  preco: number;
  duracao: string;
}

export interface ServicesData {
  type: "services";
  title: string;
  services: Service[];
}

export interface TimeSlot {
  time: string;
  enabled: boolean;
}

export interface CalendarDay {
  date: string;
  weekday: string;
  label?: string;
  slots: TimeSlot[];
}

export interface CalendarData {
  type: "calendar";
  title: string;
  days: CalendarDay[];
}

export interface Option {
  id: string;
  label: string;
}

export interface OptionsData {
  type: "options";
  title: string;
  options: Option[];
}

export interface Professional {
  id: string;
  nome: string;
  status: string;
}

export interface ProfessionalsData {
  type: "professionals";
  title: string;
  professionals: Professional[];
}

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  servicesData?: ServicesData;
  calendarData?: CalendarData;
  optionsData?: OptionsData;
  professionalsData?: ProfessionalsData;
}

export interface FlowData {
  SessionId: string;
  NomeCliente?: string;
  Serviço?: string;
  DataAgendamento?: string;
  Profissional?: string;
}

// Chave para armazenar dados do fluxo no sessionStorage
const FLOW_DATA_KEY = "chatbarber_flow_data";

// Funções para gerenciar dados do fluxo no sessionStorage
const getFlowData = (): FlowData => {
  try {
    const stored = sessionStorage.getItem(FLOW_DATA_KEY);
    return stored ? JSON.parse(stored) : { SessionId: "" };
  } catch (error) {
    console.warn("Erro ao ler dados do fluxo:", error);
    return { SessionId: "" };
  }
};

const saveFlowData = (data: Partial<FlowData>) => {
  try {
    const current = getFlowData();
    const updated = { ...current, ...data };
    sessionStorage.setItem(FLOW_DATA_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn("Erro ao salvar dados do fluxo:", error);
    return getFlowData();
  }
};

const clearFlowData = () => {
  try {
    sessionStorage.removeItem(FLOW_DATA_KEY);
  } catch (error) {
    console.warn("Erro ao limpar dados do fluxo:", error);
  }
};

// Função para visualizar dados do fluxo no console
const logFlowData = () => {
  const data = getFlowData();
  console.group("📊 Dados do Fluxo Agrupados");
  console.log("SessionId:", data.SessionId || "Não definido");
  console.log("NomeCliente:", data.NomeCliente || "Não definido");
  console.log("Serviço:", data.Serviço || "Não selecionado");
  console.log("DataAgendamento:", data.DataAgendamento || "Não selecionado");
  console.log("Profissional:", data.Profissional || "Não selecionado");
  console.log("JSON completo:", JSON.stringify(data, null, 2));
  console.groupEnd();
  return data;
};

// URL do Webhook do n8n
const WEBHOOK_URL = "https://n8n.srv1067196.hstgr.cloud/webhook/7b20070b-f130-4d08-b165-9b6426fcb568";

// Função para obter ou criar sessionId persistente
const getOrCreateSessionId = (): string => {
  const STORAGE_KEY = "chatbarber_session_id";
  
  try {
    // Tenta recuperar o sessionId do localStorage
    const storedSessionId = localStorage.getItem(STORAGE_KEY);
    
    if (storedSessionId) {
      return storedSessionId;
    }
    
    // Se não existir, cria um novo e salva
    const newSessionId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, newSessionId);
    return newSessionId;
  } catch (error) {
    // Se houver erro (ex: localStorage desabilitado), cria um temporário
    console.warn("Erro ao acessar localStorage, usando sessionId temporário:", error);
    return crypto.randomUUID();
  }
};

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [sessionId] = useState(() => {
    const id = getOrCreateSessionId();
    // Armazena o SessionId quando criado
    saveFlowData({ SessionId: id });
    return id;
  });

  // Função para enviar dados finais ao webhook
  const sendFinalData = useCallback(async (flowData: FlowData) => {
    try {
      console.log("Enviando dados finais ao webhook...");
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...flowData,
          finalData: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Dados finais enviados com sucesso:", responseData);
      return responseData;
    } catch (error) {
      console.error("Erro ao enviar dados finais:", error);
      throw error;
    }
  }, []);

  // Função para enviar mensagem inicial (invisível ao usuário)
  const sendInitialMessage = useCallback(async () => {
    try {
      console.log("Enviando mensagem inicial ao webhook...");
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "primeiramensagem",
          sessionId: sessionId,
        }),
      });

      console.log("Status da resposta:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Recebe a resposta em formato JSON
      const responseData = await response.json();
      console.log("Resposta do webhook (mensagem inicial):", responseData);
      
      // Verifica se o chat foi finalizado
      if (responseData.fim === "true" || responseData.fim === true) {
        console.log("✅ Chat finalizado pelo webhook");
        setIsFinished(true);
      }
      
      // Captura nomeCliente se estiver no nível raiz da resposta
      if (responseData.nomeCliente) {
        saveFlowData({ NomeCliente: responseData.nomeCliente });
        console.log("NomeCliente capturado:", responseData.nomeCliente);
      }
      
      // Processa e exibe a resposta no chat (mas não exibe a mensagem inicial)
      if (responseData.response) {
        const response = responseData.response;
        
        // Verifica se é uma resposta do tipo serviços
        if (typeof response === "object" && response.type === "services") {
          const botMessage: Message = {
            id: crypto.randomUUID(),
            content: response.title || "Selecione um serviço:",
            isUser: false,
            timestamp: new Date(),
            servicesData: response as ServicesData,
          };
          setMessages((prev) => [...prev, botMessage]);
        } else if (typeof response === "object" && response.type === "calendar") {
          // Resposta do tipo calendário
          const botMessage: Message = {
            id: crypto.randomUUID(),
            content: response.title || "Selecione o dia e horário:",
            isUser: false,
            timestamp: new Date(),
            calendarData: response as CalendarData,
          };
          setMessages((prev) => [...prev, botMessage]);
        } else if (typeof response === "object" && response.type === "options") {
          // Resposta do tipo opções
          const botMessage: Message = {
            id: crypto.randomUUID(),
            content: response.title || "Selecione uma opção:",
            isUser: false,
            timestamp: new Date(),
            optionsData: response as OptionsData,
          };
          setMessages((prev) => [...prev, botMessage]);
        } else if (typeof response === "object" && response.type === "professionals") {
          // Resposta do tipo profissionais
          const botMessage: Message = {
            id: crypto.randomUUID(),
            content: response.title || "Selecione um profissional:",
            isUser: false,
            timestamp: new Date(),
            professionalsData: response as ProfessionalsData,
          };
          setMessages((prev) => [...prev, botMessage]);
        } else if (typeof response === "object" && response.type === "final") {
          // Resposta do tipo final - envia dados do fluxo
          const flowData = getFlowData();
          // Envia dados finais ao webhook
          await sendFinalData(flowData);
          
          const botMessage: Message = {
            id: crypto.randomUUID(),
            content: response.message || response.title || "Processamento finalizado!",
            isUser: false,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMessage]);
        } else {
          // Resposta de texto normal
          const botResponse = typeof response === "string" 
            ? response 
            : JSON.stringify(response);

          const botMessage: Message = {
            id: crypto.randomUUID(),
            content: botResponse,
            isUser: false,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMessage]);
        }
      } else {
        console.warn("Resposta do webhook não contém o campo 'response'");
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem inicial:", error);
      throw error;
    }
  }, [sessionId, sendFinalData]);

  const sendMessage = useCallback(
    async (content: string, isService: boolean = false, isHorario: boolean = false, isOption: boolean = false, opcaoValue?: string, isProfessional: boolean = false, professionalName?: string) => {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        content,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Se for um clique em horário, envia todos os dados armazenados
        if (isHorario) {
          // Armazena a data de agendamento primeiro
          saveFlowData({ DataAgendamento: content });
          
          // Busca todos os dados armazenados
          const flowData = getFlowData();
          
          // Prepara o JSON com todos os dados e tipomensagem: "final"
          const requestBody = {
            ...flowData,
            tipomensagem: "final"
          };

          console.log("📤 Enviando dados finais ao webhook:", JSON.stringify(requestBody, null, 2));

          // Envia mensagem para o Webhook do n8n com todos os dados
          const response = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // Recebe a resposta em formato JSON
          const responseData = await response.json();
          
          // Log para debug
          console.log("📥 Resposta do Webhook (dados finais):", responseData);
          console.log("📥 Tipo de resposta:", responseData.response?.type || "texto");
          
          // Verifica se o chat foi finalizado
          if (responseData.fim === "true" || responseData.fim === true) {
            console.log("✅ Chat finalizado pelo webhook");
            setIsFinished(true);
          }
          
          // Verifica se a resposta está causando reinício do fluxo
          if (responseData.response?.type === "options" || responseData.response?.type === "services") {
            console.warn("⚠️ ATENÇÃO: O webhook retornou uma resposta que pode reiniciar o fluxo:", responseData.response.type);
          }
          
          // Processa a resposta normalmente
          if (responseData.response) {
            const response = responseData.response;
            
            // Verifica se é uma resposta do tipo serviços
            if (typeof response === "object" && response.type === "services") {
              const botMessage: Message = {
                id: crypto.randomUUID(),
                content: response.title || "Selecione um serviço:",
                isUser: false,
                timestamp: new Date(),
                servicesData: response as ServicesData,
              };
              setMessages((prev) => [...prev, botMessage]);
            } else if (typeof response === "object" && response.type === "calendar") {
              // Resposta do tipo calendário
              const botMessage: Message = {
                id: crypto.randomUUID(),
                content: response.title || "Selecione o dia e horário:",
                isUser: false,
                timestamp: new Date(),
                calendarData: response as CalendarData,
              };
              setMessages((prev) => [...prev, botMessage]);
            } else if (typeof response === "object" && response.type === "options") {
              // Resposta do tipo opções
              const botMessage: Message = {
                id: crypto.randomUUID(),
                content: response.title || "Selecione uma opção:",
                isUser: false,
                timestamp: new Date(),
                optionsData: response as OptionsData,
              };
              setMessages((prev) => [...prev, botMessage]);
            } else if (typeof response === "object" && response.type === "professionals") {
              // Resposta do tipo profissionais
              const botMessage: Message = {
                id: crypto.randomUUID(),
                content: response.title || "Selecione um profissional:",
                isUser: false,
                timestamp: new Date(),
                professionalsData: response as ProfessionalsData,
              };
              setMessages((prev) => [...prev, botMessage]);
            } else {
              // Resposta de texto normal
              const botResponse = typeof response === "string" 
                ? response 
                : JSON.stringify(response);

              const botMessage: Message = {
                id: crypto.randomUUID(),
                content: botResponse,
                isUser: false,
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, botMessage]);
            }
          } else {
            throw new Error("Resposta não contém o campo 'response'");
          }
          
          setIsLoading(false);
          return;
        }

        // Prepara o body da requisição para outros tipos de mensagem
        const requestBody: {
          message: string;
          sessionId: string;
          serviço?: boolean;
          opcao?: string;
          professional?: string;
          profselecionado?: string;
        } = {
          message: content,
          sessionId: sessionId,
        };

        // Adiciona o parâmetro "serviço" se for um clique em serviço
        if (isService) {
          requestBody.serviço = true;
          // Armazena o serviço
          saveFlowData({ Serviço: content });
          
          // Busca o profissional armazenado e adiciona ao requestBody se existir
          const flowData = getFlowData();
          if (flowData.Profissional) {
            requestBody.profselecionado = flowData.Profissional;
          }
        }

        // Adiciona o parâmetro "opcao" se for um clique em opção
        if (isOption) {
          requestBody.opcao = opcaoValue || content;
        }

        // Adiciona o parâmetro "professional" se for um clique em profissional
        if (isProfessional) {
          requestBody.professional = content;
          // Armazena o ID do profissional
          saveFlowData({ Profissional: content });
        }

        // Envia mensagem para o Webhook do n8n
        const response = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Recebe a resposta em formato JSON
        const responseData = await response.json();
        
        // Log para debug
        console.log("Resposta do Webhook:", responseData);
        
        // Verifica se o chat foi finalizado
        if (responseData.fim === "true" || responseData.fim === true) {
          console.log("✅ Chat finalizado pelo webhook");
          setIsFinished(true);
        }
        
        // Captura nomeCliente se estiver no nível raiz da resposta
        if (responseData.nomeCliente) {
          saveFlowData({ NomeCliente: responseData.nomeCliente });
          console.log("NomeCliente capturado:", responseData.nomeCliente);
        }
        
        // Extrai o campo "response" do JSON
        if (responseData.response) {
          const response = responseData.response;
          
          // Verifica se é uma resposta do tipo serviços
          if (typeof response === "object" && response.type === "services") {
            const botMessage: Message = {
              id: crypto.randomUUID(),
              content: response.title || "Selecione um serviço:",
              isUser: false,
              timestamp: new Date(),
              servicesData: response as ServicesData,
            };
            setMessages((prev) => [...prev, botMessage]);
          } else if (typeof response === "object" && response.type === "calendar") {
            // Resposta do tipo calendário
            const botMessage: Message = {
              id: crypto.randomUUID(),
              content: response.title || "Selecione o dia e horário:",
              isUser: false,
              timestamp: new Date(),
              calendarData: response as CalendarData,
            };
            setMessages((prev) => [...prev, botMessage]);
          } else if (typeof response === "object" && response.type === "options") {
            // Resposta do tipo opções
            const botMessage: Message = {
              id: crypto.randomUUID(),
              content: response.title || "Selecione uma opção:",
              isUser: false,
              timestamp: new Date(),
              optionsData: response as OptionsData,
            };
            setMessages((prev) => [...prev, botMessage]);
          } else if (typeof response === "object" && response.type === "professionals") {
            // Resposta do tipo profissionais
            const botMessage: Message = {
              id: crypto.randomUUID(),
              content: response.title || "Selecione um profissional:",
              isUser: false,
              timestamp: new Date(),
              professionalsData: response as ProfessionalsData,
            };
            setMessages((prev) => [...prev, botMessage]);
          } else if (typeof response === "object" && response.type === "final") {
            // Resposta do tipo final - envia dados do fluxo
            const flowData = getFlowData();
            // Envia dados finais ao webhook
            await sendFinalData(flowData);
            
            const botMessage: Message = {
              id: crypto.randomUUID(),
              content: response.message || response.title || "Processamento finalizado!",
              isUser: false,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMessage]);
          } else {
            // Resposta de texto normal
            const botResponse = typeof response === "string" 
              ? response 
              : JSON.stringify(response);

            const botMessage: Message = {
              id: crypto.randomUUID(),
              content: botResponse,
              isUser: false,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMessage]);
          }
        } else {
          throw new Error("Resposta não contém o campo 'response'");
        }
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          content:
            "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, sendFinalData]
  );

  // Função para visualizar dados do fluxo no console
  const viewFlowData = useCallback(() => {
    return logFlowData();
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    clearFlowData();
  }, []);

  const restartChat = useCallback(() => {
    console.log("🔄 Reiniciando chat...");
    setMessages([]);
    setIsFinished(false);
    clearFlowData();
    // Mantém a mesma SessionId do usuário e apenas regrava nos dados de fluxo
    saveFlowData({ SessionId: sessionId });
    console.log("✅ Chat reiniciado mantendo o mesmo sessionId:", sessionId);
  }, [sessionId]);

  return {
    messages,
    isLoading,
    isFinished,
    sendMessage,
    clearMessages,
    sendInitialMessage,
    sendFinalData,
    viewFlowData,
    sessionId,
    restartChat,
  };
}
