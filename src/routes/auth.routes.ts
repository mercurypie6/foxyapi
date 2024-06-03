import { Router } from "express";
import { check } from "express-validator";
import authMiddleware from "./../middleware/authMiddleware";
import { authController } from "../controllers//authController";

const router = Router();

router.post(
  "/registration",
  [
    check("firstName", "firstName field should not be empty").notEmpty(),
    check("lastName", "lastName field should not be empty").notEmpty(),
    check("email", "Uncorrect email").isEmail(),
    check(
      "password",
      "Password must be longer than 5 and shorter than 13"
    ).isLength({
      min: 6,
      max: 12,
    }),
  ],
  authController.registration
);

router.post("/login", authController.login);

router.get("/auth", authMiddleware, authController.auth);

export { router } ;
