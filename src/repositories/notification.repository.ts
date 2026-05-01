import { prisma } from "lib/prisma";

export class NotificationRepository {
  static async findByUser(userId: string) {
    // manter compatibilidade: retornar todas notificações do usuário
    return prisma.notification.findMany({
      include: {
        reads: {
          where: { userId },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findByUserPaginated(
    userId: string,
    page: number = 1,
    perPage: number = 20,
  ) {
    const where = {
      reads: { some: { userId } },
    };

    const total = await prisma.notification.count({ where });

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        reads: {
          where: { userId },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return { notifications, total };
  }

  static async markAsRead(userId: string, notificationId: string) {
    return prisma.notificationRead.update({
      where: {
        userId_notificationId: {
          userId,
          notificationId,
        },
      },
      data: { read: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notificationRead.updateMany({
      where: {
        userId,
        read: false,
      },
      data: { read: true },
    });
  }

  static async delete(userId: string, notificationId: string) {
    // deleteMany não lança se o registro não existir — evita PrismaClientKnownRequestError
    const result = await prisma.notificationRead.deleteMany({
      where: {
        userId,
        notificationId,
      },
    });

    return result;
  }
}
