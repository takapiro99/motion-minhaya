import { Storage } from '@google-cloud/storage';

const bucketName = 'motion-minhaya-motion';


export type QuizInfo = {
    quizID: string;
    createdTimestamp: string;
    pose: any[]; // 正規化されてない状態
    answers: string[];
    screenAspectRatio: number; // 縦/横
};

// Creates a client
const storage = new Storage();
const bucket = storage.bucket(bucketName);

export async function uploadNewQuiz(data: QuizInfo) {
    // BlobとしてJSONデータを作成
    const blob = Buffer.from(JSON.stringify(data));

    // アップロード先のファイル名
    const fileName = `motion/${Date.now()}.json`;
    const file = bucket.file(fileName);

    // GCSにBlobをアップロード
    await file.save(blob, {
        contentType: 'application/json',
    });
}


