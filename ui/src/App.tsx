import { AppRoutes } from "./AppRoutes";
import { SocketContextProvider } from "./SocketContext";

function App() {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <SocketContextProvider>
        <AppRoutes />
      </SocketContextProvider>
    </div>
  );
}

export default App;
