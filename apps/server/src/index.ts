import express, { Request, Response } from "express";
import SocketService from "./services/socket";
import { startMessageConsumer } from "./services/kafka";
import prismaClient from "./services/prisma";
import cors from "cors";

async function init() {
  startMessageConsumer();
  const socketService = new SocketService();
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/messages", async (req: Request, res: Response) => {
    const messages = await prismaClient.message.findMany();
    res.json(messages);
  });

  // User Login
  app.post("/api/login", async (req: Request, res: Response) => {
    const { name, password } = req.body;
    const user = await prismaClient.user.findFirst({
      where: { name: name },
    });
    if (!user || user.password !== password) {
      console.log('unsucess')
      res.status(401).json({message: "Invalid username or password"});
      return;
    }
    res.status(200).json({message:"Login successful"});
  });

  // User Registration
  app.post("/api/register", async (req: Request, res: Response) => {
    const { name, password } = req.body;
    console.log(name, password)
    const existingUser = await prismaClient.user.findFirst({
      where: { name },
    });
    if (existingUser) {
      res.status(400).json({message:"User already exists"});
      return;
    }
    const newUser = await prismaClient.user.create({
      data: { name, password },
    });
    res.status(201).json({message:"Registered"});
  });

  app.use((req: Request, res: Response) => {
    res.status(404).send("Not Found");
  });

  const PORT = process.env.PORT || 8000;

  const server = app.listen(PORT, () => {
    console.log(`Express server started at PORT:${PORT}`);
  });

  socketService.io.attach(server);

  socketService.initListeners();
}

init();
