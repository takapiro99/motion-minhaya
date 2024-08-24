import { AppRoutes } from './AppRoutes'
import { SocketContextProvider } from './SocketContext'

function App() {
  return (
    <SocketContextProvider>
      <AppRoutes />
    </SocketContextProvider>
  )
}

export default App
