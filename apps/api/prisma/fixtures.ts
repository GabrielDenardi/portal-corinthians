import type { CategorySlug } from "@portal-corinthians/contracts";

import {
  buildArticleBody,
  createArticleSlug,
  estimateReadTime,
  getBadgeForCategory,
  getToneForCategory,
} from "../src/modules/articles/article.helpers";

type FixtureArticleInput = {
  title: string;
  dek: string;
  summary: string;
  category: CategorySlug;
  sourceName: string;
  originalUrl: string;
  imageUrl?: string;
  publishedAt: string;
  featuredRank?: number;
};

function createFixtureArticle(input: FixtureArticleInput) {
  const badge = getBadgeForCategory(input.category);
  const body = buildArticleBody(input.summary, input.category, input.sourceName);

  return {
    slug: createArticleSlug(input.title),
    title: input.title,
    dek: input.dek,
    summary: input.summary,
    category: input.category,
    sourceName: input.sourceName,
    originalUrl: input.originalUrl,
    imageUrl: input.imageUrl ?? null,
    imageAlt: input.title,
    publishedAt: new Date(input.publishedAt),
    readTime: estimateReadTime(body),
    badge: badge.badge,
    badgeLabel: badge.badgeLabel,
    tone: getToneForCategory(input.category),
    featuredRank: input.featuredRank ?? 0,
    body,
  };
}

export const articleFixtures = [
  createFixtureArticle({
    title: "Corinthians afina pressão pós-perda e chega ao dérbi com ajuste claro no meio-campo",
    dek: "Treino fechado reforça circulação curta por dentro e aceleração pelos corredores em transição.",
    summary:
      "A comissão técnica concentrou a semana em encurtar a distância entre volantes e atacantes, reduzindo o tempo de reação defensiva.",
    category: "profissional",
    sourceName: "Agência Corinthians",
    originalUrl: "https://agencia.corinthians.com.br/ultimas/corinthians-ajustes-classico",
    publishedAt: "2026-04-08T18:10:00.000Z",
    featuredRank: 100,
  }),
  createFixtureArticle({
    title: "Corinthians Feminino administra posse alta e amplia repertório em bola parada",
    dek: "Equipe trabalha variações curtas na cobrança lateral para manter o campo inclinado.",
    summary:
      "A leitura interna aponta crescimento de repertório ofensivo e controle de ritmo em jogos de domínio territorial.",
    category: "feminino",
    sourceName: "Corinthians Feminino",
    originalUrl: "https://agencia.corinthians.com.br/futebol-feminino/posse-alta-bola-parada",
    publishedAt: "2026-04-08T17:25:00.000Z",
    featuredRank: 80,
  }),
  createFixtureArticle({
    title: "Diretoria prioriza zagueiro de imposição física e evita pressa no mercado",
    dek: "A leitura interna é de oportunidade, não de volume, para a próxima janela.",
    summary:
      "A diretoria mantém o foco em uma contratação pontual para elevar o nível competitivo do elenco sem abrir muitas frentes ao mesmo tempo.",
    category: "mercado",
    sourceName: "Setoristas credenciados",
    originalUrl: "https://gnews.io/portal-corinthians/diretoria-zagueiro-imposicao",
    publishedAt: "2026-04-08T16:50:00.000Z",
    featuredRank: 70,
  }),
  createFixtureArticle({
    title: "Venda de ingressos acelera e expectativa por Neo Química cheia cresce para o fim de semana",
    dek: "Procura nas últimas horas reforça ambiente de pressão desde a entrada do time em campo.",
    summary:
      "A mobilização da torcida intensificou a procura por ingressos e aqueceu o entorno do clássico com antecedência.",
    category: "torcida",
    sourceName: "Portal Corinthians",
    originalUrl: "https://gabrieldenardi.com.br/portal-corinthians/torcida-ingressos-neo-quimica",
    publishedAt: "2026-04-08T16:05:00.000Z",
    featuredRank: 60,
  }),
  createFixtureArticle({
    title: "Base alvinegra recebe nova leva de observações internas para acelerar transição ao sub-20",
    dek: "Relatórios destacam maturidade competitiva e leitura sem bola entre os jovens mais prontos.",
    summary:
      "O clube ampliou o monitoramento individual de atletas da base para encurtar o caminho até o próximo estágio competitivo.",
    category: "base",
    sourceName: "Observatório da Base",
    originalUrl: "https://gnews.io/portal-corinthians/base-sub20-transicao",
    publishedAt: "2026-04-08T15:25:00.000Z",
    featuredRank: 40,
  }),
  createFixtureArticle({
    title: "Clube ajusta operação de matchday e amplia sinalização interna para agilizar fluxos no estádio",
    dek: "Mudança envolve circulação em acessos, tempo de revista e orientação de portões.",
    summary:
      "A operação do dia de jogo recebeu ajustes para melhorar a experiência no acesso e reduzir gargalos nas entradas da arena.",
    category: "clube",
    sourceName: "Site oficial do Corinthians",
    originalUrl: "https://www.corinthians.com.br/noticias/operacao-matchday-arena",
    publishedAt: "2026-04-08T14:55:00.000Z",
    featuredRank: 35,
  }),
  createFixtureArticle({
    title: "Comissão observa minutagem de titulares e monta rotação curta para sequência pesada",
    dek: "Ideia é preservar intensidade sem descaracterizar a estrutura que deu resposta no último compromisso.",
    summary:
      "A equipe técnica estuda pequenas rotações para segurar intensidade e manter a estrutura competitiva nos próximos jogos.",
    category: "profissional",
    sourceName: "Redação Portal Corinthians",
    originalUrl: "https://gabrieldenardi.com.br/portal-corinthians/rotacao-curta-sequencia-pesada",
    publishedAt: "2026-04-08T14:15:00.000Z",
    featuredRank: 50,
  }),
  createFixtureArticle({
    title: "Torcida organiza mosaico e reforça clima de decisão já na semana pré-jogo",
    dek: "Mobilização digital e presença no entorno do estádio elevaram o tom da preparação.",
    summary:
      "O ambiente de arquibancada ganhou protagonismo ainda antes da rodada com ações coordenadas de torcida e sinalização visual.",
    category: "torcida",
    sourceName: "Portal Corinthians",
    originalUrl: "https://gabrieldenardi.com.br/portal-corinthians/mosaico-semana-pre-jogo",
    publishedAt: "2026-04-08T13:45:00.000Z",
    featuredRank: 30,
  }),
];

export const teamFixtures = [
  {
    externalId: "134615",
    name: "Corinthians",
    normalizedName: "corinthians",
    shortName: "SCCP",
    badgeUrl: "https://static.corinthians.com.br/img/escudo-corinthians-2023.svg",
    country: "Brazil",
    sport: "Soccer",
    alternateNames: ["Sport Club Corinthians Paulista"],
  },
  {
    externalId: "134626",
    name: "Palmeiras",
    normalizedName: "palmeiras",
    shortName: "SEP",
    badgeUrl: "https://upload.wikimedia.org/wikipedia/commons/1/10/Palmeiras_logo.svg",
    country: "Brazil",
    sport: "Soccer",
    alternateNames: ["Sociedade Esportiva Palmeiras"],
  },
  {
    externalId: "134618",
    name: "São Paulo",
    normalizedName: "sao-paulo",
    shortName: "SPFC",
    badgeUrl: "https://upload.wikimedia.org/wikipedia/en/0/05/S%C3%A3o_Paulo_FC_logo.svg",
    country: "Brazil",
    sport: "Soccer",
    alternateNames: ["Sao Paulo Futebol Clube"],
  },
];

export const matchFixtures = [
  {
    externalId: "fixture-next-001",
    competition: "Brasileirão",
    round: "8ª rodada",
    venue: "Neo Química Arena",
    kickOff: new Date("2026-04-12T23:00:00.000Z"),
    broadcast: "Premiere e cobertura em tempo real no portal",
    note: "A pauta do jogo gira em torno da pressão pós-perda, da disputa no meio e do impacto da arquibancada nos primeiros minutos.",
    statusLabel: "Pré-jogo",
    statusTone: "alert",
    homeTeamNormalizedName: "corinthians",
    awayTeamNormalizedName: "palmeiras",
  },
  {
    externalId: "fixture-recent-001",
    competition: "Brasileirão",
    round: "7ª rodada",
    venue: "MorumBIS",
    kickOff: new Date("2026-04-05T21:30:00.000Z"),
    broadcast: "Resumo e análise pós-jogo no portal",
    note: "O recorte desta partida observa controle emocional, comportamento sem bola e impacto do resultado na sequência do Corinthians.",
    statusLabel: "Encerrado",
    statusTone: "warning",
    homeTeamNormalizedName: "sao-paulo",
    awayTeamNormalizedName: "corinthians",
  },
];
