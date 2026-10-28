FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["sh","-c","npm run db:init && npm start"]
