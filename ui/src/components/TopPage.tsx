import { FC } from "react"
import { Link } from "react-router-dom"

export const TopPage: FC = () => {  
  return (
    <div>
      <Link to="/">Top</Link> | <Link to="/game">Game</Link> | <Link to="/create-quiz">CreateQuiz</Link>
      <div>This is a top page.</div>
    </div>
  )
}