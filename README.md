# FinanceApp - Gestão Financeira Pessoal

Uma aplicação web moderna e completa para gestão financeira pessoal, desenvolvida com as melhores tecnologias e práticas do mercado.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748?style=flat-square&logo=prisma)

## ✨ Funcionalidades

### 🔐 Autenticação
- Login e cadastro com email e senha
- Hash de senha com bcrypt
- Sessões com JWT
- Proteção total de rotas privadas
- Redirecionamento automático

### 📊 Dashboard
- Visão geral do mês (ganhos, gastos, saldo)
- Gráficos interativos (barras e pizza)
- Transações recentes
- Metas de investimento
- Alertas de gastos fixos

### 💸 Controle de Gastos
- CRUD completo de despesas
- Categorias personalizadas
- Filtros por data, categoria e tipo
- Exportação para CSV

### 📅 Gastos Fixos
- Despesas recorrentes (mensal, semanal, anual)
- Alertas de vencimento
- Ativação/desativação

### 💰 Controle de Receitas
- Cadastro de ganhos
- Tipos de receita (salário, freelance, etc.)
- Receitas recorrentes

### 🎯 Metas de Investimento
- Criação de metas financeiras
- Barra de progresso
- Prioridades (1-5)
- Prazo e acompanhamento

### 📈 Simulador de Investimentos
- Simulação de crescimento
- Juros simples e compostos
- Gráfico de projeção
- Salvamento de simulações

### ⚙️ Configurações
- Tema claro/escuro
- Gerenciamento de categorias
- Informações do perfil

## 🛠️ Tecnologias

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Componentes:** Shadcn/UI
- **ORM:** Prisma
- **Banco de Dados:** PostgreSQL
- **Autenticação:** NextAuth.js (Auth.js)
- **Validação:** Zod
- **Gráficos:** Recharts
- **Animações:** Framer Motion
- **Formulários:** React Hook Form

## 📦 Instalação

### Pré-requisitos

- Node.js 18+
- PostgreSQL
- npm ou yarn

### Passo a passo

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd finance-manager
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de dados PostgreSQL
DATABASE_URL="postgresql://usuario:senha@localhost:5432/finance_manager?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-super-segura-aqui"

# JWT
JWT_SECRET="outra-chave-secreta-para-jwt"
```

> ⚠️ Gere chaves seguras para produção usando `openssl rand -base64 32`

4. **Configure o banco de dados**
```bash
# Gera o cliente Prisma
npm run db:generate

# Cria as tabelas no banco
npm run db:push

# (Opcional) Abre o Prisma Studio
npm run db:studio
```

5. **Execute o projeto**
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

6. **Acesse a aplicação**

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📁 Estrutura do Projeto

```
├── app/                    # App Router (Next.js 14)
│   ├── (auth)/            # Rotas de autenticação
│   ├── api/               # API Routes
│   └── dashboard/         # Páginas protegidas
├── components/            # Componentes React
│   ├── dashboard/         # Componentes do dashboard
│   ├── expenses/          # Componentes de despesas
│   ├── fixed-expenses/    # Componentes de gastos fixos
│   ├── goals/             # Componentes de metas
│   ├── income/            # Componentes de receitas
│   ├── layout/            # Layout (sidebar, header)
│   ├── providers/         # Providers (tema, sessão)
│   └── ui/                # Componentes UI (shadcn)
├── hooks/                 # Custom hooks
├── lib/                   # Utilitários e configurações
├── prisma/                # Schema do Prisma
├── services/              # Serviços de dados
└── types/                 # Tipos TypeScript
```

## 🔒 Segurança

- **Proteção contra SQL Injection:** Prisma ORM com queries parametrizadas
- **Validação de dados:** Zod em todas as APIs
- **Autenticação:** NextAuth com JWT
- **Middleware:** Proteção de rotas no servidor
- **Hash de senhas:** bcrypt com salt

## 📱 Responsividade

A aplicação é totalmente responsiva:
- Desktop (1280px+)
- Tablet (768px - 1279px)
- Mobile (< 768px)

## 🎨 Temas

- **Tema Claro:** Design limpo com tons claros
- **Tema Escuro:** Modo noturno confortável
- **Tema Sistema:** Segue preferência do SO

## 📊 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Verificação de código
npm run db:generate  # Gera cliente Prisma
npm run db:push      # Sincroniza schema com banco
npm run db:migrate   # Executa migrações
npm run db:studio    # Abre Prisma Studio
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido com 💜 usando Next.js, TypeScript e muito café ☕

