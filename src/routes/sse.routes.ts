
import Router, { Request, Response } from "express";
import { sse } from "./../utils/sse";

const sseRouter = Router();

sseRouter.get("/stream/:userId", (req: Request, res: Response) => {
  sse._init(req, res);
});

export { sseRouter } ;
