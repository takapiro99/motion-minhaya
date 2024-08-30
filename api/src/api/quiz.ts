import { QuizInfo, storageAPI } from "@/common/utils/storage";
import { Request, Response } from "express";
import { v4 } from "uuid";

export const quizUploadHandler = async (req: Request, res: Response) => {
    console.log("save new quiz!");
    const quizInfo = req.body as QuizInfo;
    if (!quizInfo.answers || !quizInfo.createdAt || !quizInfo.pose || !quizInfo.screenAspectRatio) {
        res.status(400).send("Invalid request");
        return;
    }
    quizInfo.quizID = v4();
    try {
        await storageAPI.uploadNewQuiz(quizInfo);
        res.status(200).json({ status: "ok", quizID: quizInfo.quizID });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Failed");
    }
}

export const getQuizHandler = async (req: Request, res: Response) => {
    const quizID = req.params.id;
    if (!quizID) {
        res.status(400).send("Invalid request");
        return;
    }
    const quizInfo = await storageAPI.getQuizById(quizID)
    if (!quizInfo) {
        res.status(500).send("Quiz not found");
        return;
    }
    res.status(200).send(quizInfo);
}