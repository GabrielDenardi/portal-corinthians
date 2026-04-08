export type NewsTone = "default" | "alert" | "success" | "warning";

export type NewsCategoryId =
  | "todas"
  | "profissional"
  | "feminino"
  | "base"
  | "mercado"
  | "torcida"
  | "clube";

export interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

export interface FooterGroup {
  title: string;
  links: NavItem[];
}

export interface NewsCategory {
  id: NewsCategoryId;
  label: string;
  description: string;
}

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  categoryId: Exclude<NewsCategoryId, "todas">;
  categoryLabel: string;
  source: string;
  publishedAt: string;
  readTime: string;
  image?: string;
  imageAlt?: string;
  badge?: "breaking" | "live" | "category" | "status";
  badgeLabel?: string;
  tone?: NewsTone;
}

export interface FeaturedStory extends NewsItem {
  subheadline: string;
  highlights: string[];
}

export interface MatchInfo {
  competition: string;
  round: string;
  homeTeam: string;
  awayTeam: string;
  venue: string;
  kickOff: string;
  broadcast: string;
  note: string;
  statusLabel: string;
  statusTone: NewsTone;
}

export const siteNavigation: NavItem[] = [
  { label: "Destaque", href: "#destaque-principal" },
  { label: "Próximo jogo", href: "#proximo-jogo" },
  { label: "Últimas", href: "#ultimas" },
  { label: "Categorias", href: "#categorias" },
  { label: "Mais lidas", href: "#destaques" },
];

export const footerLinkGroups: FooterGroup[] = [
  {
    title: "Portal",
    links: [
      { label: "Home", href: "/" },
      { label: "Últimas notícias", href: "#ultimas" },
      { label: "Cobertura editorial", href: "#categorias" },
    ],
  },
  {
    title: "Editorias",
    links: [
      { label: "Profissional", href: "#categorias" },
      { label: "Feminino", href: "#categorias" },
      { label: "Base", href: "#categorias" },
    ],
  },
  {
    title: "Institucional",
    links: [
      { label: "Política editorial", href: "#footer" },
      { label: "Fontes e créditos", href: "#footer" },
      { label: "Contato", href: "#footer" },
    ],
  },
];

export const newsCategories: NewsCategory[] = [
  {
    id: "todas",
    label: "Todas",
    description: "Panorama geral com os movimentos que puxam o dia.",
  },
  {
    id: "profissional",
    label: "Profissional",
    description: "Treinos, jogo, bastidor e leitura tática do elenco principal.",
  },
  {
    id: "feminino",
    label: "Feminino",
    description: "Cobertura do time que sustenta regularidade e protagonismo.",
  },
  {
    id: "base",
    label: "Base",
    description: "Talentos em formação, desempenho e próximos passos no clube.",
  },
  {
    id: "mercado",
    label: "Mercado",
    description: "Entradas, saídas, sondagens e impacto na montagem do elenco.",
  },
  {
    id: "torcida",
    label: "Torcida",
    description: "Arquibancada, ambiente de jogo e temperatura do noticiário.",
  },
  {
    id: "clube",
    label: "Clube",
    description: "Gestão, bastidores institucionais e agenda do Parque São Jorge.",
  },
];

export const featuredStory: FeaturedStory = {
  id: "featured-derby",
  slug: "#destaque-principal",
  title: "Corinthians afina pressão pós-perda e chega ao dérbi com ajuste claro no meio-campo",
  subheadline:
    "Treino fechado reforça circulação curta por dentro e aceleração pelos corredores em transição.",
  summary:
    "A comissão técnica concentrou a semana em encurtar a distância entre volantes e atacantes, reduzindo o tempo de reação defensiva e melhorando a ocupação do terço final.",
  categoryId: "profissional",
  categoryLabel: "Profissional",
  source: "Redação Portal Corinthians",
  publishedAt: "Atualizado há 18 min",
  readTime: "5 min de leitura",
  badge: "breaking",
  badgeLabel: "Em alta",
  tone: "alert",
  highlights: [
    "Compactação sem a bola virou prioridade desde o pós-jogo.",
    "Treino indicou lado direito mais agressivo nas inversões longas.",
    "Comissão quer entrada forte nos primeiros 20 minutos do clássico.",
  ],
};

export const secondaryHighlights: NewsItem[] = [
  {
    id: "highlight-feminino",
    slug: "#categorias",
    title: "Corinthians Feminino administra posse alta e amplia repertório em bola parada",
    summary:
      "Equipe trabalha variações curtas na cobrança lateral para manter o campo inclinado.",
    categoryId: "feminino",
    categoryLabel: "Feminino",
    source: "Setorista Parque São Jorge",
    publishedAt: "Há 42 min",
    readTime: "3 min",
    badge: "live",
    badgeLabel: "Ao vivo",
    tone: "success",
  },
  {
    id: "highlight-mercado",
    slug: "#categorias",
    title: "Diretoria prioriza zagueiro de imposição física e evita pressa no mercado",
    summary:
      "A leitura interna é de oportunidade, não de volume: reforço precisa elevar o nível do elenco.",
    categoryId: "mercado",
    categoryLabel: "Mercado",
    source: "Mesa de apuração",
    publishedAt: "Há 1 h",
    readTime: "4 min",
    badge: "status",
    badgeLabel: "Monitorando",
    tone: "warning",
  },
  {
    id: "highlight-torcida",
    slug: "#categorias",
    title: "Venda de ingressos acelera e expectativa por Neo Química cheia cresce para o fim de semana",
    summary:
      "Movimento nas últimas horas reforça ambiente de pressão desde a entrada do time em campo.",
    categoryId: "torcida",
    categoryLabel: "Torcida",
    source: "Monitor de arquibancada",
    publishedAt: "Há 1 h",
    readTime: "2 min",
    tone: "default",
  },
];

export const latestStories: NewsItem[] = [
  {
    id: "latest-01",
    slug: "#ultimas",
    title: "Comissão observa minutagem de titulares e monta rotação curta para sequência pesada",
    summary:
      "Ideia é preservar intensidade sem descaracterizar a estrutura que deu resposta no último compromisso.",
    categoryId: "profissional",
    categoryLabel: "Profissional",
    source: "Redação Portal Corinthians",
    publishedAt: "Há 12 min",
    readTime: "4 min",
    tone: "default",
  },
  {
    id: "latest-02",
    slug: "#ultimas",
    title: "Base alvinegra recebe nova leva de observações internas para acelerar transição ao sub-20",
    summary:
      "Relatórios destacam maturidade competitiva e leitura sem bola entre os jovens mais prontos.",
    categoryId: "base",
    categoryLabel: "Base",
    source: "Observatório da base",
    publishedAt: "Há 29 min",
    readTime: "3 min",
    tone: "success",
  },
  {
    id: "latest-03",
    slug: "#ultimas",
    title: "Clube ajusta operação de matchday e amplia sinalização interna para agilizar fluxos no estádio",
    summary:
      "Mudança envolve circulação em acessos, tempo de revista e orientação de portões.",
    categoryId: "clube",
    categoryLabel: "Clube",
    source: "Bastidores do clube",
    publishedAt: "Há 37 min",
    readTime: "4 min",
    tone: "warning",
  },
  {
    id: "latest-04",
    slug: "#ultimas",
    title: "Corinthians volta a explorar corredor esquerdo com mais profundidade e amplitude",
    summary:
      "Treino indicou movimentações coordenadas entre lateral, meia e ponta para abrir o bloco rival.",
    categoryId: "profissional",
    categoryLabel: "Profissional",
    source: "Análise tática",
    publishedAt: "Há 53 min",
    readTime: "5 min",
    tone: "alert",
  },
  {
    id: "latest-05",
    slug: "#ultimas",
    title: "Departamento feminino monitora carga de atletas em reta de calendário decisiva",
    summary:
      "Controle fino de recuperação virou prioridade para segurar desempenho alto na sequência.",
    categoryId: "feminino",
    categoryLabel: "Feminino",
    source: "Cobertura feminino",
    publishedAt: "Há 1 h 08",
    readTime: "3 min",
    tone: "success",
  },
  {
    id: "latest-06",
    slug: "#ultimas",
    title: "Torcida organiza mosaico e reforça clima de decisão já na semana pré-jogo",
    summary:
      "Mobilização digital e presença no entorno do estádio elevaram o tom da preparação.",
    categoryId: "torcida",
    categoryLabel: "Torcida",
    source: "Radar da torcida",
    publishedAt: "Há 1 h 20",
    readTime: "2 min",
    tone: "default",
  },
];

export const mostReadStories: NewsItem[] = [
  {
    id: "most-read-01",
    slug: "#destaques",
    title: "Leitura do setor defensivo aponta ganho de agressividade nas coberturas curtas",
    summary:
      "Ajuste de distância entre zaga e volantes reduziu espaço para a segunda bola do adversário.",
    categoryId: "profissional",
    categoryLabel: "Profissional",
    source: "Análise tática",
    publishedAt: "Hoje",
    readTime: "6 min",
    tone: "alert",
  },
  {
    id: "most-read-02",
    slug: "#destaques",
    title: "Mercado do Corinthians entra em janela de observação e diretoria refina prioridades",
    summary:
      "A ordem é atacar posições carentes com convicção, sem abrir frentes paralelas desnecessárias.",
    categoryId: "mercado",
    categoryLabel: "Mercado",
    source: "Mesa de apuração",
    publishedAt: "Hoje",
    readTime: "4 min",
    tone: "warning",
  },
  {
    id: "most-read-03",
    slug: "#destaques",
    title: "Neo Química deve receber ocupação forte nos setores centrais para o clássico",
    summary:
      "Procura aquecida confirma expectativa de arquibancada agressiva desde o aquecimento.",
    categoryId: "torcida",
    categoryLabel: "Torcida",
    source: "Monitor de ingressos",
    publishedAt: "Hoje",
    readTime: "3 min",
    tone: "default",
  },
];

export const spotlightStories: NewsItem[] = [
  {
    id: "spotlight-01",
    slug: "#destaques",
    title: "Parque São Jorge agenda semana de alinhamento entre futebol, operação e comunicação",
    summary:
      "Movimento indica tentativa de dar mais unidade entre informação institucional e rotina esportiva.",
    categoryId: "clube",
    categoryLabel: "Clube",
    source: "Bastidores do clube",
    publishedAt: "Há 2 h",
    readTime: "4 min",
    tone: "warning",
  },
  {
    id: "spotlight-02",
    slug: "#destaques",
    title: "Sub-17 mantém sequência positiva e chama atenção por maturidade sem a bola",
    summary:
      "Equipe tem sustentado pressão coordenada e resposta imediata após perder a posse.",
    categoryId: "base",
    categoryLabel: "Base",
    source: "Observatório da base",
    publishedAt: "Há 3 h",
    readTime: "3 min",
    tone: "success",
  },
  {
    id: "spotlight-03",
    slug: "#destaques",
    title: "Time feminino amplia liderança emocional nos jogos grandes e sustenta ritmo alto",
    summary:
      "Comando técnico valoriza maturidade de grupo e leitura competitiva em ambientes de pressão.",
    categoryId: "feminino",
    categoryLabel: "Feminino",
    source: "Cobertura feminino",
    publishedAt: "Há 3 h",
    readTime: "5 min",
    tone: "success",
  },
];

export const upcomingMatch: MatchInfo = {
  competition: "Brasileirão",
  round: "8ª rodada",
  homeTeam: "Corinthians",
  awayTeam: "Palmeiras",
  venue: "Neo Química Arena",
  kickOff: "Sábado, 20h00",
  broadcast: "Premiere e cobertura em tempo real no portal",
  note: "A pauta do jogo gira em torno da pressão pós-perda, da disputa no meio e do impacto da arquibancada nos primeiros minutos.",
  statusLabel: "Pré-jogo",
  statusTone: "alert",
};

function uniqueStories<T extends NewsItem>(stories: T[]) {
  const seen = new Set<string>();

  return stories.filter((story) => {
    if (seen.has(story.id)) {
      return false;
    }

    seen.add(story.id);
    return true;
  });
}

const storyPool = uniqueStories([
  featuredStory,
  ...secondaryHighlights,
  ...latestStories,
  ...mostReadStories,
  ...spotlightStories,
]);

export const newsByCategory: Record<NewsCategoryId, NewsItem[]> = {
  todas: storyPool.slice(0, 6),
  profissional: storyPool.filter((story) => story.categoryId === "profissional").slice(0, 4),
  feminino: storyPool.filter((story) => story.categoryId === "feminino").slice(0, 4),
  base: storyPool.filter((story) => story.categoryId === "base").slice(0, 4),
  mercado: storyPool.filter((story) => story.categoryId === "mercado").slice(0, 4),
  torcida: storyPool.filter((story) => story.categoryId === "torcida").slice(0, 4),
  clube: storyPool.filter((story) => story.categoryId === "clube").slice(0, 4),
};
