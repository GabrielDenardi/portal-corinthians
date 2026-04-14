import type { CategorySlug } from "@portal-corinthians/contracts";

const CATEGORY_KEYWORDS: Array<{ category: CategorySlug; keywords: string[] }> = [
  { category: "feminino", keywords: ["feminino", "brabas"] },
  { category: "base", keywords: ["sub-17", "sub-20", "base", "copinha"] },
  { category: "mercado", keywords: ["mercado", "janela", "reforço", "contratação", "negociação"] },
  { category: "torcida", keywords: ["torcida", "ingresso", "arquibancada", "neo química", "mosaico"] },
  { category: "clube", keywords: ["diretoria", "presidente", "parque são jorge", "clube", "gestão"] },
];

export function inferCategoryFromText(input: string): CategorySlug {
  const normalized = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const matched = CATEGORY_KEYWORDS.find(({ keywords }) =>
    keywords.some((keyword) => normalized.includes(keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))),
  );

  return matched?.category ?? "profissional";
}
