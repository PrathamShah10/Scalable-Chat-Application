"use client";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketProviderProps {
  children?: React.ReactNode;
}
interface ISocketContext {
  sendMessage: (msg: string, name: string) => any;
  updateMessages: (
    newMessages: { senderName: string; message: string }[]
  ) => any;
  messages: { senderName: string; message: string }[];
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const state = useContext(SocketContext);
  if (!state) throw new Error(`state is undefined`);

  return state;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<
    { senderName: string; message: string }[]
  >([]);

  const sendMessage: ISocketContext["sendMessage"] = useCallback(
    (msg: string, name: string) => {
      console.log("Send Message", msg);
      if (socket) {
        socket.emit("event:message", { message: msg, senderName: name });
      }
    },
    [socket]
  );

  const updateMessages = (
    newMessages: { senderName: string; message: string }[]
  ) => {
    setMessages(newMessages);
  };

  const onMessageRec = useCallback((msg: string) => {
    console.log("From Server Msg Rec", msg);
    const { message, senderName } = JSON.parse(msg) as {
      message: string;
      senderName: string;
    };
    setMessages((prev) => [...prev, { senderName, message }]);
  }, []);

  useEffect(() => {
    const _socket = io("http://localhost:8000");
    _socket.on("message", onMessageRec);
    setSocket(_socket);

    return () => {
      _socket.off("message", onMessageRec);
      _socket.disconnect();
      setSocket(undefined);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ sendMessage, updateMessages, messages }}>
      {children}
    </SocketContext.Provider>
  );
};
