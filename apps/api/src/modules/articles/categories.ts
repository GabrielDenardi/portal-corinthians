import type { CategoryDTO, CategorySlug } from "@portal-corinthians/contracts";

export const CATEGORY_META: Record<CategorySlug, CategoryDTO> = {
  profissional: {
    slug: "profissional",
    label: "Profissional",
    description: "Treinos, jogo, bastidor e leitura tática do elenco principal.",
  },
  feminino: {
    slug: "feminino",
    label: "Feminino",
    description: "Cobertura do time que sustenta regularidade e protagonismo.",
  },
  base: {
    slug: "base",
    label: "Base",
    description: "Talentos em formação, desempenho e próximos passos no clube.",
  },
  mercado: {
    slug: "mercado",
    label: "Mercado",
    description: "Entradas, saídas, sondagens e impacto na montagem do elenco.",
  },
  torcida: {
    slug: "torcida",
    label: "Torcida",
    description: "Arquibancada, ambiente de jogo e temperatura do noticiário.",
  },
  clube: {
    slug: "clube",
    label: "Clube",
    description: "Gestão, bastidores institucionais e agenda do Parque São Jorge.",
  },
};

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

export function assertCategorySlug(value: string): CategorySlug {
  if (value in CATEGORY_META) {
    return value as CategorySlug;
  }

  throw new Error(`Unsupported category slug: ${value}`);
}
