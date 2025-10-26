# ============ Build Angular ============
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-fund --no-audit
COPY . .
RUN npm run build -- --configuration=production

# ============ Nginx (serve estático) ============
FROM nginx:alpine AS nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ⚠️ Si NO usas SSR:
COPY --from=build /app/dist/skeleton /usr/share/nginx/html/

# ⚠️ Si USAS SSR (comenta la línea anterior y descomenta esta):
# COPY --from=build /app/dist/skeleton/browser /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
