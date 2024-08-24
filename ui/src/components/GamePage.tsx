import { FC } from "react"
import { Link } from "react-router-dom"

export const GamePage: FC = () => {  
  return (
    <div>
      <Link to="/">Top</Link> | <Link to="/game">Game</Link> | <Link to="/create-quiz">CreateQuiz</Link>
      <div>This is a game page.</div>
    </div>
  )
}