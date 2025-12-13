# test-message-content-indentation.ps1
# Diagnóstico de indentação no componente MessageContent.tsx

Write-Host ""
Write-Host "🔍 DIAGNÓSTICO - Indentação MessageContent.tsx" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Gray

# ============================================================================
# 1. VERIFICAR ESTRUTURA DE ARQUIVOS
# ============================================================================
Write-Host ""
Write-Host "📁 [1/5] Verificando estrutura de arquivos..." -ForegroundColor Yellow

$targetFile = "apps\web\components\chat\MessageContent.tsx"
$relatedFiles = @(
    "apps\web\app\chat\page.tsx",
    "apps\web\components\chat\ChatMessage.tsx",
    "apps\web\lib\api.ts"
)

if (Test-Path $targetFile) {
    Write-Host "   ✅ MessageContent.tsx encontrado" -ForegroundColor Green
    
    $fileContent = Get-Content $targetFile -Raw
    $fileLines = (Get-Content $targetFile).Count
    Write-Host "   📊 Total de linhas: $fileLines" -ForegroundColor Cyan
}
else {
    Write-Host "   ❌ MessageContent.tsx NÃO encontrado em: $targetFile" -ForegroundColor Red
    Write-Host "   💡 Verifique o caminho do arquivo" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "   Arquivos relacionados:" -ForegroundColor Gray
foreach ($file in $relatedFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    }
    else {
        Write-Host "   ⚠️  $file (não encontrado)" -ForegroundColor Yellow
    }
}

# ============================================================================
# 2. ANALISAR COMPONENTE NTSLHighlighter
# ============================================================================
Write-Host ""
Write-Host "🎨 [2/5] Analisando componente NTSLHighlighter..." -ForegroundColor Yellow

if ($fileContent -match "const NTSLHighlighter") {
    Write-Host "   ✅ Componente NTSLHighlighter encontrado" -ForegroundColor Green
    
    # Verificar se preserva espaços/tabs
    $hasWhitespacePreservation = $fileContent -match "white-space:\s*pre"
    $hasTabHandling = $fileContent -match "\\t"
    $hasSpaceSpan = $fileContent -match "space-"
    
    Write-Host ""
    Write-Host "   Análise de preservação de whitespace:" -ForegroundColor Cyan
    
    if ($hasWhitespacePreservation) {
        Write-Host "   • CSS white-space: pre/pre-wrap: ✅" -ForegroundColor Green
    }
    else {
        Write-Host "   • CSS white-space: pre/pre-wrap: ❌" -ForegroundColor Red
    }
    
    if ($hasTabHandling) {
        Write-Host "   • Tratamento de tabs (\t): ✅" -ForegroundColor Green
    }
    else {
        Write-Host "   • Tratamento de tabs (\t): ❌" -ForegroundColor Red
    }
    
    if ($hasSpaceSpan) {
        Write-Host "   • Spans para espaços: ✅" -ForegroundColor Green
    }
    else {
        Write-Host "   • Spans para espaços: ❌" -ForegroundColor Red
    }
}
else {
    Write-Host "   ❌ Componente NTSLHighlighter NÃO encontrado" -ForegroundColor Red
}

# ============================================================================
# 3. ANALISAR TOKENIZAÇÃO
# ============================================================================
Write-Host ""
Write-Host "🔤 [3/5] Analisando lógica de tokenização..." -ForegroundColor Yellow

# Verificar regex de tokenização
if ($fileContent -match "tokenRegex\s*=\s*/(.+?)/g") {
    Write-Host "   ✅ Regex de tokenização encontrada" -ForegroundColor Green
    Write-Host "   📝 Pattern detectado no código" -ForegroundColor Gray
    
    # Verificar se captura espaços
    $capturesSpaces = $fileContent -match "\\s\+"
    
    if ($capturesSpaces) {
        Write-Host "   • Captura espaços (\s+): ✅" -ForegroundColor Green
    }
    else {
        Write-Host "   • Captura espaços (\s+): ❌" -ForegroundColor Red
    }
}
else {
    Write-Host "   ❌ Regex de tokenização NÃO encontrada" -ForegroundColor Red
}

# Verificar tratamento de espaços no processLine
$hasSpaceCheck = $fileContent -match "if\s*\(/\^\\s\+\$/.test\(part\)\)"

Write-Host ""
Write-Host "   Tratamento de espaços brancos:" -ForegroundColor Cyan

if ($hasSpaceCheck) {
    Write-Host "   • Verifica /^\s+$/: ✅" -ForegroundColor Green
}
else {
    Write-Host "   • Verifica /^\s+$/: ❌" -ForegroundColor Red
}

# ============================================================================
# 4. ANALISAR ESTRUTURA HTML DO CodeBlock
# ============================================================================
Write-Host ""
Write-Host "📦 [4/5] Analisando estrutura HTML do CodeBlock..." -ForegroundColor Yellow

# Verificar container do código
$hasMonoFont = $fileContent -match "font-mono"
$hasPreWrap = $fileContent -match "whitespace-pre-wrap"
$hasFlexStructure = $fileContent -match "className=.*?flex"

Write-Host "   Estrutura do bloco de código:" -ForegroundColor Cyan

if ($hasMonoFont) {
    Write-Host "   • Font monospace aplicada: ✅" -ForegroundColor Green
}
else {
    Write-Host "   • Font monospace aplicada: ❌" -ForegroundColor Red
}

if ($hasPreWrap) {
    Write-Host "   • Whitespace-pre-wrap: ✅" -ForegroundColor Green
}
else {
    Write-Host "   • Whitespace-pre-wrap: ⚠️" -ForegroundColor Yellow
}

if ($hasFlexStructure) {
    Write-Host "   • Estrutura flex para linhas: ✅" -ForegroundColor Green
}
else {
    Write-Host "   • Estrutura flex para linhas: ❌" -ForegroundColor Red
}

# Verificar estrutura de linha
if ($fileContent -match "lines\.map\(\(line, lineIndex\)") {
    Write-Host "   ✅ Mapeamento de linhas encontrado" -ForegroundColor Green
    
    # Verificar se cada linha tem container próprio
    $hasLineContainer = $fileContent -match "key=\{lineIndex\}"
    
    if ($hasLineContainer) {
        Write-Host "   • Container por linha (div): ✅" -ForegroundColor Green
    }
    else {
        Write-Host "   • Container por linha (div): ❌" -ForegroundColor Red
    }
    
    # Verificar se linha tem span para conteúdo
    $hasLineSpan = $fileContent -match "flex-1"
    
    if ($hasLineSpan) {
        Write-Host "   • Span flex-1 para conteúdo: ✅" -ForegroundColor Green
    }
    else {
        Write-Host "   • Span flex-1 para conteúdo: ❌" -ForegroundColor Red
    }
}
else {
    Write-Host "   ❌ Mapeamento de linhas NÃO encontrado" -ForegroundColor Red
}

# ============================================================================
# 5. SIMULAÇÃO DE TESTE COM CÓDIGO NTSL
# ============================================================================
Write-Host ""
Write-Host "🧪 [5/5] Simulando processamento de código NTSL..." -ForegroundColor Yellow

$testCode = @"
input
  periodo: Integer = 20;
var
  media: Float;
begin
  media := Media(periodo, Close);
  
  If Close > media Then
    BuyAtMarket(1);
end.
"@

Write-Host ""
Write-Host "   📝 Código de teste:" -ForegroundColor Cyan
Write-Host $testCode -ForegroundColor Gray

# Contar espaços e tabs na primeira linha indentada
$indentedLine = "  periodo: Integer = 20;"
$leadingSpaces = ($indentedLine -replace '\S.*$', '').Length

Write-Host ""
Write-Host "   Análise de indentação:" -ForegroundColor Cyan
Write-Host "   • Linha: '$indentedLine'" -ForegroundColor Gray
Write-Host "   • Espaços iniciais detectados: $leadingSpaces" -ForegroundColor $(if($leadingSpaces -gt 0){'Green'}else{'Red'})

# ============================================================================
# RESUMO E DIAGNÓSTICO FINAL
# ============================================================================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Gray
Write-Host "📊 RESUMO DO DIAGNÓSTICO" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Gray

$issues = @()

if (-not $hasWhitespacePreservation) {
    $issues += "❌ CRÍTICO: CSS não preserva whitespace (falta white-space: pre)"
}

if (-not $hasSpaceCheck) {
    $issues += "❌ CRÍTICO: Regex não está capturando/renderizando espaços"
}

if (-not $hasLineContainer) {
    $issues += "⚠️  ALERTA: Estrutura de linhas pode estar incorreta"
}

if ($issues.Count -eq 0) {
    Write-Host ""
    Write-Host "✅ CONFIGURAÇÃO APARENTEMENTE CORRETA" -ForegroundColor Green
    Write-Host "   Se a indentação não aparece, o problema pode estar em:" -ForegroundColor Yellow
    Write-Host "   1. Tailwind não compilando classes corretas" -ForegroundColor Gray
    Write-Host "   2. Espaços sendo removidos no processamento" -ForegroundColor Gray
    Write-Host "   3. CSS sendo sobrescrito por estilos globais" -ForegroundColor Gray
}
else {
    Write-Host ""
    Write-Host "⚠️  PROBLEMAS ENCONTRADOS:" -ForegroundColor Yellow
    foreach ($issue in $issues) {
        Write-Host "   $issue" -ForegroundColor Red
    }
}

# ============================================================================
# PRÓXIMOS PASSOS RECOMENDADOS
# ============================================================================
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS RECOMENDADOS:" -ForegroundColor Cyan
Write-Host "   1. Execute este script para identificar problemas" -ForegroundColor Gray
Write-Host "   2. Compartilhe o output com o assistente" -ForegroundColor Gray
Write-Host "   3. Aguarde correções específicas baseadas no diagnóstico" -ForegroundColor Gray
Write-Host "   4. Re-execute após aplicar correções" -ForegroundColor Gray

Write-Host ""
Write-Host "✅ Diagnóstico concluído!" -ForegroundColor Green
Write-Host ""