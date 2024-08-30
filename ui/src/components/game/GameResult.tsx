import { FC, useContext } from "react";
import { SocketContext } from "../../SocketContext";
import { createUseStyles } from "react-jss";

// type GameResultProps = {}

const useStyles = createUseStyles({
  results: {
    display: "flex",
    // justifyContent: "center",
    justifyContent: "space-between",
    // flexFlow: "column",
    flexDirection: "column",
    width: "100%",
    gap: "12px",
  },
  result: {
    // height: "36px",
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
  rank: {
    // width: "20%",
  },
  name: {
    // width: "50%",
  },
  gamePoint: {
    // width: "30%",
  },
});

export const GameResult: FC = () => {
  const classes = useStyles();
  const { game } = useContext(SocketContext);
  const sortedGameResult =
    game.status === "ONGOING"
      ? game.gameResult.sort((a, b) => b.gamePoint - a.gamePoint)
      : [];

  // css 確認用
  // const exampleGame = [
  //   { name: "aa", gamePoint: 300},
  //   { name: "bb", gamePoint: 100},
  //   { name: "cc", gamePoint: 400},
  //   { name: "dd", gamePoint: 200},
  // ]
  // const sortedExampleGameResult = exampleGame.sort((a, b) => b.gamePoint - a.gamePoint)

  return (
    <div className={classes.results}>
      aa
      {sortedGameResult.map((result, index) => {
        {
          /* {sortedExampleGameResult.map((result, index) => { */
        } // css 確認用
        return (
          <div className={classes.result}>
            <div className={classes.rank}>{index + 1}位</div>
            <div className={classes.name}>{result.name}</div>
            <div className={classes.gamePoint}>{result.gamePoint}pt</div>
          </div>
        );
      })}
    </div>
  );
};
