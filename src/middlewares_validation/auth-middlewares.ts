import {NextFunction, Response, Request} from "express";
import {StatusCode} from "../models/common";
import dotenv from 'dotenv';


dotenv.config()

export const authMiddleware = (req: Request,
                               res: Response,
                               next: NextFunction) => {

    const auth = req.headers['authorization']
    if (!auth) {
        res.sendStatus(StatusCode.Unauthorized_401)
        return
    }

    const [basic, token] = auth.split(" ")
    if (basic !== 'Basic') {
        res.sendStatus(StatusCode.Unauthorized_401)
        return
    }
    const decodedData = Buffer.from(token, 'base64').toString()
    //admin:qwerty
    const [login, password] = decodedData.split(":")

    if (login !== process.env.AUTH_LOGIN || password !== process.env.AUTH_PASSWORD) {
        res.sendStatus(StatusCode.Unauthorized_401)
        return

    }
    return next();

}