"use client";

import React, { useState } from 'react';

interface MessageContentProps {
  content: string;
}

// Extrai blocos de código do texto
const extractCodeBlocks = (content: string): Array<{ type: 'text' | 'code', content: string, language?: string }> => {
  const blocks: Array<{ type: 'text' | 'code', content: string, language?: string }> = [];
  
  // DEBUG: Log do conteúdo recebido
  console.log('🔍 MessageContent - Conteúdo recebido:', content.substring(0, 200));
  
  const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
  
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let matchCount = 0;

  while ((match = codeRegex.exec(content)) !== null) {
    matchCount++;
    console.log(`📦 Bloco ${matchCount} encontrado:`, {
      language: match[1] || 'none',
      codePreview: match[2].substring(0, 50) + '...'
    });

    if (match.index > lastIndex) {
      blocks.push({
        type: 'text',
        content: content.substring(lastIndex, match.index)
      });
    }

    const language = match[1]?.toLowerCase() || 'text';
    const codeContent = match[2].trim();
    
    // Detectar NTSL automaticamente
    const hasNTSLKeywords = codeContent.includes('BuyAtMarket') ||
                           codeContent.includes('SellShortAtMarket') ||
                           codeContent.includes('Media') ||
                           codeContent.includes('IFR');
    
    const hasNTSLStructure = codeContent.match(/^(input|var|begin)/im);
    
    const isNTSL = language === 'ntsl' || 
                   language === 'pascal' || 
                   hasNTSLStructure ||
                   hasNTSLKeywords;
    
    const finalLanguage = isNTSL ? 'ntsl' : language;
    
    console.log(`✅ Bloco ${matchCount} classificado como:`, finalLanguage, {
      originalLanguage: language,
      hasNTSLKeywords,
      hasNTSLStructure,
      isNTSL
    });
    
    blocks.push({
      type: 'code',
      content: codeContent,
      language: finalLanguage
    });

    lastIndex = codeRegex.lastIndex;
  }

  if (matchCount === 0) {
    console.warn('⚠️ Nenhum bloco de código encontrado!');
  }

  if (lastIndex < content.length) {
    blocks.push({
      type: 'text',
      content: content.substring(lastIndex)
    });
  }

  if (blocks.length === 0) {
    blocks.push({
      type: 'text',
      content
    });
  }

  console.log(`📊 Total de blocos: ${blocks.length} (${blocks.filter(b => b.type === 'code').length} de código)`);

  return blocks;
};

// Renderiza texto simples com suporte a markdown básico
const TextBlock: React.FC<{ content: string }> = ({ content }) => {
  const processMarkdown = (text: string) => {
    // Negrito **texto**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Itálico *texto*
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Código inline `código`
    text = text.replace(/`(.*?)`/g, '<code class="bg-gray-700 px-1.5 py-0.5 rounded text-sm">$1</code>');
    
    return text;
  };

  return (
    <div className="whitespace-pre-wrap">
      {content.split('\n').map((line, idx) => {
        const processedLine = processMarkdown(line);
        return (
          <p 
            key={idx} 
            className="mb-2 last:mb-0"
            dangerouslySetInnerHTML={{ __html: processedLine || '\u00A0' }}
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
      'input', 'var', 'begin', 'end', 'If', 'Then', 'Else', 'For', 'While', 'To', 'Do',
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
    
    const parts = text.split(/(\b(?:\w+)\b|["'].*?["']|\d+\.?\d*|:=|[(){}[\];:,<>=+\-*\/]|\s+)/g);
    
    parts.forEach((part, idx) => {
      if (!part) return;
      
      if (/^\s+$/.test(part)) {
        tokenArray.push(<span key={`space-${idx}`}>{part}</span>);
      }
      else if (keywords.some(kw => kw.toLowerCase() === part.toLowerCase())) {
        tokenArray.push(
          <span key={`keyword-${idx}`} className="text-blue-400 font-semibold">
            {part}
          </span>
        );
      }
      else if (/^["'].*["']$/.test(part)) {
        tokenArray.push(
          <span key={`string-${idx}`} className="text-green-400">
            {part}
          </span>
        );
      }
      else if (/^\d+\.?\d*$/.test(part)) {
        tokenArray.push(
          <span key={`number-${idx}`} className="text-amber-400">
            {part}
          </span>
        );
      }
      else if (part === ':=') {
        tokenArray.push(
          <span key={`operator-${idx}`} className="text-pink-400">
            {part}
          </span>
        );
      }
      else if (/^[(){}[\];:,<>=+\-*\/]$/.test(part)) {
        tokenArray.push(
          <span key={`punct-${idx}`} className="text-gray-300">
            {part}
          </span>
        );
      }
      else {
        tokenArray.push(
          <span key={`text-${idx}`} className="text-gray-100">
            {part}
          </span>
        );
      }
    });
  }
};

// Bloco de código com syntax highlighting
const CodeBlock: React.FC<{ content: string; language?: string }> = ({ content, language = 'text' }) => {
  const [copied, setCopied] = useState(false);

  console.log('🎨 Renderizando CodeBlock:', { language, contentPreview: content.substring(0, 50) });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar código:', err);
    }
  };

  const lines = content.split('\n');
  const isNTSL = language === 'pascal' || language === 'ntsl';

  console.log('🎨 CodeBlock configurado:', { isNTSL, language, lineCount: lines.length });

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-gray-700 shadow-lg">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between bg-gray-900 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          
          <span className={`text-xs font-mono px-2 py-1 rounded ${
            isNTSL ? 'bg-blue-800 text-blue-200' : 'bg-gray-800 text-gray-300'
          }`}>
            {isNTSL ? 'NTSL' : language.toUpperCase()}
          </span>
          
          {isNTSL && (
            <span className="text-sm text-gray-400">
              ✨ Syntax Highlighting Ativo
            </span>
          )}
        </div>
        
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium transition-colors"
        >
          {copied ? (
            <>
              <span>✅</span>
              <span>Copiado!</span>
            </>
          ) : (
            <>
              <span>📋</span>
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      
      {/* Código */}
      <div className="bg-gray-950 text-gray-100 p-4 overflow-x-auto">
        <div className="font-mono text-sm">
          {lines.map((line, lineIndex) => (
            <div key={lineIndex} className="flex hover:bg-gray-900/50">
              <span className="text-gray-500 text-xs w-8 text-right pr-3 select-none leading-6">
                {lineIndex + 1}
              </span>
              <span className="flex-1 leading-6">
                {isNTSL ? (
                  <NTSLHighlighter line={line} />
                ) : (
                  <span className="text-gray-100">{line || '\u00A0'}</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Rodapé */}
      <div className="bg-gray-900 px-4 py-2 border-t border-gray-800">
        <div className="flex justify-between items-center text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span>{lines.length} linhas</span>
            {isNTSL && (
              <>
                <span>•</span>
                <span className="text-blue-400">NTSL/Pascal</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className={isNTSL ? 'text-blue-500' : 'text-green-500'}>●</span>
            <span>{isNTSL ? 'Highlighting Ativo' : 'Pronto'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal
const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  console.log('🚀 MessageContent renderizado com', content.length, 'caracteres');
  
  const blocks = extractCodeBlocks(content);

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        if (block.type === 'code') {
          return (
            <CodeBlock 
              key={index} 
              content={block.content} 
              language={block.language} 
            />
          );
        }
        
        return <TextBlock key={index} content={block.content} />;
      })}
    </div>
  );
};

export default MessageContent;