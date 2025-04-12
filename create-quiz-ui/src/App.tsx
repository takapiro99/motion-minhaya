import { createUseStyles } from "react-jss";
import { CreateQuizPage } from "./components/CreateQuizPage";
import "semantic-ui-css/semantic.min.css";

const useStyles = createUseStyles({
  app: {
    display: "flex",
    justifyContent: "center",
    height: "100%",
    width: "100%",
    background: "#111",
  },
  appChild: {
    maxWidth: "680px",
    width: "100%",
  },
});

function App() {
  const classes = useStyles();
  return (
    <div className={classes.app}>
      <div className={classes.appChild}>
        <CreateQuizPage />
      </div>
    </div>
  );
}

export default App;
