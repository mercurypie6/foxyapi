import { Request, Response, NextFunction } from "express";
import moment from "moment";

const logger = (req: Request, res: Response, next: NextFunction): void => {
  console.log(
    `#${req.protocol}://${req.get("host")}${
      req.originalUrl
    }:${moment().format()}`
  );
  next();
};

export default logger;
