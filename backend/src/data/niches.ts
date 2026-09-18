export const NICHES = [
  "AI & Technology",
  "Financial Markets",
  "Indian Business",
  "Global Politics",
  "Startups",
  "Cybersecurity",
  "Health & Medicine",
  "Climate & Energy",
  "Sports",
  "Culture & Arts",
  "Legal & Policy",
] as const;
export type Niche = (typeof NICHES)[number];

export const VOICES = [
  { id: "aria", name: "Aria", language: "English", accent: "British" },
  { id: "kai", name: "Kai", language: "English", accent: "American" },
  { id: "meera", name: "Meera", language: "Hindi", accent: "Indian" },
] as const;
export type Voice = (typeof VOICES)[number];
