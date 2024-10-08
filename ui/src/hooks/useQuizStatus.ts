import { useEffect, useState } from "react"
import { QuizStatus } from "../domain/type"
import { Quiz } from "../../../api/src/common/models/game"

type UseQuizStatusProps = {
  motionStartTimestamp: number | null,
  answerFinishTimestamp: number | null,
  currentQuiz: Quiz | null,
}

type UseQuizStatus = {
  quizStatus: QuizStatus,
  updateQuizStatus: (quizStatus: QuizStatus) => void,
}

// 動作未検証
export const useQuizStatus = ({
  motionStartTimestamp,
  answerFinishTimestamp,
  currentQuiz
}: UseQuizStatusProps): UseQuizStatus => {
  const [quizStatus, setQuizStatus] = useState<QuizStatus>("NOT_STARTED")

  useEffect(() => {
    if (motionStartTimestamp !== null && answerFinishTimestamp !== null) {
      const currentTime = Date.now()

      const motionTimer = setTimeout(() => {
        setQuizStatus("CAN_ANSWER")
      }, motionStartTimestamp - currentTime)
      const finishTimer = setTimeout(() => {
        setQuizStatus("IN_RESULT")
      }, answerFinishTimestamp - currentTime)

      return () => {
        clearTimeout(motionTimer)
        clearTimeout(finishTimer)
      }
    }
  }, [motionStartTimestamp, answerFinishTimestamp])

  useEffect(() => {
    if (currentQuiz) {
      if (currentQuiz.answers.length > 0) {
        setQuizStatus("IN_RESULT")
      }
    }
  })

  return {
    quizStatus: quizStatus,
    updateQuizStatus: setQuizStatus,
  }
}