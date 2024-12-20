import { FC, useContext, useEffect } from "react";
import { Button } from "semantic-ui-react";
import { SocketContext } from "../../SocketContext";
import { useQuizStatus } from "../../hooks/useQuizStatus";
import { useCountdown } from "../../hooks/useCountdown";
import { UsersInfo } from "./UsersInfo";
import { ParticipantsMatched } from "./ParticipantsMatched";
import { GameThinking } from "./GameThinking";
import { GameAnswering } from "./GameAnswering";
import { QuizResult } from "./QuizResult";
import useSound from "use-sound";
import buttonPressedSound from "/music/buttonPressed.mp3?url";
import timeout from "/music/timeout.mp3";

// type GameOngoingProps = {}

export const GameOngoing: FC = () => {
  const { game, updateClientStatus, user, buttonPressed, guessAnswer } =
    useContext(SocketContext);
  const currentQuiz = game.quizzes
    ? game.quizzes[game.currentQuizNumberOneIndexed - 1]
    : null;
  const { quizStatus, updateQuizStatus } = useQuizStatus({
    // leftTime を渡した方が綺麗かも
    motionStartTimestamp: currentQuiz?.motionStartTimestamp ?? null,
    answerFinishTimestamp: currentQuiz?.answerFinishTimestamp ?? null,
    currentQuiz: currentQuiz,
  });
  const { leftTime } = useCountdown({
    answerFinishTimestamp: currentQuiz?.answerFinishTimestamp ?? null,
  });
  const [playButtonPressedSound] = useSound(buttonPressedSound, {
    volume: 0.3,
  });
  const [playTimeout] = useSound(timeout, { volume: 0.3 });

  useEffect(() => {
    if (quizStatus === "IN_RESULT") {
      playTimeout();
    }
  }, [quizStatus]);

  const handleAnswerButtonClick = () => {
    playButtonPressedSound();
    updateQuizStatus("ANSWERING");
    buttonPressed({
      gameId: game.gameId as string,
      quizNumber: game.currentQuizNumberOneIndexed as number,
      clientId: user.clientId as string,
      buttonPressedTimestamp: Date.now(),
    });
  };

  const handleSubmitButtonClick = (guess: string) => {
    updateQuizStatus("ANSWERED");
    guessAnswer({
      clientId: user.clientId as string,
      gameId: game.gameId as string,
      quizNumber: game.currentQuizNumberOneIndexed as number,
      guess: guess,
    });
  };

  if (quizStatus === "NOT_STARTED") {
    return <ParticipantsMatched />;
  }

  if (quizStatus === "CAN_ANSWER") {
    return (
      <GameThinking
        quizNum={game.currentQuizNumberOneIndexed ?? -1}
        leftTime={leftTime}
        handleAnswerButtonClick={handleAnswerButtonClick}
      />
    );
  }

  if (quizStatus === "ANSWERING") {
    return (
      <GameAnswering
        quizNum={game.currentQuizNumberOneIndexed ?? -1}
        leftTime={leftTime}
        handleSubmit={handleSubmitButtonClick}
      />
    );
  }
  if (quizStatus === "ANSWERED") {
    return (
      <GameAnswering
        quizNum={game.currentQuizNumberOneIndexed ?? -1}
        leftTime={leftTime}
        handleSubmit={handleSubmitButtonClick}
        answered={true}
      />
    );
  }

  if (quizStatus === "IN_RESULT") {
    if (currentQuiz) return <QuizResult quiz={currentQuiz} />;
  }

  return (
    <>
      <div>第 {game.currentQuizNumberOneIndexed} 問</div>
      <div>残り {leftTime} 秒</div>
      <UsersInfo
        participants={game.participants}
        guesses={
          game.quizzes?.find(
            (quiz) => quiz.quizNumber === game.currentQuizNumberOneIndexed,
          )?.guesses ?? null
        }
        gameResult={game.gameResult}
      />
      {quizStatus === "IN_RESULT" && <div>結果を表示しています。</div>}
      <Button onClick={() => updateClientStatus("GAME_FINISIED")}>次へ</Button>
    </>
  );
};
