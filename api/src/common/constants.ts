export const constants = {
  // 参加者
  PARTICIPANTS_PER_GAME: 4, // 人

  // 1問ごとの回答時間（実質使ってない）
  ANSWER_TIME_MS: 400 * 1000,

  // みんな集まってからGameを始めるまで
  PARTICIPANTS_GATHERING_START_GAME_MS: 1.5 * 1000,

  // クイズ1問目の開始まで
  START_GAME_TO_START_QUIZ1_MS: 3 * 1000,

  // みんなの回答が集まってから結果発表まで
  ANSWERS_GATHERING_TO_QUIZ_RESULT_MS: 1.5 * 1000,

  // 結果発表から次のクイズまで
  QUIZ_RESULT_TO_NEXT_QUIZ_MS: 7 * 1000,

  NUMBER_OF_QUIZZES: 3,
};
