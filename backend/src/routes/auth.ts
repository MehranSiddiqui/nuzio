import { Router } from "express";
import {
  getCurrentUser,
  login,
  loginWithGoogle,
  logout,
  register,
  updatePreferences,
} from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { googleSchema, loginSchema, preferencesSchema, registerSchema } from "../schemas/auth";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/google", validateBody(googleSchema), loginWithGoogle);
router.post("/logout", logout);
router.get("/me", requireAuth, getCurrentUser);
router.patch("/me", requireAuth, validateBody(preferencesSchema), updatePreferences);

export default router;
