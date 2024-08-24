import { createContext, FC, ReactNode } from "react";
import { io, Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket
}

const socket = io("localhost:8080")

export const SocketContext = createContext<SocketContextType>({socket})

export const SocketContextProvider: FC<{children: ReactNode}> = ({children}) => {
  return (
    <SocketContext.Provider value={{socket}}>
      {children}
    </SocketContext.Provider>
  )
}