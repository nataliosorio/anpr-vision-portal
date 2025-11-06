# ===============================
# 🧱 Etapa 1 — Build de Angular
# ===============================
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --no-fund --no-audit

COPY . .

ARG ENVIRONMENT=production
ARG API_URL
ENV ENVIRONMENT=${ENVIRONMENT}
ENV API_URL=${API_URL}

RUN echo "🔧 Inyectando API_URL=${API_URL} en environment.prod.ts" && \
    sed -i "s|apiURL: .*|apiURL: '${API_URL}',|" src/environments/environment.prod.ts

RUN npm run build -- --configuration=${ENVIRONMENT}

# ===============================
# 🧱 Etapa 2 — NGINX
# ===============================
FROM nginx:alpine AS runtime

RUN rm /etc/nginx/conf.d/default.conf

# Config simple de Angular (SPA)
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# ⚠️ ESTA ES LA LÍNEA CLAVE
COPY --from=build /app/dist/* /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
