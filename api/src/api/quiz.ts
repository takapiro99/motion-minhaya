import { uploadNewQuiz } from "@/common/utils/storage";
import { Request, Response } from "express";

export const quizUploadHandler = async (req: Request, res: Response) => {
    console.log("save new quiz!");
    const quizInfo = req.body;
    try {
        await uploadNewQuiz(quizInfo);
        res.status(200).send("Success");
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Failed");
    }
}