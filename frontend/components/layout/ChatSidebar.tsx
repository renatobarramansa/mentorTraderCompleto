// frontend/components/layout/ChatSidebar.tsx
'use client';

import { useState } from 'react';
import { 
  MessageSquare, 
  BarChart3, 
  BookOpen, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit,
} from 'lucide-react';
import ThemeToggle from '../../components/theme/ThemeToggle';
import { useTheme } from '../../contexts/ThemeContext';
import { useChat } from '../../contexts/ChatContext';

type ActiveTab = 'chat' | 'statistics' | 'diary' | 'config';

interface ChatSidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export default function ChatSidebar({
  activeTab,
  setActiveTab,
}: ChatSidebarProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme } = useTheme();
  
  // Usar o contexto do chat
  const {
    conversations,
    activeConversationId,
    switchConversation,
    createNewConversation,
    deleteConversation,
    updateConversationTitle
  } = useChat();

  const handleEditConversation = (id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      const newTitle = prompt('Novo título:', conversation.title);
      if (newTitle && newTitle.trim()) {
        updateConversationTitle(id, newTitle.trim());
      }
    }
  };

  const handleDeleteConversation = (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta conversa?')) {
      deleteConversation(id);
    }
  };

  return (
    <div
      className={`
        flex
        flex-col
        h-full
        border-r
        transition-all
        duration-300
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
        bg-white dark:bg-gray-900
        border-gray-200 dark:border-gray-800
      `}
    >
      {/* Header do Sidebar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-white font-bold">MT</span>
            </div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">
              Mentor Trader
            </h1>
          </div>
        )}
        
        {/* Botão para recolher/expandir */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`
            p-1
            rounded-lg
            hover:bg-gray-100 dark:hover:bg-gray-800
            transition-colors
            ${sidebarCollapsed ? 'mx-auto' : ''}
          `}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Navegação principal */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Botão Novo Chat */}
        <button
          onClick={createNewConversation}
          className={`
            w-full
            mb-6
            p-3
            rounded-lg
            flex items-center justify-center gap-2
            transition-all
            duration-200
            ${sidebarCollapsed ? 'px-0' : ''}
            bg-gradient-to-r from-primary-500 to-primary-600
            hover:from-primary-600 hover:to-primary-700
            text-white
            font-medium
            shadow-sm hover:shadow-md
          `}
        >
          <Plus className="w-5 h-5" />
          {!sidebarCollapsed && 'Novo Chat'}
        </button>

        {/* Abas de navegação */}
        <nav className="space-y-1 mb-8">
          {[
            { id: 'chat' as ActiveTab, icon: MessageSquare, label: 'Chat IA' },
            { id: 'statistics' as ActiveTab, icon: BarChart3, label: 'Estatísticas' },
            { id: 'diary' as ActiveTab, icon: BookOpen, label: 'Diário' },
            { id: 'config' as ActiveTab, icon: Settings, label: 'Configurações' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full
                  p-3
                  rounded-lg
                  flex items-center gap-3
                  transition-all
                  duration-200
                  ${isActive 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }
                  ${sidebarCollapsed ? 'justify-center' : ''}
                `}
              >
                <Icon className="w-5 h-5" />
                {!sidebarCollapsed && item.label}
              </button>
            );
          })}
        </nav>

        {/* Lista de conversas */}
        {!sidebarCollapsed && conversations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 px-3">
              Conversas Recentes
            </h3>
            <div className="space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`
                    group
                    rounded-lg
                    transition-all
                    duration-200
                    ${activeConversationId === conv.id
                      ? 'bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-300 dark:ring-gray-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between p-3">
                    <button
                      onClick={() => switchConversation(conv.id)}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">
                        {conv.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {conv.timestamp.toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </button>
                    
                    {/* Menu de ações */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditConversation(conv.id);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        <Edit className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(conv.id);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botão Toggle de Tema */}
        <div className={`mt-auto ${sidebarCollapsed ? 'flex justify-center' : 'px-3'}`}>
          <div className={`flex items-center ${sidebarCollapsed ? '' : 'justify-between'}`}>
            {!sidebarCollapsed && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Tema {theme === 'dark' ? 'Escuro' : 'Claro'}
              </span>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}