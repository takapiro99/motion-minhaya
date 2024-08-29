import { FC, useContext } from "react";
import { Button, Input } from "semantic-ui-react";
import { SocketContext } from "../../SocketContext";
import { useQuizStatus } from "../../hooks/useQuizStatus";
import { useCountdown } from "../../hooks/useCountdown";

// type GameOngoingProps = {}

// 動作未検証
export const GameOngoing: FC = () => {
  const { game, updateClientStatus, user, buttonPressed } = useContext(SocketContext)
  const currentQuiz = game.quizzes ? game.quizzes[game.currentQuizNumberOneIndexed - 1] : null
  const { quizStatus, updateQuizStatus } = useQuizStatus({ // leftTime を渡した方が綺麗かも
    motionStartTimestamp: currentQuiz?.motionStartTimestamp ?? null,
    answerFinishTimestamp: currentQuiz?.answerFinishTimestamp ?? null,
  })
  const { leftTime } = useCountdown({
    answerFinishTimestamp: currentQuiz?.answerFinishTimestamp ?? null
  })

  const handleAnswerButtonClick = () => {
    updateQuizStatus("ANSWERING")
    buttonPressed({
      gameId: game.gameId as string,
      quizNumber: game.currentQuizNumberOneIndexed as number,
      clientId: user.clientId as string,
      buttonPressedTimestamp: Date.now(),
    })
  }

  const handleSubmitButtonClick = () => {
    updateQuizStatus("ANSWERED")
  }
  
  return (
    <>
      <div>第 {game.currentQuizNumberOneIndexed} 問</div>
      <div>残り {leftTime} 秒</div>
      {quizStatus === "NOT_STARTED" && <div>まだ問題が始まっていません。</div>}
      {quizStatus === "CAN_ANSWER" && (
        <div>
          <div>問題が始まりました。回答ボタンを押すと回答できます。</div>
          <Button onClick={handleAnswerButtonClick}>回答する</Button>
        </div>
      )}
      {quizStatus === "ANSWERING" && (
        <div>
          <div>回答中です。</div>
          <Input />
          <Button onClick={handleSubmitButtonClick}>提出する</Button>
        </div>
      )}
      {quizStatus === "ANSWERED" && <div>回答を提出しました。</div>}
      {quizStatus === "IN_RESULT" && <div>結果を表示しています。</div>}
      <Button onClick={() => updateClientStatus("GAME_FINISIED")}>次へ</Button>
    </>
  )
}