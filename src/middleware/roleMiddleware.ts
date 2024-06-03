import { NextFunction, Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import { ICustomRequest, IExtendedJwtPayload } from "./authMiddleware";
import { errorSerializer } from "../errors/errorSerializer";

const secretKey = process.env.SECRET_KEY;

export default function roleMiddleware (role: string) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (req.method === "OPTIONS") {
      next();
    }

    try {
      const token = String(req.headers.authorization?.split(" ")[1]);
      if (!token) {
        return res.status(403).json({ message: "User not authoriiized" });
      }
      const decoded = jwt.verify(token, secretKey as Secret) as IExtendedJwtPayload;  
      const { roles: userRoles } = decoded;
      let hasRole = false;
      if (userRoles) {
        hasRole = userRoles.includes(role) ? true : false;       
      }      
      if (!hasRole) {
        return res.status(403).json({ message: "User has no permission" });
      } else {
        (req as ICustomRequest).user = decoded
      }
      next();
    } catch (e: unknown) {
      const message = errorSerializer(e)
      res.status(403).json({ message });
    }
  };
};
