import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AnthropicRequest {
  messages: AnthropicMessage[];
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

@Injectable()
export class AnthropicService implements OnModuleInit {
  private readonly logger = new Logger(AnthropicService.name);
  private anthropic: Anthropic;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.initializeClient();
  }

  private initializeClient() {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    
    if (!apiKey || apiKey === 'your_claude_api_key_here') {
      this.logger.warn('⚠️ ANTHROPIC_API_KEY não configurada. Usando modo simulação.');
      this.logger.warn('⚠️ Para usar a API real do Claude, configure ANTHROPIC_API_KEY no arquivo .env');
      this.anthropic = null;
    } else {
      try {
        this.anthropic = new Anthropic({
          apiKey,
          baseURL: 'https://api.anthropic.com',
        });
        this.logger.log('✅ Cliente Anthropic inicializado com sucesso');
      } catch (error) {
        this.logger.error(`❌ Falha ao inicializar cliente Anthropic: ${error.message}`);
        this.anthropic = null;
      }
    }

    this.model = this.configService.get<string>('ANTHROPIC_MODEL', 'claude-3-haiku-20240307');
    this.maxTokens = this.configService.get<number>('ANTHROPIC_MAX_TOKENS', 4096);
    this.temperature = this.configService.get<number>('ANTHROPIC_TEMPERATURE', 0.7);
    
    this.logger.debug(`Configuração: Model=${this.model}, MaxTokens=${this.maxTokens}, Temp=${this.temperature}`);
  }

  async generateResponse(request: AnthropicRequest): Promise<string> {
    const { messages, systemPrompt, maxTokens, temperature } = request;
    
    this.logger.log(`Gerando resposta com ${messages.length} mensagens de histórico`);

    // If no API key configured, use mock responses
    if (!this.anthropic) {
      return this.getMockResponse(messages);
    }

    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: maxTokens || this.maxTokens,
        temperature: temperature || this.temperature,
        system: systemPrompt,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      const content = response.content[0]?.text || '';
      this.logger.log(`Resposta gerada: ${content.length} caracteres`);
      
      return this.formatResponse(content);
    } catch (error) {
      this.logger.error(`Erro na API do Claude: ${error.message}`, error.stack);
      
      // Fallback to mock response on API error
      return this.getMockResponse(messages, true);
    }
  }

  private getMockResponse(messages: AnthropicMessage[], isError: boolean = false): string {
    if (isError) {
      return `❌ **Erro na API Claude**\n\nO serviço está temporariamente indisponível. Aqui está uma resposta simulada:\n\n---\n\nOlá! Sou o Mentor Trader. Estou aqui para ajudar você com:\n\n📈 **Análise Técnica**\n🤖 **Códigos NTSL para Profit**\n🎯 **Estratégias de Trading**\n📊 **Gestão de Risco**\n💭 **Psicologia do Trader**\n\nPara testar a funcionalidade completa, configure sua chave da API Claude no arquivo .env do backend.\n\n**Exemplo de código NTSL para média móvel:**\n\`\`\`ntsl\n// Média Móvel Simples de 20 períodos\nPlot(MA(Close, 20), "MM20", corAzul, estiloLinha);\n\`\`\`\n\nComo posso ajudar você hoje?`;
    }

    const lastMessage = messages[messages.length - 1]?.content || '';
    
    if (lastMessage.toLowerCase().includes('ntsl') || lastMessage.includes('código')) {
      return `Aqui está um exemplo de código NTSL para o Profit Chart:\n\n\`\`\`ntsl\n// Exemplo de indicador de média móvel\n// Autor: Mentor Trader\n// Data: ${new Date().toLocaleDateString()}\n\n// Configurações\nperiodos = 20;\ncorLinha = corAzul;\nesspessura = 1;\n\n// Cálculo da média móvel\nmedia = MA(Close, periodos);\n\n// Plotagem no gráfico\nPlot(media, "MM" + NumToStr(periodos, 0), corLinha, estiloLinha, espessura);\n\n// Adicionar legendas\nAddText("Média Móvel " + NumToStr(periodos, 0) + " períodos", true);\n\`\`\`\n\nEste código plota uma média móvel simples de 20 períodos no gráfico. Você pode modificar o número de períodos ajustando a variável \`periodos\`.`;
    }
    
    if (lastMessage.toLowerCase().includes('erro') || lastMessage.includes('problema')) {
      return `**Análise do Problema:**\n\nParece que você está enfrentando dificuldades. Vamos resolver isso juntos:\n\n1. **Identifique o erro específico** - O que exatamente não está funcionando?\n2. **Revise seu diário de trades** - Padrões se repetem?\n3. **Reduza o tamanho da posição** - Tente operar com 0.5% do capital\n4. **Faça uma pausa** - À vezes, descansar é a melhor estratégia\n\nMe conte mais detalhes para que eu possa ajudar melhor!`;
    }
    
    return `Olá! Sou o Mentor Trader, seu assistente especializado em trading do mercado brasileiro. 👋\n\n**Como posso ajudá-lo hoje?**\n\n📊 **Análise técnica** de ativos\n📈 **Estratégias** de day trade e swing trade\n💻 **Códigos NTSL** para o Profit Chart\n🎯 **Gestão de risco** e posição sizing\n📝 **Revisão** de operações passadas\n\n**Exemplo rápido:** Se você está aprendendo NTSL, posso criar indicadores personalizados para você. Se está tendo dificuldades psicológicas, podemos trabalhar em técnicas de controle emocional.\n\nMe conte: qual é seu foco no momento?`;
  }

  private formatResponse(content: string): string {
    // Ensure NTSL code blocks are properly formatted
    if (content.includes('```ntsl') || content.includes('```NTSL')) {
      return content;
    }
    
    // Add proper code block formatting if code is detected
    const codeKeywords = ['Plot(', 'MA(', 'Close', 'Open', 'High', 'Low', 'Volume', 'If ', 'Then', 'Else', 'For ', 'While '];
    const hasCode = codeKeywords.some(keyword => content.includes(keyword));
    
    if (hasCode && !content.includes('```')) {
      // Try to extract code section
      const lines = content.split('\n');
      let inCodeBlock = false;
      const formattedLines = [];
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        const looksLikeCode = codeKeywords.some(keyword => trimmedLine.includes(keyword)) || 
                             trimmedLine.includes('=') || 
                             trimmedLine.endsWith(';');
        
        if (looksLikeCode && !inCodeBlock) {
          formattedLines.push('```ntsl');
          inCodeBlock = true;
        } else if (!looksLikeCode && inCodeBlock && trimmedLine) {
          formattedLines.push('```');
          inCodeBlock = false;
        }
        
        formattedLines.push(line);
      }
      
      if (inCodeBlock) {
        formattedLines.push('```');
      }
      
      return formattedLines.join('\n');
    }
    
    return content;
  }

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    if (!this.anthropic) {
      return {
        connected: false,
        message: 'API Claude não configurada. Configure ANTHROPIC_API_KEY no arquivo .env',
      };
    }

    try {
      // Simple test request
      await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Test' }],
      });

      return {
        connected: true,
        message: '✅ Conexão com API Claude estabelecida com sucesso!',
      };
    } catch (error) {
      return {
        connected: false,
        message: `❌ Falha na conexão com API Claude: ${error.message}`,
      };
    }
  }
}