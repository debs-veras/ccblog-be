import { prisma } from "lib/prisma";
import { NotificationRepository } from "repositories/notification.repository";

export class NotificationService {
  static async notifyNewPost(post: any) {
    // 1. cria notificação no banco
    const notification = await prisma.notification.create({
      data: {
        type: "NEW_POST",
        title: "Novo post disponível",
        message: post.title,
        postId: post.id,
      },
    });

    // 2. pega alunos
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true },
    });

    // 3. cria relação de leitura
    await prisma.notificationRead.createMany({
      data: students.map((s) => ({
        userId: s.id,
        notificationId: notification.id,
      })),
    });

    // 4. realtime (socket desacoplado)
    global.io.to("students").emit("new_notification", {
      id: notification.id,
      title: notification.title,
      message: notification.message,
    });
  }

  static async getUserNotifications(userId: string) {
    // compatibilidade: retorna todas sem paginação
    const notifications = await NotificationRepository.findByUser(userId);

    return notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      read: n.reads[0]?.read ?? false,
      createdAt: n.createdAt,
    }));
  }

  static async getUserNotificationsPaginated(
    userId: string,
    page: number = 1,
    perPage: number = 20,
  ) {
    const { notifications, total } = await NotificationRepository.findByUserPaginated(
      userId,
      page,
      perPage,
    );

    const data = notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      read: n.reads[0]?.read ?? false,
      createdAt: n.createdAt,
    }));

    const totalPages = Math.ceil(total / perPage);

    return { data, total, page, perPage, totalPages };
  }

  static async markAsRead(userId: string, notificationId: string) {
    return NotificationRepository.markAsRead(userId, notificationId);
  }

  static async markAllAsRead(userId: string) {
    return NotificationRepository.markAllAsRead(userId);
  }

  static async deleteNotification(userId: string, notificationId: string) {
    return NotificationRepository.delete(userId, notificationId);
  }
}
