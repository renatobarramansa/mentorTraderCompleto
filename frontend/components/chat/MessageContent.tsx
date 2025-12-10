"use client";

import React, { useState } from 'react';

interface MessageContentProps {
  content: string;
}

// Extrai blocos de código do texto
const extractCodeBlocks = (content: string): Array<{ type: 'text' | 'code', content: string, language?: string }> => {
  const blocks: Array<{ type: 'text' | 'code', content: string, language?: string }> = [];
  const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
  
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({
        type: 'text',
        content: content.substring(lastIndex, match.index)
      });
    }

    const language = match[1]?.toLowerCase() || 'text';
    const codeContent = match[2].trim();
    
    blocks.push({
      type: 'code',
      content: codeContent,
      language: language === 'ntsl' ? 'pascal' : language
    });

    lastIndex = codeRegex.lastIndex;
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

  return blocks;
};

// Renderiza texto simples
const TextBlock: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="whitespace-pre-wrap">
      {content.split('\n').map((line, idx) => (
        <p key={idx} className="mb-2 last:mb-0">
          {line || '\u00A0'}
        </p>
      ))}
    </div>
  );
};

// Componente para syntax highlighting de NTSL/Pascal
const NTSLHighlighter: React.FC<{ line: string }> = ({ line }) => {
  const tokens = [];
  let currentIndex = 0;
  
  // Comentários
  const commentMatch = line.match(/(\/\/.*)/);
  if (commentMatch) {
    const commentIndex = line.indexOf(commentMatch[0]);
    const beforeComment = line.substring(0, commentIndex);
    
    // Processa a parte antes do comentário
    processLine(beforeComment);
    
    // Adiciona o comentário
    tokens.push(
      <span key={`comment-${currentIndex}`} className="text-gray-500 italic">
        {commentMatch[0]}
      </span>
    );
    
    return <>{tokens}</>;
  }
  
  function processLine(text: string) {
    const parts = text.split(/(\b(?:Plot|Plot2|MA|Media|MediaExp|IFR|ADX|Close|Open|High|Low|Volume|If|Then|Else|For|While|Begin|End|Var|Const|Function|Procedure|Array|Of|String|Integer|Float|Double|Boolean|True|False|input|var|begin|end|BuyAtMarket|SellShortAtMarket|HasPosition|ConsoleLog|Date|Time)\b|["'].*?["']|\d+\.?\d*|[(){}[\];:,])/g);
    
    parts.forEach((part, idx) => {
      if (!part) return;
      
      // Keywords
      if (/^(Plot|Plot2|MA|Media|MediaExp|IFR|ADX|Close|Open|High|Low|Volume|If|Then|Else|For|While|Begin|End|Var|Const|Function|Procedure|Array|Of|String|Integer|Float|Double|Boolean|True|False|input|var|begin|end|BuyAtMarket|SellShortAtMarket|HasPosition|ConsoleLog|Date|Time)$/.test(part)) {
        tokens.push(
          <span key={`keyword-${idx}`} className="text-blue-400 font-semibold">
            {part}
          </span>
        );
      }
      // Strings
      else if (/^["'].*["']$/.test(part)) {
        tokens.push(
          <span key={`string-${idx}`} className="text-green-400">
            {part}
          </span>
        );
      }
      // Números
      else if (/^\d+\.?\d*$/.test(part)) {
        tokens.push(
          <span key={`number-${idx}`} className="text-amber-400">
            {part}
          </span>
        );
      }
      // Operadores e pontuação
      else if (/^[(){}[\];:,]$/.test(part)) {
        tokens.push(
          <span key={`punct-${idx}`} className="text-gray-300">
            {part}
          </span>
        );
      }
      // Texto normal
      else {
        tokens.push(
          <span key={`text-${idx}`} className="text-gray-100">
            {part}
          </span>
        );
      }
    });
  }
  
  processLine(line);
  
  return <>{tokens}</>;
};

// Bloco de código com syntax highlighting
const CodeBlock: React.FC<{ content: string; language?: string }> = ({ content, language = 'text' }) => {
  const [copied, setCopied] = useState(false);

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
          
          <span className="text-xs font-mono text-gray-300 px-2 py-1 bg-gray-800 rounded">
            NTSL
          </span>
          
          <span className="text-sm text-gray-400">
            Copie e cole no editor de estratégias do profit
          </span>
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
          
          <div className="flex items-center gap-1">
            <span className="text-green-500">●</span>
            <span>Pronto</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal - EXPORTAÇÃO CORRETA
const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
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
