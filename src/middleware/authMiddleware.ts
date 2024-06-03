import { NextFunction, Request, Response } from "express";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { errorSerializer } from "../errors/errorSerializer";

const secretKey = process.env.SECRET_KEY;


export interface IExtendedJwtPayload extends JwtPayload {   
  id: string,
  role?: Array<string>,
  iat?: number,
  exp?: number  
}

export interface ICustomRequest extends Request {
  user: IExtendedJwtPayload,
}

export default function authMiddleware (req: Request, res: Response, next: NextFunction) {
 
  if (req.method === "OPTIONS") {
    next();
  }
  try {
    const token = String(req.headers.authorization?.split(" ")[1]);  
    
    if (!token) {      
      return res.status(401).json({ message: "Auth error" });
    } 
    const decoded = jwt.verify(token, secretKey as Secret) as IExtendedJwtPayload;        
    (req as ICustomRequest).user = decoded;   
    return next();    
  } catch (e: unknown) {
    const message = errorSerializer(e)
    return res.status(403).json({ message });
  }
};
