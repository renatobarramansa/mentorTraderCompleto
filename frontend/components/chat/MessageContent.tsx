// frontend/components/chat/MessageContent.tsx
"use client";

import React, { useState, useEffect } from "react";

interface MessageContentProps {
  content: string;
}

// Extrai blocos de código do texto - VERSÃO ROBUSTA
const extractCodeBlocks = (
  content: string
): Array<{ type: "text" | "code"; content: string; language?: string }> => {
  const blocks: Array<{
    type: "text" | "code";
    content: string;
    language?: string;
  }> = [];

  console.log("🔍 [MessageContent] Analisando conteúdo:", {
    length: content.length,
    preview: content.substring(0, 100),
    hasBackticks: content.includes("```"),
    hasNTSLKeywords:
      content.includes("input") || content.includes("BuyAtMarket"),
  });

  // PRIMEIRO: Tentar encontrar blocos com backticks
  const codeRegex = /```(ntsl|pascal|NTSL|Pascal)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let blockCount = 0;

  while ((match = codeRegex.exec(content)) !== null) {
    blockCount++;

    console.log(
      `📦 [MessageContent] Bloco ${blockCount} encontrado com backticks:`,
      {
        language: match[1] || "none",
        preview: match[2].substring(0, 50) + "...",
        position: match.index,
      }
    );

    // Texto antes do bloco
    if (match.index > lastIndex) {
      const textBefore = content.substring(lastIndex, match.index).trim();
      if (textBefore) {
        blocks.push({
          type: "text",
          content: textBefore,
        });
      }
    }

    const rawLanguage = match[1]?.toLowerCase() || "";
    const codeContent = match[2].trim();

    // DETECTAR automaticamente se é NTSL
    const ntslKeywords = [
      "BuyAtMarket",
      "SellShortAtMarket",
      "BuyToCoverAtMarket",
      "SellToCoverAtMarket",
      "Media(",
      "IFR(",
      "ADX(",
      "MACD(",
      "BollingerBands",
      "TakeProfit(",
      "StopLoss(",
      "ConsoleLog(",
    ];

    const hasNTSLKeywords = ntslKeywords.some((keyword) =>
      codeContent.includes(keyword)
    );
    const hasNTSLStructure = /^(input|var|begin)/im.test(codeContent);
    const endsWithEndDot = /end\.\s*$/m.test(codeContent);

    const isDefinitelyNTSL = rawLanguage === "ntsl" || rawLanguage === "pascal";
    const looksLikeNTSL = hasNTSLKeywords || hasNTSLStructure || endsWithEndDot;

    const finalLanguage =
      isDefinitelyNTSL || looksLikeNTSL ? "ntsl" : rawLanguage || "text";

    console.log(
      `✅ [MessageContent] Bloco ${blockCount} classificado como: ${finalLanguage}`,
      {
        rawLanguage,
        hasNTSLKeywords,
        hasNTSLStructure,
        endsWithEndDot,
        looksLikeNTSL,
      }
    );

    blocks.push({
      type: "code",
      content: codeContent,
      language: finalLanguage,
    });

    lastIndex = codeRegex.lastIndex;
  }

  // SEGUNDO: Se não encontrou blocos com backticks, verificar se há código NTSL solto
  if (blockCount === 0) {
    console.log(
      "🔄 [MessageContent] Nenhum bloco com backticks. Verificando código solto..."
    );

    // Padrões para detectar código NTSL sem backticks
    const ntslPatterns = [
      /(input[\s\S]*?end\.)/i, // Bloco completo input...end.
      /(var[\s\S]*?begin[\s\S]*?end\.)/i, // Bloco completo var...begin...end.
      /(begin[\s\S]*?end\.)/i, // Bloco begin...end.
    ];

    for (const pattern of ntslPatterns) {
      const match = content.match(pattern);
      if (match) {
        const codeContent = match[0].trim();
        const codeStart = content.indexOf(codeContent);
        const codeEnd = codeStart + codeContent.length;

        console.log(
          "⚠️ [MessageContent] Código NTSL encontrado SEM backticks!",
          {
            preview: codeContent.substring(0, 50) + "...",
            length: codeContent.length,
            start: codeStart,
            end: codeEnd,
          }
        );

        // Texto antes do código
        if (codeStart > 0) {
          const textBefore = content.substring(0, codeStart).trim();
          if (textBefore) {
            blocks.push({ type: "text", content: textBefore });
          }
        }

        // Código NTSL
        blocks.push({
          type: "code",
          content: codeContent,
          language: "ntsl",
        });

        // Texto após o código
        if (codeEnd < content.length) {
          const textAfter = content.substring(codeEnd).trim();
          if (textAfter) {
            blocks.push({ type: "text", content: textAfter });
          }
        }

        console.log(
          `📊 [MessageContent] Código extraído (${blocks.length} blocos)`
        );
        return blocks;
      }
    }

    console.warn("⚠️ [MessageContent] Nenhum código NTSL identificado");
  }

  // Adicionar texto restante após o último bloco de código
  if (lastIndex < content.length) {
    const remainingText = content.substring(lastIndex).trim();
    if (remainingText) {
      blocks.push({
        type: "text",
        content: remainingText,
      });
    }
  }

  // Se não encontrou nada, retorna tudo como texto
  if (blocks.length === 0 && content.trim()) {
    blocks.push({
      type: "text",
      content: content.trim(),
    });
  }

  console.log(
    `📊 [MessageContent] Total de blocos: ${blocks.length} (${
      blocks.filter((b) => b.type === "code").length
    } de código)`
  );

  return blocks;
};

// Renderiza texto simples com suporte a markdown básico
const TextBlock: React.FC<{ content: string }> = ({ content }) => {
  const processMarkdown = (text: string) => {
    // Negrito **texto**
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Itálico *texto*
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
    // Código inline `código`
    text = text.replace(
      /`(.*?)`/g,
      '<code class="bg-gray-700 px-1.5 py-0.5 rounded text-sm">$1</code>'
    );

    return text;
  };

  return (
    <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
      {content.split("\n").map((line, idx) => {
        const processedLine = processMarkdown(line);
        return (
          <p
            key={idx}
            className="mb-2 last:mb-0"
            dangerouslySetInnerHTML={{ __html: processedLine || "\u00A0" }}
          />
        );
      })}
    </div>
  );
};

// Componente para syntax highlighting de NTSL/Pascal
const NTSLHighlighter: React.FC<{ line: string }> = ({ line }) => {
  const tokens: React.ReactNode[] = [];

  // Comentários
  const commentMatch = line.match(/(\/\/.*)/);
  if (commentMatch) {
    const commentIndex = line.indexOf(commentMatch[0]);
    const beforeComment = line.substring(0, commentIndex);

    if (beforeComment) {
      processLine(beforeComment, tokens);
    }

    tokens.push(
      <span key={`comment-${tokens.length}`} className="text-gray-500 italic">
        {commentMatch[0]}
      </span>
    );

    return <>{tokens}</>;
  }

  processLine(line, tokens);

  return <>{tokens}</>;

 function processLine(text: string, tokenArray: React.ReactNode[]) {
    const keywords = [
      'input', 'var', 'begin', 'end', 
      'If', 'Then', 'Else', 'For', 'While', 'To', 'Do',
      'Integer', 'Float', 'Double', 'Boolean', 'String', 'Array', 'Of',
      'BuyAtMarket', 'BuyLimit', 'BuyStop',
      'SellShortAtMarket', 'SellShortLimit', 'SellShortStop',
      'BuyToCoverAtMarket', 'BuyToCoverLimit', 'BuyToCoverStop',
      'SellToCoverAtMarket', 'SellToCoverLimit', 'SellToCoverStop',
      'HasPosition', 'ClosePosition', 'ReversePosition',
      'Media', 'MediaExp', 'IFR', 'ADX', 'MACD', 'BollingerBands', 'Stochastic',
      'WAverage', 'TriAverage', 'xAverage', 'HullMovingAverage', 'VWAP',
      'Close', 'Open', 'High', 'Low', 'Volume',
      'AskPrice', 'AskSize', 'BidPrice', 'BidSize',
      'TotalBuyQtd', 'TotalSellQtd', 'BookSpread',
      'CloseD', 'OpenD', 'HighD', 'LowD', 'VolumeD',
      'Date', 'Time', 'Today', 'Yesterday',
      'Max', 'Min', 'Highest', 'Lowest', 'ABS', 'Sqrt', 'Round', 'Floor', 'Ceiling',
      'Plot', 'Plot2', 'Plot3', 'Plot4', 'Plot5',
      'PaintBar', 'PaintVar', 'Alert', 'ConsoleLog',
      'True', 'False',
      'Const', 'Function', 'Procedure', 'XRay', 'BoolToString',
      'TakeProfit', 'StopLoss'
    ];
    
    // ⚡ CORREÇÃO CRÍTICA: Regex que PRESERVA espaços
    const tokenRegex = /(\b\w+\b|:=|[-+*/=<>!]+|["'].*?["']|\d+\.?\d*|[(){}[\];:,]|\s+)/g;
    const parts = text.match(tokenRegex) || [text];
    
    parts.forEach((part, idx) => {
      if (!part) return;
      
      // ✅ CORREÇÃO: Renderizar espaços como spans com conteúdo preservado
      if (/^\s+$/.test(part)) {
        // Converter espaços em &nbsp; para forçar renderização
        const spaceContent = part.split('').map(char => 
          char === ' ' ? '\u00A0' : char
        ).join('');
        tokenArray.push(
          <span key={`space-${idx}-${tokenArray.length}`} style={{ whiteSpace: 'pre' }}>
            {spaceContent}
          </span>
        );
        return;
      }
      
      // Keywords (case-insensitive)
      if (keywords.some(kw => kw.toLowerCase() === part.toLowerCase())) {
        tokenArray.push(
          <span key={`keyword-${idx}`} className="text-blue-400 dark:text-blue-300 font-semibold">
            {part}
          </span>
        );
      }
      // Strings
      else if (/^["'].*["']$/.test(part)) {
        tokenArray.push(
          <span key={`string-${idx}`} className="text-green-400 dark:text-green-300">
            {part}
          </span>
        );
      }
      // Números
      else if (/^\d+\.?\d*$/.test(part)) {
        tokenArray.push(
          <span key={`number-${idx}`} className="text-amber-400 dark:text-amber-300">
            {part}
          </span>
        );
      }
      // Operador de atribuição
      else if (part === ':=') {
        tokenArray.push(
          <span key={`operator-${idx}`} className="text-pink-400 dark:text-pink-300">
            {part}
          </span>
        );
      }
      // Outros operadores
      else if (/^[-+*/=<>!]+$/.test(part)) {
        tokenArray.push(
          <span key={`operator2-${idx}`} className="text-purple-400 dark:text-purple-300">
            {part}
          </span>
        );
      }
      // Pontuação
      else if (/^[(){}[\];:,]$/.test(part)) {
        tokenArray.push(
          <span key={`punct-${idx}`} className="text-gray-300 dark:text-gray-400">
            {part}
          </span>
        );
      }
      // Texto normal
      else {
        tokenArray.push(
          <span key={`text-${idx}`} className="text-gray-100 dark:text-gray-200">
            {part}
          </span>
        );
      }
    });
  }
};

// Bloco de código com syntax highlighting
const CodeBlock: React.FC<{ content: string; language?: string }> = ({
  content,
  language = "text",
}) => {
  const [copied, setCopied] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  useEffect(() => {
    console.log("🎨 [CodeBlock] Renderizando:", {
      language,
      lines: content.split("\n").length,
      preview: content.substring(0, 30) + "...",
    });
  }, [content, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setShowCopySuccess(true);

      setTimeout(() => {
        setShowCopySuccess(false);
        setTimeout(() => setCopied(false), 300);
      }, 2000);
    } catch (err) {
      console.error("❌ [CodeBlock] Erro ao copiar:", err);
    }
  };

  const lines = content.split("\n");
  const isNTSL = language === "ntsl" || language === "pascal";
  const lineCount = lines.length;

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700 shadow-lg shadow-gray-200 dark:shadow-gray-900 transition-all duration-300 hover:shadow-xl">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-900 px-4 py-3 border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {/* Dots */}
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400 dark:bg-red-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 dark:bg-yellow-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 dark:bg-green-500"></div>
          </div>

          {/* Badge de linguagem */}
          <span
            className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-md ${
              isNTSL
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700"
            }`}
          >
            {isNTSL ? "NTSL" : language.toUpperCase()}
          </span>

          {/* Info */}
          {isNTSL && (
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-gray-400"></span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Copie e cole no editor de estratégias
              </span>
            </div>
          )}
        </div>

        {/* Botão Copiar */}
        <div className="relative">
          <button
            onClick={handleCopy}
            disabled={copied}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              copied
                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                : "bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700"
            }`}
          >
            {copied ? (
              <>
                <span className="text-sm">✅</span>
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <span className="text-sm">📋</span>
                <span>Copiar</span>
              </>
            )}
          </button>

          {/* Tooltip de sucesso */}
          {showCopySuccess && (
            <div className="absolute -top-10 right-0 bg-green-500 text-white text-xs px-2 py-1.5 rounded shadow-lg animate-fade-in-out">
              ✅ Código copiado para a área de transferência!
            </div>
          )}
        </div>
      </div>

      {/* Código */}
      <div className="bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 p-0 overflow-x-auto">
        <div className="font-mono text-sm">
          {lines.map((line, lineIndex) => (
            <div
              key={lineIndex}
              className={`flex hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-colors ${
                lineIndex % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-950/50" : ""
              }`}
            >
              {/* Número da linha */}
              <span className="text-gray-400 dark:text-gray-600 text-xs w-10 text-right pr-3 pl-2 select-none leading-6 border-r border-gray-200 dark:border-gray-800">
                {lineIndex + 1}
              </span>

              {/* Conteúdo da linha */}
              <span className="flex-1 leading-6 pl-3 pr-4">
                {isNTSL ? (
                  <NTSLHighlighter line={line} />
                ) : (
                  <span className="text-gray-800 dark:text-gray-200">
                    {line || "\u00A0"}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé */}
      <div className="bg-gray-100 dark:bg-gray-900 px-4 py-2 border-t border-gray-300 dark:border-gray-700">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <span>
              {lineCount} linha{lineCount !== 1 ? "s" : ""}
            </span>

            {isNTSL && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                <span className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isNTSL ? "bg-blue-500" : "bg-green-500"
                    }`}
                  ></span>
                  <span>Texto no rodapé</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal
const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  const [blocks, setBlocks] = useState<
    Array<{ type: "text" | "code"; content: string; language?: string }>
  >([]);

  useEffect(() => {
    console.log("🚀 [MessageContent] Componente montado com conteúdo:", {
      length: content.length,
      hasBackticks: content.includes("```"),
      preview: content.substring(0, 100),
    });

    const extractedBlocks = extractCodeBlocks(content);
    setBlocks(extractedBlocks);

    console.log("📊 [MessageContent] Blocos processados:", {
      total: extractedBlocks.length,
      codeBlocks: extractedBlocks.filter((b) => b.type === "code").length,
      textBlocks: extractedBlocks.filter((b) => b.type === "text").length,
    });
  }, [content]);

  if (blocks.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400 italic">
        Carregando conteúdo...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}-${block.content
          .substring(0, 20)
          .replace(/\s/g, "_")}`;

        if (block.type === "code") {
          return (
            <CodeBlock
              key={key}
              content={block.content}
              language={block.language}
            />
          );
        }

        return <TextBlock key={key} content={block.content} />;
      })}
    </div>
  );
};

export default MessageContent;

// Estilos CSS para animação
const styles = `
@keyframes fade-in-out {
  0% { opacity: 0; transform: translateY(5px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(5px); }
}

.animate-fade-in-out {
  animation: fade-in-out 2s ease-in-out forwards;
}
`;

// Adiciona estilos ao documento
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
