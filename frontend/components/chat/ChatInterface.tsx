// frontend/components/chat/ChatInterface.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Copy, Check } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useChat } from "../../contexts/ChatContext";
import MessageContent from "./MessageContent";

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  
  // Usar o contexto ao invés de estado local
  const { messages, isLoading, sendMessage } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const messageContent = input;
    setInput(""); // Limpar input imediatamente
    
    // Enviar através do contexto
    await sendMessage(messageContent);
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

  return (
    <div className="flex flex-col h-full">
      {/* Cabeçalho do Chat */}
      <div
        className="
        p-4
        border-b
        bg-white dark:bg-gray-800
        border-gray-200 dark:border-gray-700
      "
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`
              w-10 h-10
              rounded-full
              flex items-center justify-center
              ${
                isDark
                  ? "bg-gradient-to-br from-primary-800 to-primary-900"
                  : "bg-gradient-to-br from-primary-500 to-primary-600"
              }
            `}
            >
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Assistente de Trading
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                IA especializada em análise de mercado
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Online</div>
        </div>
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Nenhuma mensagem ainda
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Comece uma conversa enviando uma mensagem
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {/* Avatar */}
            <div
              className={`
              flex-shrink-0
              w-8 h-8
              rounded-full
              flex items-center justify-center
              ${
                message.role === "user"
                  ? "bg-primary-500 text-white"
                  : isDark
                  ? "bg-gradient-to-br from-gray-700 to-gray-800"
                  : "bg-gradient-to-br from-gray-600 to-gray-700"
              }
            `}
            >
              {message.role === "user" ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>

            {/* Mensagem */}
            <div
              className={`flex flex-col max-w-[70%] ${
                message.role === "user" ? "items-end" : ""
              }`}
            >
              <div
                className={`
                rounded-2xl
                px-4 py-3
                ${
                  message.role === "user"
                    ? "bg-primary-500 text-white rounded-tr-none"
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none"
                }
                shadow-sm
              `}
              >
                <MessageContent content={message.content} />

                {/* Botão de copiar para mensagens do assistente */}
                {message.role === "assistant" && (
                  <button
                    onClick={() => handleCopy(message.content, message.id)}
                    className={`
                      mt-2
                      flex items-center gap-1
                      text-xs
                      px-2 py-1
                      rounded
                      transition-colors
                      ${
                        isDark
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
              <span
                className="
                text-xs
                mt-1
                px-2
                text-gray-500 dark:text-gray-400
              "
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div
              className="
              flex-shrink-0
              w-8 h-8
              rounded-full
              flex items-center justify-center
              bg-gradient-to-br from-gray-600 to-gray-700
            "
            >
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div
              className="
              bg-white dark:bg-gray-800
              rounded-2xl rounded-tl-none
              px-4 py-3
              shadow-sm
            "
            >
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  Digitando...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Área de input */}
      <div
        className="
        p-4
        border-t
        bg-white dark:bg-gray-800
        border-gray-200 dark:border-gray-700
      "
      >
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="
              flex-1
              resize-none
              p-3
              border
              rounded-lg
              focus:outline-none
              focus:ring-2
              focus:ring-primary-500
              focus:border-transparent
              bg-white dark:bg-gray-900
              border-gray-300 dark:border-gray-700
              text-gray-800 dark:text-gray-100
              placeholder-gray-500 dark:placeholder-gray-400
              min-h-[60px]
              max-h-[120px]
            "
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`
              self-end
              p-3
              rounded-lg
              flex items-center justify-center
              transition-all
              duration-200
              disabled:opacity-50
              disabled:cursor-not-allowed
              ${
                isDark
                  ? "bg-primary-600 hover:bg-primary-700 text-white"
                  : "bg-primary-500 hover:bg-primary-600 text-white"
              }
              shadow-sm hover:shadow-md
            `}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Dicas rápidas */}
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "Análise técnica de BTC",
            "Risco vs Retorno",
            "Estratégia de stop loss",
            "Mercado em alta",
          ].map((tip) => (
            <button
              key={tip}
              onClick={() => setInput(tip)}
              disabled={isLoading}
              className={`
                text-xs
                px-3 py-1.5
                rounded-full
                transition-colors
                disabled:opacity-50
                disabled:cursor-not-allowed
                ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }
              `}
            >
              {tip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}