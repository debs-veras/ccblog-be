# CCBlog - Backend 🚀

O CCBlog é o backend de uma plataforma de gestão acadêmica e blog, focada em cursos de graduação (como Ciência da Computação). O sistema permite o gerenciamento de disciplinas, horários, matrículas de alunos e uma plataforma de blog para notícias e conteúdo educacional.

## 🛠️ Tecnologias Utilizadas

- **Runtime:** Node.js
- **Framework:** Express.js
- **Linguagem:** TypeScript
- **ORM:** Prisma
- **Banco de Dados:** PostgreSQL
- **Autenticação:** JWT (JSON Web Token) & Bcrypt
- **Upload de Imagens:** Multer & Cloudinary
- **Validação de Dados:** Zod

## 📋 Funcionalidades Principais

- **Autenticação e Autorização:** Sistema de login com diferentes níveis de acesso (ADMIN, TEACHER, STUDENT).
- **Gestão Acadêmica:**
  - Cadastro e listagem de disciplinas com carga horária e períodos.
  - Gerenciamento de pré-requisitos entre disciplinas.
  - Cronograma/Horário das disciplinas.
  - Sistema de matrículas para alunos.
- **Blog:**
  - Criação, edição e exclusão de posts.
  - Categorização de posts.
  - Upload de imagens para capas de posts.
- **Dashboard:** Estatísticas gerais do sistema.

## 🚀 Como Iniciar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [Docker](https://www.docker.com/) e Docker Compose
- Gerenciador de pacotes (npm, yarn ou pnpm)

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd ccblog-be
   ```

2. **Configurar as variáveis de ambiente:**
   Copie o arquivo `.env.example` para `.env` e preencha com suas credenciais (especialmente as do Cloudinary e a URL do banco).
   ```bash
   cp .env.example .env
   ```

3. **Subir o banco de dados (Docker):**
   ```bash
   docker-compose up -d
   ```

4. **Instalar as dependências:**
   ```bash
   pnpm install
   ```

5. **Executar as migrações do Prisma:**
   ```bash
   npx prisma migrate dev
   ```

6. **Popular o banco de dados (Opcional):**
   ```bash
   npm run seed
   ```

   > [!IMPORTANT]
   > O comando de seed criará um usuário administrador padrão para fins de teste:
   > - **E-mail:** `admin@blogtech.com`
   > - **Senha:** `admin123`
   >
   > **Atenção:** Estes dados são apenas para testes e demonstração. Em ambiente de produção, certifique-se de alterar as credenciais ou desabilitar o seed automático.

7. **Iniciar o servidor em modo de desenvolvimento:**
   ```bash
   npm run dev
   ```

O servidor estará rodando em `http://localhost:3000`.

## 📂 Estrutura de Pastas

```text
src/
├── controller/     # Lógica de controle das requisições
├── service/        # Regras de negócio
├── repositories/   # Acesso ao banco de dados (Prisma)
├── routes/         # Definição das rotas da API
├── middleware/     # Middlewares (Auth, Validação, etc.)
├── schemas/        # Esquemas de validação (Zod)
├── prisma/         # Schema do Prisma e Migrations
└── lib/            # Configurações de bibliotecas externas
```

## 🔐 API Endpoints (Principais)

- `POST /auth/login` - Autenticação de usuário.
- `GET /post` - Listagem de posts do blog.
- `GET /discipline` - Listagem de disciplinas.
- `POST /enrollment` - Realizar matrícula em uma disciplina.
- `GET /dashboard` - Obter estatísticas do sistema.

---
Desenvolvido como parte de um projeto pessoal de gestão acadêmica.
