import { createContext, FC, ReactNode, useEffect } from "react";
import { io, Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket;
  ping: () => void;
  enterWaitingRoom: (name: string) => void;
};

const socket = io(import.meta.env.SERVER_ORIGIN ?? "localhost:8080");

const ping = () => socket.emit("game", { action: "PING" });

const enterWaitingRoom = (name: string) => {
  socket.emit("game", {
    "action": "ENTER_WAITING_ROOM", 
    "name": name,
  })
}

export const SocketContext = createContext<SocketContextType>({ socket, ping, enterWaitingRoom });

export const SocketContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected!", socket);
    });
    socket.on("game", (message) => {
      console.log(message);
      if (message.event === "PONG") {
        console.log("PONG received!");
        // update state なりなんなり
      }
    });
  }, []);

  return (
    <SocketContext.Provider value={{ socket, ping, enterWaitingRoom }}>
      {children}
    </SocketContext.Provider>
  );
};
