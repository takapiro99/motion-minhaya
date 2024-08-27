import { FC } from "react";
import { ToTopPageButton } from "../utils/ToTopPageButton";

// type WaitingRoomUnjoinableProps = {}

export const WaitingRoomUnjoinable: FC = () => {  
  return (
    <>
      <div>満員のため入室できませんでした</div>
      <ToTopPageButton />
    </>
  )
}