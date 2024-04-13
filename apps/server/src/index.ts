import http from "http";
import SocketService from "./services/socket";
import { startMessageConsumer } from "./services/kafka";
import prismaClient from "./services/prisma";
import cors from "cors";

async function init() {
  startMessageConsumer();
  const socketService = new SocketService();

  const httpServer = http.createServer(async (req, res) => {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Access-Control-Allow-Headers"
    );
    if (req.url === "/api/messages" && req.method === "GET") {
      const messages = await prismaClient.message.findMany();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(messages));
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  });
  const PORT = process.env.PORT ? process.env.PORT : 8000;
  // httpServer.use(cors());
  socketService.io.attach(httpServer);

  httpServer.listen(PORT, () =>
    console.log(`HTTP Server started at PORT:${PORT}`)
  );

  socketService.initListeners();
}

init();
