# Manual de Despliegue e Instalación del Frontend ANPR Vision Portal

Este manual proporciona instrucciones detalladas para instalar, configurar y desplegar el frontend de ANPR Vision Portal en diferentes entornos (desarrollo, QA, staging y producción). El proyecto utiliza Angular 20, Docker y Docker Compose para el despliegue.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes programas:

- **Node.js** (versión 20 o superior) - Para desarrollo local
- **Angular CLI** (versión 20 o superior) - Para comandos de Angular
- **Git** - Para clonar el repositorio
- **Docker** - Para contenerización
- **Docker Compose** - Para orquestación de contenedores
- **Jenkins** (opcional) - Para integración continua y despliegue automatizado

## Estructura del Proyecto

El proyecto frontend se encuentra en la carpeta `angular/` y incluye:

- `src/` - Código fuente de Angular
- `DevOps/` - Configuraciones por entorno (develop, qa, staging, prod)
- `Dockerfile` - Para construcción de imagen Docker
- `nginx/nginx.conf` - Configuración del servidor web
- `package.json` - Dependencias y scripts

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/nataliosorio/anpr-vision-portal.git
cd anpr-vision-portal/angular
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Cada entorno tiene su propio archivo `.env` en `DevOps/{entorno}/.env`. Copia y ajusta según sea necesario:

- **Desarrollo**: `DevOps/develop/.env`
- **QA**: `DevOps/qa/.env`
- **Staging**: `DevOps/staging/.env`
- **Producción**: `DevOps/prod/.env`

Ejemplo de configuración para desarrollo:

```env
ENVIRONMENT=develop
FRONT_PORT=4200
API_URL=http://localhost:5100/api
API_HUB=http://localhost:5100/parkingHub
```

## Despliegue por Entorno

### Desarrollo Local (Sin Docker)

Para desarrollo rápido con hot-reload:

```bash
# Configurar variables de entorno
cp DevOps/develop/.env .env

# Ejecutar servidor de desarrollo
npm start
# o
ng serve
```

Accede en: http://localhost:4200

### Despliegue con Docker Compose

#### Desarrollo

```bash
cd DevOps/develop
docker-compose up -d --build
```

Accede en: http://localhost:4200

#### QA

```bash
cd DevOps/qa
docker-compose up -d --build
```

Accede en: http://localhost:4201

#### Staging

```bash
cd DevOps/staging
docker-compose up -d --build
```

Accede en: http://localhost:4202

#### Producción

```bash
cd DevOps/prod
docker-compose up -d --build
```

Accede en: http://localhost:4203 (o la IP pública configurada)

### Build Manual

Para construir la aplicación manualmente:

```bash
# Build para producción
npm run build-prod

# Los archivos se generan en dist/
```

## Integración Continua con Jenkins

El proyecto incluye un `Jenkinsfile` para automatización del despliegue.

### Configuración en Jenkins

1. Crea un nuevo pipeline job
2. Configura el repositorio Git
3. Agrega credenciales para AWS (producción):
   - `aws_ssh_key`: Clave privada SSH
   - `aws_prod_ip`: IP del servidor de producción

### Variables de Entorno en Jenkins

En la raíz del repositorio, crea un archivo `.env` con:

```env
ENVIRONMENT=develop  # o qa, staging, prod
```

### Despliegue Automático

- **Entornos locales** (develop, qa, staging): Despliega en el servidor Jenkins usando Docker Compose
- **Producción**: Despliega remotamente en AWS EC2 via SSH

## Configuración de Redes Docker

Para entornos no productivos, Jenkins crea automáticamente la red Docker necesaria:

```bash
docker network create anpr-net-{entorno}
```

Asegúrate de que el backend esté conectado a la misma red para comunicación interna.

## Verificación del Despliegue

### Verificar Contenedores

```bash
docker ps | grep anprvision-front
```

### Verificar Logs

```bash
docker logs anprvision-front-{entorno}
```

### Verificar Salud de la Aplicación

Accede a la URL del entorno y verifica que la aplicación cargue correctamente.

## Solución de Problemas

### Problemas Comunes

1. **Puerto ocupado**: Cambia `FRONT_PORT` en el archivo `.env`
2. **Error de conexión al backend**: Verifica `API_URL` y `API_HUB`
3. **Error de build**: Asegúrate de tener Node.js 20+ y limpia el cache de npm
4. **Red Docker no existe**: Jenkins la crea automáticamente, o créala manualmente

### Comandos Útiles

```bash
# Detener contenedores
docker-compose down

# Reconstruir sin cache
docker-compose up -d --build --no-cache

# Ver logs en tiempo real
docker-compose logs -f

# Limpiar imágenes no utilizadas
docker image prune -f
```

## Configuración de Producción

Para producción en AWS:

1. El servidor EC2 debe tener Docker y Docker Compose instalados
2. Configura un reverse proxy (nginx-proxy) para manejar SSL y routing
3. Actualiza `API_URL` y `API_HUB` con la URL pública
4. Configura firewall para permitir tráfico en el puerto 80/443

## Conclusión

Siguiendo estos pasos, podrás desplegar el frontend de ANPR Vision Portal en cualquier entorno. Para desarrollo local, usa `ng serve`; para despliegue, utiliza Docker Compose. Jenkins automatiza el proceso para una integración continua eficiente.

Para más información, consulta la documentación del proyecto o contacta al equipo de desarrollo.