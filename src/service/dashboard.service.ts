import { prisma } from "lib/prisma";
import { EnrollmentRepository } from "repositories/enrollment.repository";

export class DashboardService {
  static async getStudentDashboard(studentId: string) {
    if (!studentId) throw { statusCode: 400, message: "Estudante não encontrado" };
    const enrollments = await EnrollmentRepository.getStudentEnrollments(studentId);

    const enrolled = enrollments.filter((e) => e.status === "ENROLLED");
    const passed = enrollments.filter((e) => e.status === "PASSED");
    const totalDisciplines = await prisma.discipline.count();
    const progress = totalDisciplines > 0 ? (passed.length / totalDisciplines) * 100 : 0;
    const today = new Date().getDay() - 1;


    const upcomingClasses = enrolled.flatMap((e) =>
      e.discipline.schedules
        .filter((s) => s.dayOfWeek === today)
        .map((s) => ({
          discipline: e.discipline.name,
          teacher: e.discipline.teacher?.name,
          startTime: s.startTime,
          endTime: s.endTime,
        })),
    );

    return {
      enrolledDisciplines: enrolled.map((e) => e.discipline),
      completedDisciplines: passed.map((e) => e.discipline),
      upcomingClasses,
      progress: Number(progress.toFixed(2)),
      totalCourseDisciplines: totalDisciplines,
      totalCompleted: passed.length,
      totalRemaining: totalDisciplines - passed.length,
    };
  }

  static async getTeacherDashboard(teacherId: string) {
    if (!teacherId) throw { statusCode: 400, message: "Professor não encontrado" };

    const totalDisciplines = await prisma.discipline.count({ where: { teacherId }});
    const totalStudents = await prisma.enrollment.count({ where: { discipline: { teacherId }, status: "ENROLLED" }});
    const totalPosts = await prisma.post.count({ where: { authorId: teacherId, published: true }});
    const viewsAggregation = await prisma.post.aggregate({ where: { authorId: teacherId }, _sum: { views: true }});
    const totalViews = viewsAggregation._sum.views || 0;

    const topPosts = await prisma.post.findMany({
      where: { authorId: teacherId },
      orderBy: { views: "desc" },
      take: 5,
    });

    return {
      totalDisciplines,
      totalStudents,
      totalPosts,
      totalViews,
      topPosts,
    };
  }
}
