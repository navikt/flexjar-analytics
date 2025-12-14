FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:22-slim

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json ./
COPY dist ./dist
COPY prod-server.js ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "prod-server.js"]

