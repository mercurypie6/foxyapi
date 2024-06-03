import { Request, Response } from "express";
import { UserModel } from "../models/User";
import { RoleModel } from "../models/Role";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { check, validationResult } from "express-validator";
import { errorSerializer } from "../errors/errorSerializer";
import { ICustomRequest } from "../middleware/authMiddleware";


const secretKey = process.env.SECRET_KEY;


class AuthController {
  async registration(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "uncorrect request",
        });
      }
      const { firstName, lastName, email, password } = req.body;      
      const candidate = await UserModel.findOne({ email });

      if (candidate) {        
        return res
          .status(400)
          .json({ message: `User with email ${email} already exist` });
      }
      const hashPassword = bcrypt.hashSync(password, 8);      
      const userRole = await RoleModel.findOne({ value: "User" });
      const created = new Date();
      const user = new UserModel({
        firstName,
        lastName,
        email,
        password: hashPassword,
        created,
        roles: [userRole?.value],
      });
      await user.save();
      return res.status(201).json({ message: "new user created", user });
    } catch (e: unknown) {
      const message = errorSerializer(e)
      res.status(400).json({ message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      const isPassValid = bcrypt.compareSync(password, user.password);

      if (!isPassValid) {
        return res.status(400).json({ message: "incorrect password" });
      }

      const token = jwt.sign({ id: user._id, roles: user.roles }, secretKey as Secret, {
        expiresIn: "1200s",
      });
      return res.status(200).json({
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          roles: user.roles,
          avatar: user.avatar || null,
        },
      });
    } catch (e: unknown) {
      const message = errorSerializer(e)
      res.status(500).json({ message });
    }
  }

  async auth(req: Request, res: Response) {
    
    try {
      const user = await UserModel.findOne({ _id: (req as ICustomRequest).user.id });    
      if (user) {
        const token = jwt.sign({ id: user.id }, secretKey as Secret, {
          expiresIn: "1200s",
        });
        return res.json({
          token,
          user: {
            id: user.id,
            email: user.email,
            avatar: user.avatar,
          },
        });
      }       
    } catch (e: unknown) {
      const message = errorSerializer(e)      
      res.status(403).json({ message });
    }
  }
}
const authController = new AuthController();
export { authController }
