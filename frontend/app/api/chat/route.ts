// API Route para Mentor Trader Chat
// Arquivo: frontend/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

// URL do backend NestJS
const BACKEND_URL = 'http://localhost:3333';

export async function POST(request: NextRequest) {
  console.log('🚀 API Route POST /api/chat chamada');
  
  try {
    // Ler a mensagem do usuário
    const body = await request.json();
    const userMessage = body.message || '';
    
    console.log(`📨 Mensagem recebida: "${userMessage.substring(0, 50)}..."`);
    
    // Tentar conectar ao backend
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          systemPrompt: body.systemPrompt || '',
          conversationId: body.conversationId || `conv-${Date.now()}`,
          isContinuation: body.isContinuation || false
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (backendError) {
      console.warn('⚠️ Backend offline, usando modo simulação');
    }
    
    // Modo simulação (quando backend está offline)
    return NextResponse.json({
      content: `🤖 **Mentor Trader (Modo Simulação)**\n\nOlá! Recebi sua mensagem: "${userMessage}"\n\n💡 **Dica do Dia:**\nSempre defina seu stop loss antes de entrar na operação!\n\n📊 **Exemplo de código NTSL:**\n\`\`\`ntsl\n// Média Móvel de 20 períodos\nPlot(MA(Close, 20), "MM20", corAzul, estiloLinha);\n\`\`\`\n\nPara respostas completas, inicie o backend NestJS.`,
      conversationId: body.conversationId || `conv-${Date.now()}`,
      timestamp: new Date().toISOString(),
      success: true,
      mode: 'simulation'
    });
    
  } catch (error) {
    console.error('💥 Erro na API route:', error);
    
    return NextResponse.json({
      content: '❌ Erro ao processar sua mensagem. Tente novamente.',
      timestamp: new Date().toISOString(),
      error: true
    }, { status: 500 });
  }
}

export async function GET() {
  console.log('ℹ️ API Route GET /api/chat chamada');
  
  return NextResponse.json({
    status: 'online',
    service: 'Mentor Trader Chat API',
    backend: BACKEND_URL,
    timestamp: new Date().toISOString(),
    message: 'Use POST /api/chat para enviar mensagens'
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Forçar dynamic rendering
export const dynamic = 'force-dynamic';