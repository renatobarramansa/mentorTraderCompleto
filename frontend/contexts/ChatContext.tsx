// frontend/contexts/ChatContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: ChatMessage[];
  traderName?: string;
  traderLevel?: "iniciante" | "intermediario" | "avancado" | "profissional";
}

interface ChatContextType {
  // Estado
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isLoadingConversations: boolean;
  
  // Ações
  switchConversation: (conversationId: string) => void;
  createNewConversation: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  updateConversationTitle: (conversationId: string, title: string) => void;
  deleteConversation: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
  defaultTraderName?: string;
  defaultTraderLevel?: "iniciante" | "intermediario" | "avancado" | "profissional";
}

export function ChatProvider({ 
  children, 
  defaultTraderName = "trader",
  defaultTraderLevel = "intermediario"
}: ChatProviderProps) {
  // Estado
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [traderName] = useState(defaultTraderName);
  const [traderLevel] = useState(defaultTraderLevel);

  // Carregar conversas do localStorage ao montar
  useEffect(() => {
    loadConversations();
  }, []);

  // Atualizar mensagens quando a conversa ativa muda
  useEffect(() => {
    if (activeConversationId) {
      const conversation = conversations.find(c => c.id === activeConversationId);
      if (conversation) {
        console.log('📨 Loading messages for conversation:', activeConversationId, conversation.messages);
        setMessages(conversation.messages || []);
      } else {
        console.log('⚠️ No conversation found, clearing messages');
        setMessages([]);
      }
    } else {
      console.log('🔄 No active conversation, clearing messages');
      setMessages([]);
    }
  }, [activeConversationId, conversations]);

  // Função para carregar conversas do localStorage
  const loadConversations = async () => {
    setIsLoadingConversations(true);
    try {
      // Tentar carregar do localStorage
      const savedConversations = localStorage.getItem('mentorTrader_conversations');
      if (savedConversations) {
        const parsed = JSON.parse(savedConversations);
        // Converter timestamps de string para Date
        const conversationsWithDates = parsed.map((conv: any) => ({
          ...conv,
          timestamp: new Date(conv.timestamp),
          messages: conv.messages?.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })) || []
        }));
        
        setConversations(conversationsWithDates);
        console.log('✅ Loaded conversations from localStorage:', conversationsWithDates.length);
        
        // Se não houver conversa ativa, criar uma nova
        if (conversationsWithDates.length === 0) {
          console.log('📝 No conversations found, creating first one');
          setTimeout(() => createNewConversation(), 100);
        } else {
          // Definir a primeira conversa como ativa
          setActiveConversationId(conversationsWithDates[0].id);
        }
      } else {
        console.log('📝 No saved conversations, creating first one');
        // Criar primeira conversa se não houver nenhuma
        setTimeout(() => createNewConversation(), 100);
      }
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
      // Se houver erro, criar uma nova conversa
      setTimeout(() => createNewConversation(), 100);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Salvar conversas no localStorage
  const saveConversations = (convs: Conversation[]) => {
    try {
      localStorage.setItem('mentorTrader_conversations', JSON.stringify(convs));
      console.log('💾 Saved conversations to localStorage');
    } catch (error) {
      console.error('❌ Error saving conversations:', error);
    }
  };

  // Função para alternar entre conversas
  const switchConversation = (conversationId: string) => {
    console.log('🔄 Switching to conversation:', conversationId);
    
    // Limpar mensagens imediatamente para evitar flash de mensagens antigas
    setMessages([]);
    
    // Definir nova conversa ativa
    setActiveConversationId(conversationId);
  };

  // Função para criar nova conversa
  const createNewConversation = () => {
    const newConversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newConversation: Conversation = {
      id: newConversationId,
      title: 'Nova Conversa',
      lastMessage: '',
      timestamp: new Date(),
      messages: [],
      traderName,
      traderLevel
    };
    
    console.log('✨ Creating new conversation:', newConversationId);
    
    // Limpar mensagens imediatamente
    setMessages([]);
    
    // Adicionar nova conversa à lista
    const updatedConversations = [newConversation, ...conversations];
    setConversations(updatedConversations);
    saveConversations(updatedConversations);
    
    // Definir como ativa
    setActiveConversationId(newConversationId);
  };

  // Função para atualizar conversa na lista
  const updateConversationInList = (
    conversationId: string, 
    updates: Partial<Conversation>
  ) => {
    setConversations(prev => {
      const updated = prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, ...updates, timestamp: new Date() }
          : conv
      );
      saveConversations(updated);
      return updated;
    });
  };

  // Função para enviar mensagem
  const sendMessage = async (content: string) => {
    if (!content.trim()) {
      console.warn('⚠️ Attempted to send empty message');
      return;
    }
    
    if (!activeConversationId) {
      console.error('❌ No active conversation');
      return;
    }
    
    console.log('📤 Sending message:', content, 'to conversation:', activeConversationId);
    
    setIsLoading(true);
    
    // Mensagem do usuário
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    // Atualizar mensagens localmente
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Atualizar também a conversa na lista
    updateConversationInList(activeConversationId, {
      messages: updatedMessages,
      lastMessage: content.length > 50 ? content.substring(0, 50) + '...' : content
    });
    
    try {
      // Enviar para o backend
      const response = await fetch('http://localhost:3333/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: activeConversationId,
          message: content,
          traderName: traderName,
          traderLevel: traderLevel,
          useSystemPrompt: true,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Backend response:', data);
      
      // Mensagem do assistente
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: data.content || data.response || "Desculpe, não consegui processar sua mensagem.",
        timestamp: new Date()
      };
      
      // Atualizar mensagens com a resposta
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      
      // Atualizar conversa na lista
      updateConversationInList(activeConversationId, {
        messages: finalMessages,
        lastMessage: content.length > 50 ? content.substring(0, 50) + '...' : content
      });
      
      // Se for a primeira mensagem, definir título baseado no conteúdo
      if (messages.length === 0) {
        const title = content.length > 30 
          ? content.substring(0, 30) + '...' 
          : content;
        updateConversationTitle(activeConversationId, title);
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Mensagem de erro
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: error instanceof Error 
          ? `Erro: ${error.message}. Verifique se o backend está rodando em http://localhost:3333`
          : "Desculpe, houve um erro ao conectar com o servidor.",
        timestamp: new Date()
      };
      
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      
      // Atualizar conversa na lista
      updateConversationInList(activeConversationId, {
        messages: finalMessages
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para limpar chat atual
  const clearChat = () => {
    if (activeConversationId) {
      console.log('🗑️ Clearing chat for conversation:', activeConversationId);
      setMessages([]);
      updateConversationInList(activeConversationId, {
        messages: [],
        lastMessage: ''
      });
    }
  };

  // Função para atualizar título da conversa
  const updateConversationTitle = (conversationId: string, title: string) => {
    console.log('✏️ Updating title for conversation:', conversationId, 'to:', title);
    updateConversationInList(conversationId, { title });
  };

  // Função para deletar conversa
  const deleteConversation = (conversationId: string) => {
    console.log('🗑️ Deleting conversation:', conversationId);
    
    // Remover da lista
    const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updatedConversations);
    saveConversations(updatedConversations);
    
    // Se era a conversa ativa, criar uma nova ou trocar para outra
    if (activeConversationId === conversationId) {
      if (updatedConversations.length > 0) {
        switchConversation(updatedConversations[0].id);
      } else {
        createNewConversation();
      }
    }
  };

  // Computed value para activeConversation
  const activeConversation = activeConversationId 
    ? conversations.find(c => c.id === activeConversationId) || null
    : null;

  return (
    <ChatContext.Provider
      value={{
        // Estado
        conversations,
        activeConversationId,
        activeConversation,
        messages,
        isLoading,
        isLoadingConversations,
        
        // Ações
        switchConversation,
        createNewConversation,
        sendMessage,
        clearChat,
        updateConversationTitle,
        deleteConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}