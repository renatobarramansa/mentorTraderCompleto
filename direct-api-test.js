// direct-api-test.js
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env' });

async function testClaudeDirect() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    console.log('?? TESTE DIRETO CLAUDE API');
    console.log('===========================');
    console.log('?? API Key:', apiKey ? apiKey.substring(0, 10) + '...' : 'NÃO ENCONTRADA');
    console.log('?? Tamanho:', apiKey?.length || 0, 'caracteres');
    
    if (!apiKey) {
        console.log('? ERRO: ANTHROPIC_API_KEY não encontrada no .env');
        return;
    }
    
    // Teste 1: Verificar se a chave tem formato válido
    if (!apiKey.startsWith('sk-ant-')) {
        console.log('??  FORMATO INCOMUM: A chave não começa com "sk-ant-"');
        console.log('   Formato esperado: sk-ant-xxxxxxxxxx');
    }
    
    // Teste 2: Tentar diferentes modelos
    const testModels = [
        'claude-3-5-sonnet-20241022',
        'claude-3-5-haiku-20241022',
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307'
    ];
    
    for (const model of testModels) {
        console.log(`\n?? Testando modelo: ${model}`);
        
        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'anthropic-beta': 'max-tokens-3-5-sonnet-2024-10-22'
                },
                body: JSON.stringify({
                    model: model,
                    max_tokens: 10,
                    messages: [
                        {
                            role: 'user',
                            content: 'Responda apenas com "TESTE OK"'
                        }
                    ]
                }),
                timeout: 10000
            });
            
            console.log(`?? Status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log('? SUCESSO!');
                console.log('Resposta:', data.content[0].text);
                console.log('Modelo compatível:', model);
                
                // Mostrar headers de rate limit
                console.log('\n?? HEADERS:');
                const headers = ['anthropic-ratelimit-requests-remaining', 'anthropic-ratelimit-tokens-remaining'];
                headers.forEach(h => {
                    if (response.headers.get(h)) {
                        console.log(`${h}: ${response.headers.get(h)}`);
                    }
                });
                
                return; // Parar no primeiro sucesso
            } else {
                const errorText = await response.text();
                console.log('? ERRO HTTP:', errorText.substring(0, 200));
                
                try {
                    const errorJson = JSON.parse(errorText);
                    console.log('Detalhes:', JSON.stringify(errorJson, null, 2));
                    
                    // Verificar se é erro de autenticação
                    if (errorJson.error?.type === 'authentication_error') {
                        console.log('?? ERRO DE AUTENTICAÇÃO - Chave inválida');
                        break;
                    }
                    if (errorJson.error?.type === 'invalid_request_error') {
                        console.log('?? ERRO NA REQUISIÇÃO - Verifique parâmetros');
                    }
                } catch {
                    console.log('Resposta não é JSON');
                }
            }
        } catch (error) {
            console.log('? ERRO DE CONEXÃO:', error.message);
            if (error.code === 'ECONNREFUSED') {
                console.log('?? Problema de conexão com a internet');
            }
        }
    }
    
    // Teste 3: Verificar se consegue acessar o dashboard da Anthropic
    console.log('\n?? VERIFICANDO ACESSO À INTERNET...');
    try {
        const testResponse = await fetch('https://status.anthropic.com', { timeout: 5000 });
        console.log('? Internet funcionando');
    } catch {
        console.log('? Problema de conexão com a internet');
    }
}

testClaudeDirect().catch(console.error);
