// frontend/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import ChatSidebar from '../components/layout/ChatSidebar';
import ChatInterface from '../components/chat/ChatInterface';
import TradeDiary from '../components/diary/TradeDiary';
import Statistics from '../components/statistics/Statistics';
import TraderConfig from '../components/trader/TraderConfig';
import { useTheme } from '../contexts/ThemeContext';
import { ChatProvider } from '../contexts/ChatContext';

type ActiveTab = 'chat' | 'statistics' | 'diary' | 'config';

function MainContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [traderName, setTraderName] = useState('Trader');
  const [traderLevel, setTraderLevel] = useState<'iniciante' | 'intermediario' | 'avancado' | 'profissional'>('intermediario');
  const { theme } = useTheme();

  // Carregar configuração do trader do localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('mentorTrader_traderName');
    const savedLevel = localStorage.getItem('mentorTrader_traderLevel') as typeof traderLevel;
    
    if (savedName) setTraderName(savedName);
    if (savedLevel && ['iniciante', 'intermediario', 'avancado', 'profissional'].includes(savedLevel)) {
      setTraderLevel(savedLevel);
    }
  }, []);

  const handleSaveTraderConfig = (name: string, level: typeof traderLevel) => {
    setTraderName(name);
    setTraderLevel(level);
    localStorage.setItem('mentorTrader_traderName', name);
    localStorage.setItem('mentorTrader_traderLevel', level);
    
    // Opcional: Mostrar notificação de sucesso
    console.log('Configuração salva:', { name, level });
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <div className="h-full flex flex-col">
              
            <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
             {/*
              <TraderConfig
                traderName={traderName}
                traderLevel={traderLevel}
                onSave={handleSaveTraderConfig}
              />
              */}
            </div>
            {/* Interface do Chat */}
            <div className="flex-1 overflow-hidden">
              <ChatInterface />
            </div>
          </div>
        );
        
      case 'diary':
        return <TradeDiary />;
        
      case 'statistics':
        return <Statistics />;
        
      case 'config':
        return (
          <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-2xl p-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                  Configurações do Perfil
                </h2>
                <TraderConfig
                  traderName={traderName}
                  traderLevel={traderLevel}
                  onSave={(name, level) => {
                    handleSaveTraderConfig(name, level);
                    // Voltar para o chat após salvar
                    setTimeout(() => setActiveTab('chat'), 500);
                  }}
                />
              </div>
            </div>
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
      />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="
          p-4
          border-b
          flex items-center justify-between
          bg-white dark:bg-gray-800
          border-gray-200 dark:border-gray-700
        ">
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
              } animate-pulse`} />
              <span>Trader: {traderName}</span>
              <span className="text-gray-400 dark:text-gray-500">•</span>
              <span className="capitalize">{traderLevel}</span>
              <span className="text-gray-400 dark:text-gray-500">•</span>
              <span>Tema: {theme === 'dark' ? '🌙 Escuro' : '☀️ Claro'}</span>
            </div>
          </div>
        </header>

        {/* Área de conteúdo */}
        <main className="flex-1 overflow-hidden">
          {renderActiveTab()}
        </main>

        {/* Footer */}
        <footer className="
          p-3
          text-center
          text-sm
          border-t
          bg-white dark:bg-gray-800
          border-gray-200 dark:border-gray-700
          text-gray-600 dark:text-gray-400
        ">
          <div className="flex items-center justify-center gap-6">
            <span>© 2025 Mentor Trader</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Versão 1.0.0</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">
              Desenvolvido para desenvolvedores e traders NTSL
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Componente principal com Provider
export default function Home() {
  const [traderName, setTraderName] = useState('Trader');
  const [traderLevel, setTraderLevel] = useState<'iniciante' | 'intermediario' | 'avancado' | 'profissional'>('intermediario');

  // Carregar configurações do localStorage antes de renderizar
  useEffect(() => {
    const savedName = localStorage.getItem('mentorTrader_traderName');
    const savedLevel = localStorage.getItem('mentorTrader_traderLevel') as typeof traderLevel;
    
    if (savedName) setTraderName(savedName);
    if (savedLevel && ['iniciante', 'intermediario', 'avancado', 'profissional'].includes(savedLevel)) {
      setTraderLevel(savedLevel);
    }
  }, []);

  return (
    <ChatProvider 
      defaultTraderName={traderName} 
      defaultTraderLevel={traderLevel}
    >
      <MainContent />
    </ChatProvider>
  );
}