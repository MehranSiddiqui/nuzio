import { Router } from "express";
import { ARTICLES } from "../data/articles";
import { NICHES, VOICES } from "../data/niches";
import { requireAuth } from "../auth";

const router = Router();

router.get("/niches", (_req, res) => {
  res.json({ niches: NICHES, voices: VOICES });
});

function sortByRecency(list: typeof ARTICLES) {
  return [...list].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

// Personalized morning brief: articles from the user's chosen niches first,
// then top-ups from everywhere else so the brief never feels empty.
router.get("/brief", requireAuth, (req, res) => {
  const user = req.user!;
  const niches = user.niches.length > 0 ? user.niches : NICHES.slice(0, 3);

  const preferred = sortByRecency(ARTICLES.filter((a) => niches.includes(a.category)));
  const rest = sortByRecency(ARTICLES.filter((a) => !niches.includes(a.category)));
  const brief = [...preferred, ...rest].slice(0, 6);

  const totalAudioSec = brief.reduce((sum, a) => sum + a.audioSec, 0);
  const voice = VOICES.find((v) => v.id === user.voice) ?? VOICES[0];

  res.json({
    greetingName: user.name.split(" ")[0],
    itemCount: brief.length,
    totalAudioSec,
    voice,
    articles: brief,
  });
});

// Discover feed: full catalogue with optional category/search filtering.
router.get("/discover", requireAuth, (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const q = typeof req.query.q === "string" ? req.query.q.toLowerCase() : undefined;

  let list = sortByRecency(ARTICLES);
  if (category && category !== "All") {
    list = list.filter((a) => a.category === category);
  }
  if (q) {
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q)
    );
  }

  res.json({ articles: list });
});

export default router;
