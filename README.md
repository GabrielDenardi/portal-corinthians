# Portal Corinthians

Monorepo da V2 do Portal Corinthians com:

- `apps/web`: Next.js 16 + Tailwind CSS 4
- `apps/api`: NestJS + Prisma
- `packages/contracts`: contratos compartilhados entre frontend e backend
- `postgres`: banco para artigos, partidas, views e jobs de sync

## Requisitos

- Node.js 20+
- Docker Desktop

## Ambiente local sem Docker

1. Copie `.env.example` para `.env`
2. Suba um PostgreSQL local
3. Rode:

```bash
npm install
npm run prisma:migrate
npm run seed
npm run dev:api
npm run dev:web
```

## Subir tudo com Docker

O setup Docker sobe:

- `postgres` em `localhost:5432`
- `api` em `localhost:4000`
- `web` em `localhost:3000`

Comando principal:

```bash
npm run docker:up
```

Ou diretamente:

```bash
docker compose up --build
```

Para parar:

```bash
npm run docker:down
```

Para limpar volumes e reiniciar o banco do zero:

```bash
npm run docker:reset
```

## Variaveis de ambiente

O `docker-compose.yml` ja tem defaults para rodar localmente. Se quiser trocar as chaves externas, crie um arquivo `.env` na raiz com:

```env
GNEWS_API_KEY=
THESPORTSDB_API_KEY=3
```

## Fluxo do Docker

- a API espera o PostgreSQL ficar disponivel
- aplica o schema com Prisma
- executa o seed inicial
- sobe o backend NestJS
- a web sobe em build standalone do Next.js e consome a API interna do compose

## URLs

- Web: [http://localhost:3000](http://localhost:3000)
- API health: [http://localhost:4000/health](http://localhost:4000/health)
