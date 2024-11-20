import { FC, useContext } from "react";
import { SocketContext } from "../../SocketContext";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  results: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "column",
    width: "100%",
    gap: "12px",
  },
  result: {
    width: "90%",
    margin: "0 auto",
    borderRadius: "40px",
    background: "white",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "16px 0",
    fontSize: "1.8rem",
  },
});

export const GameResult: FC = () => {
  const classes = useStyles();
  const { game } = useContext(SocketContext);
  const sortedGameResult =
    game.status === "ONGOING"
      ? game.gameResult.sort((a, b) => b.gamePoint - a.gamePoint)
      : [];

  return (
    <div className={classes.results}>
      {sortedGameResult.map((result, index) => {
        return (
          <div className={classes.result} key={result.clientId}>
            <div>{index + 1}位</div>
            <div>{result.name}</div>
            <div>{result.gamePoint}pt</div>
          </div>
        );
      })}
    </div>
  );
};
