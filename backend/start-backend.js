console.log("=== INICIANDO BACKEND NESTJS ===");
const { spawn } = require("child_process");
const path = require("path");

const backendDir = path.join(__dirname);
const nestProcess = spawn("npm", ["run", "start:dev"], {
    cwd: backendDir,
    stdio: "inherit",
    shell: true
});

nestProcess.on("error", (err) => {
    console.error("Erro ao iniciar NestJS:", err);
});

nestProcess.on("exit", (code) => {
    console.log(`NestJS encerrado com código: ${code}`);
});
