"use client";

import React, { useState } from 'react';

interface MessageContentProps {
  content: string;
}

// Função para extrair e formatar código
const extractCodeBlocks = (content: string): Array<{ type: 'text' | 'code', content: string, language?: string }> => {
  const blocks: Array<{ type: 'text' | 'code', content: string, language?: string }> = [];
  const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
  
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeRegex.exec(content)) !== null) {
    // Adicionar texto antes do código
    if (match.index > lastIndex) {
      blocks.push({
        type: 'text',
        content: content.substring(lastIndex, match.index)
      });
    }

    // Adicionar bloco de código
    const language = match[1]?.toLowerCase() || 'text';
    const codeContent = match[2].trim();
    
    blocks.push({
      type: 'code',
      content: codeContent,
      language: language === 'ntsl' ? 'pascal' : language // Mapear NTSL para Pascal syntax
    });

    lastIndex = codeRegex.lastIndex;
  }

  // Adicionar texto restante
  if (lastIndex < content.length) {
    blocks.push({
      type: 'text',
      content: content.substring(lastIndex)
    });
  }

  // Se não houver blocos de código, retornar como texto único
  if (blocks.length === 0) {
    blocks.push({
      type: 'text',
      content
    });
  }

  return blocks;
};

// Componente para renderizar texto simples
const TextBlock: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="whitespace-pre-wrap">
      {content.split('\n').map((line, idx) => (
        <p key={idx} className="mb-2 last:mb-0">
          {line}
        </p>
      ))}
    </div>
  );
};

// Componente para renderizar bloco de código estilo DeepSeek/VS Code
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

  // Função para syntax highlighting básico (você pode expandir isso)
  const highlightCode = (code: string, lang: string): React.ReactNode => {
    const lines = code.split('\n');
    
    if (lang === 'pascal' || lang === 'ntsl') {
      // Highlight básico para NTSL/Pascal
      return lines.map((line, lineIndex) => {
        let highlightedLine = line;
        
        // Palavras-chave NTSL
        const keywords = ['Plot', 'MA', 'Close', 'Open', 'High', 'Low', 'Volume', 'If', 'Then', 'Else', 'For', 'While', 'Begin', 'End', 'Var', 'Const', 'Function', 'Procedure', 'Array', 'Of', 'String', 'Integer', 'Double', 'Boolean'];
        
        keywords.forEach(keyword => {
          const regex = new RegExp(`\\b${keyword}\\b`, 'g');
          highlightedLine = highlightedLine.replace(regex, `<span class="text-blue-500 font-semibold">${keyword}</span>`);
        });
        
        // Números
        highlightedLine = highlightedLine.replace(/(\d+\.?\d*)/g, '<span class="text-green-600">$1</span>');
        
        // Strings
        highlightedLine = highlightedLine.replace(/["']([^"']*)["']/g, '<span class="text-green-500">"$1"</span>');
        
        // Comentários
        highlightedLine = highlightedLine.replace(/(\/\/.*)/g, '<span class="text-gray-500 italic">$1</span>');
        
        return (
          <div key={lineIndex} className="flex">
            <span className="text-gray-500 text-xs w-8 text-right pr-2 select-none">{lineIndex + 1}</span>
            <span 
              className="flex-1 font-mono text-sm"
              dangerouslySetInnerHTML={{ __html: highlightedLine }}
            />
          </div>
        );
      });
    }
    
    // Fallback para outras linguagens
    return lines.map((line, lineIndex) => (
      <div key={lineIndex} className="flex">
        <span className="text-gray-500 text-xs w-8 text-right pr-2 select-none">{lineIndex + 1}</span>
        <span className="flex-1 font-mono text-sm">{line}</span>
      </div>
    ));
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-gray-700 shadow-lg">
      {/* Cabeçalho do código */}
      <div className="flex items-center justify-between bg-gray-900 px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Botões de controle estilo VS Code */}
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          
          {/* Linguagem */}
          <span className="text-xs font-mono text-gray-300 px-2 py-1 bg-gray-800 rounded">
            {language.toUpperCase()}
          </span>
          
          {/* Nome do arquivo */}
          <span className="text-sm text-gray-400">
            {language === 'pascal' || language === 'ntsl' ? 'script.ntsl' : 'code.' + language}
          </span>
        </div>
        
        {/* Botão de copiar */}
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
      
      {/* Área do código */}
      <div className="bg-gray-950 text-gray-100 p-4 overflow-x-auto">
        <div className="font-mono text-sm">
          {highlightCode(content, language)}
        </div>
      </div>
      
      {/* Rodapé do código */}
      <div className="bg-gray-900 px-4 py-2 border-t border-gray-800">
        <div className="flex justify-between items-center text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span>{language.toUpperCase()}</span>
            <span>{content.split('\n').length} linhas</span>
            <span>{content.length} caracteres</span>
          </div>
          <div>
            <span className="text-green-500">●</span>
            <span className="ml-1">Executável</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal
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