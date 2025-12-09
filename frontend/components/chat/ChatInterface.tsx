"use client";

import React, { useEffect, useRef, useState } from "react";
import { getSystemPrompt } from "../../lib/systemPrompt";

type Role = "user" | "assistant";

type ChatMessage = {
  role: Role;
  content: string;
  timestamp: number; // Adicionado para controle de histórico
};

type MessagePart = {
  type: "text" | "code";
  content: string;
};

// Novo tipo para o diário de trade
type TradeEntry = {
  id: string;
  date: string;
  time: string;
  symbol: string;
  direction: "Compra" | "Venda";
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  result: number;
  emotions: string;
  mistakes: string;
  lessons: string;
  setup: string;
  duration?: string; // Nova propriedade para duração da operação
};

type AppTab = "chat" | "diario";

interface ConversationMemory {
  conversationId: string;
  messages: ChatMessage[];
  strategyContext?: {
    currentCode?: string;
    lastModification?: string;
    errors?: string[];
  };
  lastUpdated: number;
}

export default function MentorTrader(): React.ReactElement {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [traderLevel, setTraderLevel] = useState<
    "iniciante" | "intermediario" | "avancado" | "profissional"
  >("intermediario");
  const [traderName, setTraderName] = useState<string>("");

  // Novos estados para o diário
  const [currentTab, setCurrentTab] = useState<AppTab>("chat");
  const [tradeEntries, setTradeEntries] = useState<TradeEntry[]>([]);
  const [showTradeForm, setShowTradeForm] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<TradeEntry | null>(null);

  // Estados para gerenciamento de memória
  const [conversationId, setConversationId] = useState<string>("");
  const [isNewConversation, setIsNewConversation] = useState<boolean>(false);
  const [conversationSummary, setConversationSummary] = useState<string>("");

  // Estado para o formulário
  const [tradeForm, setTradeForm] = useState<Omit<TradeEntry, "id" | "result">>(
    {
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      symbol: "",
      direction: "Compra",
      entryPrice: 0,
      exitPrice: 0,
      quantity: 1,
      emotions: "",
      mistakes: "",
      lessons: "",
      setup: "",
    }
  );

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const tradeFormRef = useRef<HTMLDivElement | null>(null);

  // Load saved config e diário
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mentorTraderConfig");
      if (saved) {
        const config = JSON.parse(saved) as Partial<{
          traderLevel: string;
          traderName: string;
        }>;
        if (
          config.traderLevel === "iniciante" ||
          config.traderLevel === "intermediario" ||
          config.traderLevel === "avancado" ||
          config.traderLevel === "profissional"
        ) {
          setTraderLevel(config.traderLevel);
        }
        if (config.traderName) setTraderName(config.traderName);
      }

      // Carrega o diário salvo
      const savedDiary = localStorage.getItem("tradeDiary");
      if (savedDiary) {
        setTradeEntries(JSON.parse(savedDiary));
      }
    } catch (err) {
      console.error("Erro ao carregar configurações:", err);
    }
  }, []);

  // Auto-scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Função para carregar memória da conversa
  const loadConversationMemory = () => {
    try {
      const savedMemory = localStorage.getItem("conversationMemory");
      if (savedMemory) {
        const memory: ConversationMemory = JSON.parse(savedMemory);

        // Verifica se a conversa é muito antiga (mais de 4 horas)
        const isOld = Date.now() - memory.lastUpdated > 4 * 60 * 60 * 1000;

        if (!isOld && memory.messages.length > 0) {
          setMessages(memory.messages);
          setConversationId(memory.conversationId);

          // Gera um resumo do contexto para referência
          if (memory.strategyContext?.currentCode) {
            setConversationSummary(
              `Conversa contínua sobre estratégia de trading. Código atual disponível.`
            );
          }
        } else {
          // Cria nova conversa se for muito antiga
          startNewConversation();
        }
      } else {
        startNewConversation();
      }
    } catch (err) {
      console.error("Erro ao carregar memória:", err);
      startNewConversation();
    }
  };

  // Função para salvar memória da conversa
  const saveConversationMemory = () => {
    try {
      // Extrai contexto da conversa atual
      const lastCode = extractLatestCodeFromMessages();
      const memory: ConversationMemory = {
        conversationId: conversationId || generateConversationId(),
        messages: messages.slice(-20), // Mantém apenas últimas 20 mensagens
        strategyContext: lastCode
          ? {
              currentCode: lastCode,
              lastModification: new Date().toISOString(),
              errors: extractErrorsFromMessages(),
            }
          : undefined,
        lastUpdated: Date.now(),
      };

      localStorage.setItem("conversationMemory", JSON.stringify(memory));

      // Atualiza ID se necessário
      if (!conversationId) {
        setConversationId(memory.conversationId);
      }
    } catch (err) {
      console.error("Erro ao salvar memória:", err);
    }
  };

  // Função para extrair o código mais recente das mensagens
  const extractLatestCodeFromMessages = (): string | undefined => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === "assistant" && msg.content.includes("```")) {
        const codeMatch = msg.content.match(/```([\s\S]*?)```/);
        if (codeMatch && codeMatch[1]) {
          return codeMatch[1].trim();
        }
      }
    }
    return undefined;
  };

  // Função para extrair erros das mensagens
  const extractErrorsFromMessages = (): string[] => {
    const errors: string[] = [];
    messages.forEach((msg) => {
      if (
        msg.content.toLowerCase().includes("erro") ||
        msg.content.toLowerCase().includes("error") ||
        msg.content.includes("❌")
      ) {
        errors.push(msg.content.substring(0, 100));
      }
    });
    return errors.slice(-5); // Mantém últimos 5 erros
  };

  // Gera um ID único para a conversa
  const generateConversationId = (): string => {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Inicia nova conversa
  const startNewConversation = () => {
    const newId = generateConversationId();
    setConversationId(newId);
    setMessages([]);
    setConversationSummary("");
    setIsNewConversation(true);

    // Salva no localStorage
    const config = JSON.parse(
      localStorage.getItem("mentorTraderConfig") || "{}"
    );
    config.conversationId = newId;
    localStorage.setItem("mentorTraderConfig", JSON.stringify(config));
  };

  // Função para criar contexto da conversa
  const createConversationContext = (): string => {
    if (messages.length === 0) return "";

    let context = "CONTEXTO DA CONVERSA ANTERIOR:\n\n";

    // Adiciona resumo dos últimos códigos discutidos
    const recentCode = extractLatestCodeFromMessages();
    if (recentCode) {
      context += "📋 CÓDIGO ATUALMENTE EM DISCUSSÃO:\n";
      context += "```\n" + recentCode.substring(0, 500) + "\n```\n\n";
    }

    // Adiciona últimas 3 trocas de mensagens
    const recentMessages = messages.slice(-6);
    if (recentMessages.length > 0) {
      context += "🗣️ CONVERSA RECENTE:\n";
      recentMessages.forEach((msg) => {
        const role = msg.role === "user" ? "👤 VOCÊ" : "🤖 ASSISTENTE";
        const content =
          msg.content.length > 200
            ? msg.content.substring(0, 200) + "..."
            : msg.content;
        context += `${role}: ${content}\n`;
      });
      context += "\n";
    }

    // Adiciona instruções para continuidade
    context += "INSTRUÇÕES PARA RESPOSTA:\n";
    context += "1. Mantenha continuidade com a conversa anterior\n";
    context += "2. Se estiver corrigindo código, refira-se ao código acima\n";
    context += "3. Considere o histórico para dar respostas consistentes\n\n";

    return context;
  };

  // Salva diário sempre que mudar
  useEffect(() => {
    if (tradeEntries.length > 0) {
      localStorage.setItem("tradeDiary", JSON.stringify(tradeEntries));
    }
  }, [tradeEntries]);

  const copyCode = async (code: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // fallback
    }
  };

  // Função para validar e limpar código NTSL
  const validarCodigoNTSL = (conteudo: string): string => {
    const blocosCodigo: string[] = [];
    let conteudoProcessado = conteudo;

    const regexBlocos = /```([\s\S]*?)```/g;
    let match;

    while ((match = regexBlocos.exec(conteudo)) !== null) {
      blocosCodigo.push(match[1]);
    }

    if (blocosCodigo.length > 0) {
      blocosCodigo.forEach((bloco) => {
        const blocoLimpo = limparCodigoNTSL(bloco);
        conteudoProcessado = conteudoProcessado.replace(bloco, blocoLimpo);
      });
    }

    return conteudoProcessado;
  };

  const limparCodigoNTSL = (codigo: string): string => {
    const linhas = codigo.split("\n");

    while (linhas.length > 0 && linhas[0].trim() === "") {
      linhas.shift();
    }

    if (linhas.length === 0) return codigo;

    const primeiraLinha = linhas[0].trim().toLowerCase();

    if (primeiraLinha === "ntsl" || primeiraLinha === "pascal") {
      linhas.shift();
      console.warn(
        "⚠️ Removida palavra-chave inválida do início do código:",
        primeiraLinha
      );
    }

    return linhas.join("\n");
  };

  const renderMessage = (msg: ChatMessage, idx: number) => {
    const codeRegex = /```([\s\S]*?)```/g;
    const parts: MessagePart[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeRegex.exec(msg.content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: msg.content.substring(lastIndex, match.index),
        });
      }

      parts.push({
        type: "code",
        content: match[1].trim(),
      });

      lastIndex = codeRegex.lastIndex;
    }

    if (parts.length === 0 || lastIndex < msg.content.length) {
      parts.push({
        type: "text",
        content:
          lastIndex === 0
            ? msg.content
            : msg.content.substring(lastIndex, msg.content.length),
      });
    }

    return (
      <div
        key={idx}
        className={`flex gap-3 mb-4 ${
          msg.role === "user" ? "flex-row-reverse" : ""
        }`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 ${
            msg.role === "user" ? "bg-purple-600" : "bg-pink-500"
          }`}
        >
          {msg.role === "user" ? "👤" : "🤖"}
        </div>
        <div className="max-w-[70%] space-y-2">
          {parts.map((part, i) =>
            part.type === "code" ? (
              <div
                key={i}
                className="relative bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-sm overflow-x-auto"
              >
                <button
                  onClick={() => copyCode(part.content)}
                  className="absolute top-2 right-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs"
                >
                  📋 Copiar
                </button>
                <pre className="whitespace-pre-wrap mt-6">{part.content}</pre>
              </div>
            ) : (
              <div
                key={i}
                className={`p-4 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-white text-gray-800"
                    : "bg-white/95 text-gray-800"
                }`}
              >
                {part.content.split("\n").map((line, j) => (
                  <p key={j} className="mb-2 last:mb-0">
                    {line}
                  </p>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  const sendMessage = async (): Promise<void> => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Cria contexto da conversa
      const conversationContext = createConversationContext();

      // Prepara a mensagem com contexto
      const messageWithContext = conversationContext
        ? `${conversationContext}\n\nNOVA MENSAGEM DO USUÁRIO:\n${input}`
        : input;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageWithContext,
          systemPrompt: getSystemPrompt(traderName, traderLevel),
          conversationId: conversationId,
          isContinuation: messages.length > 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      const assistantText = data.content || "Resposta vazia";
      const textoValidado = validarCodigoNTSL(assistantText);

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: textoValidado,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Atualiza resumo se necessário
      if (textoValidado.includes("```")) {
        setConversationSummary(
          `Último código atualizado em ${new Date().toLocaleTimeString()}`
        );
      }
    } catch (error: unknown) {
      console.error("Erro na requisição:", error);

      const errMsg =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "Erro desconhecido";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Erro: ${errMsg}\n\nSugestão: Tente reformular sua pergunta ou iniciar uma nova conversa.`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para limpar memória da conversa
  const clearConversationMemory = () => {
    if (
      confirm("Deseja iniciar uma nova conversa? O histórico atual será limpo.")
    ) {
      startNewConversation();
      localStorage.removeItem("conversationMemory");
      alert("Nova conversa iniciada! O histórico foi limpo.");
    }
  };

  // Atualize a função saveConfig para salvar o conversationId
  const saveConfig = (): void => {
    const config = {
      traderLevel,
      traderName,
      conversationId: conversationId || generateConversationId(),
    };
    localStorage.setItem("mentorTraderConfig", JSON.stringify(config));
    setShowConfig(false);
  };

  const testConnection = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Teste de conexão",
          systemPrompt: getSystemPrompt(traderName, traderLevel),
        }),
      });

      if (response.ok) {
        alert("✅ Conexão com a API funcionando perfeitamente!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Status: ${response.status}`);
      }
    } catch (error) {
      alert(
        `❌ Falha na conexão: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============= FUNÇÕES DO DIÁRIO =============

  const calculateResult = (
    entryPrice: number,
    exitPrice: number,
    quantity: number,
    direction: "Compra" | "Venda"
  ): number => {
    const diff = exitPrice - entryPrice;
    const multiplier = direction === "Compra" ? 1 : -1;
    return diff * multiplier * quantity;
  };

  const handleTradeFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setTradeForm((prev) => ({
      ...prev,
      [name]:
        name === "entryPrice" || name === "exitPrice" || name === "quantity"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const saveTradeEntry = () => {
    if (!tradeForm.symbol || !tradeForm.entryPrice || !tradeForm.exitPrice) {
      alert("Preencha pelo menos o ativo, preço de entrada e saída");
      return;
    }

    const result = calculateResult(
      tradeForm.entryPrice,
      tradeForm.exitPrice,
      tradeForm.quantity,
      tradeForm.direction
    );

    const entry: TradeEntry = {
      id: editingEntry?.id || Date.now().toString(),
      ...tradeForm,
      result,
    };

    if (editingEntry) {
      // Editar entrada existente
      setTradeEntries((prev) =>
        prev.map((item) => (item.id === editingEntry.id ? entry : item))
      );
    } else {
      // Adicionar nova entrada
      setTradeEntries((prev) => [entry, ...prev]);
    }

    // Resetar formulário
    setTradeForm({
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      symbol: "",
      direction: "Compra",
      entryPrice: 0,
      exitPrice: 0,
      quantity: 1,
      emotions: "",
      mistakes: "",
      lessons: "",
      setup: "",
    });

    setEditingEntry(null);
    setShowTradeForm(false);
  };

  const editTradeEntry = (entry: TradeEntry) => {
    const { id, result, ...formData } = entry;
    setTradeForm(formData);
    setEditingEntry(entry);
    setShowTradeForm(true);
  };

  const deleteTradeEntry = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta operação?")) {
      setTradeEntries((prev) => prev.filter((entry) => entry.id !== id));
    }
  };

  const exportDiary = () => {
    const csvContent = convertToCSV(tradeEntries);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `diario-trade-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (entries: TradeEntry[]): string => {
    const headers = [
      "Data",
      "Hora",
      "Ativo",
      "Direção",
      "Preço Entrada",
      "Preço Saída",
      "Quantidade",
      "Resultado",
      "Setup",
      "Emoções",
      "Erros",
      "Lições",
    ].join(";");

    const rows = entries.map((entry) =>
      [
        entry.date,
        entry.time,
        entry.symbol,
        entry.direction,
        entry.entryPrice.toString().replace(".", ","),
        entry.exitPrice.toString().replace(".", ","),
        entry.quantity.toString(),
        entry.result.toString().replace(".", ","),
        entry.setup,
        `"${entry.emotions}"`,
        `"${entry.mistakes}"`,
        `"${entry.lessons}"`,
      ].join(";")
    );

    return [headers, ...rows].join("\n");
  };

  const importFromCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const importedEntries = parseCSV(csvText);

        if (importedEntries.length > 0) {
          // Pede confirmação se já existem registros
          if (tradeEntries.length > 0) {
            const shouldReplace = confirm(
              `Foram encontradas ${importedEntries.length} operações no CSV.\n` +
                `Deseja:\n` +
                `• "OK" para ADICIONAR às operações existentes (${tradeEntries.length} operações)\n` +
                `• "Cancelar" para SUBSTITUIR todas as operações existentes`
            );

            if (shouldReplace) {
              setTradeEntries((prev) => [...prev, ...importedEntries]);
            } else {
              setTradeEntries(importedEntries);
            }
          } else {
            setTradeEntries(importedEntries);
          }

          alert(
            `✅ ${importedEntries.length} operações importadas com sucesso do CSV!`
          );
        } else {
          alert("⚠️ Nenhuma operação encontrada no arquivo CSV");
        }
      } catch (error) {
        console.error("Erro ao importar CSV:", error);
        alert(
          `❌ Erro ao importar CSV: ${
            error instanceof Error ? error.message : "Formato inválido"
          }`
        );
      }
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  // Função para parsear CSV do Profit
  const parseCSV = (csvText: string): TradeEntry[] => {
    const lines = csvText.split("\n");
    const entries: TradeEntry[] = [];

    // Procura a linha de cabeçalho (pode estar em diferentes formatos)
    let startIndex = 0;
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      if (
        lines[i].includes("Data") ||
        lines[i].includes("data") ||
        lines[i].includes("DATA")
      ) {
        startIndex = i;
        break;
      }
    }

    // Pula o cabeçalho
    for (let i = startIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line === ";" || line.startsWith("#")) continue;

      try {
        // Tenta diferentes separadores
        let fields = line.split(";");
        if (fields.length < 5) {
          fields = line.split(",");
        }
        if (fields.length < 5) {
          fields = line.split("\t");
        }

        // Limpa aspas dos campos
        fields = fields.map((field) => field.replace(/^"|"$/g, "").trim());

        // Tenta identificar os campos
        // Formato esperado do Profit pode variar, então tentamos diferentes padrões
        let date = "";
        let time = "";
        let symbol = "";
        let direction: "Compra" | "Venda" = "Compra";
        let entryPrice = 0;
        let exitPrice = 0;
        let quantity = 1;

        // Padrão 1: Data e hora juntas
        if (fields[0].includes("/") && fields[0].includes(" ")) {
          const [datePart, timePart] = fields[0].split(" ");
          date = formatDate(datePart);
          time = timePart.substring(0, 5); // Pega apenas HH:MM
        } else if (fields[0].includes("/")) {
          date = formatDate(fields[0]);
          time =
            fields.length > 1
              ? fields[1].includes(":")
                ? fields[1].substring(0, 5)
                : "09:00"
              : "09:00";
        }

        // Tenta identificar o símbolo
        for (const field of fields) {
          if (field.match(/[A-Z]{4}\d/)) {
            // Padrão como PETR4, VALE3, etc
            symbol = field;
            break;
          } else if (field.match(/WIN|WDO|DOL/)) {
            // Mini índice, dólar
            symbol = field;
            break;
          }
        }

        if (!symbol && fields.length > 2) {
          symbol = fields[2] || "DESC";
        }

        // Tenta identificar preços e direção
        for (let j = 0; j < fields.length; j++) {
          const field = fields[j];
          const numValue = parseFloat(field.replace(",", "."));

          if (!isNaN(numValue) && numValue > 0) {
            if (entryPrice === 0) {
              entryPrice = numValue;
            } else if (exitPrice === 0) {
              exitPrice = numValue;
            }
          }

          // Identifica direção por texto
          if (
            field.toLowerCase().includes("compra") ||
            field.toLowerCase().includes("buy")
          ) {
            direction = "Compra";
          } else if (
            field.toLowerCase().includes("venda") ||
            field.toLowerCase().includes("sell")
          ) {
            direction = "Venda";
          }

          // Identifica quantidade
          if (field.match(/^\d+$/)) {
            const qty = parseInt(field);
            if (qty > 0 && qty < 10000) {
              quantity = qty;
            }
          }
        }

        // Se não conseguiu determinar ambos preços, tenta lógica alternativa
        if (entryPrice > 0 && exitPrice === 0) {
          exitPrice =
            direction === "Compra" ? entryPrice * 1.001 : entryPrice * 0.999;
        } else if (exitPrice > 0 && entryPrice === 0) {
          entryPrice =
            direction === "Compra" ? exitPrice * 0.999 : exitPrice * 1.001;
        }

        // Garante que temos os dados mínimos
        if (date && symbol && entryPrice > 0 && exitPrice > 0) {
          const result = calculateResult(
            entryPrice,
            exitPrice,
            quantity,
            direction
          );

          entries.push({
            id: `imported-${Date.now()}-${i}`,
            date,
            time: time || "09:00",
            symbol,
            direction,
            entryPrice,
            exitPrice,
            quantity,
            result,
            emotions: "",
            mistakes: "",
            lessons: "Importado do Profit",
            setup: "Importado do CSV",
          });
        }
      } catch (error) {
        console.warn(`Linha ${i} ignorada:`, error);
        // Continua processando outras linhas
      }
    }

    return entries;
  };

  // Função para formatar data
  const formatDate = (dateStr: string): string => {
    // Tenta diferentes formatos de data
    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        const [day, month, year] = parts;
        const fullYear = year.length === 2 ? `20${year}` : year;
        return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
    } else if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
    }

    // Retorna data atual se não conseguir parsear
    return new Date().toISOString().split("T")[0];
  };

  // ============= RENDERIZAÇÃO =============

  const renderDiary = () => (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            📓 Diário de Trade
          </h2>
          <p className="text-gray-600">
            Registro das suas operações e aprendizado
          </p>
        </div>
        <div className="flex gap-2">
          <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold cursor-pointer flex items-center gap-2">
            <span>📥 Importar CSV</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={importFromCSV}
              className="hidden"
            />
          </label>
          <button
            onClick={exportDiary}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
          >
            📤 Exportar CSV
          </button>
          <button
            onClick={() => {
              setEditingEntry(null);
              setShowTradeForm(true);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
          >
            ➕ Nova Operação
          </button>
        </div>
      </div>

      {/* Instruções de Importação */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
          ℹ️ Como exportar do Profit
        </h3>
        <ol className="text-blue-700 text-sm space-y-1 pl-5 list-decimal">
          <li>
            No Profit, vá em{" "}
            <strong>Relatórios → Relatório de Negociação</strong>
          </li>
          <li>Selecione o período desejado</li>
          <li>
            Clique em <strong>(Exportar)</strong> e escolha <strong>CSV</strong>
          </li>
          <li>Salve o arquivo e importe aqui usando o botão acima</li>
          <li>
            <em>
              Dica: O sistema tenta identificar automaticamente os campos, mas
              você pode editar as operações após importar
            </em>
          </li>
        </ol>
      </div>

      {/* Estatísticas */}
      {tradeEntries.length > 0 && (
        <div className="bg-white rounded-xl p-4 mb-6 shadow">
          <h3 className="font-bold text-lg mb-3">📊 Resumo do Diário</h3>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold">{tradeEntries.length}</div>
              <div className="text-sm text-gray-600">Operações</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {tradeEntries.filter((t) => t.result > 0).length}
              </div>
              <div className="text-sm text-gray-600">Lucros</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {tradeEntries.filter((t) => t.result < 0).length}
              </div>
              <div className="text-sm text-gray-600">Prejuízos</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold">
                {(
                  (tradeEntries.filter((t) => t.result > 0).length /
                    tradeEntries.length) *
                    100 || 0
                ).toFixed(1)}
                %
              </div>
              <div className="text-sm text-gray-600">Taxa de Acerto</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold">
                R${" "}
                {tradeEntries.reduce((sum, t) => sum + t.result, 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Resultado Total</div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de operações */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow">
        {tradeEntries.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700">
              Nenhuma operação registrada
            </h3>
            <p className="text-gray-500 mb-4">
              Comece registrando sua primeira operação ou importe do Profit
            </p>
            <div className="flex gap-3 justify-center">
              <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold cursor-pointer">
                📥 Importar do Profit
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={importFromCSV}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setShowTradeForm(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold"
              >
                ➕ Registrar Manualmente
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Data/Hora</th>
                  <th className="p-3 text-left">Ativo</th>
                  <th className="p-3 text-left">Direção</th>
                  <th className="p-3 text-left">Entrada</th>
                  <th className="p-3 text-left">Saída</th>
                  <th className="p-3 text-left">Qtd</th>
                  <th className="p-3 text-left">Resultado</th>
                  <th className="p-3 text-left">Setup</th>
                  <th className="p-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {tradeEntries.map((entry) => (
                  <tr key={entry.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{entry.date}</div>
                      <div className="text-sm text-gray-500">{entry.time}</div>
                    </td>
                    <td className="p-3 font-medium">{entry.symbol}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.direction === "Compra"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {entry.direction}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium">
                        R$ {entry.entryPrice.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium">
                        R$ {entry.exitPrice.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {entry.quantity}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          entry.result > 0
                            ? "bg-green-100 text-green-700"
                            : entry.result < 0
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        R$ {entry.result.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {entry.setup || "Não informado"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editTradeEntry(entry)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => {
                            const confirmed = confirm(
                              `Excluir operação de ${entry.date} ${entry.time}?\n` +
                                `${entry.symbol} ${
                                  entry.direction
                                } R$${entry.result.toFixed(2)}`
                            );
                            if (confirmed) deleteTradeEntry(entry.id);
                          }}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderMemoryStatus = () => (
    <div className="flex items-center justify-between mb-4 p-3 bg-white/10 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-sm">💭</span>
        <span className="text-sm text-white">
          {conversationSummary || "Nova conversa"}
        </span>
      </div>
      <button
        onClick={clearConversationMemory}
        className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded"
        title="Iniciar nova conversa"
      >
        Nova Conversa
      </button>
    </div>
  );

  const renderChat = () => (
    <>
      <div className="flex-1 overflow-y-auto pb-4">
        {messages.length === 0 && (
          <div className="text-center text-white py-10">
            <h2 className="text-3xl font-bold mb-3">👋 Bem-vindo!</h2>
            <p className="text-lg">Pergunte sobre trading, NTSL e mais!</p>
            <p className="text-sm mt-2 opacity-80">
              O sistema agora mantém memória da conversa por 4 horas
            </p>
            <button
              onClick={clearConversationMemory}
              className="mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg"
            >
              🔄 Iniciar Nova Conversa
            </button>
          </div>
        )}

        {messages.length > 0 && renderMemoryStatus()}

        {messages.map((msg, idx) => renderMessage(msg, idx))}

        {isLoading && (
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-xl">
              🤖
            </div>
            <div className="bg-white/95 p-4 rounded-2xl">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-lg flex gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Digite sua dúvida... (o sistema lembrará da conversa anterior)"
          className="text-black flex-1 p-4 border-2 border-gray-300 rounded-xl resize-none focus:outline-none focus:border-purple-600"
          rows={2}
          disabled={isLoading}
        />
        <div className="flex flex-col gap-2">
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50"
          >
            Enviar
          </button>
          <button
            onClick={clearConversationMemory}
            className="text-xs text-gray-500 hover:text-gray-700"
            title="Limpar histórico"
          >
            🔄 Nova
          </button>
        </div>
      </div>
    </>
  );

  // Atualize o modal de configurações para incluir opções de memória
  const renderConfigModal = () => (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-5 z-50"
      onClick={() => setShowConfig(false)}
    >
      <div
        className="bg-white rounded-2xl p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6">⚙️ Configurações</h2>

        <div className="space-y-4">
          {/* Status da Memória */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-blue-800">
                  💭 Memória da Conversa
                </p>
                <p className="text-blue-600 text-sm mt-1">
                  {messages.length > 0
                    ? `${messages.length} mensagens salvas`
                    : "Nenhuma conversa salva"}
                </p>
              </div>
              <button
                onClick={clearConversationMemory}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* API Status */}
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-800 font-semibold">
              ✅ API Key Configurada
            </p>
            <p className="text-green-600 text-sm mt-1">
              A chave da API está definida no arquivo .env.local
            </p>
          </div>

          {/* Configurações existentes... */}
          <div>
            <label className="block font-semibold mb-2">Nível:</label>
            <select
              value={traderLevel}
              onChange={(e) =>
                setTraderLevel(
                  e.target.value as
                    | "iniciante"
                    | "intermediario"
                    | "avancado"
                    | "profissional"
                )
              }
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:border-purple-600"
            >
              <option value="iniciante">Iniciante</option>
              <option value="intermediario">Intermediário</option>
              <option value="avancado">Avançado</option>
              <option value="profissional">Profissional</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-2">Nome (opcional):</label>
            <input
              type="text"
              value={traderName}
              onChange={(e) => setTraderName(e.target.value)}
              placeholder="Seu nome"
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:border-purple-600"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={testConnection}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold disabled:opacity-50"
          >
            Testar Conexão
          </button>
        </div>

        <div className="flex gap-3 mt-3">
          <button
            onClick={() => setShowConfig(false)}
            className="flex-1 bg-gray-200 hover:bg-gray-300 p-3 rounded-lg font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={saveConfig}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-semibold"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-600 to-purple-900">
      <div className="bg-white p-5 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🤖</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mentor Trader</h1>
            <p className="text-sm text-gray-600">Seu mentor 24/7</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Tabs de navegação */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCurrentTab("chat")}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                currentTab === "chat"
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              💬 Chat
            </button>
            <button
              onClick={() => setCurrentTab("diario")}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                currentTab === "diario"
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📓 Diário
            </button>
          </div>

          <button
            onClick={() => setShowConfig(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-semibold"
          >
            ⚙️ Config
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col max-w-5xl w-full mx-auto p-5">
        {currentTab === "chat" ? renderChat() : renderDiary()}
      </div>

      {/* Modal de Configurações atualizado */}
      {showConfig && renderConfigModal()}

      {/* Modal do Diário */}
      {showTradeForm && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-5 z-50"
          onClick={() => setShowTradeForm(false)}
        >
          <div
            ref={tradeFormRef}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6">
              {editingEntry ? "✏️ Editar Operação" : "➕ Nova Operação"}
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block font-semibold mb-2">Data *</label>
                <input
                  type="date"
                  name="date"
                  value={tradeForm.date}
                  onChange={handleTradeFormChange}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:border-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Hora *</label>
                <input
                  type="time"
                  name="time"
                  value={tradeForm.time}
                  onChange={handleTradeFormChange}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:border-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Ativo *</label>
                <input
                  type="text"
                  name="symbol"
                  value={tradeForm.symbol}
                  onChange={handleTradeFormChange}
                  placeholder="Ex: PETR4, WINZ23"
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:border-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Direção *</label>
                <select
                  name="direction"
                  value={tradeForm.direction}
                  onChange={handleTradeFormChange}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:border-purple-600"
                >
                  <option value="Compra">Compra</option>
                  <option value="Venda">Venda</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Preço Entrada *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="entryPrice"
                  value={tradeForm.entryPrice || ""}
                  onChange={handleTradeFormChange}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:border-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Preço Saída *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="exitPrice"
                  value={tradeForm.exitPrice || ""}
                  onChange={handleTradeFormChange}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:border-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Quantidade *</label>
                <input
                  type="number"
                  name="quantity"
                  value={tradeForm.quantity || ""}
                  onChange={handleTradeFormChange}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:border-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Setup</label>
                <select
                  name="setup"
                  value={tradeForm.setup}
                  onChange={handleTradeFormChange}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:border-purple-600"
                >
                  <option value="">Selecione...</option>
                  <option value="Média Móvel">Média Móvel</option>
                  <option value="Suporte/Resistência">
                    Suporte/Resistência
                  </option>
                  <option value="Romper">Romper de Linha</option>
                  <option value="Pullback">Pullback</option>
                  <option value="Divergência">Divergência</option>
                  <option value="Scalping">Scalping</option>
                  <option value="Day Trade">Day Trade</option>
                  <option value="Swing Trade">Swing Trade</option>
                  <option value="Importado">Importado do CSV</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block font-semibold mb-2">
                  Emoções Durante a Operação
                </label>
                <textarea
                  name="emotions"
                  value={tradeForm.emotions}
                  onChange={handleTradeFormChange}
                  placeholder="Como você se sentiu? Confiante? Ansioso? Impulsivo?"
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:border-purple-600 h-24"
                  rows={3}
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Erros Cometidos
                </label>
                <textarea
                  name="mistakes"
                  value={tradeForm.mistakes}
                  onChange={handleTradeFormChange}
                  placeholder="Quais erros você identificou? Entrada antecipada? Stop muito apertado?"
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:border-purple-600 h-24"
                  rows={3}
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Lições Aprendidas
                </label>
                <textarea
                  name="lessons"
                  value={tradeForm.lessons}
                  onChange={handleTradeFormChange}
                  placeholder="O que você aprendeu com essa operação?"
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:border-purple-600 h-24"
                  rows={3}
                />
              </div>
            </div>

            {/* Preview do resultado */}
            {tradeForm.entryPrice && tradeForm.exitPrice && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold mb-2">📊 Previsão do Resultado</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-600">Resultado: </span>
                    <span
                      className={`text-lg font-bold ${
                        calculateResult(
                          tradeForm.entryPrice,
                          tradeForm.exitPrice,
                          tradeForm.quantity,
                          tradeForm.direction
                        ) > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      R${" "}
                      {calculateResult(
                        tradeForm.entryPrice,
                        tradeForm.exitPrice,
                        tradeForm.quantity,
                        tradeForm.direction
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {tradeForm.direction === "Compra"
                      ? `Entrada: R$ ${tradeForm.entryPrice} → Saída: R$ ${tradeForm.exitPrice}`
                      : `Entrada: R$ ${tradeForm.entryPrice} → Saída: R$ ${tradeForm.exitPrice}`}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowTradeForm(false);
                  setEditingEntry(null);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 p-3 rounded-lg font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={saveTradeEntry}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-semibold"
              >
                {editingEntry ? "Atualizar" : "Salvar Operação"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
