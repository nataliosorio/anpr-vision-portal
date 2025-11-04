pipeline {
    agent any

    environment {
        NODE_HOME = 'C:\\jenkins\\.node'
    }

    stages {

        // =========================================================
        // 1️⃣ Leer entorno desde .env (raíz del repo)
        // =========================================================
        stage('Leer entorno desde .env') {
            steps {
                script {
                    def envValue = powershell(
                        script: "(Get-Content .env | Where-Object { \$_ -match '^ENVIRONMENT=' }) -replace '^ENVIRONMENT=', ''",
                        returnStdout: true
                    ).trim()

                    if (!envValue) {
                        error "❌ No se encontró ENVIRONMENT en .env"
                    }

                    env.ENVIRONMENT = envValue
                    env.ENV_DIR = "DevOps/${env.ENVIRONMENT}"
                    env.COMPOSE_FILE = "${env.ENV_DIR}/docker-compose.yml"
                    env.ENV_FILE = "${env.ENV_DIR}/.env"

                    echo "✅ Entorno detectado: ${env.ENVIRONMENT}"
                    echo "📄 Archivo compose: ${env.COMPOSE_FILE}"
                }
            }
        }

        // =========================================================
        // 2️⃣ Instalar dependencias Angular
        // =========================================================
        stage('Instalar dependencias') {
            steps {
                dir('angular') {   // 👈 Entramos a la carpeta angular
                    bat '''
                        echo Instalando dependencias...
                        npm install --legacy-peer-deps
                    '''
                }
            }
        }

        // =========================================================
        // 3️⃣ Compilar Angular
        // =========================================================
        stage('Compilar Angular') {
            steps {
                dir('angular') {
                    echo "⚙️ Compilando aplicación Angular..."
                    bat 'npm run build -- --configuration=production'
                }
            }
        }

        // =========================================================
        // 4️⃣ Construir imagen Docker
        // =========================================================
        stage('Construir imagen Docker') {
            steps {
                dir('angular') {
                    echo "🐳 Construyendo imagen Docker para FRONT (${env.ENVIRONMENT})"
                    bat "docker build -t anpr-vision-front-${env.ENVIRONMENT}:latest --build-arg ENVIRONMENT=${env.ENVIRONMENT} -f Dockerfile ."
                }
            }
        }

        

        // =========================================================
        // 5️⃣ Desplegar contenedor
        // =========================================================
        stage('Desplegar contenedor') {
            steps {
                dir('angular') {
                    echo "🚀 Desplegando Frontend en entorno ${env.ENVIRONMENT}"
                    bat "docker compose -f ${env.COMPOSE_FILE} --env-file ${env.ENV_FILE} up -d --build"
                }
            }
        }
    }

    // =========================================================
    // 🎯 Resultados finales
    // =========================================================
    post {
        success {
            echo "🎉 Despliegue completado correctamente para ${env.ENVIRONMENT}"
        }
        failure {
            echo "💥 Error durante el despliegue en ${env.ENVIRONMENT}"
        }
    }
}