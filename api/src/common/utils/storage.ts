import { Storage } from '@google-cloud/storage';

const bucketName = 'motion-minhaya-motion';


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
    try {
      // BlobとしてJSONデータを作成
      const blob = Buffer.from(JSON.stringify(data));

      // アップロード先のファイル名
      const fileName = `motion/${data.quizID}.json`;
      const file = bucket.file(fileName);

      // GCSにBlobをアップロード
      await file.save(blob, {
        contentType: 'application/json',
      });
    } catch (error) {
      return console.error(error);
    }
  },
  listAllQuizzes: async () => {
    try {
      const [files] = await bucket.getFiles({ prefix: 'motion/' });
      return files.map((file) => file.name);
    } catch (error) {
      return console.error(error);
    }
  },
  getQuizById: async (quizID: string): Promise<QuizInfo | null> => {
    try {
      const file = bucket.file(`motion/${quizID}.json`);
      const [content] = await file.download();
      return JSON.parse(content.toString());
    } catch (error) {
      console.error(error);
      return null
    }
  }
}



