import { geminiModel as model } from "../lib/gemini";
import { DisciplineRepository } from "../repositories/discipline.repository";
import { EnrollmentRepository } from "../repositories/enrollment.repository";
import { EnrollmentStatus } from "../generated/prisma/enums";
import { PostRepository } from "../repositories/post.repository";

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

    // 2. Busca posts publicados (para contexto do blog)
    const posts = await PostRepository.getAll({ published: true });
    console.log(`[AI Context] Posts encontrados: ${posts.data.length}`);
    const postsContext = posts.data
      .map((p: any) => `- "${p.title}" (${p.description || "N/A"})`)
      .join("\n");

    // 3. Busca o histórico do aluno (se logado)
    let passedContext = "Nenhum histórico disponível.";
    if (studentId) {
      const enrollments = await EnrollmentRepository.getStudentEnrollments(studentId);
      const passed = enrollments
        .filter((e) => e.status === EnrollmentStatus.PASSED)
        .map((e) => `${e.discipline.name} (${e.discipline.code})`);
      
      console.log(`[AI Context] Histórico do aluno: ${passed.length} matérias concluídas.`);
      if (passed.length > 0) passedContext = passed.join(", ");
    }

    // 4. Formata a grade curricular de forma simples
    const curriculumContext = disciplines.data
      .map((d: any) => {
        const teacher = d.teacher?.name || "A definir";
        return `- ${d.name} [${d.code}] | Período: ${d.period} | Prof: ${teacher} | Carga: ${d.workload}h`;
      })
      .join("\n");
      
    const systemPrompt = `
      Você é o Assistente Virtual do curso de Ciência da Computação.
      Responda de forma curta, direta e amigável.

      GRADE CURRICULAR:
      ${curriculumContext}
      
      POSTS DO BLOG:
      ${postsContext}
      
      HISTÓRICO DO ALUNO (JÁ CONCLUÍDAS):
      ${passedContext}
      
      REGRAS IMPORTANTES:
      1. Use os dados acima. Se não encontrar algo, peça para o usuário contatar a secretaria.
      2. Cite o PROFESSOR sempre que falar de uma matéria.
      3. Seja conciso. NÃO repita a grade completa na resposta.
      4. Se pedirem plano de estudos, organize por anos/semestres e respeite o limite de matérias se informado.
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
