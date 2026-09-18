"use client";

import useSWR from "swr";
import { api, BriefResponse, NewsArticle } from "./api";

export function useBrief(enabled: boolean) {
  return useSWR<BriefResponse>(enabled ? "brief" : null, () => api.brief());
}

export function useDiscover(enabled: boolean, params: { category: string; q: string }) {
  const key = enabled ? (["discover", params.category, params.q] as const) : null;
  return useSWR<{ articles: NewsArticle[] }>(key, () =>
    api.discover({ category: params.category, q: params.q || undefined })
  );
}
