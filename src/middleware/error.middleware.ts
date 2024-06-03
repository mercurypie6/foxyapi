import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/ApiError";


export const errorHandler: ErrorRequestHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (error instanceof ApiError) {       
        return res.status(error.status).json({ message: error.message})
    }    
    return res.status(500).json({message: error.message || "unknown error"})    
};
