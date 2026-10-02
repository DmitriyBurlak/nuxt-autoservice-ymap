# Stage 1: Билдер
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable

# Кэшируем зависимости: слой пересобирается только при изменении lock-файла
COPY package.json pnpm-lock.yaml ./
RUN pnpm fetch

# Копируем исходники, ставим зависимости из кэша (postinstall → nuxt prepare)
COPY . .
RUN pnpm install --frozen-lockfile --offline

# Проверки перед сборкой — если упадут, деплой не произойдёт
RUN pnpm lint
RUN pnpm test

RUN pnpm build

# Stage 2: Продакшн — .output самодостаточен, node_modules не нужны
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.output ./.output

EXPOSE 3000
ENTRYPOINT ["node", ".output/server/index.mjs"]
