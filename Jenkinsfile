pipeline {
    agent any

    environment {
        NODE_HOME = 'C:\\jenkins\\.node'
    }

    stages {
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

        stage('Instalar dependencias') {
            steps {
                bat '''
                    echo Instalando dependencias...
                    npm install --legacy-peer-deps
                '''
            }
        }

        stage('Compilar Angular') {
            steps {
                echo "⚙️ Compilando aplicación Angular..."
                bat 'npm run build -- --configuration=production'
            }
        }

        stage('Construir imagen Docker') {
            steps {
                echo "🐳 Construyendo imagen Docker para FRONT (${env.ENVIRONMENT})"
                bat "docker build -t anpr-vision-front-${env.ENVIRONMENT}:latest -f Dockerfile ."
            }
        }

        stage('Desplegar contenedor') {
            steps {
                echo "🚀 Desplegando Frontend en entorno ${env.ENVIRONMENT}"
                bat "docker compose -f ${env.COMPOSE_FILE} --env-file ${env.ENV_FILE} up -d --build"
            }
        }
    }

    post {
        success {
            echo "🎉 Despliegue completado correctamente para ${env.ENVIRONMENT}"
        }
        failure {
            echo "💥 Error durante el despliegue en ${env.ENVIRONMENT}"
        }
    }
}
