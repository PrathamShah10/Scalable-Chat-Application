"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "../context/SocketProvider";
import classes from "./page.module.css";

export default function Page() {
  const { sendMessage, updateMessages, messages } = useSocket();
  const [message, setMessage] = useState("");
  const [name, setName] = useState("Anonymous");
  const router = useRouter();
  useEffect(() => {
    const name = localStorage.getItem("username");
    if (!name) {
      router.push("/signin");
    }
  }, []);
  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) {
      setName(username);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("http://localhost:8000/api/messages");
      const data = await res.json();
      const newMessages = await data.map(
        (m: { text: string; senderName: string }) => {
          return { senderName: m.senderName, message: m.text };
        }
      );
      updateMessages(newMessages);
    };

    fetchData();
  }, []);
  return (
    <div className={classes["chat-container"]}>
      <div className={classes["chat-messages"]}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${classes["message-container"]} ${
              msg.senderName === name
                ? classes["own-message"]
                : classes["other-message"]
            }`}
          >
            <div className={classes["message-sender"]}>{msg.senderName}</div>
            <div className={classes["message-content"]}>{msg.message}</div>
          </div>
        ))}
      </div>
      <div className={classes["chat-input-container"]}>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={classes["chat-input"]}
        />
        <button
          onClick={() => {
            sendMessage(message, name);
            setMessage("");
          }}
          className={classes["button"]}
        >
          Send
        </button>
      </div>
    </div>
  );
}
