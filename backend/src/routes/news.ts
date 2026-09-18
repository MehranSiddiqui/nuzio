import { Router } from "express";
import { discover, getBrief, getNiches } from "../controllers/newsController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/niches", getNiches);
router.get("/brief", requireAuth, getBrief);
router.get("/discover", requireAuth, discover);

export default router;
