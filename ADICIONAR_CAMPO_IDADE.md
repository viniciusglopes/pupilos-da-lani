# 🔧 ADICIONAR CAMPO IDADE - Pupilos da Lani

## ⚠️ AÇÃO NECESSÁRIA NO SUPABASE

### **1. Acesse o Supabase Admin:**
URL: https://supabase.com/dashboard/project/ljttishwndzkcytkdsrc

### **2. Vá para SQL Editor:**
- Menu lateral → SQL Editor
- Clique em "New Query"

### **3. Execute este SQL:**

```sql
-- Adicionar coluna idade na tabela pessoas
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS idade INTEGER;

-- Adicionar idades de exemplo para os pupilos existentes
UPDATE pessoas SET idade = 8 WHERE nome = 'Nicole Lopes';
UPDATE pessoas SET idade = 12 WHERE nome LIKE '%João Lucas%';
UPDATE pessoas SET idade = 35 WHERE nome LIKE '%Vinicius%';

-- Verificar se funcionou
SELECT nome, idade FROM pessoas WHERE idade IS NOT NULL ORDER BY nome;
```

### **4. Resultado esperado:**
Deve mostrar:
- João Lucas Bueno Lopes: 12
- Nicole Lopes: 8  
- Vinicius Guimarães Lopes: 35

## ✅ APÓS EXECUTAR O SQL

### **HomePage vai mostrar:**
- ✅ Cards pequenos (160px altura)
- ✅ Grid 2-6 colunas responsivo
- ✅ Descrição: Nome + Idade
- ✅ Fotos visíveis (corrigidas)

### **Admin CMS vai:**
- ✅ Salvar dados corretamente
- ✅ Logs detalhados para debug
- ✅ Fallback para arquivo se Supabase falhar

## 🎯 VERIFICAÇÃO FINAL

1. **Executar SQL** no Supabase ☐
2. **Aguardar deploy** (3-5 min) ☐  
3. **Testar homepage** - fotos aparecendo ☐
4. **Testar admin** - textos salvando ☐

**DEPLOY ATUAL**: kt03eicblpj4xnpn8sjman1m (f8e8fe8)