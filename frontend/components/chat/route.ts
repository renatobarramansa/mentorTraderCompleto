import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conversationId, message } = body;

    // Resposta mockada até o backend estar pronto
    const mockResponses = [
      "Analisando BTC/USD: O preço está testando o suporte em $60,000. Indicadores mostram oversold no RSI. Sugiro aguardar confirmação de reversão.",
      "Para swing trade em ações, recomendo usar médias móveis exponenciais de 9 e 21 períodos. Aguardar cruzamento de alta para entrada.",
      "EUR/JPY rompeu resistência. Alvo imediato em 157.50. Stop loss abaixo de 156.20. Volume confirmando o movimento.",
      "Gerenciamento de risco: Nunca arrisque mais de 1-2% do capital por trade. Use trailing stops para proteger lucros."
    ];

    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

    return NextResponse.json({
      response: randomResponse,
      conversationId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao processar mensagem' },
      { status: 500 }
    );
  }
}