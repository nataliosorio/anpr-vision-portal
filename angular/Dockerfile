# ============ Build Angular ============
FROM node:20-alpine AS build

# Directorio de trabajo
WORKDIR /app

# Copiar dependencias primero (para aprovechar la cache)
COPY package*.json ./

# Instalar dependencias (más rápido y seguro que npm install)
RUN npm ci --no-fund --no-audit

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación (ajusta 'skeleton' si tu app tiene otro nombre en dist/)
# Usa variable ENVIRONMENT para elegir configuración si lo requieres más adelante
ARG ENVIRONMENT=production
ENV ENVIRONMENT=${ENVIRONMENT}
RUN npm run build -- --configuration=${ENVIRONMENT}

# ============ Nginx (serve estático) ============
FROM nginx:alpine AS nginx

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ⚠️ Si tu build Angular genera la carpeta dist/skeleton/
# (ajusta este nombre si tu app se llama distinto)
COPY --from=build /app/dist/skeleton /usr/share/nginx/html/

# ⚠️ Si usas Angular Universal (SSR), comenta la línea anterior y descomenta esta:
# COPY --from=build /app/dist/skeleton/browser /usr/share/nginx/html/

# Exponer puerto estándar del contenedor
EXPOSE 80

# Mantener Nginx ejecutándose en primer plano
CMD ["nginx", "-g", "daemon off;"]
