// .node-config.js
// Configuração para UTF-8 no Windows
if (process.platform === 'win32') {
    process.env.NODE_OPTIONS = '--max-old-space-size=4096';
    
    // Forçar UTF-8 no Windows
    if (typeof process.env.NODE_ENV === 'undefined') {
        process.env.NODE_ENV = 'development';
    }
    
    console.log('✅ Configuração Windows UTF-8 aplicada');
}
