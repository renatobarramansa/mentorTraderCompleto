# test-ntsl-validation.ps1
# Teste completo do validador NTSL

Clear-Host
Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  TESTE DE VALIDACAO NTSL" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = "backend"
$validatorFile = "$backendPath\src\utils\ntslValidator.ts"
$anthropicFile = "$backendPath\src\anthropic\anthropic.service.ts"

# ============================================================================
# 1. VERIFICAR ARQUIVOS
# ============================================================================
Write-Host "[1/5] Verificando arquivos..." -ForegroundColor Yellow
Write-Host ""

$filesOk = $true

if (Test-Path $validatorFile) {
    Write-Host "  OK - ntslValidator.ts encontrado" -ForegroundColor Green
    $validatorContent = Get-Content $validatorFile -Raw
} else {
    Write-Host "  ERRO - ntslValidator.ts NAO encontrado" -ForegroundColor Red
    $filesOk = $false
}

if (Test-Path $anthropicFile) {
    Write-Host "  OK - anthropic.service.ts encontrado" -ForegroundColor Green
    $anthropicContent = Get-Content $anthropicFile -Raw
} else {
    Write-Host "  ERRO - anthropic.service.ts NAO encontrado" -ForegroundColor Red
    $filesOk = $false
}

if (-not $filesOk) {
    Write-Host ""
    Write-Host "Arquivos nao encontrados. Verifique a estrutura." -ForegroundColor Red
    Read-Host "Pressione ENTER para sair"
    exit 1
}

# ============================================================================
# 2. ANALISAR VALIDADOR NTSL
# ============================================================================
Write-Host ""
Write-Host "[2/5] Analisando ntslValidator.ts..." -ForegroundColor Yellow
Write-Host ""

# Verificar se tem função de validação
$hasValidateFunction = $validatorContent -match "export\s+(const|function)\s+validate"
$hasErrorMessages = $validatorContent -match "error|Error|invalid"
$hasKeywordCheck = $validatorContent -match "(input|var|begin|end)"
$hasSyntaxCheck = $validatorContent -match "syntax|Syntax"

Write-Host "  Funcao de validacao exportada:" -ForegroundColor Gray
if ($hasValidateFunction) {
    Write-Host "    OK - Funcao 'validate' encontrada" -ForegroundColor Green
} else {
    Write-Host "    ERRO - Funcao 'validate' NAO encontrada" -ForegroundColor Red
}

Write-Host ""
Write-Host "  Verificacoes implementadas:" -ForegroundColor Gray

if ($hasErrorMessages) {
    Write-Host "    OK - Sistema de mensagens de erro" -ForegroundColor Green
} else {
    Write-Host "    AVISO - Sistema de erros pode estar faltando" -ForegroundColor Yellow
}

if ($hasKeywordCheck) {
    Write-Host "    OK - Verificacao de keywords NTSL" -ForegroundColor Green
} else {
    Write-Host "    AVISO - Verificacao de keywords pode estar faltando" -ForegroundColor Yellow
}

if ($hasSyntaxCheck) {
    Write-Host "    OK - Verificacao de sintaxe" -ForegroundColor Green
} else {
    Write-Host "    AVISO - Verificacao de sintaxe pode estar faltando" -ForegroundColor Yellow
}

# ============================================================================
# 3. ANALISAR INTEGRACAO COM ANTHROPIC SERVICE
# ============================================================================
Write-Host ""
Write-Host "[3/5] Analisando integracao com Anthropic..." -ForegroundColor Yellow
Write-Host ""

$importsValidator = $anthropicContent -match "import.*ntslValidator"
$usesValidator = $anthropicContent -match "validate.*ntsl|ntsl.*validate"
$hasSystemPrompt = $anthropicContent -match "system.*prompt|systemPrompt"

Write-Host "  Integracao do validador:" -ForegroundColor Gray

if ($importsValidator) {
    Write-Host "    OK - ntslValidator importado" -ForegroundColor Green
} else {
    Write-Host "    AVISO - Import do validador nao encontrado" -ForegroundColor Yellow
}

if ($usesValidator) {
    Write-Host "    OK - Validador sendo utilizado" -ForegroundColor Green
} else {
    Write-Host "    AVISO - Uso do validador nao detectado" -ForegroundColor Yellow
}

if ($hasSystemPrompt) {
    Write-Host "    OK - System prompt configurado" -ForegroundColor Green
} else {
    Write-Host "    AVISO - System prompt pode estar faltando" -ForegroundColor Yellow
}

# ============================================================================
# 4. EXTRAIR ESTRUTURA DO VALIDADOR
# ============================================================================
Write-Host ""
Write-Host "[4/5] Extraindo estrutura do validador..." -ForegroundColor Yellow
Write-Host ""

# Procurar por validações específicas
$checks = @{
    "Validacao de estrutura input/var/begin/end" = $validatorContent -match "input.*var.*begin.*end"
    "Validacao de funcoes (Media, IFR, etc)" = $validatorContent -match "(Media|IFR|ADX|MACD)"
    "Validacao de operacoes (BuyAtMarket, etc)" = $validatorContent -match "(BuyAtMarket|SellShort)"
    "Validacao de tipos (Integer, Float, etc)" = $validatorContent -match "(Integer|Float|Boolean)"
    "Validacao de pontuacao (ponto e virgula)" = $validatorContent -match "semicolon|;|\."
}

Write-Host "  Tipos de validacao implementadas:" -ForegroundColor Gray
foreach ($check in $checks.GetEnumerator()) {
    if ($check.Value) {
        Write-Host "    OK - $($check.Key)" -ForegroundColor Green
    } else {
        Write-Host "    ? - $($check.Key) (nao detectado)" -ForegroundColor Yellow
    }
}

# ============================================================================
# 5. TESTE PRATICO (SE API ESTIVER RODANDO)
# ============================================================================
Write-Host ""
Write-Host "[5/5] Verificando se a API esta rodando..." -ForegroundColor Yellow
Write-Host ""

$apiPort = 3333
$apiRunning = $false

try {
    $connection = Test-NetConnection -ComputerName localhost -Port $apiPort -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        $apiRunning = $true
        Write-Host "  OK - API rodando na porta $apiPort" -ForegroundColor Green
    } else {
        Write-Host "  INFO - API nao detectada na porta $apiPort" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  INFO - API nao detectada na porta $apiPort" -ForegroundColor Yellow
}

if ($apiRunning) {
    Write-Host ""
    Write-Host "  Testando endpoint de chat..." -ForegroundColor Cyan
    
    # Teste simples de conexão
    try {
        $testPayload = @{
            message = "teste"
            conversationId = "test-validation-001"
        } | ConvertTo-Json

        $headers = @{
            "Content-Type" = "application/json"
        }

        $response = Invoke-WebRequest -Uri "http://localhost:$apiPort/api/chat" -Method POST -Body $testPayload -Headers $headers -TimeoutSec 5 -ErrorAction Stop
        
        Write-Host "    OK - Endpoint responde (Status: $($response.StatusCode))" -ForegroundColor Green
        
    } catch {
        Write-Host "    AVISO - Endpoint nao respondeu ou requer autenticacao" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "  Para testar o validador em acao:" -ForegroundColor Cyan
    Write-Host "    1. Inicie a API: cd backend && npm run start:dev" -ForegroundColor Gray
    Write-Host "    2. Execute este script novamente" -ForegroundColor Gray
}

# ============================================================================
# RESUMO FINAL
# ============================================================================
Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  RESUMO DO TESTE" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

$score = 0
$maxScore = 8

if ($hasValidateFunction) { $score++ }
if ($hasErrorMessages) { $score++ }
if ($hasKeywordCheck) { $score++ }
if ($hasSyntaxCheck) { $score++ }
if ($importsValidator) { $score++ }
if ($usesValidator) { $score++ }
if ($hasSystemPrompt) { $score++ }
if ($apiRunning) { $score++ }

$percentage = [math]::Round(($score / $maxScore) * 100)

if ($percentage -ge 80) {
    Write-Host "  STATUS: EXCELENTE ($score/$maxScore - $percentage%)" -ForegroundColor Green
} elseif ($percentage -ge 60) {
    Write-Host "  STATUS: BOM ($score/$maxScore - $percentage%)" -ForegroundColor Yellow
} else {
    Write-Host "  STATUS: PRECISA MELHORIAS ($score/$maxScore - $percentage%)" -ForegroundColor Red
}

Write-Host ""
Write-Host "  Componentes verificados:" -ForegroundColor Gray
Write-Host "    - Validador NTSL: $(if($hasValidateFunction){'OK'}else{'PENDENTE'})" -ForegroundColor $(if($hasValidateFunction){'Green'}else{'Red'})
Write-Host "    - Integracao Anthropic: $(if($usesValidator){'OK'}else{'PENDENTE'})" -ForegroundColor $(if($usesValidator){'Green'}else{'Yellow'})
Write-Host "    - API Backend: $(if($apiRunning){'RODANDO'}else{'PARADA'})" -ForegroundColor $(if($apiRunning){'Green'}else{'Yellow'})

Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "PROXIMAS ACOES:" -ForegroundColor Yellow
Write-Host ""

if ($score -lt $maxScore) {
    Write-Host "  1. Compartilhe este resultado com o assistente" -ForegroundColor White
    Write-Host "  2. Envie os arquivos para analise detalhada:" -ForegroundColor White
    Write-Host "     - $validatorFile" -ForegroundColor Gray
    Write-Host "     - $anthropicFile" -ForegroundColor Gray
} else {
    Write-Host "  1. Teste manualmente no chat enviando:" -ForegroundColor White
    Write-Host "     'Crie uma estrategia NTSL invalida'" -ForegroundColor Gray
    Write-Host "  2. Verifique se o assistente corrige os erros" -ForegroundColor White
}

Write-Host ""
Read-Host "Pressione ENTER para fechar"