# 🌟 Pupilos da Lani

Portal profissional para modelos em Minas Gerais - Conectando talentos com oportunidades.

## 🚀 Características

- ✅ **Next.js 14** com App Router e TypeScript
- ✅ **Tailwind CSS** para estilização responsiva
- ✅ **Supabase** para banco de dados e storage
- ✅ **LGPD Compliant** - Em conformidade com a Lei Geral de Proteção de Dados
- ✅ **Upload de fotos e vídeos** profissionais
- ✅ **Sistema de parcerias** exclusivas
- ✅ **Interface responsiva** para mobile e desktop

## 📱 Páginas Criadas

- **`/`** - Lista todos os modelos ativos
- **`/parceria`** - Apenas modelos parceiros exclusivos
- **`/login`** - Acesso administrativo
- **`/admin/cadastro`** - Cadastro de novos modelos
- **`/privacidade`** - Política de Privacidade (LGPD)

## 🔧 Setup Rápido

### 1. Clonar e Instalar

\`\`\`bash
git clone <repo-url>
cd pupilos-da-lani
npm install
\`\`\`

### 2. Configurar Supabase

1. Vá em [https://supabase.com](https://supabase.com)
2. Crie um novo projeto (região São Paulo)
3. Copie as credenciais

### 3. Configurar Ambiente

Crie o arquivo \`.env.local\`:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Admin Configuration
NEXT_PUBLIC_ADMIN_PASSWORD=sua-senha-super-segura
\`\`\`

### 4. Criar Banco de Dados

1. Abra o **SQL Editor** no Supabase
2. Copie o conteúdo de \`SCHEMA_BANCO_DADOS.sql\`
3. Execute o SQL
4. Crie os buckets de storage:
   - Bucket: \`fotos\` (público)
   - Bucket: \`videos\` (público)

### 5. Executar Localmente

\`\`\`bash
npm run dev
\`\`\`

Acesse: [http://localhost:3000](http://localhost:3000)

## 📊 Estrutura do Banco

### Tabela \`pessoas\`
- Informações pessoais e profissionais
- Medidas corporais
- Localização e especialidades
- Controle de consentimento (LGPD)
- Flag de parceria exclusiva

### Tabela \`fotos\`
- Upload de fotos profissionais
- Sistema de foto principal
- Ordenação customizada

### Tabela \`videos\`
- Upload de vídeos de portfólio
- Sistema de vídeo principal
- Ordenação customizada

## 🔐 LGPD - Conformidade

### ✅ Dados Permitidos
- Nome, altura, medidas corporais
- Cor dos olhos/cabelo
- Especialidades profissionais
- Localização (cidade/estado)
- Instagram público
- Email/WhatsApp (COM consentimento)
- Fotos/vídeos de portfólio

### ❌ Dados Proibidos
- CPF/RG
- Data de nascimento completa
- Endereço residencial
- Dados de saúde/financeiros
- Reconhecimento facial

### 📋 Controle de Consentimento
- Campo \`consentimento_contato\` obrigatório
- Data de consentimento registrada
- Possibilidade de revogação a qualquer momento

## 🌍 Deploy

### Opção 1: Vercel (Recomendado)
\`\`\`bash
npm i -g vercel
vercel
\`\`\`

### Opção 2: Docker + Coolify
\`\`\`dockerfile
FROM node:20-slim
WORKDIR /app
COPY . .
RUN npm ci && npm run build
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

### Opção 3: Railway
1. Conecte seu repositório
2. Configure as variáveis de ambiente
3. Deploy automático

## 🛠️ Desenvolvimento

### Estrutura de Arquivos
\`\`\`
src/
├── app/                 # App Router pages
├── components/          # Componentes React
├── lib/                # Utilitários (Supabase client)
├── types/              # Tipos TypeScript
└── styles/             # Estilos globais
\`\`\`

### Comandos Úteis
\`\`\`bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Verificar código
\`\`\`

## 📝 TODO

- [ ] Sistema de autenticação completo
- [ ] Upload direto para Supabase Storage
- [ ] Página individual de cada modelo
- [ ] Sistema de busca e filtros
- [ ] Dashboard administrativo completo
- [ ] Sistema de notificações
- [ ] Integração com redes sociais
- [ ] Analytics e métricas

## 🆘 Troubleshooting

**Erro ao fazer upload?**
→ Verifique se os buckets estão criados no Supabase

**Página branca após login?**
→ Abra DevTools (F12) e verifique o console

**Variáveis não funcionam?**
→ Reinicie o servidor após editar \`.env.local\`

**Vídeo não carrega?**
→ Use formato MP4 e máximo 100MB

**Qual minha senha de admin?**
→ Está em \`NEXT_PUBLIC_ADMIN_PASSWORD\` no \`.env.local\`

## 📄 Licença

Este projeto está licenciado sob a MIT License.

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit suas mudanças (\`git commit -m 'Add AmazingFeature'\`)
4. Push para a branch (\`git push origin feature/AmazingFeature\`)
5. Abra um Pull Request

---

**Desenvolvido com ❤️ em Minas Gerais**

*Em conformidade com a LGPD - Lei Geral de Proteção de Dados*# Force deploy Tue Mar 31 20:58:31 UTC 2026
