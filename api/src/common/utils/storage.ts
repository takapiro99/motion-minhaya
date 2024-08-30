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
        // BlobとしてJSONデータを作成
        const blob = Buffer.from(JSON.stringify(data));

        // アップロード先のファイル名
        const fileName = `motion/${data.quizID}.json`;
        const file = bucket.file(fileName);

        // GCSにBlobをアップロード
        await file.save(blob, {
            contentType: 'application/json',
        });
    },
    listAllQuizzes: async () => {
        const [files] = await bucket.getFiles({ prefix: 'motion/' });
        return files.map((file) => file.name);
    },
    getQuizById: async (quizID: string): Promise<QuizInfo> => {
        const file = bucket.file(`motion/${quizID}.json`);
        const [content] = await file.download();
        return JSON.parse(content.toString());
    }
}



