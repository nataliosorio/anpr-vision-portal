# ============ Build Angular ============
FROM node:20-alpine AS build
WORKDIR /app

# Copiar dependencias primero (cache)
COPY package*.json ./
RUN npm ci --no-fund --no-audit

# Copiar el resto del código fuente
COPY . .

# Variable de entorno del entorno actual (viene de Jenkins o .env)
ARG ENVIRONMENT=production
ENV ENVIRONMENT=${ENVIRONMENT}

# Compilar Angular con el entorno correspondiente
RUN npm run build -- --configuration=${ENVIRONMENT}

# ============ Nginx (serve estático) ============
FROM nginx:alpine AS nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar el contenido compilado
COPY --from=build /app/dist /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
