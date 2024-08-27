import { useState } from "react"
import { ClientStatus } from "../domain/type"

export type UseClientStatus = {
  clientStatus: ClientStatus,
  updateClientStatus: (clientStatus: ClientStatus) => void,
}

// SocketContext に移植したので消すかも
export const useClientStatus = (): UseClientStatus => {
  const [clientStatus, setClientStatus] = useState<ClientStatus>("NAME_INPUTING")
  return {
    clientStatus: clientStatus,
    updateClientStatus: setClientStatus,
  }
}