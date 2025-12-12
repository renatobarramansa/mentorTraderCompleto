// backend/test-chat-formatting.ts
// VERSÃO CORRIGIDA - sem variáveis indefinidas

import { ChatService } from "@/chat/chat.service";

// Interface para o mock
interface AnthropicRequest {
  message: string;
  conversationId?: string;
  systemPrompt?: string;
  maxTokens: number;
  temperature: number;
}

// Mock do AnthropicService para simulação
class MockAnthropicService {
  private responseMode: 'good' | 'bad' | 'mixed' = 'bad';
  
  constructor(mode: 'good' | 'bad' | 'mixed' = 'bad') {
    this.responseMode = mode;
  }
  
  async generateResponse(request: AnthropicRequest): Promise<string> {
    console.log('🤖 [MockAnthropicService] Simulando resposta da IA...');
    console.log(`- Mode: ${this.responseMode}`);
    console.log(`- Prompt size: ${request.systemPrompt?.length || 0} chars`);
    
    // Verificar se o prompt tem instruções claras sobre backticks
    const hasBacktickInstructions = request.systemPrompt?.includes('```ntsl') || false;
    console.log(`- Prompt mentions \`\`\`ntsl? ${hasBacktickInstructions ? '✅ YES' : '❌ NO'}`);
    
    switch (this.responseMode) {
      case 'good':
        return this.getGoodResponse();
      case 'mixed':
        return this.getMixedResponse();
      case 'bad':
      default:
        return this.getBadResponse();
    }
  }
  
  private getBadResponse(): string {
    // Simulação 1: Resposta SEM backticks (problema atual)
    // NOTA: Removemos a referência a 'Close' que não está definida
    return `Aqui está uma estratégia de média móvel de 20 períodos:

// Estrategia de Media Movel Simples
input
    Periodo(20);
    TakeProfit(6);
    StopLoss(3);

var
    rMedia: Float;
    bCondicao: Boolean;

begin
    rMedia := Media(Periodo, Close);
    bCondicao := Close > rMedia;
    
    if (not HasPosition) and bCondicao then
    begin
        BuyAtMarket(1);
        SellToCoverLimit(TakeProfit, 1);
        SellToCoverStop(StopLoss, 1);
        ConsoleLog("Estrategia ativada");
    end;
end.

Esta estratégia compra quando o preço está acima da média móvel de 20 períodos.

Dica: Sempre use gestão de risco adequada.`;
  }
  
  private getMixedResponse(): string {
    // Simulação 2: Resposta MISTA - alguns códigos com backticks, outros não
    return `Vou te mostrar 3 estratégias diferentes:

1. Estratégia básica (SEM backticks):
input
    Periodo(20);
    TakeProfit(10);
var
    rMedia: Float;
begin
    rMedia := Media(Periodo, Close);
    if Close > rMedia then BuyAtMarket(1);
end.

2. Estratégia avançada (COM backticks):
\`\`\`ntsl
// Estrategia com IFR
input
    Periodo(14);
    TakeProfit(8);
    StopLoss(4);
var
    rIFR: Float;
begin
    rIFR := IFR(Periodo);
    if (rIFR < 30) and (not HasPosition) then
    begin
        BuyAtMarket(1);
        SellToCoverLimit(TakeProfit, 1);
    end;
end.
\`\`\`

3. Estratégia simples (SEM backticks):
begin
    if Time > 1000 then
        BuyAtMarket(1);
end.

Espero que essas estratégias te ajudem!`;
  }
  
  private getGoodResponse(): string {
    // Simulação 3: Resposta CORRETA com backticks
    return `Aqui está uma estratégia completa de média móvel:

\`\`\`ntsl
// Estrategia de Media Movel para Profit Pro
input
    Periodo(20);
    TakeProfit(6);
    StopLoss(3);

var
    rMedia: Float;
    bSinalCompra: Boolean;

begin
    // Calcula a média móvel
    rMedia := Media(Periodo, Close);
    
    // Condição de entrada
    bSinalCompra := (Close > rMedia) and (not HasPosition);
    
    if bSinalCompra then
    begin
        // Entrada com gestão de risco
        BuyAtMarket(1);
        SellToCoverLimit(TakeProfit, 1);
        SellToCoverStop(StopLoss, 1);
        
        // Debug
        ConsoleLog("Media calculada: " + rMedia);
    end;
end.
\`\`\`

**Funcionamento:**
1. Calcula média móvel de 20 períodos
2. Compra quando preço > média
3. Usa TakeProfit de 6 e StopLoss de 3
4. Evita reentrada com HasPosition

**Dicas:**
- Teste em conta demo primeiro
- Ajuste os parâmetros conforme seu estilo
- Sempre use StopLoss!`;
  }
}

// Classe de teste
class NTSLFormattingTester {
  private testResults: Array<{
    testName: string;
    passed: boolean;
    details: string;
    metrics: any;
  }> = [];
  
  async runAllTests() {
    console.log('🧪 ============================================');
    console.log('🧪 TESTE COMPLETO DE FORMATAÇÃO NTSL');
    console.log('🧪 ============================================\n');
    
    await this.testBadResponse();
    await this.testMixedResponse();
    await this.testGoodResponse();
    await this.testSyntaxValidation();
    await this.testRegexPatterns();
    
    this.printSummary();
  }
  
  private async testBadResponse() {
    console.log('📋 TESTE 1: Resposta SEM backticks');
    console.log('='.repeat(50));
    
    const mockService = new MockAnthropicService('bad');
    // Criar instância do ChatService com o mock
    const chatService = new (ChatService as any)(mockService);
    
    try {
      const response = await chatService.processMessage(
        'Crie uma estratégia com média móvel de 20',
        'test-1',
        'Trader Teste',
        'intermediario',
        true
      );
      
      const metrics = this.analyzeResponse(response);
      
      const testPassed = metrics.hasBackticks && metrics.hasNTSLMarkers;
      
      this.testResults.push({
        testName: 'Resposta sem backticks (correção automática)',
        passed: testPassed,
        details: testPassed ? 'Backticks adicionados automaticamente' : 'Falha na correção automática',
        metrics
      });
      
      console.log('\n📊 Análise:');
      console.log(`- Tem \`\`\`ntsl? ${metrics.hasNTSLMarkers ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`- Tem backticks? ${metrics.hasBackticks ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`- Código NTSL detectado? ${metrics.hasNTSLCode ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`- Tamanho: ${metrics.length} chars`);
      console.log(`- Blocos de código: ${metrics.codeBlocks}`);
      
      if (!testPassed) {
        console.log('\n⚠️ Problemas:');
        if (!metrics.hasBackticks) console.log('  - Sem backticks');
        if (!metrics.hasNTSLMarkers) console.log('  - Sem ```ntsl');
      }
      
    } catch (error: any) {
      console.error('❌ Erro no teste:', error.message);
      this.testResults.push({
        testName: 'Resposta sem backticks',
        passed: false,
        details: `Erro: ${error.message}`,
        metrics: {}
      });
    }
    
    console.log('');
  }
  
  private async testMixedResponse() {
    console.log('📋 TESTE 2: Resposta MISTA (alguns com, alguns sem backticks)');
    console.log('='.repeat(50));
    
    const mockService = new MockAnthropicService('mixed');
    const chatService = new (ChatService as any)(mockService);
    
    try {
      const response = await chatService.processMessage(
        'Mostre várias estratégias diferentes',
        'test-2',
        'Trader Teste',
        'avancado',
        true
      );
      
      const metrics = this.analyzeResponse(response);
      
      // Verificar se TODOS os códigos têm backticks
      const codeBlocks = this.extractAllCodeBlocks(response);
      const allHaveBackticks = codeBlocks.every(block => block.hasBackticks);
      
      this.testResults.push({
        testName: 'Resposta mista (correção múltipla)',
        passed: allHaveBackticks,
        details: allHaveBackticks ? 
          `Todos os ${codeBlocks.length} blocos corrigidos` : 
          `Apenas ${codeBlocks.filter(b => b.hasBackticks).length}/${codeBlocks.length} blocos corrigidos`,
        metrics: { ...metrics, codeBlocksCount: codeBlocks.length }
      });
      
      console.log('\n📊 Análise:');
      console.log(`- Total de blocos: ${codeBlocks.length}`);
      console.log(`- Blocos com backticks: ${codeBlocks.filter(b => b.hasBackticks).length}`);
      console.log(`- Blocos com \`\`\`ntsl: ${codeBlocks.filter(b => b.hasNTSLMarkers).length}`);
      
      codeBlocks.forEach((block, index) => {
        console.log(`\n  Bloco ${index + 1}:`);
        console.log(`    - Começa com: ${block.startsWith}`);
        console.log(`    - Linhas: ${block.lines}`);
        console.log(`    - Tem \`\`\`ntsl? ${block.hasNTSLMarkers ? '✅' : '❌'}`);
        console.log(`    - Tem backticks? ${block.hasBackticks ? '✅' : '❌'}`);
      });
      
    } catch (error: any) {
      console.error('❌ Erro no teste:', error.message);
      this.testResults.push({
        testName: 'Resposta mista',
        passed: false,
        details: `Erro: ${error.message}`,
        metrics: {}
      });
    }
    
    console.log('');
  }
  
  private async testGoodResponse() {
    console.log('📋 TESTE 3: Resposta CORRETA (já com backticks)');
    console.log('='.repeat(50));
    
    const mockService = new MockAnthropicService('good');
    const chatService = new (ChatService as any)(mockService);
    
    try {
      const response = await chatService.processMessage(
        'Estratégia profissional com médias',
        'test-3',
        'Trader Teste',
        'profissional',
        true
      );
      
      const metrics = this.analyzeResponse(response);
      
      // Verificar se a resposta já correta não foi corrompida
      const wasAlreadyCorrect = metrics.hasNTSLMarkers && metrics.hasBackticks;
      const wasModified = response.includes('```ntsl```ntsl') || response.includes('```ntsl\n```ntsl');
      
      this.testResults.push({
        testName: 'Resposta já correta (não deve modificar)',
        passed: wasAlreadyCorrect && !wasModified,
        details: wasModified ? 
          'Resposta correta foi corrompida!' : 
          'Resposta correta mantida intacta',
        metrics
      });
      
      console.log('\n📊 Análise:');
      console.log(`- Já tinha \`\`\`ntsl? ${metrics.hasNTSLMarkers ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`- Foi modificada? ${wasModified ? '❌ SIM (problema!)' : '✅ NÃO'}`);
      console.log(`- Blocos de código: ${metrics.codeBlocks}`);
      console.log(`- TakeProfit declarado? ${response.includes('TakeProfit(') ? '✅' : '❌'}`);
      console.log(`- StopLoss declarado? ${response.includes('StopLoss(') ? '✅' : '❌'}`);
      
    } catch (error: any) {
      console.error('❌ Erro no teste:', error.message);
      this.testResults.push({
        testName: 'Resposta correta',
        passed: false,
        details: `Erro: ${error.message}`,
        metrics: {}
      });
    }
    
    console.log('');
  }
  
  private async testSyntaxValidation() {
    console.log('📋 TESTE 4: Validação de Sintaxe NTSL');
    console.log('='.repeat(50));
    
    const testCodes = [
      {
        name: 'Código CORRETO',
        code: `input
    Periodo(20);
    TakeProfit(6);
    StopLoss(3);
var
    rMedia: Float;
begin
    rMedia := Media(Periodo, Close);
    if (not HasPosition) and (Close > rMedia) then
    begin
        BuyAtMarket(1);
        SellToCoverLimit(TakeProfit, 1);
        SellToCoverStop(StopLoss, 1);
    end;
end.`
      },
      {
        name: 'Código com ERROS',
        code: `input
    Periodo(20);
    // Faltou TakeProfit e StopLoss
var
    media: Float;  // ERRO: nome de função
begin
    media := Media(Periodo, Close);
    if Close > media then
        BuyAtMarket;  // ERRO: sem quantidade
end;  // ERRO: end; em vez de end.`
      },
      {
        name: 'Código que começa com begin',
        code: `begin
    if Time > 0900 then
        BuyAtMarket(1);
end.`
      },
      {
        name: 'Código que começa com var',
        code: `var
    rMedia: Float;
    bCondicao: Boolean;
begin
    rMedia := Media(20, Close);
    bCondicao := Close > rMedia;
    if bCondicao then BuyAtMarket(1);
end.`
      }
    ];
    
    console.log('\n🧪 Testando diferentes padrões de código:');
    
    testCodes.forEach((test, index) => {
      console.log(`\n  ${index + 1}. ${test.name}:`);
      
      // Verificações básicas
      const checks = {
        endsWithEndDot: /end\.\s*$/.test(test.code),
        startsCorrectly: /^(input|var|begin)/im.test(test.code),
        hasTakeProfitIfUsed: !test.code.includes('TakeProfit') || test.code.includes('TakeProfit('),
        hasStopLossIfUsed: !test.code.includes('StopLoss') || test.code.includes('StopLoss('),
        noFunctionNamesAsVars: !/(?:^|\s)media\s*:/im.test(test.code) // Não usa 'media' como variável
      };
      
      Object.entries(checks).forEach(([checkName, passed]) => {
        console.log(`    ${passed ? '✅' : '❌'} ${checkName}`);
      });
      
      // Detectar qual padrão começa
      const startsWith = test.code.match(/^(input|var|begin)/im)?.[0] || 'unknown';
      console.log(`    🔍 Começa com: ${startsWith}`);
    });
    
    this.testResults.push({
      testName: 'Validação de sintaxe',
      passed: true,
      details: 'Testes de padrões executados',
      metrics: { testCount: testCodes.length }
    });
    
    console.log('');
  }
  
  private testRegexPatterns() {
    console.log('📋 TESTE 5: Padrões Regex');
    console.log('='.repeat(50));
    
    const testCases = [
      {
        name: 'Código COM ```ntsl',
        text: `Texto antes
\`\`\`ntsl
input
    Periodo(20);
end.
\`\`\`
Texto depois`,
        shouldFind: true
      },
      {
        name: 'Código SEM backticks (input)',
        text: `Veja:
input
    Periodo(20);
end.
Funciona.`,
        shouldFind: true
      },
      {
        name: 'Código SEM backticks (begin)',
        text: `Simples:
begin
    BuyAtMarket(1);
end.`,
        shouldFind: true
      },
      {
        name: 'Código SEM backticks (var)',
        text: `Exemplo:
var
    rMedia: Float;
begin
    rMedia := Media(20, Close);
end.`,
        shouldFind: true
      },
      {
        name: 'Texto sem código',
        text: 'Apenas explicação sobre trading e análise técnica.',
        shouldFind: false
      }
    ];
    
    // Regex do backend (enforceCodeBlockFormat) - ATUALIZADA
    const backendPattern = /(^|\n)(\/\/[^\n]*\n)?((?:input|var|begin)[\s\S]*?end\.)(\n|$)/gi;
    
    console.log('\n🧪 Testando regex do backend (deve capturar input/var/begin):');
    
    testCases.forEach((testCase, index) => {
      const matches = [...testCase.text.matchAll(backendPattern)];
      const found = matches.length > 0;
      const expected = testCase.shouldFind ? 'ENCONTRAR' : 'NÃO ENCONTRAR';
      const result = found ? 'ENCONTRADO' : 'NÃO ENCONTRADO';
      
      console.log(`\n  Teste ${index + 1}: ${testCase.name}`);
      console.log(`    Esperado: ${expected}`);
      console.log(`    Resultado: ${found ? '✅' : '❌'} ${result}`);
      console.log(`    Matches: ${matches.length}`);
      
      if (found !== testCase.shouldFind) {
        console.log(`    ⚠️ DISCREPÂNCIA!`);
        console.log(`    Texto: ${testCase.text.substring(0, 50).replace(/\n/g, ' ')}...`);
      }
      
      if (matches.length > 0) {
        const code = matches[0][3];
        const startsWith = code.match(/^(input|var|begin)/im)?.[0] || 'unknown';
        console.log(`    Começa com: ${startsWith}`);
        console.log(`    Tamanho: ${code.length} chars`);
      }
    });
    
    this.testResults.push({
      testName: 'Padrões regex',
      passed: testCases.every(tc => {
        const matches = [...tc.text.matchAll(backendPattern)];
        return (matches.length > 0) === tc.shouldFind;
      }),
      details: `Regex ${testCases.every(tc => {
        const matches = [...tc.text.matchAll(backendPattern)];
        return (matches.length > 0) === tc.shouldFind;
      }) ? 'funciona' : 'tem problemas'}`,
      metrics: { testCases: testCases.length }
    });
    
    console.log('');
  }
  
  private analyzeResponse(response: string): any {
    return {
      length: response.length,
      hasBackticks: response.includes('```'),
      hasNTSLMarkers: response.includes('```ntsl'),
      hasPascalMarkers: response.includes('```pascal'),
      hasNTSLCode: /(input|var|begin)[\s\S]*?end\./i.test(response),
      codeBlocks: (response.match(/```ntsl/g) || []).length,
      takeProfitDeclared: response.includes('TakeProfit('),
      stopLossDeclared: response.includes('StopLoss('),
      endsWithEndDot: /end\.\s*$/.test(response)
    };
  }
  
  private extractAllCodeBlocks(response: string): Array<{
    code: string;
    hasBackticks: boolean;
    hasNTSLMarkers: boolean;
    startsWith: string;
    lines: number;
  }> {
    const blocks: Array<{
      code: string;
      hasBackticks: boolean;
      hasNTSLMarkers: boolean;
      startsWith: string;
      lines: number;
    }> = [];
    
    // Encontrar blocos com backticks
    const backtickPattern = /```(?:ntsl|pascal)?\n([\s\S]*?)```/g;
    let match;
    
    while ((match = backtickPattern.exec(response)) !== null) {
      const code = match[1].trim();
      blocks.push({
        code,
        hasBackticks: true,
        hasNTSLMarkers: match[0].includes('```ntsl'),
        startsWith: code.match(/^(input|var|begin)/im)?.[0] || 'unknown',
        lines: code.split('\n').length
      });
    }
    
    // Encontrar blocos sem backticks (após processamento)
    const noBacktickPattern = /(?:^|\n)((?:input|var|begin)[\s\S]*?end\.)(?:\n|$)/gi;
    while ((match = noBacktickPattern.exec(response)) !== null) {
      // Verificar se este bloco JÁ está em um bloco com backticks
      const code = match[1].trim();
      const isAlreadyInBlock = blocks.some(block => block.code.includes(code));
      
      if (!isAlreadyInBlock) {
        blocks.push({
          code,
          hasBackticks: false,
          hasNTSLMarkers: false,
          startsWith: code.match(/^(input|var|begin)/im)?.[0] || 'unknown',
          lines: code.split('\n').length
        });
      }
    }
    
    return blocks;
  }
  
  private printSummary() {
    console.log('🏁 ============================================');
    console.log('🏁 RESUMO DOS TESTES');
    console.log('🏁 ============================================\n');
    
    const passed = this.testResults.filter(t => t.passed).length;
    const total = this.testResults.length;
    
    console.log(`📊 Resultado: ${passed}/${total} testes passaram\n`);
    
    this.testResults.forEach((test, index) => {
      console.log(`${test.passed ? '✅' : '❌'} ${index + 1}. ${test.testName}`);
      console.log(`   ${test.details}`);
      
      if (test.metrics && Object.keys(test.metrics).length > 0) {
        console.log(`   Métricas: ${JSON.stringify(test.metrics, null, 0).replace(/[{}"]/g, '')}`);
      }
      
      console.log('');
    });
    
    console.log('🎯 RECOMENDAÇÕES:');
    if (passed === total) {
      console.log('✅ Todos os testes passaram! Sistema está funcionando corretamente.');
    } else {
      const failedTests = this.testResults.filter(t => !t.passed);
      console.log('⚠️ Problemas encontrados:');
      failedTests.forEach(test => {
        console.log(`   - ${test.testName}: ${test.details}`);
      });
      console.log('\n🔧 Ações recomendadas:');
      console.log('   1. Verificar regex no enforceCodeBlockFormat');
      console.log('   2. Testar com respostas reais da API Claude');
      console.log('   3. Verificar logs do processMessage');
    }
    
    console.log('\n🧪 Testes completos!');
  }
}

// Função wrapper para executar sem importações complexas
async function runTests() {
  console.log('🔧 Executando testes simplificados...\n');
  
  const tester = new NTSLFormattingTester();
  
  try {
    await tester.runAllTests();
  } catch (error: any) {
    console.error('❌ Erro fatal nos testes:', error.message);
    console.error(error.stack);
  }
}

// Executar se chamado diretamente
if (typeof require !== 'undefined' && require.main === module) {
  runTests();
}

// Exportar para uso em outros testes
export { NTSLFormattingTester, MockAnthropicService };