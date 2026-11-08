FROM node:20-alpine AS frontend-build

WORKDIR /frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
ARG APP_URL=
ENV APP_URL=${APP_URL}
RUN npm run build

FROM node:20-bookworm-slim

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --omit=dev

COPY backend/ ./
COPY --from=frontend-build /frontend/dist ./frontend

RUN mkdir -p uploads && chown -R node:node /app

USER node

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "start"]
