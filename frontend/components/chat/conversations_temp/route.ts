import { NextResponse } from 'next/server';

export async function GET() {
  // Dados mockados até o backend estar pronto
  const mockConversations = [
    {
      id: 'conv_1',
      title: 'Análise BTC/USD',
      lastMessage: 'O suporte está em $60,000 conforme análise técnica',
      timestamp: new Date(Date.now() - 3600000),
      messages: []
    },
    {
      id: 'conv_2',
      title: 'Estratégia Swing Trade',
      lastMessage: 'Vamos usar médias móveis de 20 e 50 períodos',
      timestamp: new Date(Date.now() - 7200000),
      messages: []
    },
    {
      id: 'conv_3',
      title: 'Setup EUR/JPY',
      lastMessage: 'Rompeu a resistência em 156.80, alvo 158.00',
      timestamp: new Date(Date.now() - 10800000),
      messages: []
    }
  ];

  return NextResponse.json(mockConversations);
}