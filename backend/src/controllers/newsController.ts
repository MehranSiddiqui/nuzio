import { Request, Response } from "express";
import { newsRepository } from "../repositories/newsRepository";

export function getNiches(_req: Request, res: Response) {
  return res.json({ niches: newsRepository.listNiches(), voices: newsRepository.listVoices() });
}

export function getBrief(req: Request, res: Response) {
  const user = req.user!;
  const niches = user.niches.length > 0 ? user.niches : newsRepository.listNiches().slice(0, 3);
  const articles = newsRepository.listByNiches([...niches]).slice(0, 6);
  const totalAudioSec = articles.reduce((sum, article) => sum + article.audioSec, 0);
  const voice = newsRepository.findVoice(user.voice) ?? newsRepository.listVoices()[0];

  return res.json({
    greetingName: user.name.split(" ")[0],
    itemCount: articles.length,
    totalAudioSec,
    voice,
    articles,
  });
}

export function discover(req: Request, res: Response) {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const query = typeof req.query.q === "string" ? req.query.q : undefined;

  return res.json({ articles: newsRepository.search({ category, query }) });
}
