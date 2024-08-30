import { useEffect, useState } from "react"

type UseCountdownProps = {
  answerFinishTimestamp: number | null,
}

type UseCountdown = {
  leftTime: number,
}

export const useCountdown = ({
  answerFinishTimestamp,
}: UseCountdownProps): UseCountdown => {
  const [leftTime, setleftTime] = useState<number>(0)

  useEffect(() => {
    if (answerFinishTimestamp !== null) {
      const updateCountdown = () => {
        const currentTime = Date.now()
        const remainingTime = Math.max((answerFinishTimestamp - currentTime) / 1000, 0)
        setleftTime(remainingTime)
        if (remainingTime <= 0) {
          clearInterval(intervalId)
        }
      }
      updateCountdown()
      const intervalId = setInterval(updateCountdown, 1000)
      return () => clearInterval(intervalId)
    }
  }, [answerFinishTimestamp]);
  
  return { leftTime: Math.ceil(leftTime) }
}