import { FC, useContext } from "react";

import { SocketContext } from "../../SocketContext";

// type ParticipantsWaitingProps = {}

export const ParticipantsWaiting: FC = () => {
  const { game } = useContext(SocketContext)
  
  return (
    <>
      <div>参加者が集まるまでしばらくお待ちください。</div>
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