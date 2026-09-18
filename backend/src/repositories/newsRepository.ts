import { ARTICLES } from "../data/articles";
import { NICHES, VOICES, Voice } from "../data/niches";
import { NewsArticle } from "../types";

export interface NewsRepository {
  listNiches(): readonly string[];
  listVoices(): readonly Voice[];
  findVoice(id: string): Voice | undefined;
  listByNiches(niches: string[]): NewsArticle[];
  search(params: { category?: string; query?: string }): NewsArticle[];
}

class InMemoryNewsRepository implements NewsRepository {
  listNiches(): readonly string[] {
    return NICHES;
  }

  listVoices(): readonly Voice[] {
    return VOICES;
  }

  findVoice(id: string): Voice | undefined {
    return VOICES.find((voice) => voice.id === id);
  }

  listByNiches(niches: string[]): NewsArticle[] {
    const preferred = sortByRecency(ARTICLES.filter((article) => niches.includes(article.category)));
    const rest = sortByRecency(ARTICLES.filter((article) => !niches.includes(article.category)));
    return [...preferred, ...rest];
  }

  search({ category, query }: { category?: string; query?: string }): NewsArticle[] {
    let articles = sortByRecency(ARTICLES);
    if (category && category !== "All") {
      articles = articles.filter((article) => article.category === category);
    }
    if (query) {
      const q = query.toLowerCase();
      articles = articles.filter(
        (article) =>
          article.title.toLowerCase().includes(q) ||
          article.summary.toLowerCase().includes(q) ||
          article.source.toLowerCase().includes(q)
      );
    }
    return articles;
  }
}

function sortByRecency(list: NewsArticle[]): NewsArticle[] {
  return [...list].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export const newsRepository: NewsRepository = new InMemoryNewsRepository();
