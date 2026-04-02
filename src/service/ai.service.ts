import { geminiModel as model } from "../lib/gemini";
import { DisciplineRepository } from "../repositories/discipline.repository";
import { EnrollmentRepository } from "../repositories/enrollment.repository";
import { EnrollmentStatus, Role } from "../generated/prisma/enums";
import { PostRepository } from "../repositories/post.repository";
import { UserRepository } from "../repositories/user.repository";

export class AIService {
  /**
   * Sugere metatags e descrição curta (meta tag) para uma postagem.
   */
  static async suggestMetadata(title: string, content: string) {
    const prompt = `
      Você é um especialista em SEO. Com base no título e conteúdo abaixo, gere:
      1. Uma meta description de no máximo 160 caracteres (tag description).
      2. Uma lista de 5 a 10 palavras-chave (metatags/keywords) relevantes.
      
      Título: ${title}
      Conteúdo: ${content}
      
      Retorne APENAS um JSON no seguinte formato:
      {
        "description": "...",
        "tags": ["tag1", "tag2", ...]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Tenta extrair o JSON da resposta (limpando possíveis blocos de código markdown)
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  }

  /**
   * Responde dúvidas sobre o funcionamento do curso, disciplinas, grade curricular e posts.
   * Agora inclui informações de professores, sugestões personalizadas e posts do blog.
   * Suporta histórico para conversas contínuas.
   */
  static async askAcademicQuestion(question: string, history: any[] = [], studentId?: string) {
    // 1. Busca todas as disciplinas (grade completa)
    const disciplines = await DisciplineRepository.findMany();
    console.log(`[AI Context] Disciplinas encontradas: ${disciplines.data.length}`);

    // 2. Busca todos os professores do departamento
    const teachers = await UserRepository.getAll({ role: Role.TEACHER });
    console.log(`[AI Context] Professores encontrados: ${teachers.data.length}`);
    const teachersContext = teachers.data
      .map((t: any) => `- ${t.name} (E-mail: ${t.email})`)
      .join("\n");

    // 3. Busca posts publicados (para contexto do blog)
    const posts = await PostRepository.getAll({ published: true });
    console.log(`[AI Context] Posts encontrados: ${posts.data.length}`);
    const postsContext = posts.data
      .map((p: any) => `- "${p.title}" (${p.description || "N/A"})`)
      .join("\n");

    // 4. Busca o histórico do aluno (se logado)
    let passedContext = "Nenhum histórico disponível.";
    if (studentId) {
      const enrollments = await EnrollmentRepository.getStudentEnrollments(studentId);
      const passed = enrollments
        .filter((e) => e.status === EnrollmentStatus.PASSED)
        .map((e) => e.discipline.name);
      
      console.log(`[AI Context] Histórico do aluno: ${passed.length} matérias concluídas.`);
      if (passed.length > 0) passedContext = passed.join(", ");
    }

    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    // 5. Formata a grade curricular de forma simples
    const curriculumContext = disciplines.data
      .map((d: any) => {
        const teacher = d.teacher?.name ? `${d.teacher.name} (${d.teacher.email})` : "A definir";
        const prereqs = d.prerequisites?.length > 0 
          ? d.prerequisites.map((p: any) => p.prerequisite.name).join(", ")
          : "Nenhum";
        const schedules = d.schedules?.length > 0
          ? d.schedules.map((s: any) => `${dayNames[s.dayOfWeek]} ${s.startTime}-${s.endTime}`).join(", ")
          : "A definir";
          
        return `- ${d.name} | Período: ${d.period} | Prof: ${teacher} | Horários: ${schedules} | Pré-requisitos: ${prereqs}`;
      })
      .join("\n");
      
    const systemPrompt = `
      Você é o Assistente Virtual especializado do curso de Ciência da Computação. 
      Sua missão é fornecer informações precisas sobre a grade curricular, professores, pré-requisitos e novidades do blog.

      CONTEXTO DISPONÍVEL:
      - GRADE CURRICULAR COMPLETA:
      ${curriculumContext}

      - CORPO DOCENTE (PROFESSORES):
      ${teachersContext}
      
      - ÚLTIMOS POSTS DO BLOG:
      ${postsContext}
      
      - PROGRESSO DO ALUNO (MATÉRIAS JÁ CONCLUÍDAS):
      ${passedContext}
      
      REGRAS DE RESPOSTA:
      1. Use APENAS os dados fornecidos no contexto. Se uma informação não constar nos dados, oriente o aluno a procurar a coordenação.
      2. Cite o PROFESSOR responsável sempre que mencionar uma disciplina, e forneça o e-mail de contato caso o aluno solicite.
      3. Ao sugerir planos de estudo:
         - Use obrigatoriamente o formato "ANO.SEMESTRE" (ex: 2026.1, 2026.2).
         - Respeite rigorosamente a ordem dos PRÉ-REQUISITOS.
         - Evite CHOQUES DE HORÁRIOS: não sugira disciplinas que ocorrem no mesmo dia e horário dentro do mesmo semestre.
         - Se o usuário não informar o semestre de início ou o limite de matérias por semestre, peça essas informações ANTES de gerar a grade.
      
      REGRAS DE FORMATAÇÃO (OBRIGATÓRIO):
      1. Responda EXCLUSIVAMENTE em código HTML semântico.
      2. NÃO utilize blocos de código markdown (evite \`\`\`html). Forneça apenas a string de tags.
      3. Use <p> para textos, <strong> para ênfase, <ul>/<li> para listas.
      4. Para cronogramas ou planos de estudo, utilize obrigatoriamente a tag <table> com <thead> e <tbody> para uma visualização organizada.
      5. Mantenha a resposta limpa e pronta para ser renderizada diretamente no frontend.
    `;

    // Inicia o chat com histórico e instruções de sistema
    const chat = model.startChat({
      history: history,
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt }]
      },
    });


    const result = await chat.sendMessage(question);
    const response = await result.response;
    return response.text();
  }
}
