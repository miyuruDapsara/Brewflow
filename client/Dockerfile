# Build context: repository root (see docker-compose.yml)
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

RUN npm ci -w client

COPY client ./client

ARG VITE_API_URL=
ARG VITE_UI_DEMO=true
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_UI_DEMO=$VITE_UI_DEMO

RUN npm run build -w client

FROM nginx:alpine

COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
