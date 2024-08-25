import { FC, useContext } from "react";
import { SocketContext } from "../../SocketContext";

// type ParticipantsMatchedProps = {}

export const ParticipantsMatched: FC = () => {
  const { game } = useContext(SocketContext)
  
  return (
    <>
      <div>参加者が決定しました。ゲーム開始までしばらくお待ちください。</div>
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