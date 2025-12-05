const fs = require('fs');
const path = require('path');

// ========== CONFIGURAÇÕES ==========
const INCLUDE_EXTENSIONS = ['.tsx', '.ts', '.json', '.prisma', '.yml', '.yaml', '.env'];

const EXCLUDE_DIRS = [
  'node_modules', '.next', 'dist', 'build', '.git', 
  '.turbo', 'coverage', '.vscode', '.idea'
];

const EXCLUDE_FILES = [
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  '.gitignore', '.eslintrc', '.prettierrc', 'tsconfig.json',
  'next.config.js', 'next.config.mjs', 'postcss.config.js',
  'tailwind.config.js', 'tailwind.config.ts', 'jest.config.js',
  'README.md', '.dockerignore', 'Dockerfile'
];

// Pastas/arquivos importantes que sempre aparecem
const ALWAYS_SHOW = [
  'apps', 'prisma', 'docker', 'src', 'app', 
  'package.json', 'schema.prisma', 'docker-compose.yml',
  '.env', 'turbo.json', 'main.ts', 'app.module.ts'
];

// ========== FUNÇÃO PRINCIPAL ==========
function shouldInclude(file, filePath, stats) {
  // Sempre mostra pastas/arquivos importantes
  if (ALWAYS_SHOW.includes(file)) return true;
  
  // Ignora arquivos de configuração do sistema
  if (EXCLUDE_FILES.includes(file)) return false;
  
  // Se for diretório, verifica se não está na lista de exclusão
  if (stats.isDirectory()) {
    return !EXCLUDE_DIRS.includes(file);
  }
  
  // Se for arquivo, verifica extensão
  const ext = path.extname(file);
  return INCLUDE_EXTENSIONS.includes(ext);
}

function generateTree(dir, prefix = '', isRoot = true, depth = 0, maxDepth = 10) {
  if (depth > maxDepth) return '';
  
  let output = '';
  
  if (isRoot) {
    output += `\n${path.basename(dir)}/\n`;
  }

  let files;
  try {
    files = fs.readdirSync(dir);
  } catch (err) {
    return '';
  }

  // Ordena: pastas primeiro, depois arquivos
  files.sort((a, b) => {
    const aPath = path.join(dir, a);
    const bPath = path.join(dir, b);
    const aIsDir = fs.statSync(aPath).isDirectory();
    const bIsDir = fs.statSync(bPath).isDirectory();
    
    if (aIsDir && !bIsDir) return -1;
    if (!aIsDir && bIsDir) return 1;
    return a.localeCompare(b);
  });

  // Filtra arquivos relevantes
  const relevantFiles = files.filter(file => {
    const filePath = path.join(dir, file);
    try {
      const stats = fs.statSync(filePath);
      return shouldInclude(file, filePath, stats);
    } catch {
      return false;
    }
  });

  relevantFiles.forEach((file, index) => {
    const filePath = path.join(dir, file);
    const isLast = index === relevantFiles.length - 1;
    let stats;
    
    try {
      stats = fs.statSync(filePath);
    } catch {
      return;
    }

    const connector = isLast ? '└── ' : '├── ';
    
    if (stats.isDirectory()) {
      output += `${prefix}${connector}${file}/\n`;
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      output += generateTree(filePath, newPrefix, false, depth + 1, maxDepth);
    } else {
      output += `${prefix}${connector}${file}\n`;
    }
  });

  return output;
}

// ========== EXECUÇÃO ==========
console.log('🌲 Gerando estrutura do projeto...\n');

const tree = generateTree('.');
console.log(tree);

// Salva em arquivo
fs.writeFileSync('project-structure.txt', tree);
console.log('\n✅ Estrutura salva em: project-structure.txt');