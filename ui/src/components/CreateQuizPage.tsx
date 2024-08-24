import { FC } from "react"
import { Link } from "react-router-dom"

export const CreateQuizPage: FC = () => {  
  return (
    <div>
      <Link to="/">Top</Link> | <Link to="/game">Game</Link> | <Link to="/create-quiz">CreateGame</Link>
      <div>This is a create quiz page.</div>
    </div>
  )
}