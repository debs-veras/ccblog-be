// import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { sendMail } from "../lib/mail";

export class NotificationJob {
  // static init() {
    // Agendado para rodar de Segunda a Sexta às 07:00 da manhã
    // Formato: min hora dia_mes mes dia_semana
  //   cron.schedule(
  //     "0 7 * * 1-5", 
  //     async () => {
  //       await this.sendDailyClasses();
  //     },
  //     {
  //       timezone: "America/Sao_Paulo",
  //     },
  //   );
  // }

  public static async sendDailyClasses() {
    const todayJs = new Date().getDay();

    // Banco:
    // 0 = Segunda
    // 1 = Terça
    // ...
    // 4 = Sexta

    const dayOfWeek = todayJs - 1;

    // Ignora sábado/domingo
    if (dayOfWeek < 0 || dayOfWeek > 4) return;

    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      include: {
        enrollments: {
          where: { status: "ENROLLED" },
          include: {
            discipline: {
              include: {
                schedules: {
                  where: { dayOfWeek },
                },
                teacher: true,
              },
            },
          },
        },
      },
    });

    await Promise.all(
      students.map(async (student) => {
        const classesToday = student.enrollments
          .filter((e) => e.discipline.schedules.length > 0)
          .map((e) => ({
            name: e.discipline.name,
            schedules: e.discipline.schedules,
            teacher: e.discipline.teacher?.name || "A definir",
          }));
        console.log({
          student: student.name,
          classesToday,
        });
        if (classesToday.length === 0) return;

        return this.sendDailyEmail(student, classesToday);
      }),
    );
  }

  private static async sendDailyEmail(student: any, classes: any[]) {
    const classListHtml = classes
      .map(
        (c) => `
          <div
            style="
              margin-bottom: 15px;
              padding: 10px;
              border-left: 4px solid #3b82f6;
              background: #f8fafc;
              border-radius: 6px;
            "
          >
            <strong style="font-size: 16px;">
              ${c.name}
            </strong>

            <br />

            <span>
              Professor: ${c.teacher}
            </span>

            <br />

            <span>
              Horário:
              ${c.schedules
                .map((s: any) => `${s.startTime} - ${s.endTime}`)
                .join(", ")}
            </span>
          </div>
        `,
      )
      .join("");

    const html = `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          color: #333;
        "
      >
        <h2 style="color: #1e40af;">
          Bom dia, ${student.name}! 📚
        </h2>

        <p>
          Aqui estão suas aulas de hoje:
        </p>

        ${classListHtml}

        <hr
          style="
            border: 0;
            border-top: 1px solid #eee;
            margin: 20px 0;
          "
        />

        <p
          style="
            font-size: 12px;
            color: #666;
          "
        >
          Este é um aviso automático do CC Blog.
        </p>
      </div>
    `;

    try {
      await sendMail(student.email, "CC Blog - Suas aulas de hoje", html);
    } catch (error) {
      console.error(`Erro ao enviar para ${student.email}`, error);
    }
  }
}
