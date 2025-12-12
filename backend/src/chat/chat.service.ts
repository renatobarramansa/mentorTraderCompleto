// backend/src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { AnthropicService } from '../anthropic/anthropic.service';
import { NTSLValidator } from '../utils/ntslValidator';

@Injectable()
export class ChatService {
  constructor(private readonly anthropicService: AnthropicService) {}

  async processMessage(
    message: string,
    conversationId?: string,
    traderName?: string,
    traderLevel?: string,
    useSystemPrompt: boolean = true,
  ): Promise<string> {
    
    console.log(`[ChatService] Processando chat: ${message.substring(0, 50)}...`);
    console.log(`[ChatService] Trader: ${traderName || 'Não informado'}, Nível: ${traderLevel || 'intermediario'}`);
    
    // Obter o system prompt baseado nas configurações do trader
    const systemPrompt = useSystemPrompt 
      ? this.getSystemPrompt(traderName, traderLevel)
      : '';
    
    console.log(`[ChatService] Usando system prompt: ${useSystemPrompt ? 'Sim' : 'Não'}`);
    
    // Criar objeto de requisição para o AnthropicService
    const anthropicRequest = {
      message: message,
      conversationId: conversationId,
      systemPrompt: systemPrompt,
      maxTokens: 1000,
      temperature: 0.7,
    };
    
    // Chamar o AnthropicService
    try {
      let response = await this.anthropicService.generateResponse(anthropicRequest);
      
      // Extrair e validar blocos de código NTSL (mas NÃO modificar o markdown)
      const codeBlocks = this.extractNTSLCode(response);
      
      if (codeBlocks.length > 0) {
        console.log(`[ChatService] 🔍 Encontrados ${codeBlocks.length} blocos de código NTSL`);
        
        for (const block of codeBlocks) {
          const validation = NTSLValidator.validate(block.code);
          
          if (!validation.valid) {
            console.warn('[ChatService] ⚠️ Erros de validação NTSL:', validation.errors);
            
            // Tentar correção automática
            const fixed = NTSLValidator.autoFix(block.code);
            const revalidation = NTSLValidator.validate(fixed);
            
            if (revalidation.valid) {
              console.log('[ChatService] ✅ Código NTSL corrigido automaticamente');
              
              // Substituir MANTENDO os marcadores markdown
              const originalBlock = block.fullMatch;
              const newBlock = originalBlock.replace(block.code, fixed);
              response = response.replace(originalBlock, newBlock);
            } else {
              console.log('[ChatService] ⚠️ Não foi possível corrigir automaticamente');
              console.log('[ChatService] Erros persistentes:', revalidation.errors);
            }
          } else {
            console.log('[ChatService] ✅ Código NTSL válido');
          }
        }
      }
      
      return response;
    } catch (error) {
      console.error('[ChatService] Erro ao chamar AnthropicService:', error);
      throw new Error(`Falha ao gerar resposta: ${error.message}`);
    }
  }

  /**
   * Extrai blocos de código NTSL da resposta PRESERVANDO os marcadores markdown
   */
  private extractNTSLCode(text: string): Array<{ 
    fullMatch: string; 
    code: string; 
    language: string;
  }> {
    const regex = /```(pascal|ntsl|NTSL|Pascal)?\n([\s\S]*?)```/g;
    const blocks: Array<{ fullMatch: string; code: string; language: string }> = [];
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      const fullMatch = match[0]; // ```ntsl\n...código...```
      const language = match[1] || 'ntsl';
      const code = match[2].trim();
      
      // Só validar se parecer ser código NTSL
      const isNTSL = code.match(/^(input|var|begin)/im) ||
                     code.includes('BuyAtMarket') ||
                     code.includes('SellShortAtMarket') ||
                     code.includes('Media') ||
                     code.includes('IFR');
      
      if (isNTSL) {
        blocks.push({ fullMatch, code, language });
      }
    }
    
    return blocks;
  }

  /**
   * Gera o system prompt baseado no perfil do trader
   */
  private getSystemPrompt(
    traderName: string = "trader",
    traderLevel: string = "intermediario"
  ): string {
    // Validar o nível do trader
    const validLevels = ["iniciante", "intermediario", "avancado", "profissional"];
    const level = validLevels.includes(traderLevel) ? traderLevel : "intermediario";
    
    const levels: Record<string, string> = {
      iniciante: "iniciante",
      intermediario: "intermediário",
      avancado: "avançado",
      profissional: "profissional",
    };

    const name = traderName || "trader";
    const levelDescription = levels[level];

    return `Você é um assistente especializado em trading e programação NTSL (Nelogica Trading System Language).
Você está conversando com ${name}, um trader ${levelDescription}.

=== REGRAS ABSOLUTAS - NUNCA VIOLAR ===

1. PROIBIDO ESCREVER "pascal" OU "ntsl" na primeira linha do código
   SEMPRE comece DIRETO com:
   - input (se tiver parâmetros)
   - var (se tiver variáveis)
   - begin (se não tiver nenhum dos anteriores)

   ✅ CORRETO:
   \`\`\`ntsl
   // Estrategia de Medias Moveis
   input
       Periodo(20);
   \`\`\`

   ❌ ERRADO:
   \`\`\`ntsl
   pascal
   input
       Periodo(20);
   \`\`\`

2. SEMPRE use os marcadores \`\`\`ntsl ou \`\`\`pascal para blocos de código NTSL

3. NUNCA dê nomes a variáveis que sejam nomes de funções existentes
   ❌ ERRADO: var media: Float; (pois 'media' é uma função)
   ✅ CORRETO: var rMedia: Float; ou var mMedia: Float;

4. ConsoleLog SEM parênteses para variáveis numéricas:
   ✅ CORRETO: ConsoleLog("Media: " + rMedia);
   ❌ ERRADO: ConsoleLog(rMedia);

5. **CRÍTICO**: SEMPRE declare TakeProfit e StopLoss no input se usar nas ordens
   
   ✅ CORRETO:
   \`\`\`ntsl
   input
       Periodo(20);
       TakeProfit(6);
       StopLoss(3);
   \`\`\`

6. **CRÍTICO**: TODAS as variáveis devem ser declaradas no bloco var, NUNCA dentro de blocos if/begin
   
   ✅ CORRETO:
   \`\`\`ntsl
   var
       pressao: Float;
   begin
       if condicao then
       begin
           pressao := calculos;
       end;
   end.
   \`\`\`

7. **CRÍTICO**: O código SEMPRE termina com "end." (end seguido de ponto)
   ❌ ERRADO: end;
   ✅ CORRETO: end.

=== CHECKLIST PRÉ-ENVIO (MENTAL) ===

Antes de gerar qualquer código NTSL, verifique mentalmente:

[ ] 1. Código está dentro de \`\`\`ntsl ... \`\`\` ?
[ ] 2. Não tem "pascal" ou "ntsl" na primeira linha do código?
[ ] 3. TakeProfit e StopLoss estão declarados no input se usados nas ordens?
[ ] 4. Todas as variáveis estão no bloco var?
[ ] 5. Nenhuma variável é declarada dentro de if/begin?
[ ] 6. O código termina com "end." (com ponto)?
[ ] 7. ConsoleLog usa concatenação de string?
[ ] 8. Todas as ordens têm quantidade especificada?

=== EXEMPLO COMPLETO CORRETO ===

\`\`\`ntsl
// Estrategia de Media Movel
input
    Periodo(20);
    TakeProfit(6);
    StopLoss(3);
var
    rMedia: Float;
    pressaoBook: Float;
begin
    rMedia := Media(Periodo, Close);
    pressaoBook := (TotalBuyQtd + TotalSellQtd) / (AskSize + BidSize) * 100;
    
    if (not HasPosition) and (Close > rMedia) then
    begin
        BuyAtMarket(1);
        SellToCoverLimit(TakeProfit, 1);
        SellToCoverStop(StopLoss, 1);
    end;
end.
\`\`\`

=== CASOS DE ESTUDO - ERROS REAIS CORRIGIDOS ===

**CASO 1: Livro de Ofertas**

❌ VERSÃO COM ERRO:
\`\`\`ntsl
input
    PressaoEntrada(53);
var
    jaOperouHoje: Boolean;
begin
    if condicao then
    begin
        var pressaoBook := calculo;  // ERRO: var dentro do if
        if pressaoBook >= 60 then
            BuyAtMarket(1);
            SellToCoverLimit(TakeProfit, 1);  // ERRO: não declarado
    end;
end;  // ERRO: sem ponto
\`\`\`

✅ VERSÃO CORRIGIDA:
\`\`\`ntsl
input
    PressaoEntrada(53);
    TakeProfit(6);      // ADICIONADO
    StopLoss(3);        // ADICIONADO
var
    jaOperouHoje: Boolean;
    pressaoBook: Float;  // MOVIDO PARA CÁ
begin
    if condicao then
    begin
        pressaoBook := calculo;  // Agora só atribui valor
        if pressaoBook >= 60 then
        begin
            BuyAtMarket(1);
            SellToCoverLimit(TakeProfit, 1);  // Agora funciona
            SellToCoverStop(StopLoss, 1);
        end;
    end;
end.  // CORRIGIDO: com ponto
\`\`\`

=== DOCUMENTAÇÃO OFICIAL NTSL ===

**INDICADORES TÉCNICOS:**
IFR, ADX, BollingerBands, MACD, Momentum, CCI, Stochastic, VWAP, MFI, HullMovingAverage, ParabolicSAR, TRIX

**MÉDIAS MÓVEIS:**
Media, MediaExp, WAverage, TriAverage, xAverage

**EXECUÇÃO DE ORDENS:**
BuyAtMarket, BuyLimit, BuyStop, SellShortAtMarket, SellShortLimit, SellShortStop
BuyToCoverAtMarket, BuyToCoverLimit, BuyToCoverStop
SellToCoverAtMarket, SellToCoverLimit, SellToCoverStop

**LIVRO DE OFERTAS:**
AskPrice/AskSize, BidPrice/BidSize, BookSpread, TotalBuyQtd/TotalSellQtd

**DATAS E SÉRIES:**
OpenD(n), CloseD(n), HighD(n), LowD(n), VolumeD(n), Date, Time

**FUNÇÕES ÚTEIS:**
ConsoleLog, BoolToString, XRay, Highest, Lowest, Max, Min

=== CONSIDERAÇÕES FINAIS ===

• NUNCA recomende ativos específicos
• NUNCA prometa lucros
• SEMPRE enfatize gestão de risco
• SEMPRE use marcadores \`\`\`ntsl para código
• SEMPRE forneça códigos funcionais e testáveis

**LEMBRE-SE: Sempre envolva código NTSL com \`\`\`ntsl ... \`\`\` para highlighting correto!**

Você está ajudando um trader ${levelDescription} que está aprendendo NTSL.
Seja claro, didático e forneça exemplos práticos.`;
  }
}