# TouchBaseAI frontend — Vite build served by nginx.
# The API base URL is baked in at build time. Default "/api/v1" is relative, so
# the app calls the same origin and Caddy proxies /api/* to the backend.

# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
ARG VITE_BASE_URL=/api/v1
ENV VITE_BASE_URL=$VITE_BASE_URL
RUN npm run build

# ---- serve ----
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
