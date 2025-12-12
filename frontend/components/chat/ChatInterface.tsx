"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Copy, Check, Trash2 } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useChat } from "../../contexts/ChatContext";
import MessageContent from "./MessageContent";

interface ChatInterfaceProps {
  conversationId?: string;
  traderName?: string;
  traderLevel?: "iniciante" | "intermediario" | "avancado" | "profissional";
}

export default function ChatInterface({
  conversationId,
  traderName = "trader",
  traderLevel = "intermediario",
}: ChatInterfaceProps) {
  // Usar contexto de chat
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    activeConversation,
    clearChat,
    conversations 
  } = useChat();
  
  // Usar contexto de tema
  const { isDark } = useTheme();
  
  const [input, setInput] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Rolagem automática para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Limpa o input quando a conversa muda
  useEffect(() => {
    setInput("");
  }, [activeConversation?.id]);

  // Enviar mensagem
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const messageToSend = input;
    setInput("");
    await sendMessage(messageToSend);
  };

  const handleCopy = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (confirm("Tem certeza que deseja limpar esta conversa?")) {
      clearChat();
    }
  };

  // Se não houver conversa ativa
  if (!activeConversation && conversations.length > 0) {
    return (
      <div className={`
        flex flex-col h-full items-center justify-center p-8
        ${isDark ? "bg-gray-900" : "bg-gray-50"}
      `}>
        <Bot className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Selecione uma conversa
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Clique em uma conversa na sidebar para começar a conversar
        </p>
      </div>
    );
  }

  // Se não houver conversas
  if (conversations.length === 0) {
    return (
      <div className={`
        flex flex-col h-full items-center justify-center p-8
        ${isDark ? "bg-gray-900" : "bg-gray-50"}
      `}>
        <Bot className="w-16 h-16 text-primary-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Bem-vindo ao Mentor Trader! 👋
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
          Comece uma nova conversa clicando em "Novo Chat" na sidebar
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {[
            "Análise técnica de BTC/USD",
            "Estratégia de swing trade",
            "Gerenciamento de risco",
            "Setup EUR/JPY",
          ].map((tip) => (
            <button
              key={tip}
              onClick={() => setInput(tip)}
              className={`
                text-sm px-4 py-2 rounded-lg transition-colors shadow-sm
                ${isDark
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
                  : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                }
              `}
            >
              {tip}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Cabeçalho do Chat */}
      <div className={`
        p-4 border-b flex items-center justify-between 
        ${isDark 
          ? "bg-gray-800 border-gray-700" 
          : "bg-white border-gray-200"
        }
      `}>
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center
            ${isDark
              ? "bg-gradient-to-br from-primary-800 to-primary-900"
              : "bg-gradient-to-br from-primary-500 to-primary-600"
            }
          `}>
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {activeConversation?.title || "Nova Conversa"}
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {traderName} • {traderLevel}
              </p>
              <span className={`
                text-xs px-2 py-0.5 rounded-full
                ${isDark
                  ? "bg-primary-900 text-primary-300"
                  : "bg-primary-100 text-primary-600"
                }
              `}>
                {messages.length} mensagens
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {activeConversation?.timestamp 
              ? new Date(activeConversation.timestamp).toLocaleDateString('pt-BR')
              : "Hoje"}
          </div>
          <button
            onClick={handleClearChat}
            disabled={messages.length === 0}
            className={`
              p-2 rounded-lg transition-colors
              disabled:opacity-30 disabled:cursor-not-allowed
              ${isDark
                ? "hover:bg-gray-700 text-gray-400 hover:text-red-400"
                : "hover:bg-gray-100 text-gray-500 hover:text-red-500"
              }
            `}
            title="Limpar conversa atual"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Área de mensagens */}
      <div className={`
        flex-1 overflow-y-auto p-4 space-y-6
        ${isDark ? "bg-gray-900" : "bg-gray-50"}
      `}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className={`
              w-20 h-20 rounded-full flex items-center justify-center mb-6
              ${isDark 
                ? "bg-gray-800 text-gray-400" 
                : "bg-white text-gray-300 border border-gray-200"
              }
            `}>
              <Bot className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Comece sua conversa
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-md">
              Peça para o robo, que ele se encarrega de automatizar a sua estratégia
            </p>
            
            {/* Dicas rápidas */}
            <div className="flex flex-wrap gap-3 justify-center">
             
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                ${message.role === "user"
                  ? "bg-primary-500 text-white"
                  : isDark
                    ? "bg-gradient-to-br from-gray-700 to-gray-800"
                    : "bg-gradient-to-br from-gray-600 to-gray-700"
                }
              `}>
                {message.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Mensagem */}
              <div className={`flex flex-col max-w-[70%] ${
                message.role === "user" ? "items-end" : ""
              }`}>
                <div className={`
                  rounded-2xl px-4 py-3 shadow-sm
                  ${message.role === "user"
                    ? "bg-primary-500 text-white rounded-tr-none"
                    : isDark
                      ? "bg-gray-800 text-gray-100 rounded-tl-none"
                      : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
                  }
                `}>
                  <MessageContent content={message.content} />

                  {/* Botão de copiar para mensagens do assistente */}
                  {message.role === "assistant" && (
                    <button
                      onClick={() => handleCopy(message.content, message.id)}
                      className={`
                        mt-2 flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors
                        ${isDark
                          ? "hover:bg-gray-700 text-gray-400 hover:text-gray-300"
                          : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                        }
                      `}
                    >
                      {copiedMessageId === message.id ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copiar
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Timestamp */}
                <span className={`
                  text-xs mt-1 px-2
                  ${isDark ? "text-gray-400" : "text-gray-500"}
                `}>
                  {new Date(message.timestamp).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3">
            <div className="
              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
              bg-gradient-to-br from-gray-600 to-gray-700
            ">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className={`
              rounded-2xl rounded-tl-none px-4 py-3 shadow-sm
              ${isDark ? "bg-gray-800" : "bg-white border border-gray-200"}
            `}>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                  Processando...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Área de input */}
      <div className={`
        p-4 border-t
        ${isDark 
          ? "bg-gray-800 border-gray-700" 
          : "bg-white border-gray-200"
        }
      `}>
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Digite sua mensagem sobre trading..."
            className={`
              flex-1 resize-none p-3 border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              min-h-[60px] max-h-[120px]
              ${isDark 
                ? "bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500" 
                : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
              }
            `}
            rows={1}
            disabled={isLoading || !activeConversation}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !activeConversation}
            className={`
              self-end p-3 rounded-lg flex items-center justify-center
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-sm hover:shadow-md
              ${isDark
                ? "bg-primary-600 hover:bg-primary-700 text-white"
                : "bg-primary-500 hover:bg-primary-600 text-white"
              }
            `}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Status e informações */}
        <div className="mt-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {activeConversation 
                ? `Conversa: ${activeConversation.title}` 
                : "Nenhuma conversa selecionada"}
            </div>
            {messages.length > 0 && (
              <div className={`
                text-xs px-2 py-1 rounded
                ${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"}
              `}>
                {messages.length} mensagem{messages.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {isLoading ? "Enviando..." : "Pressione Enter para enviar"}
          </div>
        </div>
      </div>
    </div>
  );
}