import { NotificationJob } from "service/notificationJob.service";

async function main() {
  console.log("Iniciando envio de aulas");
  try {
    await NotificationJob.sendDailyClasses();
    console.log("Emails enviados");
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

main();
