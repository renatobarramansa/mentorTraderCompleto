// Script para testar a integração
async function testIntegration() {
  console.log('🧪 Testando integração ChatInterface → Next.js API → NestJS');
  
  const testData = {
    message: "Teste de conexão com o backend",
    systemPrompt: "Você é o Mentor Trader. Responda com '✅ Conexão estabelecida com sucesso!'",
    conversationId: "test-" + Date.now(),
    isContinuation: false
  };

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Teste bem-sucedido!');
      console.log('Resposta:', data.content?.substring(0, 100) + '...');
    } else {
      const error = await response.json();
      console.error('❌ Teste falhou:', error);
    }
  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

// Execute se rodando diretamente
if (typeof window === 'undefined') {
  testIntegration();
}