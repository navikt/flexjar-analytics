
FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:22-slim

WORKDIR /app

COPY package.json package-lock.json /app/
COPY node_modules /app/node_modules
COPY dist /app/dist
COPY prod-server.js /app/

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "prod-server.js"]


