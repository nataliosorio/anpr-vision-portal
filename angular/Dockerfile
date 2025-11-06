# ============ Build Angular ============
FROM node:20-alpine AS build
WORKDIR /app

# Copiar dependencias primero (cache)
COPY package*.json ./
RUN npm ci --no-fund --no-audit

# Copiar el resto del código fuente
COPY . .

# ==============================
# 🔹 Variables de build
# ==============================
ARG ENVIRONMENT=production
ARG API_URL
ENV ENVIRONMENT=${ENVIRONMENT}
ENV API_URL=${API_URL}

# 🔹 Inyectar API_URL dinámicamente en environment.prod.ts
RUN echo "🔧 Inyectando API_URL=${API_URL} en environment.prod.ts" && \
    sed -i "s|apiURL: .*|apiURL: '${API_URL}',|" src/environments/environment.prod.ts

# 🔹 Compilar Angular con el entorno correspondiente
RUN npm run build -- --configuration=${ENVIRONMENT}

# ============ Nginx (serve estático) ============
FROM nginx:alpine AS nginx

# ✅ Elimina la configuración por defecto
RUN rm /etc/nginx/conf.d/default.conf

# ✅ Copia la tuya
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# ✅ Copiar el contenido compilado de Angular
COPY --from=build /app/dist/ /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
