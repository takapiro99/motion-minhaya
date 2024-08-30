import { createUseStyles } from "react-jss";
import { AppRoutes } from "./AppRoutes";
import { SocketContextProvider } from "./SocketContext";

const useStyles = createUseStyles({
  app: {
    display: "flex",
    justifyContent: "center",
    height: "100%",
    width: "100%"
  },
  appChild: {
    maxWidth: "680px",
  },
})

function App() {
  const classes = useStyles()
  return (
    <div className={classes.app}>
      <div className={classes.appChild}>
        <SocketContextProvider>
          <AppRoutes />
        </SocketContextProvider>
      </div>
    </div>
  );
}

export default App;
