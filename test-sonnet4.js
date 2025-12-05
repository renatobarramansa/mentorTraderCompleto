// test-sonnet4.js
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env' });

async function testSonnet4() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    console.log('?? TESTE ESPECÍFICO: claude-sonnet-4-20250514');
    console.log('=============================================');
    console.log('?? API Key:', apiKey ? `${apiKey.substring(0, 15)}...` : 'NÃO ENCONTRADA');
    
    if (!apiKey) {
        console.log('? ERRO: ANTHROPIC_API_KEY não configurada');
        return;
    }
    
    const testPayloads = [
        {
            name: 'Teste básico',
            payload: {
                model: 'claude-sonnet-4-20250514',
                max_tokens: 10,
                messages: [
                    {
                        role: 'user',
                        content: 'Responda apenas com "SONNET 4 OK"'
                    }
                ]
            }
        },
        {
            name: 'Teste com system prompt',
            payload: {
                model: 'claude-sonnet-4-20250514',
                max_tokens: 10,
                messages: [
                    {
                        role: 'user',
                        content: 'Oi'
                    }
                ],
                system: 'Você é um assistente útil. Responda apenas com "TESTE SYSTEM OK"'
            }
        },
        {
            name: 'Teste com beta header',
            payload: {
                model: 'claude-sonnet-4-20250514',
                max_tokens: 10,
                messages: [
                    {
                        role: 'user',
                        content: 'Teste'
                    }
                ]
            },
            headers: {
                'anthropic-beta': 'sonnet-4-2025-05-14'
            }
        }
    ];
    
    for (const test of testPayloads) {
        console.log(`\n?? ${test.name}...`);
        
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            ...test.headers
        };
        
        try {
            const startTime = Date.now();
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(test.payload),
                timeout: 15000
            });
            
            const responseTime = Date.now() - startTime;
            console.log(`??  Tempo de resposta: ${responseTime}ms`);
            console.log(`?? Status: ${response.status} ${response.statusText}`);
            
            // Ler resposta completa
            const responseText = await response.text();
            
            if (response.ok) {
                const data = JSON.parse(responseText);
                console.log('? SUCESSO!');
                console.log('?? Resposta:', data.content[0].text);
                console.log('?? ID:', data.id);
                console.log('?? Modelo:', data.model);
                
                if (data.usage) {
                    console.log('?? Tokens:', {
                        input: data.usage.input_tokens,
                        output: data.usage.output_tokens,
                        total: data.usage.input_tokens + data.usage.output_tokens
                    });
                }
                
                // Verificar rate limits
                console.log('?? Rate Limits:');
                const rateHeaders = [
                    'anthropic-ratelimit-requests-limit',
                    'anthropic-ratelimit-requests-remaining',
                    'anthropic-ratelimit-tokens-limit',
                    'anthropic-ratelimit-tokens-remaining'
                ];
                
                rateHeaders.forEach(header => {
                    const value = response.headers.get(header);
                    if (value) {
                        console.log(`  ${header}: ${value}`);
                    }
                });
                
                return; // Parar no primeiro sucesso
                
            } else {
                console.log('? ERRO HTTP');
                
                try {
                    const errorData = JSON.parse(responseText);
                    console.log('?? Detalhes do erro:');
                    console.log(JSON.stringify(errorData, null, 2));
                    
                    // Análise detalhada do erro
                    if (errorData.error) {
                        console.log('\n?? ANÁLISE DO ERRO:');
                        const errorType = errorData.error.type;
                        const errorMessage = errorData.error.message;
                        
                        console.log(`Tipo: ${errorType}`);
                        console.log(`Mensagem: ${errorMessage}`);
                        
                        // Diagnosticar problemas comuns
                        if (errorType === 'invalid_request_error') {
                            if (errorMessage.includes('model')) {
                                console.log('?? PROBLEMA: Modelo não encontrado ou não disponível');
                                console.log('   Verifique se o modelo "claude-sonnet-4-20250514" está disponível na sua conta');
                            }
                            if (errorMessage.includes('max_tokens')) {
                                console.log('?? PROBLEMA: max_tokens inválido');
                            }
                        }
                        
                        if (errorType === 'authentication_error') {
                            console.log('?? PROBLEMA: API Key inválida ou expirada');
                            console.log('   Verifique sua chave no console da Anthropic');
                        }
                        
                        if (errorType === 'rate_limit_error') {
                            console.log('?? PROBLEMA: Rate limit excedido');
                            console.log('   Aguarde alguns minutos ou verifique seus limites');
                        }
                        
                        if (errorType === 'api_error') {
                            console.log('?? PROBLEMA: Erro interno da API Anthropic');
                            console.log('   Tente novamente em alguns minutos');
                        }
                    }
                    
                } catch (parseError) {
                    console.log('?? Resposta (não JSON):', responseText.substring(0, 500));
                }
            }
            
        } catch (error) {
            console.log('? ERRO DE CONEXÃO:', error.message);
            
            if (error.name === 'TimeoutError' || error.code === 'ETIMEDOUT') {
                console.log('?? PROBLEMA: Timeout - Verifique sua conexão com a internet');
            }
            
            if (error.code === 'ECONNREFUSED') {
                console.log('?? PROBLEMA: Conexão recusada - Verifique firewall/proxy');
            }
            
            if (error.code === 'ENOTFOUND') {
                console.log('?? PROBLEMA: DNS não resolve - Verifique conexão com a internet');
            }
        }
        
        // Aguardar 1 segundo entre tentativas
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n?? DIAGNÓSTICO FINAL:');
    console.log('1. Verifique se o modelo "claude-sonnet-4-20250514" está disponível na sua conta');
    console.log('2. Verifique se sua API Key está ativa e tem créditos');
    console.log('3. Teste no site da Anthropic: https://console.anthropic.com/');
    console.log('4. Tente outro modelo como "claude-3-5-sonnet-20241022"');
}

testSonnet4().catch(console.error);
