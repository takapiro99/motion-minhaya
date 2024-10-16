import { Storage } from "@google-cloud/storage";

const bucketName = "motion-minhaya-motion";

export type QuizInfo = {
  quizID: string;
  createdAt: string;
  pose: any[]; // 正規化されてない状態
  answers: string[];
  screenAspectRatio: number; // 縦/横
};

// Creates a client
const storage = new Storage();
const bucket = storage.bucket(bucketName);

export const storageAPI = {
  uploadNewQuiz: async (data: QuizInfo) => {
    const blob = Buffer.from(JSON.stringify(data));
    const fileName = `motion/${data.quizID}.json`;
    const file = bucket.file(fileName);
    await file.save(blob, { contentType: "application/json" });
  },

  listAllQuizzes: async (): Promise<string[] | null> => {
    try {
      const [files] = await bucket.getFiles({ prefix: "motion/" });
      return files.map((file) => file.name);
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  getQuizById: async (quizID: string): Promise<QuizInfo | null> => {
    try {
      const file = bucket.file(`motion/${quizID}.json`);
      const [content] = await file.download();
      return JSON.parse(content.toString());
    } catch (error) {
      console.error(error);
      return null;
    }
  },
};
