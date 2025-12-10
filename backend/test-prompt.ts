import { getSystemPrompt } from './src/lib/prompts/systemPrompt';

console.log("🧪 Testando importação TypeScript...");
const prompt = getSystemPrompt("João", "intermediario");
console.log("✅ Importação funcionou!");
console.log("📏 Tamanho do prompt:", prompt.length, "caracteres");
console.log("📝 Preview:\n", prompt.substring(0, 200), "...");
