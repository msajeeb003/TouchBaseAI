# TouchBaseAI backend — Express + Prisma, runs as a persistent Node server
# (app.listen + node-cron send processor). Suitable for any VPS (Hetzner, etc.).
FROM node:20-slim

# Prisma needs OpenSSL on Debian slim
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install deps first. `postinstall` runs `prisma generate`, so the schema must
# be present before npm install.
COPY package*.json ./
COPY prisma ./prisma
RUN npm install

# Build the TypeScript app -> dist/
COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "dist/server.js"]
