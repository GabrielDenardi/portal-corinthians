#!/bin/sh
set -e

echo "Aguardando o PostgreSQL e aplicando o schema..."

attempt=1
max_attempts=20

until npm run prisma:push --workspace @portal-corinthians/api
do
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Nao foi possivel conectar ao PostgreSQL apos $max_attempts tentativas."
    exit 1
  fi

  echo "Banco indisponivel. Nova tentativa em 3s..."
  attempt=$((attempt + 1))
  sleep 3
done

echo "Executando seed inicial..."
npm run seed --workspace @portal-corinthians/api

echo "Sincronizando agenda do Corinthians..."
if ! node apps/api/dist/scripts/sync-matches.js; then
  echo "Falha no sync inicial de partidas. A API seguira no ar e o cron tentara novamente."
fi

echo "Iniciando API..."
exec node apps/api/dist/main.js
