import { FC, useContext } from "react";
import { SocketContext } from "../../SocketContext";

// type GameStartedProps = {}

export const GameStarted: FC = () => { 
  const { game } = useContext(SocketContext)
  
  return (
    <>
      <div>ゲーム開始！！！</div>
      <ul>
        {game.participants?.map((participant) => {
          return (
            <li>{participant.name}</li>
          )
        })}
      </ul>
    </>
  )
}