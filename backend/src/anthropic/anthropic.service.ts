import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

export interface AnthropicRequest {
  message: string;
  conversationId?: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

@Injectable()
export class AnthropicService {
  private anthropic: Anthropic;
  private conversationHistory: Map<string, { role: string; content: string }[]> = new Map();

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY || '';
    
    if (!apiKey) {
      console.warn('⚠️ ANTHROPIC_API_KEY não configurada. Usando modo simulador.');
      console.warn('   Para usar Claude real, adicione no .env:');
      console.warn('   ANTHROPIC_API_KEY=sua-chave-aqui');
    }
    
    this.anthropic = new Anthropic({
      apiKey: apiKey,
    });
  }

  async generateResponse(request: AnthropicRequest): Promise<string> {
    console.log(`[AnthropicService] Gerando resposta...`);
    console.log(`- Mensagem: ${request.message.substring(0, 100)}...`);
    console.log(`- System Prompt: ${request.systemPrompt ? 'Sim (' + request.systemPrompt.length + ' chars)' : 'Não'}`);
    console.log(`- API Key configurada: ${process.env.ANTHROPIC_API_KEY ? 'Sim' : 'Não'}`);
    
    try {
      let response: string;
      
      if (process.env.ANTHROPIC_API_KEY) {
        // USAR API REAL DO CLAUDE
        response = await this.callRealClaudeAPI(request);
      } else {
        // USAR MODO SIMULAÇÃO MELHORADO
        response = this.getEnhancedSimulatedResponse(request);
      }
      
      // Atualizar histórico
      this.updateConversationHistory(request.conversationId, request.message, response);
      
      console.log(`[AnthropicService] Resposta gerada: ${response.length} caracteres`);
      return response;
      
    } catch (error) {
      console.error('[AnthropicService] Erro:', error);
      return this.getEnhancedSimulatedResponse(request); // Fallback melhorado
    }
  }

  private async callRealClaudeAPI(request: AnthropicRequest): Promise<string> {
    console.log('[AnthropicService] Chamando API real do Claude...');
    
    const messages = [
      {
        role: 'user' as const,
        content: request.message,
      }
    ];
    
    const claudeResponse = await this.anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: request.maxTokens || 1500,
      temperature: request.temperature || 0.7,
      system: request.systemPrompt || 'Você é um assistente útil.',
      messages: messages,
    });
    
    const responseText = claudeResponse.content
      .filter(block => block.type === 'text')
      .map(block => (block as any).text)
      .join('\n');
    
    return responseText;
  }

  private getEnhancedSimulatedResponse(request: AnthropicRequest): string {
    console.log('[AnthropicService] Gerando resposta simulada aprimorada...');
    
    // Analisar se é pergunta sobre NTSL/trading
    const lowerMessage = request.message.toLowerCase();
    const isNTSL = lowerMessage.includes('ntsl') || 
                   lowerMessage.includes('profit pro') ||
                   lowerMessage.includes('media') ||
                   lowerMessage.includes('média') ||
                   lowerMessage.includes('trade') ||
                   lowerMessage.includes('estratégia') ||
                   lowerMessage.includes('indicador') ||
                   lowerMessage.includes('código') ||
                   lowerMessage.includes('programação');
    
    const isTrading = lowerMessage.includes('trading') ||
                      lowerMessage.includes('mercado') ||
                      lowerMessage.includes('ação') ||
                      lowerMessage.includes('ativo') ||
                      lowerMessage.includes('compra') ||
                      lowerMessage.includes('venda');
    
    // Se tem system prompt e é sobre NTSL/trading, gerar resposta específica
    if (request.systemPrompt && (isNTSL || isTrading)) {
      return this.generateNTSLResponse(request);
    }
    
    // Resposta genérica
    return `Olá! Como Mentor Trader, estou aqui para ajudar você com trading e programação NTSL para o Profit Pro.

Você perguntou: "\${request.message}"

Posso ajudar com:
• Desenvolvimento de estratégias de trading
• Programação em NTSL para o Profit Pro
• Análise técnica e indicadores
• Gerenciamento de risco
• Otimização de códigos existentes

Para uma resposta mais específica, me diga exatamente o que você precisa criar ou corrigir em NTSL!`;
  }

  private generateNTSLResponse(request: AnthropicRequest): string {
    const lowerMessage = request.message.toLowerCase();
    
    // Detectar tipo de pergunta
    if (lowerMessage.includes('media') || lowerMessage.includes('média')) {
      return this.getMovingAverageResponse(request);
    } else if (lowerMessage.includes('ifr') || lowerMessage.includes('rsi')) {
      return this.getIFRResponse();
    } else if (lowerMessage.includes('stop') || lowerMessage.includes('loss')) {
      return this.getStopLossResponse();
    } else if (lowerMessage.includes('exemplo') || lowerMessage.includes('código') || lowerMessage.includes('codigo')) {
      return this.getExampleCodeResponse();
    } else {
      return this.getGenericNTSLResponse(request);
    }
  }

  private getMovingAverageResponse(request: AnthropicRequest): string {
    // Extrair período da pergunta se possível
    const periodMatch = request.message.match(/(\d+)/);
    const period = periodMatch ? periodMatch[1] : '20';
    
    return `Como Mentor Trader, aqui está um código NTSL para média móvel de \${period} períodos:

```
// Estrategia de Media Movel para Profit Pro
input
    PeriodoMA(\${period});
    TipoMedia(1); // 1=Simples, 2=Exponencial
    Quantidade(1);
    TakeProfit(20);
    StopLoss(10);

var
    rMedia: Float;
    bCompra: Boolean;
    bVenda: Boolean;
    jaOperouHoje: Boolean;
    diaAtual: Integer;

begin
    // Controle diário
    if Date <> diaAtual then
    begin
        jaOperouHoje := False;
        diaAtual := Date;
    end;
    
    // Calcular média móvel
    if TipoMedia = 1 then
        rMedia := Media(PeriodoMA, Close)
    else
        rMedia := MediaExp(PeriodoMA, Close);
    
    // Condições de entrada
    bCompra := Close > rMedia;
    bVenda := Close < rMedia;
    
    // Sinalização visual no gráfico
    Plot(rMedia, "MA-\${period}");
    PaintBar(bCompra, clLime, clDefault);
    PaintBar(bVenda, clRed, clDefault);
    
    // Lógica de entrada
    if (not HasPosition) and (not jaOperouHoje) then
    begin
        if bCompra then
        begin
            BuyAtMarket(Quantidade);
            ConsoleLog("Compra em: " + Close + ", MA: " + rMedia);
            jaOperouHoje := True;
        end;
        
        if bVenda then
        begin
            SellShortAtMarket(Quantidade);
            ConsoleLog("Venda em: " + Close + ", MA: " + rMedia);
            jaOperouHoje := True;
        end;
    end;
    
    // Gerenciamento de posição
    if HasPosition then
    begin
        SellToCoverLimit(TakeProfit, Quantidade);
        SellToCoverStop(StopLoss, Quantidade);
    end;
    
    // Debug
    ConsoleLog("Close: " + Close + ", MA: " + rMedia);
end;
```

**Características:**
1. Suporte a média simples (`Media`) e exponencial (`MediaExp`)
2. Controle diário para evitar múltiplas entradas
3. Sinalização visual no gráfico
4. ConsoleLog para debugging
5. Gerenciamento de risco integrado

**Para usar:** 
1. Copie o código para o Profit Pro
2. Ajuste os parâmetros conforme necessário
3. Teste em modo de simulação primeiro

Dica: Para cruzar duas médias, crie `rMediaRapida` e `rMediaLenta` e compare-as!`;
  }

  private getIFRResponse(): string {
    return `Para IFR (Índice de Força Relativa) no NTSL:

```
// Estrategia com IFR
input
    PeriodoIFR(14);
    LimiteSobrecompra(70);
    LimiteSobrevendido(30);
    Quantidade(1);

var
    rIFR: Float;
    bSobrevendido: Boolean;
    bSobrecomprado: Boolean;

begin
    // Calcular IFR
    rIFR := IFR(PeriodoIFR);
    
    // Identificar condições
    bSobrevendido := rIFR < LimiteSobrevendido;
    bSobrecomprado := rIFR > LimiteSobrecompra;
    
    // Plotar no gráfico
    Plot(rIFR, "IFR");
    HorizontalLine(LimiteSobrecompra, clRed);
    HorizontalLine(LimiteSobrevendido, clLime);
    
    // Lógica de trading
    if (not HasPosition) then
    begin
        if bSobrevendido then
        begin
            BuyAtMarket(Quantidade);
            ConsoleLog("Compra por IFR sobrevendido: " + rIFR);
        end;
        
        if bSobrecomprado then
        begin
            SellShortAtMarket(Quantidade);
            ConsoleLog("Venda por IFR sobrecomprado: " + rIFR);
        end;
    end;
end;
```

O IFR mede a velocidade e mudança dos movimentos de preço. Valores abaixo de 30 indicam sobrevenda, acima de 70 sobrecompra.`;
  }

  private getStopLossResponse(): string {
    return `Gerenciamento de risco é crucial! Aqui está um exemplo com stop loss dinâmico:

```
// Stop Loss Dinâmico baseado em ATR
input
    MultiplicadorATR(2);
    PeriodoATR(14);

var
    rATR: Float;
    rStopLoss: Float;
    rTakeProfit: Float;

begin
    // Calcular ATR (Average True Range)
    rATR := AvgTrueRange(PeriodoATR);
    
    if HasPosition then
    begin
        if PositionType = Long then
        begin
            // Stop loss para posição long
            rStopLoss := EntryPrice - (rATR * MultiplicadorATR);
            rTakeProfit := EntryPrice + (rATR * 3);
            
            SellToCoverStop(rStopLoss, Quantity);
            SellToCoverLimit(rTakeProfit, Quantity);
            
            ConsoleLog("Long: SL=" + rStopLoss + ", TP=" + rTakeProfit);
        end
        else
        begin
            // Stop loss para posição short
            rStopLoss := EntryPrice + (rATR * MultiplicadorATR);
            rTakeProfit := EntryPrice - (rATR * 3);
            
            BuyToCoverStop(rStopLoss, Quantity);
            BuyToCoverLimit(rTakeProfit, Quantity);
            
            ConsoleLog("Short: SL=" + rStopLoss + ", TP=" + rTakeProfit);
        end;
    end;
end;
```

Dica: O stop loss dinâmico adapta-se à volatilidade do mercado!`;
  }

  private getExampleCodeResponse(): string {
    return `Aqui está um exemplo completo de estratégia NTSL:

```
// Estrategia Completa Mentor Trader
input
    PeriodoMA(20);
    PeriodoIFR(14);
    TipoEntrada(1); // 1=MA, 2=IFR, 3=Ambos
    Quantidade(1);
    StopLoss(50);
    TakeProfit(100);

var
    rMedia: Float;
    rIFR: Float;
    bSinalMA: Boolean;
    bSinalIFR: Boolean;
    bSinalFinal: Boolean;
    diaOperado: Integer;

begin
    // Inicialização diária
    if Date <> diaOperado then
        diaOperado := Date;
    
    // Calcular indicadores
    rMedia := Media(PeriodoMA, Close);
    rIFR := IFR(PeriodoIFR);
    
    // Gerar sinais
    bSinalMA := Close > rMedia;
    bSinalIFR := (rIFR > 30) and (rIFR < 70);
    
    // Combinar sinais conforme configuração
    case TipoEntrada of
        1: bSinalFinal := bSinalMA;
        2: bSinalFinal := bSinalIFR;
        3: bSinalFinal := bSinalMA and bSinalIFR;
    end;
    
    // Executar ordem
    if (not HasPosition) and bSinalFinal then
    begin
        if bSinalMA then
            BuyAtMarket(Quantidade)
        else
            SellShortAtMarket(Quantidade);
            
        ConsoleLog("Ordem executada: " + Close);
    end;
    
    // Gerenciar posição
    if HasPosition then
    begin
        SellToCoverStop(StopLoss, Quantidade);
        SellToCoverLimit(TakeProfit, Quantidade);
    end;
    
    // Monitoramento
    ConsoleLog("MA: " + rMedia + ", IFR: " + rIFR);
end;
```

Esta é uma estratégia básica que você pode expandir!`;
  }

  private getGenericNTSLResponse(request: AnthropicRequest): string {
    return `Como Mentor Trader especializado em NTSL para Profit Pro, aqui está minha análise:

**Sobre sua pergunta:** "\${request.message}"

**Resposta técnica:**

Para criar soluções em NTSL, siga estas etapas:

1. **Defina o objetivo:** O que sua estratégia deve fazer?
2. **Escolha os indicadores:** Médias móveis, IFR, MACD, etc.
3. **Implemente a lógica:** Use estruturas `if-then` e variáveis
4. **Adicione gerenciamento de risco:** Stop loss e take profit
5. **Teste e otimize:** Use ConsoleLog para debugging

**Exemplo de estrutura básica:**
```
input
    Param1(valor);
    Param2(valor);

var
    Variavel1: Tipo;
    Variavel2: Tipo;

begin
    // Sua lógica aqui
    if condicao then
    begin
        // Ação
    end;
end;
```

**Princípios do NTSL:**
- Sempre declare variáveis antes de usar
- Use `ConsoleLog` para debugging (sem parênteses!)
- Controle reentradas com `HasPosition`
- Implemente gestão de risco em todas estratégias

Pode me dar mais detalhes sobre o que você quer criar? Assim posso fornecer um código mais específico!`;
  }

  private updateConversationHistory(conversationId: string, userMessage: string, assistantResponse: string): void {
    const key = conversationId || 'default';
    if (!this.conversationHistory.has(key)) {
      this.conversationHistory.set(key, []);
    }
    
    const history = this.conversationHistory.get(key)!;
    history.push({ role: 'user', content: userMessage });
    history.push({ role: 'assistant', content: assistantResponse });
    
    // Limitar histórico
    if (history.length > 20) {
      this.conversationHistory.set(key, history.slice(-10));
    }
  }
}

