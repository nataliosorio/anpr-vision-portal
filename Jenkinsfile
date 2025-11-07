pipeline {
    agent any

    environment {
        DOCKER_CLI_HINTS = "off"
        DOCKER_BUILDKIT = '0'
        NODE_ENV = 'production'
    }

    stages {

        // =====================================================
        // 1️⃣ Leer entorno desde .env raíz
        // =====================================================
        stage('Leer entorno desde .env') {
            steps {
                sh '''
                    echo "📂 Leyendo entorno desde .env (raíz)..."

                    ENVIRONMENT=$(grep '^ENVIRONMENT=' .env | cut -d '=' -f2 | tr -d '\\r\\n')

                    if [ -z "$ENVIRONMENT" ]; then
                        echo "❌ No se encontró ENVIRONMENT en .env"
                        exit 1
                    fi

                    echo "✅ Entorno detectado: $ENVIRONMENT"
                    echo "ENVIRONMENT=$ENVIRONMENT" > env.properties
                    echo "ENV_DIR=angular/DevOps/$ENVIRONMENT" >> env.properties
                    echo "COMPOSE_FILE=angular/DevOps/$ENVIRONMENT/docker-compose.yml" >> env.properties
                    echo "ENV_FILE=angular/DevOps/$ENVIRONMENT/.env" >> env.properties
                '''

                script {
                    def props = readProperties file: 'env.properties'
                    env.ENVIRONMENT = props['ENVIRONMENT']
                    env.ENV_DIR = props['ENV_DIR']
                    env.COMPOSE_FILE = props['COMPOSE_FILE']
                    env.ENV_FILE = props['ENV_FILE']

                    echo """
                    ✅ Entorno detectado: ${env.ENVIRONMENT}
                    📄 Compose FRONT: ${env.COMPOSE_FILE}
                    📁 Env file: ${env.ENV_FILE}
                    """
                }
            }
        }
        
        // =====================================================
        // 5️⃣ Preparar red local (solo entornos no prod)
        // =====================================================
        stage('Preparar red local') {
            when { expression { env.ENVIRONMENT != 'prod' } }
            steps {
                sh '''
                    echo "🌐 Verificando red anpr-net-$ENVIRONMENT ..."
                    docker network create anpr-net-$ENVIRONMENT || echo '✅ Red ya existe'
                '''
            }
        }

        // =====================================================
        // 6️⃣ Desplegar Frontend
        // =====================================================
        stage('Desplegar Frontend') {
            steps {
                script {
                    if (env.ENVIRONMENT == 'prod') {
                        echo "🚀 Despliegue remoto del FRONT en AWS (producción)"

                        withCredentials([
                            sshUserPrivateKey(credentialsId: 'aws_ssh_key', keyFileVariable: 'SSH_KEY'),
                            string(credentialsId: 'aws_prod_ip', variable: 'PROD_IP')
                        ]) {
                            sh '''
                                echo "🌍 Conectando al servidor AWS en $PROD_IP"
                                ssh -o StrictHostKeyChecking=no -i $SSH_KEY ubuntu@$PROD_IP "
                                    set -e
                                    echo '📦 Actualizando repositorio del portal...'
                                    cd /srv/anprvision-portal || exit 1
                                    git pull

                                    echo '🐳 Desplegando stack del Frontend...'
                                    docker compose -f angular/DevOps/prod/docker-compose.yml --env-file angular/DevOps/prod/.env up -d --build --remove-orphans
                                "
                            '''
                        }
                    } else {
                        echo "🚀 Despliegue local (${env.ENVIRONMENT})"
                        sh '''
                            docker compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d --build --remove-orphans
                        '''
                    }
                }
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
