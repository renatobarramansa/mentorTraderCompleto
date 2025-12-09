const { spawn } = require('child_process');
const fs = require('fs');

console.log('=== INICIANDO BACKEND NESTJS ===');

const logStream = fs.createWriteStream('nest-logs.txt', { flags: 'a' });
logStream.write('\n' + '='.repeat(50) + '\n');
logStream.write('Iniciado em: ' + new Date().toISOString() + '\n');

const nest = spawn('npm', ['run', 'start:dev'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true
});

nest.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);
    logStream.write(output);
    
    if (output.includes('🚀 Backend NestJS rodando em:')) {
        console.log('\n✅ BACKEND INICIADO COM SUCESSO!');
        console.log('Endpoint: http://localhost:3333/api/chat');
    }
    
    if (output.includes('ERROR') || output.includes('Error:')) {
        console.log('\n❌ ERRO DETECTADO NO BACKEND');
    }
});

nest.stderr.on('data', (data) => {
    const error = data.toString();
    console.error('ERRO:', error);
    logStream.write('ERRO: ' + error);
});

nest.on('close', (code) => {
    console.log(\`Processo encerrado com código: \${code}\`);
    logStream.write(\`Processo encerrado com código: \${code}\n\`);
    logStream.end();
});

// Manter o processo rodando
process.stdin.resume();
