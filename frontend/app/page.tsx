// frontend/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import ChatSidebar from '../components/layout/ChatSidebar';
import ChatInterface from '../components/chat/ChatInterface';
import TradeDiary from '../components/diary/TradeDiary';
import Statistics from '../components/statistics/Statistics';
import { useTheme } from '../contexts/ThemeContext';
import TraderConfig from '../components/trader/TraderConfig';

// Adicionar 'config' ao tipo ActiveTab
type ActiveTab = 'chat' | 'statistics' | 'diary' | 'config';

interface Conversation {
  id: string;
  title: string;
  date: string;
  preview: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'Análise BTC hoje',
      date: 'Hoje, 14:30',
      preview: 'Qual a sua opinião sobre o movimento atual do Bitcoin?'
    },
    {
      id: '2',
      title: 'Estratégia de stop loss',
      date: 'Ontem, 10:15',
      preview: 'Poderia me ajudar a definir um stop loss adequado?'
    },
    {
      id: '3',
      title: 'Mercado em alta',
      date: '15/01/2024',
      preview: 'Quais setores estão performando melhor no atual cenário?'
    }
  ]);
  
  // Adicionar estado para traderName
  const [traderName, setTraderName] = useState('Trader');
  const [traderLevel, setTraderLevel] = useState<'iniciante' | 'intermediario' | 'avancado' | 'profissional'>('intermediario');
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1');
  const { theme } = useTheme();

  // Carregar conversas do localStorage
  useEffect(() => {
    const savedConversations = localStorage.getItem('mentorTrader_conversations');
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        setConversations(parsed);
        if (parsed.length > 0 && !selectedConversation) {
          setSelectedConversation(parsed[0].id);
        }
      } catch (error) {
        console.error('Erro ao carregar conversas:', error);
      }
    }
  }, []);

  // Carregar configuração do trader do localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('mentorTrader_traderName');
    const savedLevel = localStorage.getItem('mentorTrader_traderLevel') as typeof traderLevel;
    
    if (savedName) setTraderName(savedName);
    if (savedLevel && ['iniciante', 'intermediario', 'avancado', 'profissional'].includes(savedLevel)) {
      setTraderLevel(savedLevel);
    }
  }, []);

  // Salvar conversas no localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('mentorTrader_conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  const handleNewConversation = () => {
    const newId = Date.now().toString();
    const newConversation: Conversation = {
      id: newId,
      title: `Nova conversa ${conversations.length + 1}`,
      date: 'Agora',
      preview: 'Comece uma nova conversa...'
    };
    
    setConversations([newConversation, ...conversations]);
    setSelectedConversation(newId);
    setActiveTab('chat');
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
    setActiveTab('chat');
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(conversations.filter(conv => conv.id !== id));
    if (selectedConversation === id) {
      setSelectedConversation(conversations.length > 1 ? conversations[1].id : null);
    }
  };

  const handleEditConversation = (id: string) => {
    const newTitle = prompt('Novo título da conversa:');
    if (newTitle) {
      setConversations(conversations.map(conv => 
        conv.id === id ? { ...conv, title: newTitle } : conv
      ));
    }
  };

  const handleSaveTraderConfig = (name: string, level: typeof traderLevel) => {
    setTraderName(name);
    setTraderLevel(level);
    localStorage.setItem('mentorTrader_traderName', name);
    localStorage.setItem('mentorTrader_traderLevel', level);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <div className="h-full flex flex-col">
            <div className="mb-6 p-4">
              <TraderConfig
                traderName={traderName}
                traderLevel={traderLevel}
                onSave={handleSaveTraderConfig}
              />
            </div>
            <div className="flex-1">
              <ChatInterface 
                conversationId={selectedConversation || undefined}
                traderName={traderName}
                traderLevel={traderLevel}
              />
            </div>
          </div>
        );
      case 'diary':
        return <TradeDiary />;
      case 'statistics':
        return <Statistics />;
      case 'config':
        return (
          <div className="p-6">
            <TraderConfig
              traderName={traderName}
              traderLevel={traderLevel}
              onSave={(name, level) => {
                handleSaveTraderConfig(name, level);
                setActiveTab('chat'); // Voltar para o chat após salvar
              }}
            />
          </div>
        );
      default:
        return <ChatInterface />;
    }
  };

  return (
    <div className={`h-screen flex ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Sidebar */}
      <ChatSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onEditConversation={handleEditConversation}
      />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`
          p-4
          border-b
          flex items-center justify-between
          bg-white dark:bg-gray-800
          border-gray-200 dark:border-gray-700
        `}>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white capitalize">
              {activeTab === 'chat' && 'Chat com IA'}
              {activeTab === 'diary' && 'Diário de Trades'}
              {activeTab === 'statistics' && 'Estatísticas'}
              {activeTab === 'config' && 'Configurações'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {activeTab === 'chat' && 'Converse com o assistente de trading'}
              {activeTab === 'diary' && 'Registre e analise suas operações'}
              {activeTab === 'statistics' && 'Métricas e desempenho detalhados'}
              {activeTab === 'config' && 'Configure seu perfil de trader'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className={`w-2 h-2 rounded-full ${
                theme === 'dark' ? 'bg-green-500' : 'bg-green-400'
              }`} />
              <span>Trader: {traderName} ({traderLevel})</span>
              <span className="text-gray-400 dark:text-gray-500">•</span>
              <span>Tema: {theme === 'dark' ? 'Escuro' : 'Claro'}</span>
            </div>
          </div>
        </header>

        {/* Área de conteúdo */}
        <main className="flex-1 overflow-auto">
          <div className="h-full p-0">
            {renderActiveTab()}
          </div>
        </main>

        {/* Footer */}
        <footer className={`
          p-3
          text-center
          text-sm
          border-t
          bg-white dark:bg-gray-800
          border-gray-200 dark:border-gray-700
          text-gray-600 dark:text-gray-400
        `}>
          <div className="flex items-center justify-center gap-6">
            <span>© 2024 Mentor Trader</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Versão 1.0.0</span>
            <span className="hidden sm:inline">•</span>
            <span>Tema {theme === 'dark' ? '🌙' : '☀️'}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}