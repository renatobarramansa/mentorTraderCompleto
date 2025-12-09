"use client";

import React, { useState } from 'react';

interface MessageContentProps {
  content: string;
}

// Função para extrair e formatar código (versão compatível)
const extractCodeBlocks = (content: string): Array<{ type: 'text' | 'code', content: string, language?: string }> => {
  const blocks: Array<{ type: 'text' | 'code', content: string, language?: string }> = [];
  const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
  
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Use while loop em vez de for...of para compatibilidade
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
      language: language
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

// Componente para renderizar bloco de código
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

  // Processar uma linha de código para highlighting básico
  const processLine = (line: string, lang: string) => {
    let processedLine = line;
    
    // Palavras-chave para NTSL
    if (lang === 'ntsl' || lang === 'pascal') {
      const ntslKeywords = ['Plot', 'MA', 'SMA', 'EMA', 'Close', 'Open', 'High', 'Low', 'Volume', 
                           'If', 'Then', 'Else', 'Begin', 'End', 'For', 'While', 'Do', 'Repeat', 
                           'Until', 'Case', 'Of', 'Const', 'Var', 'Array', 'String', 'Integer', 
                           'Double', 'Boolean', 'Function', 'Procedure', 'And', 'Or', 'Not'];
      
      ntslKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        processedLine = processedLine.replace(regex, `###KEYWORD###${keyword}###END###`);
      });
    }
    
    // Números
    processedLine = processedLine.replace(/(\b\d+\.?\d*\b)/g, '###NUMBER###$1###END###');
    
    // Strings
    processedLine = processedLine.replace(/("[^"]*"|'[^']*')/g, '###STRING###$1###END###');
    
    // Comentários
    processedLine = processedLine.replace(/(\/\/.*|\#.*|--.*)/g, '###COMMENT###$1###END###');
    
    return processedLine;
  };

  // Renderizar linha com highlighting
  const renderLine = (line: string, lineIndex: number) => {
    const processedLine = processLine(line, language);
    const parts: JSX.Element[] = [];
    let currentText = '';
    
    for (let i = 0; i < processedLine.length; i++) {
      if (processedLine.substr(i, 11) === '###KEYWORD###') {
        if (currentText) {
          parts.push(<span key={parts.length}>{currentText}</span>);
          currentText = '';
        }
        const endIndex = processedLine.indexOf('###END###', i);
        if (endIndex !== -1) {
          const keyword = processedLine.substring(i + 11, endIndex);
          parts.push(
            <span key={parts.length} className="text-blue-500 font-semibold">
              {keyword}
            </span>
          );
          i = endIndex + 8; // Pular o ###END###
        }
      } else if (processedLine.substr(i, 10) === '###NUMBER###') {
        if (currentText) {
          parts.push(<span key={parts.length}>{currentText}</span>);
          currentText = '';
        }
        const endIndex = processedLine.indexOf('###END###', i);
        if (endIndex !== -1) {
          const number = processedLine.substring(i + 10, endIndex);
          parts.push(
            <span key={parts.length} className="text-green-600">
              {number}
            </span>
          );
          i = endIndex + 8;
        }
      } else if (processedLine.substr(i, 9) === '###STRING###') {
        if (currentText) {
          parts.push(<span key={parts.length}>{currentText}</span>);
          currentText = '';
        }
        const endIndex = processedLine.indexOf('###END###', i);
        if (endIndex !== -1) {
          const str = processedLine.substring(i + 9, endIndex);
          parts.push(
            <span key={parts.length} className="text-green-500">
              {str}
            </span>
          );
          i = endIndex + 8;
        }
      } else if (processedLine.substr(i, 11) === '###COMMENT###') {
        if (currentText) {
          parts.push(<span key={parts.length}>{currentText}</span>);
          currentText = '';
        }
        const endIndex = processedLine.indexOf('###END###', i);
        if (endIndex !== -1) {
          const comment = processedLine.substring(i + 11, endIndex);
          parts.push(
            <span key={parts.length} className="text-gray-500 italic">
              {comment}
            </span>
          );
          i = endIndex + 8;
        }
      } else {
        currentText += processedLine[i];
      }
    }
    
    if (currentText) {
      parts.push(<span key={parts.length}>{currentText}</span>);
    }
    
    return (
      <div key={lineIndex} className="flex hover:bg-gray-900/50 transition-colors">
        <span className="text-gray-500 text-xs w-8 text-right pr-2 select-none border-r border-gray-800">
          {lineIndex + 1}
        </span>
        <span className="flex-1 font-mono text-sm pl-2">
          {parts}
        </span>
      </div>
    );
  };

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-gray-700 shadow-lg">
      {/* Cabeçalho do código */}
      <div className="flex items-center justify-between bg-gray-900 px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Botões de controle */}
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          
          {/* Linguagem */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-300 px-2 py-1 bg-gray-800 rounded">
              {language.toUpperCase()}
            </span>
            
            {/* Nome do arquivo */}
            <span className="text-sm text-gray-400">
              {language === 'ntsl' ? 'script.ntsl' : 
               language === 'python' ? 'script.py' : 
               language === 'javascript' ? 'script.js' : 
               language === 'typescript' ? 'script.ts' : 
               'code.txt'}
            </span>
          </div>
        </div>
        
        {/* Botão de copiar */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium transition-colors"
        >
          {copied ? (
            <>
              <span className="text-green-400">✓</span>
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
      <div className="bg-gray-950 text-gray-100 overflow-x-auto max-h-[500px] overflow-y-auto">
        <div className="font-mono text-sm min-w-full">
          {content.split('\n').map((line, lineIndex) => renderLine(line, lineIndex))}
        </div>
      </div>
      
      {/* Rodapé do código */}
      <div className="bg-gray-900 px-4 py-2 border-t border-gray-800">
        <div className="flex justify-between items-center text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              {language.toUpperCase()}
            </span>
            <span>{content.split('\n').length} linhas</span>
            <span>{content.length} caracteres</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Pronto</span>
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