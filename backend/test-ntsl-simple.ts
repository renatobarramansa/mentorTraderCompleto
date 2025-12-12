// backend/test-ntsl-simple.ts
// TESTE SIMPLIFICADO - sem dependências

console.log('🧪 TESTE SIMPLIFICADO DE REGEX NTSL');
console.log('='.repeat(60));

// Testar a regex atualizada
const regex = /(^|\n)(\/\/[^\n]*\n)?((?:input|var|begin)[\s\S]*?end\.)(\n|$)/gi;

const testCases = [
  {
    name: 'Código com input',
    text: `Explicação:
input
    Periodo(20);
end.
Mais texto.`,
    shouldMatch: true
  },
  {
    name: 'Código com var',
    text: `Veja:
var
    rMedia: Float;
begin
    rMedia := Media(20, Close);
end.`,
    shouldMatch: true
  },
  {
    name: 'Código com begin',
    text: `Simples:
begin
    BuyAtMarket(1);
end.`,
    shouldMatch: true
  },
  {
    name: 'Código com comentário',
    text: `// Estrategia
input
    Periodo(20);
end.`,
    shouldMatch: true
  },
  {
    name: 'Apenas texto',
    text: 'Isso é apenas texto sobre trading.',
    shouldMatch: false
  },
  {
    name: 'Código sem end.',
    text: `input
    Periodo(20);`,
    shouldMatch: false
  }
];

console.log('\n📋 Testando regex:');
console.log(`Pattern: ${regex}\n`);

testCases.forEach((testCase, index) => {
  const matches = [...testCase.text.matchAll(regex)];
  const found = matches.length > 0;
  const passed = found === testCase.shouldMatch;
  
  console.log(`${passed ? '✅' : '❌'} Teste ${index + 1}: ${testCase.name}`);
  console.log(`   Esperado: ${testCase.shouldMatch ? 'ENCONTRAR' : 'NÃO ENCONTRAR'}`);
  console.log(`   Resultado: ${found ? 'ENCONTRADO' : 'NÃO ENCONTRADO'} (${matches.length} matches)`);
  
  if (matches.length > 0) {
    const code = matches[0][3];
    console.log(`   Código encontrado (${code.length} chars): ${code.substring(0, 30)}...`);
  }
  
  console.log('');
});

console.log('='.repeat(60));
console.log('🧪 Testando função de adicionar backticks:');

// Função simulada para adicionar backticks
function addBackticksToNTSL(text: string): string {
  const pattern = /(^|\n)(\/\/[^\n]*\n)?((?:input|var|begin)[\s\S]*?end\.)(\n|$)/gi;
  let result = text;
  let match;
  
  // Processar do final para o início
  const matches: Array<{code: string, start: number, end: number}> = [];
  
  while ((match = pattern.exec(text)) !== null) {
    matches.push({
      code: match[0],
      start: match.index,
      end: pattern.lastIndex
    });
  }
  
  // Aplicar na ordem reversa
  for (let i = matches.length - 1; i >= 0; i--) {
    const { code, start, end } = matches[i];
    const before = result.substring(0, start);
    const after = result.substring(end);
    
    // Verificar se já tem backticks
    if (!code.includes('```')) {
      result = `${before}\n\`\`\`ntsl\n${code.trim()}\n\`\`\`\n${after}`;
    }
  }
  
  return result;
}

// Testar a função
const testText = `Aqui está uma estratégia:

input
    Periodo(20);
    TakeProfit(6);
    StopLoss(3);

var
    rMedia: Float;

begin
    rMedia := Media(Periodo, Close);
    if Close > rMedia then BuyAtMarket(1);
end.

Funciona bem!`;

console.log('\n📥 Texto original (sem backticks):');
console.log(testText.substring(0, 100) + '...');

const processed = addBackticksToNTSL(testText);

console.log('\n📤 Texto processado (com backticks):');
console.log(processed.substring(0, 150) + '...');

console.log('\n📊 Verificação:');
console.log(`- Tem \`\`\`ntsl? ${processed.includes('```ntsl') ? '✅ SIM' : '❌ NÃO'}`);
console.log(`- Tem input? ${processed.includes('input') ? '✅ SIM' : '❌ NÃO'}`);
console.log(`- Tem end.? ${processed.includes('end.') ? '✅ SIM' : '❌ NÃO'}`);

console.log('\n✅ Teste completo!');