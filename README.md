# CCBlog - Backend 🚀

O **CCBlog** é uma plataforma robusta de gestão acadêmica e blog, desenvolvida para instituições de ensino superior, com foco em cursos de graduação como Ciência da Computação. O backend fornece APIs completas para gerenciamento de disciplinas, horários, matrículas, sistema de blog com notificações em tempo real e integração com IA generativa para suporte acadêmico.

## 🎯 Visão Geral

### Objetivo

Criar uma solução integrada que combine:

- **Gestão Acadêmica**: Organização de disciplinas, pré-requisitos, horários e matrículas
- **Plataforma de Blog**: Publicação de notícias e conteúdo educacional
- **Sistema de Notificações**: Comunicação em tempo real com alunos via WebSocket
- **Suporte Inteligente**: Chatbot IA para dúvidas acadêmicas e metadados automáticos

## 🏗️ Arquitetura do Sistema

### Padrão de Arquitetura: **Layered Architecture (MVC)**

```
┌─────────────┐
│   Routes    │ ← Define endpoints HTTP
└──────┬──────┘
       │
┌──────▼──────────────────┐
│   Middlewares           │ ← Autenticação, validação, rate limiting
└──────┬───────────────────┘
       │
┌──────▼──────────────────┐
│   Controllers           │ ← Lógica de roteamento e validação de entrada
└──────┬───────────────────┘
       │
┌──────▼──────────────────┐
│   Services              │ ← Regras de negócio
└──────┬───────────────────┘
       │
┌──────▼──────────────────┐
│   Repositories          │ ← Acesso ao banco de dados (Prisma)
└──────┬───────────────────┘
       │
┌──────▼──────────────────┐
│   PostgreSQL Database   │ ← Persistência de dados
└─────────────────────────┘
```

### Fluxo de Requisição

1. **Route** recebe requisição HTTP
2. **Middleware** valida autenticação, autorização e rate limiting
3. **Controller** processa entrada e chama serviços
4. **Service** executa lógica de negócio
5. **Repository** interage com banco de dados via Prisma
6. **Response** retorna resultado

## 🛠️ Stack Tecnológico

### Backend

| Tecnologia     | Versão | Propósito                    |
| -------------- | ------ | ---------------------------- |
| **Node.js**    | 18+    | Runtime JavaScript           |
| **Express.js** | 5.1.0  | Framework web                |
| **TypeScript** | 5.9.3  | Tipagem estática             |
| **Prisma**     | 7.2.0  | ORM e gerenciamento de banco |
| **PostgreSQL** | Latest | Banco de dados relacional    |

### Autenticação e Segurança

| Tecnologia             | Propósito                               |
| ---------------------- | --------------------------------------- |
| **JWT (jsonwebtoken)** | Tokens de sessão com expiração de 1 dia |
| **Bcrypt**             | Hashing seguro de senhas (10 rounds)    |
| **Token Blacklist**    | Logout seguro e invalidação de tokens   |

### Integrações Externas

| Serviço              | Propósito                                                |
| -------------------- | -------------------------------------------------------- |
| **Google Gemini AI** | Sugestão de metadados e respostas a perguntas acadêmicas |
| **Cloudinary**       | Hospedagem e otimização de imagens                       |
| **Resend**           | Envio de e-mails                                         |

### Desenvolvimento

| Tecnologia    | Propósito                                       |
| ------------- | ----------------------------------------------- |
| **Socket.io** | Comunicação bidirecional em tempo real          |
| **Multer**    | Processamento de uploads                        |
| **Zod**       | Validação de schemas de dados                   |
| **Node-cron** | Agendamento de jobs (ex: envio de notificações) |
| **CORS**      | Controle de acesso entre domínios               |
| **Dotenv**    | Gerenciamento de variáveis de ambiente          |

## 📋 Funcionalidades Detalhadas

### 1. 🔐 Autenticação e Autorização

#### Features

- ✅ Login com email/senha
- ✅ Geração de JWT com expiração de 1 dia
- ✅ Logout com invalidação de token (blacklist)
- ✅ Alteração de senha com validação de senha atual
- ✅ Sistema de roles: ADMIN, TEACHER, STUDENT
- ✅ Middlewares de permissão por papel

#### Decisões Técnicas

- **JWT sobre Session**: JWT é stateless, escalável e ideal para APIs RESTful
- **Token Blacklist em Memória**: Para MVP/desenvolvimento. Em produção, usar Redis para distribuído
- **Expiração 1 dia**: Equilíbrio entre segurança e UX (sem renovação frequente)
- **Bcrypt 10 rounds**: Padrão da indústria com performance aceitável

#### Endpoints

```
POST   /auth/login                 → Autenticar usuário
POST   /auth/change-password       → Alterar senha
POST   /auth/logout                → Logout e invalidar token
```

---

### 2. 👥 Gestão de Usuários

#### Features

- ✅ Cadastro de usuários com validação de email
- ✅ Listagem paginada de usuários
- ✅ Busca e filtros por role
- ✅ Edição de perfil
- ✅ Exclusão de conta
- ✅ Três tipos de usuários: ADMIN, TEACHER, STUDENT

#### Decisões Técnicas

- **UUID para ID**: Melhor segurança que auto-increment
- **Email Único**: Chave natural para login
- **Soft Delete (opcional)**: Preservar histórico de dados
- **Paginação**: Escalabilidade para grandes volumes de usuários

#### Endpoints

```
GET    /user                       → Perfil do usuário autenticado
GET    /user/list                  → Listar usuários (paginado)
PUT    /user/:id                   → Atualizar usuário
DELETE /user/:id                   → Deletar usuário
GET    /user/search                → Buscar por nome/email
```

---

### 3. 📚 Gestão Acadêmica

#### 3.1 Disciplinas

**Features:**

- ✅ Cadastro de disciplinas com código único
- ✅ Definição de períodos (1-9) e carga horária
- ✅ Atribuição de professor responsável
- ✅ Material educacional (URLs)
- ✅ Pré-requisitos complexos entre disciplinas
- ✅ Horários/cronograma associados

**Decisões Técnicas:**

- **Períodos 1-9**: Comum em cursos de 4.5 anos
- **Prerequisitos Many-to-Many**: Tabela de junção `DisciplinePrerequisite`
- **Cascata Delete**: Ao deletar disciplina, remove horários e matrículas associadas

#### 3.2 Horários/Cronograma

**Features:**

- ✅ Definição de dias e horas das aulas
- ✅ Associação com disciplina
- ✅ Suporte a múltiplos horários por disciplina

**Schema:**

```typescript
Schedule {
  dayOfWeek: number        // 0-6 (domingo-sábado)
  startTime: string        // "HH:mm" ex: "08:00"
  endTime: string          // "HH:mm" ex: "10:00"
  discipline: Discipline
}
```

#### 3.3 Matrículas

**Features:**

- ✅ Inscrição de alunos em disciplinas
- ✅ Validação de pré-requisitos
- ✅ Rastreamento de status (ENROLLED, PASSED)
- ✅ Histórico por período

**Decisões Técnicas:**

- **Período Obrigatório**: Rastrear quando o aluno se matriculou
- **Status Enum**: ENROLLED (ativo), PASSED (aprovado)
- **Unique Constraint**: Um aluno não pode se matricular 2x na mesma disciplina no mesmo período

#### Endpoints

```
GET    /discipline                 → Listar disciplinas
POST   /discipline                 → Criar disciplina (ADMIN/TEACHER)
GET    /discipline/:id             → Detalhes da disciplina
PUT    /discipline/:id             → Atualizar disciplina
DELETE /discipline/:id             → Deletar disciplina
POST   /discipline/:id/prerequisite → Adicionar pré-requisito
GET    /discipline/:id/schedule    → Horários da disciplina

GET    /enrollment                 → Listar matrículas do aluno
POST   /enrollment                 → Matricular em disciplina
GET    /enrollment/:id             → Detalhes da matrícula
PUT    /enrollment/:id             → Atualizar status de matrícula
```

---

### 4. 📝 Sistema de Blog

#### Features

- ✅ Criação, edição e exclusão de posts (CRUD)
- ✅ Publicação com controle (draft/publicado)
- ✅ Categorização de posts
- ✅ Upload de imagens para capas via Cloudinary
- ✅ Contador de visualizações
- ✅ Timestamps de criação/atualização
- ✅ Associação com autor (usuário)

#### Decisões Técnicas

- **Slug Único**: Para URLs amigáveis em vez de IDs
- **Cloudinary**: Hospedagem de imagens escalável e otimização automática
- **Multer + Cloudinary Storage**: Upload direto para Cloudinary, sem passar por memória local
- **Published Flag**: Controle de draft/publicação

#### Endpoints

```
GET    /post                       → Listar posts (paginado, filtrado por categoria)
POST   /post                       → Criar post (ADMIN/TEACHER)
GET    /post/:id                   → Detalhes do post
PUT    /post/:id                   → Editar post
DELETE /post/:id                   → Deletar post
GET    /post/slug/:slug            → Buscar por slug
GET    /post/search                → Buscar posts
POST   /post/:id/view              → Registrar visualização
```

#### 4.1 Categorias

**Features:**

- ✅ Categorias para organizar posts
- ✅ Slug único para URLs
- ✅ Descrição opcional

#### Endpoints

```
GET    /category                   → Listar categorias
POST   /category                   → Criar categoria (ADMIN)
PUT    /category/:id               → Atualizar categoria
DELETE /category/:id               → Deletar categoria
```

---

### 5. 🔔 Sistema de Notificações

#### Features

- ✅ Notificações em tempo real via WebSocket
- ✅ Persistência de notificações no banco
- ✅ Rastreamento de leitura por usuário
- ✅ Suporte a notificações de novo post
- ✅ Job agendado para envio de notificações diárias de aulas
- ✅ Integração com Socket.io

#### Decisões Técnicas

- **Modelo Separado NotificationRead**: Permite ratrear qual usuário leu qual notificação
- **Socket.io Emits**: Comunicação em tempo real com baixa latência
- **Rooms por Role**: Notificações segmentadas (ex: "students" room)
- **Node-cron**: Agendamento de jobs sem dependências externas

#### Fluxo

```
1. Novo post é criado
2. NotificationService.notifyNewPost() é chamado
3. Cria registro em Notification table
4. Cria NotificationRead para cada STUDENT
5. Emite evento via Socket.io para room "students"
```

#### Endpoints

```
GET    /notifications              → Listar notificações do usuário
GET    /notifications/unread       → Notificações não lidas
PUT    /notifications/:id/read     → Marcar como lida
DELETE /notifications/:id          → Deletar notificação
GET    /cron/send-daily-classes    → Triggar job manual de envio diário
```

---

### 6. 🤖 Sistema de IA Generativa

#### Features

- ✅ Sugestão automática de metadados para posts (SEO)
  - Meta description (160 caracteres)
  - Keywords/tags (5-10 palavras)
- ✅ Chatbot acadêmico para responder dúvidas
  - Contexto de disciplinas, professores e grade curricular
  - Histórico de conversas
  - Respostas personalizadas baseadas em curso do aluno

#### Decisões Técnicas

- **Google Gemini AI**: Modelo gratuito "gemini-3.1-flash-lite-preview"
  - Rápido e eficiente para MVP
  - Menos custo que GPT-4
- **Prompt Engineering**: Prompts estruturados em português
- **Histórico em Memória**: Suporta conversas contínuas no escopo da sessão

#### Endpoints

```
POST   /ai/suggest-metadata        → Gerar metadados para post
POST   /ai/ask                     → Fazer pergunta ao chatbot acadêmico
```

#### Exemplo de Response (Metadados)

```json
{
  "description": "Aprenda os fundamentos de algoritmos essenciais para programação...",
  "tags": ["algoritmos", "programação", "estrutura-de-dados", "complexidade"]
}
```

---

### 7. 📊 Dashboard

#### Features

- ✅ Estatísticas gerais do sistema
  - Total de usuários, disciplinas, posts
  - Alunos matriculados
  - Posts publicados
  - Distribuição de alunos por período

#### Endpoints

```
GET    /dashboard/stats            → Estatísticas gerais
GET    /dashboard/enrollment-stats → Estatísticas de matrículas
GET    /dashboard/posts-stats      → Estatísticas de posts
```

---

### 8. 📤 Upload de Imagens

#### Features

- ✅ Upload de imagens para posts
- ✅ Armazenamento em Cloudinary
- ✅ Validação de tipo de arquivo
- ✅ Otimização automática

#### Decisões Técnicas

- **Multer + Cloudinary Storage**: Plugin que conecta Multer ao Cloudinary
- **Validação MIME Type**: Apenas JPEG, PNG, WebP
- **Limite de Tamanho**: 10MB por imagem

#### Endpoints

```
POST   /upload                     → Upload de imagem
GET    /upload/test                → Teste de conexão
```

---

### 9. 🛡️ Middleware de Segurança

#### Rate Limiting

- **Limite**: 100 requisições por 15 minutos por usuário
- **Implementação**: Em memória (MVP). Considerar Redis em produção
- **Identificador**: User ID ou IP

#### Audit Log

- Registra mudanças importantes (criação/edição/deleção)
- Rastreia quem fez o que

#### Ownership Validation

- Garante que usuários só modificam seus próprios recursos

#### Token Blacklist

- Logout efetivo invalidando JWT

## 🗄️ Modelo de Dados

### Diagrama Entidade-Relacionamento

```
┌─────────────┐        ┌──────────────┐
│    User     │        │  Category    │
├─────────────┤        ├──────────────┤
│ id (UUID)   │        │ id (UUID)    │
│ name        │        │ name         │
│ email       │◄───────│ slug         │
│ password    │   1:N  │ description  │
│ role        │        └──────────────┘
│ createdAt   │               ▲
│ updatedAt   │               │
└─────────────┘               │
      ▲ ▲ ▲                   │
      │ │ └───────────────────┘
      │ │                  (Post)
      │ └─ Discipline
      │    - teaches
      │    - enrolls
      │
      └─ Post
         - author

┌──────────────────┐      ┌─────────────┐
│     Post         │      │ Discipline  │
├──────────────────┤      ├─────────────┤
│ id (UUID)        │  1:N │ id (UUID)   │
│ title            │◄─────│ name        │
│ slug             │      │ code        │
│ description      │      │ period      │
│ content          │      │ workload    │
│ published        │      │ teacherId   │
│ views            │      │ createdAt   │
│ authorId         │      │ updatedAt   │
│ categoryId       │      └─────────────┘
│ createdAt        │            ▲
│ updatedAt        │            │ (N:M)
└──────────────────┘      ┌──────────────────┐
       │ (1:N)            │DisciplinePrereq  │
       │                  ├──────────────────┤
       └─► Notification   │disciplineId      │
           - type         │prerequisiteId    │
           - title        └──────────────────┘
           - message
           - postId

┌─────────────────┐       ┌──────────────────┐
│    Schedule     │       │   Enrollment     │
├─────────────────┤       ├──────────────────┤
│ id (UUID)       │       │ id (UUID)        │
│ disciplineId    │ 1:N   │ studentId        │
│ dayOfWeek       │◄──────│ disciplineId      │
│ startTime       │       │ period           │
│ endTime         │       │ status (ENUM)    │
└─────────────────┘       │ createdAt        │
                          └──────────────────┘

┌──────────────────────┐
│ NotificationRead     │
├──────────────────────┤
│ id (UUID)            │
│ userId       (FK)    │
│ notificationId (FK)  │
│ read (Boolean)       │
└──────────────────────┘
```

### Enums

```typescript
enum Role {
  ADMIN      // Acesso total, gerencia tudo
  TEACHER    // Pode criar disciplinas, posts, ver matrículas
  STUDENT    // Acesso a disciplinas, posts, próprias matrículas
}

enum EnrollmentStatus {
  ENROLLED   // Aluno está matriculado/cursando
  PASSED     // Aluno passou/completou
}
```

## 🚀 Como Iniciar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [Docker](https://www.docker.com/) e Docker Compose
- Gerenciador de pacotes (npm, yarn ou pnpm)
- Contas em serviços externos:
  - [Cloudinary](https://cloudinary.com/) (imagens)
  - [Google Cloud](https://cloud.google.com/) (Gemini API)
  - [Resend](https://resend.com/) (e-mails)

### Guia de Instalação Passo a Passo

#### 1️⃣ Clonar o repositório

```bash
git clone https://github.com/debs-veras/ccblog-be.git
cd ccblog-be
```

#### 2️⃣ Configurar variáveis de ambiente

Copie `.env.example` para `.env` e preencha com suas credenciais:

```bash
cp .env.example .env
```

**Variáveis obrigatórias:**

```env
# Servidor
PORT=3000

# Banco de Dados PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/ccblog_db"

# Autenticação JWT
JWT_SECRET="sua-chave-super-secreta-min-32-caracteres"

# Cloudinary (Upload de Imagens)
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=seu-api-secret

# Google Gemini AI (Opcional, para IA)
GOOGLE_API_KEY=sua-google-api-key

# Resend (Opcional, para emails)
RESEND_API_KEY=sua-resend-api-key
```

**Onde obter as credenciais:**

- **Cloudinary**: https://cloudinary.com/console → Settings
- **Google API**: https://console.cloud.google.com/ → Gemini API
- **Resend**: https://resend.com/ → API Keys

> [!TIP]
> Para testes locais, você pode deixar variáveis vazias (GOOGLE_API_KEY, RESEND_API_KEY) por enquanto

#### 3️⃣ Iniciar banco de dados com Docker

```bash
docker-compose up -d
```

**Verificar se está rodando:**

```bash
docker ps
```

Deve aparecer um container `postgres` rodando.

#### 4️⃣ Instalar dependências

```bash
pnpm install
# ou
npm install
```

#### 5️⃣ Executar migrações do Prisma

```bash
npx prisma migrate dev
```

Isso irá:

- Criar o schema no banco
- Gerar tipos TypeScript
- Aplicar todas as migrações

#### 6️⃣ Popular banco de dados (Seed) - Opcional

Cria dados de teste incluindo admin user:

```bash
npm run seed
```

**Usuário padrão criado:**

- Email: `admin@blogtech.com`
- Senha: `admin123`

> [!IMPORTANT]
> **⚠️ AVISO DE SEGURANÇA**
>
> - Mude a senha após login em PRODUÇÃO
> - Disabilite ou adapte o seed para produção
> - Guarde o JWT_SECRET de forma segura

#### 7️⃣ Iniciar servidor em desenvolvimento

```bash
npm run dev
```

**Output esperado:**

```
🚀 rodando na porta 3000
```

✅ **Servidor está rodando em `http://localhost:3000`**

#### 8️⃣ Testar a API

Use Postman, Insomnia ou curl:

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@blogtech.com","password":"admin123"}'
```

Resposta:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "Admin",
    "email": "admin@blogtech.com",
    "role": "ADMIN"
  }
}
```

**Use o token para requisições autenticadas:**

```bash
curl -X GET http://localhost:3000/user \
  -H "Authorization: Bearer SEU_TOKEN"
```

## 📚 Documentação de Endpoints

### Padrão de Respostas

**Sucesso (200-201):**

```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso"
}
```

**Erro (4xx-5xx):**

```json
{
  "success": false,
  "error": "Mensagem de erro",
  "statusCode": 400
}
```

### 🔐 Autenticação

```http
POST /auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "senha123"
}
```

---

### 👥 Usuários

```http
GET /user
Authorization: Bearer <token>
```

```http
GET /user/list?page=1&limit=10
Authorization: Bearer <token>
```

---

### 📚 Disciplinas

```http
GET /discipline
GET /discipline/:id
POST /discipline
  Authorization: Bearer <token>
  Content-Type: application/json
  {
    "name": "Estrutura de Dados",
    "code": "CC101",
    "period": 2,
    "workload": 60
  }
```

---

### 📝 Posts

```http
GET /post?page=1&limit=10
GET /post/:id
POST /post
  Authorization: Bearer <token>
  Content-Type: application/json
  {
    "title": "Novo Post",
    "content": "Conteúdo...",
    "categoryId": "uuid",
    "published": true
  }
```

---

### 🔔 Notificações

```http
GET /notifications
  Authorization: Bearer <token>

PUT /notifications/:id/read
  Authorization: Bearer <token>
```

---

### 🤖 IA

```http
POST /ai/suggest-metadata
Content-Type: application/json

{
  "title": "Algoritmos e Estruturas de Dados",
  "content": "Aprenda os fundamentals de algoritmos..."
}
```

```http
POST /ai/ask
Content-Type: application/json

{
  "question": "Qual é o pré-requisito para Banco de Dados?",
  "studentId": "uuid"  // opcional, para contexto personalizado
}
```

---

## 📂 Estrutura de Pastas

```text
ccblog-be/
├── src/
│   ├── app.ts                    # Configuração do Express
│   ├── server.ts                 # Entry point com WebSocket
│   │
│   ├── config/
│   │   └── constants.ts          # Constantes globais (JWT_SECRET, etc)
│   │
│   ├── controller/               # Controladores (requisição → resposta)
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── post.controller.ts
│   │   ├── discipline.controller.ts
│   │   ├── enrollment.controller.ts
│   │   ├── notification.controller.ts
│   │   ├── ai.controller.ts
│   │   └── dashboard.controller.ts
│   │
│   ├── service/                  # Serviços (lógica de negócio)
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── post.service.ts
│   │   ├── discipline.service.ts
│   │   ├── enrollment.service.ts
│   │   ├── notification.service.ts
│   │   ├── notificationJob.service.ts  # Jobs agendados
│   │   ├── ai.service.ts
│   │   └── dashboard.service.ts
│   │
│   ├── repositories/             # Data Access Layer (Prisma)
│   │   ├── user.repository.ts
│   │   ├── post.repository.ts
│   │   ├── discipline.repository.ts
│   │   ├── enrollment.repository.ts
│   │   ├── notification.repository.ts
│   │   └── category.repository.ts
│   │
│   ├── routes/                   # Definição de rotas
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── post.routes.ts
│   │   ├── discipline.routes.ts
│   │   ├── notification.routes.ts
│   │   └── ai.routes.ts
│   │
│   ├── middleware/               # Middlewares Express
│   │   ├── auth.middleware.ts            # Verifica JWT
│   │   ├── permissions.middleware.ts     # Verifica roles
│   │   ├── error.middleware.ts           # Tratamento de erros
│   │   ├── rate-limit.middleware.ts      # Rate limiting
│   │   ├── token-blacklist.middleware.ts # Logout
│   │   ├── ownership.middleware.ts       # Validação de propriedade
│   │   ├── audit.middleware.ts           # Log de ações
│   │   └── upload.ts                     # Upload via Multer
│   │
│   ├── schemas/                  # Validação com Zod
│   │   ├── auth.schema.ts
│   │   ├── user.schema.ts
│   │   ├── post.schema.ts
│   │   ├── discipline.schema.ts
│   │   └── enrollment.schema.ts
│   │
│   ├── models/                   # Type definitions
│   │   ├── user.model.ts
│   │   ├── post.model.ts
│   │   └── discipline.model.ts
│   │
│   ├── lib/                      # Utilities e integrações
│   │   ├── prisma.ts             # Singleton Prisma Client
│   │   ├── cloudinary.ts         # Config do Cloudinary
│   │   ├── gemini.ts             # Config do Google Gemini
│   │   ├── mail.ts               # Config do Resend
│   │   └── seed.ts               # Script de seed
│   │
│   ├── errors/
│   │   ├── appError.ts           # Classe customizada de erro
│   │   └── errorCodes.ts         # Códigos de erro padronizados
│   │
│   ├── util/
│   │   └── response.ts           # Helpers de resposta
│   │
│   ├── generated/                # Gerado automaticamente pelo Prisma
│   │   └── prisma/
│   │       ├── client.ts
│   │       ├── types.ts
│   │       └── models.ts
│   │
│   └── prisma/
│       ├── schema.prisma         # Schema do banco de dados
│       └── migrations/           # Histórico de migrações

├── docker-compose.yml            # Configuração do PostgreSQL
├── prisma.config.ts              # Config do Prisma (se necessário)
├── tsconfig.json                 # Configuração TypeScript
├── package.json
├── pnpm-lock.yaml
└── README.md
```

## 🎨 Padrões de Desenvolvimento

### 1. **Padrão Repository**

Cada modelo tem seu repositório para abstrair Prisma:

```typescript
// user.repository.ts
export class UserRepository {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }
}
```

### 2. **Padrão Service**

Serviços encapsulam lógica de negócio:

```typescript
// user.service.ts
export class UserService {
  static async createUser(data: CreateUserDTO) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return UserRepository.create({ ...data, password: hashedPassword });
  }
}
```

### 3. **Padrão Controller**

Controllers recebem requisições e chamam serviços:

```typescript
// user.controller.ts
export class UserController {
  static async create(req: Request, res: Response) {
    try {
      const data = req.body;
      const user = await UserService.createUser(data);
      sendSuccess(res, user, "Usuário criado", 201);
    } catch (error) {
      sendError(res, error.message, error.statusCode || 500);
    }
  }
}
```

### 4. **Padrão Middleware**

Middlewares para requisições comuns:

```typescript
export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return sendError(res, "Token não fornecido", 401);

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    sendError(res, "Token inválido", 401);
  }
};
```

### 5. **Validação com Zod**

Schemas para validação de entrada:

```typescript
// post.schema.ts
export const CreatePostSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(10),
  categoryId: z.string().uuid().optional(),
  published: z.boolean().default(false),
});
```

### 6. **Padrão de Erro Customizado**

```typescript
throw {
  statusCode: 404,
  message: "Usuário não encontrado",
};
```

## 🧪 Testando Localmente

### Com Postman

1. Importar variáveis de ambiente
2. Usar coleção de requisições
3. Testar fluxos completos

### Com cURL

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@blogtech.com","password":"admin123"}' \
  | jq -r '.token')

# 2. Usar token
curl -X GET http://localhost:3000/user \
  -H "Authorization: Bearer $TOKEN"
```

### Com WebSocket (Notificações)

```javascript
// JavaScript no navegador
const socket = io("http://localhost:3000");

socket.emit("join", { role: "STUDENT" });

socket.on("new_notification", (data) => {
  console.log("Nova notificação:", data);
});
```

## ⚙️ Configuração e Customização

### Alterar Porta do Servidor

```env
PORT=3001
```

### Rate Limiting

Modificar em `rate-limit.middleware.ts`:

```typescript
maxRequests: 100,      // máximo de requisições
windowMs: 15 * 60 * 1000  // janela de 15 minutos
```

### Expiração de Token JWT

Modificar em `auth.service.ts`:

```typescript
expiresIn: "1d"; // 1 dia
```

### Rounds de Bcrypt

Modificar em `user.service.ts`:

```typescript
bcrypt.hash(password, 10); // 10 rounds = bom equilíbrio
```

## 🐛 Troubleshooting

### Erro: `Cannot connect to database`

```bash
# Verificar se Docker está rodando
docker ps

# Verificar logs do container
docker logs <container_id>

# Reiniciar banco
docker-compose down && docker-compose up -d
```

### Erro: `JWT_SECRET is not set`

```bash
# Verificar .env
echo $JWT_SECRET

# Gerar novo secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Erro: `Prisma migration issue`

```bash
# Reset banco (CUIDADO: deleta dados)
npx prisma migrate reset

# Ou criar nova migração
npx prisma migrate dev --name fix_issue
```

### Erro: `Cloudinary connection failed`

- Verificar credenciais em `.env`
- Testar conectividade: `GET /upload/test`

### WebSocket não conecta

```bash
# Verificar se porta está aberta
netstat -an | grep 3000

# Verificar CORS em app.ts
io.cors.origin = "*"  // ou domínio específico
```

## 📈 Otimizações e Melhorias Futuras

### Curto Prazo

- [ ] Adicionar testes unitários (Jest)
- [ ] Swagger/OpenAPI documentation
- [ ] Validação de email com confirmação
- [ ] Rate limiting com Redis
- [ ] Logging estruturado (Winston)
- [ ] Autenticação OAuth (Google, GitHub)

### Médio Prazo

- [ ] Paginação e filtros mais robustos
- [ ] GraphQL endpoint alternativo
- [ ] Cache com Redis
- [ ] Backup automático de banco
- [ ] Elasticidade para buscas (Elasticsearch)
- [ ] Integração com CMS para blog

### Longo Prazo

- [ ] Microserviços por domínio
- [ ] Event sourcing para auditoria
- [ ] Machine learning para recomendações
- [ ] Mobile app nativa
- [ ] Análise avançada de dados (Power BI, Tableau)
- [ ] Sistema de reputação/gamificação

## 📜 Decisões Técnicas Documentadas

| Decisão           | Justificativa                         | Trade-off                 |
| ----------------- | ------------------------------------- | ------------------------- |
| **PostgreSQL**    | Relacional, ACID, escalável           | Complexidade vs NoSQL     |
| **Prisma ORM**    | Type-safe, migrations automáticas, DX | Lock-in com Prisma        |
| **JWT**           | Stateless, escalável, padrão          | Sem revogação instantânea |
| **Bcrypt 10**     | Segurança balanceada                  | Performance aceitável     |
| **Cloudinary**    | Upload escalável                      | Custo mensal              |
| **Google Gemini** | Gratuito, rápido                      | Menos preciso que GPT-4   |
| **Socket.io**     | Fallback (polling), suporte amplo     | Overhead se não usado     |
| **Multer**        | Padrão Node.js                        | Limite de memória         |

## 📝 Dependências Principais

| Pacote                | Versão | Propósito             |
| --------------------- | ------ | --------------------- |
| express               | 5.1.0  | Framework web         |
| @prisma/client        | 7.2.0  | ORM                   |
| jsonwebtoken          | 9.0.3  | JWT                   |
| bcrypt                | 6.0.0  | Hash seguro           |
| zod                   | 4.1.12 | Validação             |
| cloudinary            | 1.41.3 | Hospedagem de imagens |
| @google/generative-ai | 0.24.1 | Google Gemini         |
| socket.io             | 4.8.3  | WebSocket             |
| multer                | 2.0.2  | Upload                |
| node-cron             | 4.2.1  | Agendamento           |
| resend                | 6.12.3 | Email                 |

## 🤝 Contribuindo

### Fluxo de Contribuição

1. **Fork** o repositório
2. **Clone** seu fork
3. **Crie uma branch** para sua feature: `git checkout -b feature/minha-feature`
4. **Commit** com mensagens descritivas: `git commit -m "Adiciona nova feature"`
5. **Push** para seu fork: `git push origin feature/minha-feature`
6. **Abra um Pull Request** com descrição detalhada

### Padrões de Código

- TypeScript obrigatório
- ESLint + Prettier (configurar IDE)
- Nomes em inglês para código, português para comentários
- Commits convencionais: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`

### Exemplo de Commit

```bash
git commit -m "feat: adiciona endpoint de filtro de disciplinas por período"
```

## 📄 Licença

ISC - Veja LICENSE.md

## 📧 Suporte

Para dúvidas ou issues:

- Abrir issue no GitHub
- Contato: debs.veras@example.com

## 📚 Referências Úteis

- [Express.js Docs](https://expressjs.com/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [JWT.io](https://jwt.io/)
- [Zod Docs](https://zod.dev/)
- [Socket.io Docs](https://socket.io/docs/)
- [Google Gemini API](https://ai.google.dev/)

---

**Mantido com ❤️ por Debs Veras**

Última atualização: 2026-06-10
└── lib/ # Configurações de bibliotecas externas

```

## 🔐 API Endpoints (Principais)

- `POST /auth/login` - Autenticação de usuário.
- `GET /post` - Listagem de posts do blog.
- `GET /discipline` - Listagem de disciplinas.
- `POST /enrollment` - Realizar matrícula em uma disciplina.
- `GET /dashboard` - Obter estatísticas do sistema.

---
Desenvolvido como parte de um projeto pessoal de gestão acadêmica.
```
