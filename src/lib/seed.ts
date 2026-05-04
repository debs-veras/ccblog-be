import { PrismaClient, Role } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const pool = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter: pool });

async function main() {
  // =============================
  // 1. PROFESSORES
  // =============================
  const teachersData = [
    { name: "Hudson Costa", email: "hudson_costa@uvanet.br" },
    { name: "Claudio Carvalho", email: "claudio_carvalho@uvanet.br" },
    { name: "Lorena Pereira", email: "lorena_pierre@uvanet.br" },
    { name: "Marcio Rocha", email: "marcio_rocha@uvanet.br" },
    { name: "Placido Dias", email: "placido_dias@uvanet.br" },
    { name: "Thales Andrade", email: "andrade_thales@uvanet.br" },
    { name: "Walisson Pereira", email: "walisson_pereira@uvanet.br" },
    { name: "Gilzamir Gomes", email: "gilzamir_gomes@uvanet.br" },
    { name: "Paulo Regis", email: "paulo_regis@uvanet.br" },
    { name: "Eder Porfirio", email: "eder_porfirio@uvanet.br" },
    { name: "Jose Alex", email: "alex_pontes@uvanet.br" },
    { name: "Lourival Junior", email: "lourival_junior@uvanet.br" },
    { name: "Hamilton", email: "hamilton@fake.com" },
    { name: "Rosangela Marques", email: "rosangela@email.com" },
    { name: "Marcus Fabius (Bonnet)", email: "marcus@email.com" },
    { name: "Francisco Raimundo", email: "francisco@email.com" },
    { name: "Calebe de Andrade Alves", email: "calebe@email.com" },
    { name: "Raimundo Inacio", email: "raimundoinacio@email.com" },
  ];

  const passwordHash = await bcrypt.hash("123456", 10);

  const teachers: Record<string, any> = {};

  for (const t of teachersData) {
    const teacher = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        name: t.name,
        email: t.email,
        password: passwordHash,
        role: Role.TEACHER,
      },
    });

    teachers[t.email] = teacher;
  }

  const getTeacher = (email: string) => {
    const teacher = teachers[email];
    if (!teacher) throw new Error(`❌ Professor não encontrado: ${email}`);
    return teacher;
  };

  

  // =============================
  // 2. DISCIPLINAS
  // =============================
  const disciplines = await prisma.$transaction([
    // 1º Período
    prisma.discipline.create({
      data: {
        name: "Introdução à Ciência da Computação",
        code: "ICC",
        period: 1,
        workload: 60,
        teacherId: getTeacher("eder_porfirio@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Inglês",
        code: "ING",
        period: 1,
        workload: 60,
        teacherId: null,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Lógica de Programação",
        code: "LP",
        period: 1,
        workload: 100,
        teacherId: getTeacher("walisson_pereira@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Cálculo I",
        code: "CALC1",
        period: 1,
        workload: 80,
        teacherId: getTeacher("marcus@email.com").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Lógica Matemática",
        code: "LM",
        period: 1,
        workload: 80,
        teacherId: getTeacher("hudson_costa@uvanet.br").id,
      },
    }),
    // 2º Período
    prisma.discipline.create({
      data: {
        name: "Matemática Discreta",
        code: "MD",
        period: 2,
        workload: 80,
        teacherId: getTeacher("hudson_costa@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Circuitos Digitais",
        code: "CRD",
        period: 2,
        workload: 60,
        teacherId: getTeacher("walisson_pereira@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Linguagens de Programação 1",
        code: "LP1",
        period: 2,
        workload: 60,
        teacherId: getTeacher("alex_pontes@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Laboratório de Programação",
        code: "LAB",
        period: 2,
        workload: 60,
        teacherId: getTeacher("paulo_regis@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Cálculo II",
        code: "CALC2",
        period: 2,
        workload: 80,
        teacherId: getTeacher("rosangela@email.com").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Álgebra Linear",
        code: "AL",
        period: 2,
        workload: 60,
        teacherId: getTeacher("francisco@email.com").id,
      },
    }),

    // 3º Período
    prisma.discipline.create({
      data: {
        name: "Introdução à Estatística",
        code: "IE",
        period: 3,
        workload: 60,
        teacherId: getTeacher("francisco@email.com").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Arquitetura de Computadores",
        code: "AC",
        period: 3,
        workload: 80,
        teacherId: getTeacher("walisson_pereira@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Estrutura de Dados",
        code: "ED",
        period: 3,
        workload: 100,
        teacherId: getTeacher("paulo_regis@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Cálculo Numérico",
        code: "CN",
        period: 3,
        workload: 60,
        teacherId: getTeacher("rosangela@email.com").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Física",
        code: "FIS",
        period: 3,
        workload: 80,
        teacherId: getTeacher("calebe@email.com").id,
      },
    }),

    // 4º Período
    prisma.discipline.create({
      data: {
        name: "Estatistica com Apoio Computacional",
        code: "EAC",
        period: 4,
        workload: 60,
        teacherId: getTeacher("paulo_regis@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Banco de Dados I",
        code: "BD1",
        period: 4,
        workload: 80,
        teacherId: getTeacher("placido_dias@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Algoritmos para Grafos",
        code: "GRAFOS",
        period: 4,
        workload: 60,
        teacherId: getTeacher("alex_pontes@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Programação Orientada a Objetos",
        code: "POO",
        period: 4,
        workload: 100,
        teacherId: getTeacher("placido_dias@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Tecnologias da Informação",
        code: "TI",
        period: 4,
        workload: 60,
        teacherId: getTeacher("marcio_rocha@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Metodologia do Trabalho Científico",
        code: "MTC",
        period: 4,
        workload: 60,
        teacherId: getTeacher("lourival_junior@uvanet.br").id,
      },
    }),
    
    // 5º Período
    prisma.discipline.create({
      data: {
        name: "Construção e Análise de Algoritmos",
        code: "CAA",
        period: 5,
        workload: 80,
        teacherId: getTeacher("claudio_carvalho@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Engenharia de Software",
        code: "ES",
        period: 5,
        workload: 60,
        teacherId: getTeacher("andrade_thales@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Banco de Dados II",
        code: "BD2",
        period: 5,
        workload: 80,
        teacherId: getTeacher("lorena_pierre@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Computação Gráfica",
        code: "CG",
        period: 5,
        workload: 60,
        teacherId: getTeacher("gilzamir_gomes@uvanet.br").id,
      },
    }),

    // 6º Período
    prisma.discipline.create({
      data: {
        name: "Linguagens Formais e Automatos",
        code: "LFA",
        period: 6,
        workload: 80,
        teacherId: getTeacher("claudio_carvalho@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Sistemas Operacionais",
        code: "SO",
        period: 6,
        workload: 80,
        teacherId: getTeacher("walisson_pereira@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Análise e Projeto de Sistemas",
        code: "APS",
        period: 6,
        workload: 60,
        teacherId: getTeacher("andrade_thales@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Redes de Computadores",
        code: "REDES",
        period: 6,
        workload: 80,
        teacherId: getTeacher("lourival_junior@uvanet.br").id,
      },
    }),

    // 7º Período
    prisma.discipline.create({
      data: {
        name: "Inteligência Artificial",
        code: "IA",
        period: 7,
        workload: 80,
        teacherId: getTeacher("gilzamir_gomes@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Compiladores",
        code: "COMP",
        period: 7,
        workload: 80,
        teacherId: getTeacher("eder_porfirio@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Sistemas Distribuídos",
        code: "SD",
        period: 7,
        workload: 60,
        teacherId: getTeacher("lourival_junior@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Computação e Sociedade",
        code: "CS",
        period: 7,
        workload: 60,
        teacherId: getTeacher("marcio_rocha@uvanet.br").id,
      },
    }),

    // 8º Período
    prisma.discipline.create({
      data: {
        name: "Administração de Sistemas e Serviços",
        code: "ASS",
        period: 8,
        workload: 60,
        teacherId: getTeacher("marcio_rocha@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Laboratório de Desenvolvimento de Software",
        code: "LDS",
        period: 8,
        workload: 60,
        teacherId: getTeacher("andrade_thales@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Projeto de Conclusão de Curso TCC",
        code: "TCC",
        period: 8,
        workload: 60,
        teacherId: getTeacher("lorena_pierre@uvanet.br").id,
      },
    }),

    // Optativa
    prisma.discipline.create({
      data: {
        name: "Tópicos Avançados em Banco de Dados",
        code: "TABD",
        period: 0, 
        workload: 60,
        teacherId: getTeacher("lorena_pierre@uvanet.br").id,
      },
    }),

    // OPTATIVAS
    prisma.discipline.create({
      data: {
        name: "Matemática Comercial e Financeira",
        code: "MCF",
        period: 0,
        workload: 60,
        teacherId: getTeacher("hamilton@fake.com").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Metaheuristicas",
        code: "META",
        period: 0,
        workload: 60,
        teacherId: getTeacher("gilzamir_gomes@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Estágio Supervisionado",
        code: "ESTAGIO",
        period: 0,
        workload: 60,
        teacherId: getTeacher("andrade_thales@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Empreendedorismo",
        code: "EMP",
        period: 0,
        workload: 60,
        teacherId: getTeacher("raimundoinacio@email.com").id, 
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Introdução a Administração",
        code: "ADM",
        period: 0,
        workload: 60,
        teacherId: getTeacher("marcio_rocha@uvanet.br").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Introdução às Telecomunicações",
        code: "TEL",
        period: 0,
        workload: 60,
        teacherId: getTeacher("francisco@email.com").id,
      },
    }),
    prisma.discipline.create({
      data: {
        name: "Introducao a Ciencia de Dados",
        code: "CD",
        period: 0,
        workload: 60,
        teacherId: getTeacher("hudson_costa@uvanet.br").id,
      },
    }),
  ]);

  const getDisc = (name: string) => {
    const disc = disciplines.find((d) => d.name === name);
    if (!disc) throw new Error(`❌ Disciplina não encontrada: ${name}`);
    return disc;
  };

  // =============================
  // 3. PRÉ-REQUISITOS
  // =============================
  await prisma.disciplinePrerequisite.createMany({
    data: [
      // 2º Período
      {
        disciplineId: getDisc("Matemática Discreta").id,
        prerequisiteId: getDisc("Lógica Matemática").id,
      },
      {
        disciplineId: getDisc("Circuitos Digitais").id,
        prerequisiteId: getDisc("Lógica Matemática").id,
      },
      {
        disciplineId: getDisc("Linguagens de Programação 1").id,
        prerequisiteId: getDisc("Lógica de Programação").id,
      },
      {
        disciplineId: getDisc("Laboratório de Programação").id,
        prerequisiteId: getDisc("Lógica de Programação").id,
      },
      {
        disciplineId: getDisc("Cálculo II").id,
        prerequisiteId: getDisc("Cálculo I").id,
      },

      // 3º Período
      {
        disciplineId: getDisc("Arquitetura de Computadores").id,
        prerequisiteId: getDisc("Circuitos Digitais").id,
      },
      {
        disciplineId: getDisc("Estrutura de Dados").id,
        prerequisiteId: getDisc("Linguagens de Programação 1").id,
      },
      {
        disciplineId: getDisc("Estrutura de Dados").id,
        prerequisiteId: getDisc("Laboratório de Programação").id,
      },
      {
        disciplineId: getDisc("Cálculo Numérico").id,
        prerequisiteId: getDisc("Álgebra Linear").id,
      },
      {
        disciplineId: getDisc("Cálculo Numérico").id,
        prerequisiteId: getDisc("Cálculo II").id,
      },
      {
        disciplineId: getDisc("Cálculo Numérico").id,
        prerequisiteId: getDisc("Laboratório de Programação").id,
      },
      
      // 4º Período
      {
        disciplineId: getDisc("Estatistica com Apoio Computacional").id,
        prerequisiteId: getDisc("Introdução à Estatística").id,
      },
      {
        disciplineId: getDisc("Banco de Dados I").id,
        prerequisiteId: getDisc("Estrutura de Dados").id,
      },
      {
        disciplineId: getDisc("Algoritmos para Grafos").id,
        prerequisiteId: getDisc("Matemática Discreta").id,
      },
      {
        disciplineId: getDisc("Algoritmos para Grafos").id,
        prerequisiteId: getDisc("Estrutura de Dados").id,
      },
      {
        disciplineId: getDisc("Programação Orientada a Objetos").id,
        prerequisiteId: getDisc("Estrutura de Dados").id,
      },
      {
        disciplineId: getDisc("Tecnologias da Informação").id,
        prerequisiteId: getDisc("Introdução à Ciência da Computação").id,
      },
     
      {
        disciplineId: getDisc("Construção e Análise de Algoritmos").id,
        prerequisiteId: getDisc("Algoritmos para Grafos").id,
      },
      {
        disciplineId: getDisc("Engenharia de Software").id,
        prerequisiteId: getDisc("Banco de Dados I").id,
      },
      {
        disciplineId: getDisc("Banco de Dados II").id,
        prerequisiteId: getDisc("Banco de Dados I").id,
      },
      {
        disciplineId: getDisc("Banco de Dados II").id,
        prerequisiteId: getDisc("Programação Orientada a Objetos").id,
      },
      {
        disciplineId: getDisc("Computação Gráfica").id,
        prerequisiteId: getDisc("Programação Orientada a Objetos").id,
      },
      {
        disciplineId: getDisc("Computação Gráfica").id,
        prerequisiteId: getDisc("Álgebra Linear").id,
      },
      {
        disciplineId: getDisc("Linguagens Formais e Automatos").id,
        prerequisiteId: getDisc("Matemática Discreta").id,
      },
      {
        disciplineId: getDisc("Sistemas Operacionais").id,
        prerequisiteId: getDisc("Arquitetura de Computadores").id,
      },
      {
        disciplineId: getDisc("Análise e Projeto de Sistemas").id,
        prerequisiteId: getDisc("Engenharia de Software").id,
      },
      {
        disciplineId: getDisc("Redes de Computadores").id,
        prerequisiteId: getDisc("Física").id,
      },
      {
        disciplineId: getDisc("Redes de Computadores").id,
        prerequisiteId: getDisc("Arquitetura de Computadores").id,
      },
      {
        disciplineId: getDisc("Inteligência Artificial").id,
        prerequisiteId: getDisc("Lógica Matemática").id,
      },
      {
        disciplineId: getDisc("Inteligência Artificial").id,
        prerequisiteId: getDisc("Linguagens de Programação 1").id,
      },
      {
        disciplineId: getDisc("Compiladores").id,
        prerequisiteId: getDisc("Linguagens Formais e Automatos").id,
      },
      {
        disciplineId: getDisc("Compiladores").id,
        prerequisiteId: getDisc("Laboratório de Programação").id,
      },
      {
        disciplineId: getDisc("Sistemas Distribuídos").id,
        prerequisiteId: getDisc("Sistemas Operacionais").id,
      },
      {
        disciplineId: getDisc("Sistemas Distribuídos").id,
        prerequisiteId: getDisc("Redes de Computadores").id,
      },
      {
        disciplineId: getDisc("Laboratório de Desenvolvimento de Software").id,
        prerequisiteId: getDisc("Banco de Dados II").id,
      },
      {
        disciplineId: getDisc("Laboratório de Desenvolvimento de Software").id,
        prerequisiteId: getDisc("Análise e Projeto de Sistemas").id,
      },
      {
        disciplineId: getDisc("Projeto de Conclusão de Curso TCC").id,
        prerequisiteId: getDisc("Cálculo Numérico").id,
      },
      {
        disciplineId: getDisc("Projeto de Conclusão de Curso TCC").id,
        prerequisiteId: getDisc("Banco de Dados II").id,
      },
      {
        disciplineId: getDisc("Projeto de Conclusão de Curso TCC").id,
        prerequisiteId: getDisc("Construção e Análise de Algoritmos").id,
      },
      {
        disciplineId: getDisc("Projeto de Conclusão de Curso TCC").id,
        prerequisiteId: getDisc("Inteligência Artificial").id,
      },
      {
        disciplineId: getDisc("Projeto de Conclusão de Curso TCC").id,
        prerequisiteId: getDisc("Sistemas Distribuídos").id,
      },
      {
        disciplineId: getDisc("Tópicos Avançados em Banco de Dados").id,
        prerequisiteId: getDisc("Banco de Dados II").id,
      },  
      {
        disciplineId: getDisc("Metaheuristicas").id,
        prerequisiteId: getDisc("Construção e Análise de Algoritmos").id,
      },
    ],
  });

  // =============================
  // 4. HORÁRIOS
  // =============================
  const schedules = [
    // 1º Período
    { name: "Lógica de Programação", dayOfWeek: 0, start: "14:00", end: "17:30" },
    { name: "Lógica de Programação", dayOfWeek: 1, start: "14:00", end: "17:30" },
    { name: "Cálculo I", dayOfWeek: 0, start: "08:00", end: "09:40" },
    { name: "Cálculo I", dayOfWeek: 2, start: "08:00", end: "11:30" },
    { name: "Lógica Matemática", dayOfWeek: 1, start: "08:00", end: "11:30" },
    { name: "Lógica Matemática", dayOfWeek: 2, start: "14:00", end: "15:40" },
    { name: "Introdução à Ciência da Computação", dayOfWeek: 3, start: "08:00", end: "11:30" },

    // 2º
    { name: "Matemática Discreta", dayOfWeek: 0, start: "09:50", end: "11:30" },
    { name: "Matemática Discreta", dayOfWeek: 3, start: "08:00", end: "11:30" },
    { name: "Circuitos Digitais", dayOfWeek: 2, start: "08:00", end: "11:30" },
    { name: "Linguagens de Programação 1", dayOfWeek: 1, start: "08:00", end: "11:30" },
    { name: "Laboratório de Programação", dayOfWeek: 3, start: "14:00", end: "17:30" },
    { name: "Cálculo II", dayOfWeek: 1, start: "14:00", end: "17:30" },
    { name: "Cálculo II", dayOfWeek: 2, start: "14:00", end: "15:40" },
    { name: "Álgebra Linear", dayOfWeek: 0, start: "18:30", end: "22:00" },

    // 3º
    { name: "Introdução à Estatística", dayOfWeek: 3, start: "18:30", end: "22:00" },
    { name: "Arquitetura de Computadores", dayOfWeek: 0, start: "08:00", end: "11:30" },
    { name: "Estrutura de Dados", dayOfWeek: 1, start: "14:00", end: "17:30" },
    { name: "Estrutura de Dados", dayOfWeek: 4, start: "08:00", end: "11:30" },
    { name: "Cálculo Numérico", dayOfWeek: 0, start: "14:00", end: "17:30" },
    { name: "Física", dayOfWeek: 0, start: "20:20", end: "22:00" },
    { name: "Física", dayOfWeek: 2, start: "18:30", end: "22:00" },

    // 4º
    { name: "Estatistica com Apoio Computacional", dayOfWeek: 2, start: "08:00", end: "11:30" },
    { name: "Banco de Dados I", dayOfWeek: 1, start: "18:30", end: "20:10" },
    { name: "Banco de Dados I", dayOfWeek: 2, start: "18:30", end: "22:00" },
    { name: "Algoritmos para Grafos", dayOfWeek: 0, start: "08:00", end: "11:30" },
    { name: "Programação Orientada a Objetos", dayOfWeek: 0, start: "18:30", end: "22:00" },
    { name: "Programação Orientada a Objetos", dayOfWeek: 2, start: "15:50", end: "18:20" },
    { name: "Tecnologias da Informação", dayOfWeek: 1, start: "18:30", end: "22:00" },
    { name: "Metodologia do Trabalho Científico", dayOfWeek: 0, start: "18:30", end: "22:00" },
    // 5º
    { name: "Construção e Análise de Algoritmos", dayOfWeek: 0, start: "18:30", end: "22:00" },
    { name: "Construção e Análise de Algoritmos", dayOfWeek: 2, start: "14:00", end: "17:30" },
    { name: "Engenharia de Software", dayOfWeek: 0, start: "14:00", end: "17:30" },
    { name: "Banco de Dados II", dayOfWeek: 1, start: "14:50", end: "16:40" },
    { name: "Banco de Dados II", dayOfWeek: 2, start: "08:00", end: "11:30" },
    { name: "Computação Gráfica", dayOfWeek: 3, start: "08:00", end: "11:30" },
    // 6º
    { name: "Linguagens Formais e Automatos", dayOfWeek: 0, start: "14:00", end: "17:30" },
    { name: "Linguagens Formais e Automatos", dayOfWeek: 2, start: "18:30", end: "22:00" },
    { name: "Sistemas Operacionais", dayOfWeek: 0, start: "18:30", end: "22:00" },
    { name: "Sistemas Operacionais", dayOfWeek: 1, start: "18:30", end: "20:10" },
    { name: "Análise e Projeto de Sistemas", dayOfWeek: 4, start: "14:00", end: "17:30" },
    { name: "Redes de Computadores", dayOfWeek: 1, start: "20:20", end: "22:00" },
    { name: "Redes de Computadores", dayOfWeek: 3, start: "18:30", end: "22:00" },
    // 7º
    { name: "Inteligência Artificial", dayOfWeek: 2, start: "14:00", end: "16:40" },
    { name: "Inteligência Artificial", dayOfWeek: 3, start: "14:00", end: "16:40" },
    { name: "Compiladores", dayOfWeek: 1, start: "13:10", end: "15:40" },
    { name: "Compiladores", dayOfWeek: 2, start: "16:40", end: "19:20" },
    { name: "Sistemas Distribuídos", dayOfWeek: 2, start: "18:30", end: "22:00" },
    { name: "Computação e Sociedade", dayOfWeek: 2, start: "08:00", end: "11:30" },
    // 8º
    { name: "Administração de Sistemas e Serviços", dayOfWeek: 1, start: "08:00", end: "11:30" },
    { name: "Laboratório de Desenvolvimento de Software", dayOfWeek: 0, start: "18:30", end: "22:00" },
    { name: "Projeto de Conclusão de Curso TCC", dayOfWeek: 1, start: "11:30", end: "14:00" },
    { name: "Projeto de Conclusão de Curso TCC", dayOfWeek: 3, start: "11:30", end: "14:00" },
    // Optativas
    { name: "Tópicos Avançados em Banco de Dados", dayOfWeek: 0, start: "18:30", end: "22:00" },
    { name: "Matemática Comercial e Financeira", dayOfWeek: 2, start: "14:00", end: "17:30" },
    { name: "Metaheuristicas", dayOfWeek: 2, start: "08:00", end: "11:30" },
    { name: "Estágio Supervisionado", dayOfWeek: 2, start: "14:00", end: "17:30" },
    { name: "Empreendedorismo", dayOfWeek: 1, start: "14:00", end: "17:30" },
    { name: "Introdução a Administração", dayOfWeek: 2, start: "18:30", end: "22:00" },
    { name: "Introdução às Telecomunicações", dayOfWeek: 1, start: "18:30", end: "22:00" },
    { name: "Introducao a Ciencia de Dados", dayOfWeek: 1, start: "14:00", end: "15:40" },
    { name: "Introducao a Ciencia de Dados", dayOfWeek: 3, start: "14:00", end: "15:40" },
];


  await prisma.schedule.createMany({
    data: schedules.map((s) => ({
      disciplineId: getDisc(s.name).id,
      dayOfWeek: s.dayOfWeek,
      startTime: s.start,
      endTime: s.end,
    })),
  });

  // =============================
  // 3. ADMIN
  // =============================
  await prisma.user.upsert({
    where: { email: "admin@blogtech.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@blogtech.com",
      password: passwordHash, 
      role: Role.ADMIN,
    },
  });

  console.log("✅ Seed executado com sucesso (nível clean)");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("💥 Erro no seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
