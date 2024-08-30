import { FC, useContext } from "react";
import { SocketContext } from "../../SocketContext";
import { createUseStyles } from "react-jss";

// type GameResultProps = {}

const useStyles = createUseStyles({
  results: {
    display: "flex",
    justifyContent: "center",
    flexFlow: "column",
    gap: "12px",
  },
  result: {
    height: "36px",
    width: "80%",
    borderRadius: "40px",
    background: "white",
  },
  rank: {
    width: "20%",
  },
  name: {
    width: "50%",
  },
  gamePoint: {
    width: "30%",
  },
})

export const GameResult: FC = () => {
  const classes = useStyles()
  const { game } = useContext(SocketContext)
  const sortedGameResult = 
    game.status === "ONGOING" 
      ? game.gameResult.sort((a, b) => b.gamePoint - a.gamePoint)
      : []
  
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
       {sortedGameResult.map((result, index) => {
       {/* {sortedExampleGameResult.map((result, index) => { */} // css 確認用
        return (
          <div className={classes.result}>
            <p className={classes.rank}>{index + 1}位</p>
            <p className={classes.name}>{result.name}</p>
            <p className={classes.gamePoint}>{result.gamePoint}</p>
          </div>
        )
      })}
    </div>
  )
}