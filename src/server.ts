import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app";
import { prisma } from "lib/prisma";
declare global {
  var io: Server;
}

const PORT = process.env.PORT;
// cria server HTTP
const server = http.createServer(app);
// cria socket
const io = new Server(server, {
  cors: { origin: "*" },
});
// deixa global (MVP)
global.io = io;
// config socket
io.on("connection", (socket) => {
  console.log("conectado:", socket.id);
  socket.on("join", ({ role }) => {
    if (role === "STUDENT") socket.join("students");
  });

  socket.on("disconnect", () => {
    console.log("❌ desconectou:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 rodando na porta ${PORT}`);
});

// shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
