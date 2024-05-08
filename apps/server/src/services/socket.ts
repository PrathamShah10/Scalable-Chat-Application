import { Server } from "socket.io";
import Redis from "ioredis";
import prismaClient from "./prisma";
import { produceMessage } from "./kafka";

const pub = new Redis();

const sub = new Redis();

class SocketService {
  private _io: Server;

  constructor() {
    console.log("Init Socket Service...");
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });
    sub.subscribe("MESSAGES");
  }

  public initListeners() {
    const io = this.io;
    console.log("Init Socket Listeners...");

    io.on("connect", (socket) => {
      console.log(`New Socket Connected`, socket.id);
      socket.on(
        "event:message",
        async ({
          message,
          senderName,
        }: {
          message: string;
          senderName: string;
        }) => {
          console.log("New Message Rec.", message);
          // publish this message to redis
          await pub.publish(
            "MESSAGES",
            JSON.stringify({ message, senderName })
          );
        }
      );
    });

    sub.on("message", async (channel, rawMessage) => {
      if (channel === "MESSAGES") {
        // console.log("new message from redis", message);
        // io.emit("message", message);
        // await produceMessage(message);
        // console.log("Message Produced to Kafka Broker");

        const { message, senderName } = JSON.parse(rawMessage);
        console.log("new message from redis", message);
        io.emit("message", JSON.stringify({ message, senderName }));
        await produceMessage({ message, senderName });
        console.log("Message Produced to Kafka Broker");
      }
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
