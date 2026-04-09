FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json

RUN npm ci --ignore-scripts

FROM deps AS builder
WORKDIR /app

COPY tsconfig.base.json ./
COPY apps/api ./apps/api
COPY packages/contracts ./packages/contracts

RUN npm run build --workspace @portal-corinthians/contracts
RUN npm run prisma:generate --workspace @portal-corinthians/api
RUN npm run build --workspace @portal-corinthians/api

FROM deps AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/tsconfig.base.json ./tsconfig.base.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/packages/contracts ./packages/contracts
COPY docker/api-entrypoint.sh ./docker/api-entrypoint.sh

RUN sed -i 's/\r$//' ./docker/api-entrypoint.sh && chmod +x ./docker/api-entrypoint.sh

EXPOSE 4000

CMD ["sh", "./docker/api-entrypoint.sh"]
