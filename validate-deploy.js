#!/usr/bin/env node

// VALIDAÇÃO PRÉ-DEPLOY - Detecta erros antes de enviar
// Uso: node validate-deploy.js

const fs = require('fs');
const path = require('path');

console.log('🔍 INICIANDO VALIDAÇÃO PRÉ-DEPLOY\n');

let errors = 0;
let warnings = 0;

function logError(file, issue) {
  console.log(`❌ ERRO: ${file} - ${issue}`);
  errors++;
}

function logWarning(file, issue) {
  console.log(`⚠️  AVISO: ${file} - ${issue}`);
  warnings++;
}

// 1. Verificar variáveis duplicadas
function checkDuplicateVars(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const declarations = new Map();
  
  lines.forEach((line, index) => {
    const constMatch = line.match(/const\s+(\w+)\s*=/);
    const letMatch = line.match(/let\s+(\w+)\s*=/);
    const varMatch = line.match(/var\s+(\w+)\s*=/);
    
    const varName = constMatch?.[1] || letMatch?.[1] || varMatch?.[1];
    
    if (varName) {
      if (declarations.has(varName)) {
        logError(filePath, `Variável '${varName}' redeclarada na linha ${index + 1} (primeira: linha ${declarations.get(varName)})`);
      } else {
        declarations.set(varName, index + 1);
      }
    }
  });
}

// 2. Verificar .single() duplicado
function checkDuplicateSingle(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  let singleCount = 0;
  let singleLines = [];
  
  lines.forEach((line, index) => {
    if (line.includes('.single()') && !line.includes('//') && !line.includes('/*')) {
      singleCount++;
      singleLines.push(index + 1);
      
      // Check next few lines for duplicate
      for (let i = 1; i <= 3 && index + i < lines.length; i++) {
        const nextLine = lines[index + i];
        if (nextLine.includes('.single()') && !nextLine.includes('//') && !nextLine.includes('/*')) {
          logError(filePath, `.single() duplicado nas linhas ${index + 1} e ${index + i + 1}`);
          break;
        }
      }
    }
  });
}

// 3. Verificar imports/exports
function checkImportsExports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for unused imports
  const importMatches = content.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g) || [];
  importMatches.forEach(imp => {
    const componentName = imp.match(/import\s+(\w+)/)?.[1];
    if (componentName && !content.includes(`<${componentName}`) && !content.includes(`${componentName}(`)) {
      logWarning(filePath, `Import potencialmente não utilizado: ${componentName}`);
    }
  });
}

// 4. Verificar sintaxe básica TypeScript
function checkTypeScriptSyntax(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for common TS errors
  if (content.includes('Property') && content.includes('does not exist on type')) {
    logError(filePath, 'Possível erro TypeScript detectado no conteúdo');
  }
  
  // Check for missing return types in functions
  const functionMatches = content.match(/export\s+(async\s+)?function\s+\w+\s*\([^)]*\)\s*{/g) || [];
  functionMatches.forEach(func => {
    if (!func.includes(': ') && !func.includes('=> ')) {
      logWarning(filePath, `Função sem tipo de retorno: ${func.split('{')[0].trim()}`);
    }
  });
}

// Scan files
function scanDirectory(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      scanDirectory(fullPath, extensions);
    } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
      console.log(`📁 Verificando: ${fullPath}`);
      
      try {
        checkDuplicateVars(fullPath);
        checkDuplicateSingle(fullPath);
        checkImportsExports(fullPath);
        checkTypeScriptSyntax(fullPath);
      } catch (error) {
        logError(fullPath, `Erro ao processar arquivo: ${error.message}`);
      }
    }
  });
}

// Main execution
try {
  console.log('📂 Verificando arquivos src/...\n');
  scanDirectory('./src');
  
  console.log('\n📊 RESULTADO DA VALIDAÇÃO:');
  console.log(`❌ Erros: ${errors}`);
  console.log(`⚠️  Avisos: ${warnings}`);
  
  if (errors > 0) {
    console.log('\n🚨 DEPLOY BLOQUEADO - Corrija os erros acima!');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('\n✅ Deploy liberado (com avisos)');
    process.exit(0);
  } else {
    console.log('\n✅ Validação passou - Deploy seguro!');
    process.exit(0);
  }
  
} catch (error) {
  console.error('💥 Erro na validação:', error.message);
  process.exit(1);
}