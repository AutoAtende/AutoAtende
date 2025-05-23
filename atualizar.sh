#!/bin/bash

# Definição de variáveis para log
LOG_FILE="atualizar_$(date +"%Y%m%d%H%M%S").log"
NODE_MIN_VERSION="20.17.0"
DATE_TIME=$(date +"%Y-%m-%d %H:%M:%S")
REDIS_MIN_VERSION="6.2.0"
REDIS_TARGET_VERSION="7.4.0"

# Função para registrar logs
log() {
    local message="$1"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    echo -e "$timestamp - $message" | tee -a "$LOG_FILE"
}

# Função para obter caminho do arquivo .env
get_env_file() {
    if [ -f "backend/.env" ]; then
        echo "backend/.env"
    elif [ -f ".env" ]; then
        echo ".env"
    elif [ -f "backend/dist/.env" ]; then
        echo "backend/dist/.env"
    elif [ -f "dist/.env" ]; then
        echo "dist/.env"
    else
        echo ""
    fi
}

# Inicialização de variáveis
UPDATE_BACKEND=false
UPDATE_FRONTEND=false
UPDATE_NODE_MODULES=false
RUN_MIGRATIONS=false
FORCE_MODE=false
BACKUP_MODE=false
KEEP_SRC=true  # Alterado para true como padrão
BRANCH="main"  # Valor padrão, mas agora pode ser alterado via parâmetro
UPDATE_OS_PACKAGES=false
CLEAN_REDIS=false # Nova variável para controle de limpeza do Redis
ORIGINAL_USER=$(whoami)

# Função para mostrar ajuda
show_help() {
    log "Exibindo mensagem de ajuda"
    echo "Uso: ./atualizar.sh [opções]"
    echo "Opções:"
    echo "  -bd              Atualiza o backend"
    echo "  -fd              Atualiza o frontend"
    echo "  -nm              Atualiza node_modules (pode ser usado com -bd e/ou -fd)"
    echo "  -sm              Executa migrações do Sequelize (apenas com -bd)"
    echo "  -f               Modo forçado (apenas build, sem npm install ou migrações)"
    echo "  -bkp             Realiza backup das pastas dist/build antes de atualizar e faz atualização completa"
    echo "  -nk              Não mantém as pastas src do frontend e backend (padrão agora é manter)"
    echo "  -cr              Limpa o Redis (chaves Bull e JWT) e reinicia o serviço"
    echo "  -b, --branch     Especifica a branch a ser utilizada (padrão: main)"
    echo "  -h               Mostra esta mensagem de ajuda"
    echo ""
    echo "Se nenhuma opção for informada, será realizada uma atualização completa do sistema"
    exit 0
}

# Função para limpar logs antigos
limpar_logs_antigos() {
    log "🧹 Limpando logs antigos do script atualizar.sh..."
    find . -name "atualizar_*.log" -type f | grep -v "$LOG_FILE" | xargs rm -f 2>/dev/null
    log "✅ Logs antigos removidos com sucesso."
}

# Função para verificar se um comando está disponível
comando_existe() {
    command -v "$1" >/dev/null 2>&1
}

# Função para alternar para usuário root
alternar_para_root() {
    if [ "$ORIGINAL_USER" != "root" ]; then
        log "🔐 Alternando para usuário root para realizar operações privilegiadas..."
        # Salvar o diretório de trabalho atual
        CURRENT_DIR=$(pwd)
        echo "sudo su -c \"cd $CURRENT_DIR && $0 $ORIGINAL_ARGS --continue-as-root\""
        sudo su -c "cd $CURRENT_DIR && $0 $ORIGINAL_ARGS --continue-as-root"
        exit $?
    fi
}

# Função para voltar ao usuário original
voltar_para_usuario_original() {
    if [ "$ORIGINAL_USER" != "root" ] && [ "$(whoami)" = "root" ]; then
        log "🔐 Voltando para o usuário $ORIGINAL_USER..."
        # Salvar o diretório de trabalho atual
        CURRENT_DIR=$(pwd)
        su - $ORIGINAL_USER -c "cd $CURRENT_DIR && $0 $ORIGINAL_ARGS --continue-as-user"
        exit $?
    fi
}

# Função para verificar a versão do Node.js
verificar_node_version() {
    log "Verificando versão do Node.js"
    if ! comando_existe node; then
        log "⚠️ Node.js não encontrado no sistema."
        return 1
    fi

    current_version=$(node -v | sed 's/v//g')
    log "Versão atual do Node.js: $current_version"
    
    # Comparação de versões
    if [ "$(printf '%s\n' "$NODE_MIN_VERSION" "$current_version" | sort -V | head -n1)" != "$NODE_MIN_VERSION" ]; then
        log "⚠️ A versão do Node.js ($current_version) é inferior à mínima requerida ($NODE_MIN_VERSION)."
        return 1
    else
        log "✅ Versão do Node.js compatível"
        return 0
    fi
}

# Função para atualizar o Node.js
atualizar_node() {
    log "Iniciando atualização do Node.js para a versão mínima requerida $NODE_MIN_VERSION"
    
    # Alternar para root para instalação de pacotes
    alternar_para_root
    
    # Verificar qual gerenciador de pacotes está disponível
    if comando_existe apt-get; then
        log "Usando apt-get para atualizar o Node.js"
        
        # Verificar se o curl está instalado
        if ! comando_existe curl; then
            log "Instalando curl..."
            apt-get update && apt-get install -y curl
        fi
        
        # Adicionar repositório NodeSource
        log "Adicionando repositório NodeSource"
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        
        # Instalar Node.js
        log "Instalando Node.js"
        apt-get install -y nodejs
        
    elif comando_existe yum; then
        log "Usando yum para atualizar o Node.js"
        
        # Verificar se o curl está instalado
        if ! comando_existe curl; then
            log "Instalando curl..."
            yum install -y curl
        fi
        
        # Adicionar repositório NodeSource
        log "Adicionando repositório NodeSource"
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        
        # Instalar Node.js
        log "Instalando Node.js"
        yum install -y nodejs
        
    elif comando_existe brew; then
        log "Usando Homebrew para atualizar o Node.js"
        brew update && brew install node@20
        
    else
        log "❌ Não foi possível determinar o gerenciador de pacotes. Por favor, atualize o Node.js manualmente para a versão $NODE_MIN_VERSION ou superior."
        return 1
    fi
    
    # Verificar se a atualização foi bem-sucedida
    log "Verificando a versão do Node.js após a atualização"
    new_version=$(node -v | sed 's/v//g')
    log "Nova versão do Node.js: $new_version"
    
    if [ "$(printf '%s\n' "$NODE_MIN_VERSION" "$new_version" | sort -V | head -n1)" != "$NODE_MIN_VERSION" ]; then
        log "❌ Falha ao atualizar o Node.js para a versão mínima requerida."
        return 1
    else
        log "✅ Node.js atualizado com sucesso para a versão $new_version"
        return 0
    fi
}

# Função para verificar e instalar o ffmpeg
verificar_instalar_ffmpeg() {
    log "Verificando instalação do ffmpeg"
    if ! comando_existe ffmpeg; then
        log "⚠️ ffmpeg não encontrado no sistema"
        
        read -p "🔄 O ffmpeg não está instalado. Deseja instalá-lo agora? (s/N): " install_ffmpeg_input
        if [[ "$install_ffmpeg_input" =~ ^[Ss]$ ]]; then
            log "Usuário optou por instalar o ffmpeg"
            
            # Alternar para root para instalação de pacotes
            alternar_para_root
            
            # Verificar qual gerenciador de pacotes está disponível
            if comando_existe apt-get; then
                log "Usando apt-get para instalar ffmpeg"
                apt-get update && apt-get install -y ffmpeg
                
            elif comando_existe yum; then
                log "Usando yum para instalar ffmpeg"
                yum install -y epel-release
                yum install -y ffmpeg ffmpeg-devel
                
            elif comando_existe brew; then
                log "Usando Homebrew para instalar ffmpeg"
                brew update && brew install ffmpeg
                
            else
                log "❌ Não foi possível determinar o gerenciador de pacotes. Por favor, instale o ffmpeg manualmente."
                return 1
            fi
            
            # Verificar se a instalação foi bem-sucedida
            if comando_existe ffmpeg; then
                log "✅ ffmpeg instalado com sucesso"
                return 0
            else
                log "❌ Falha ao instalar o ffmpeg"
                return 1
            fi
        else
            log "Usuário optou por não instalar o ffmpeg. Continuando sem ffmpeg..."
            return 0
        fi
    else
        log "✅ ffmpeg já está instalado"
        return 0
    fi
}

# Função para atualizar pacotes do sistema operacional
atualizar_pacotes_sistema() {
    log "Iniciando atualização dos pacotes do sistema operacional"
    
    # Alternar para root para atualização de pacotes
    alternar_para_root
    
    # Verificar qual gerenciador de pacotes está disponível
    if comando_existe apt-get; then
        log "Usando apt-get para atualizar os pacotes do sistema"
        apt-get update && apt-get upgrade -y
        
    elif comando_existe yum; then
        log "Usando yum para atualizar os pacotes do sistema"
        yum update -y
        
    elif comando_existe dnf; then
        log "Usando dnf para atualizar os pacotes do sistema"
        dnf update -y
        
    elif comando_existe brew; then
        log "Usando Homebrew para atualizar os pacotes do sistema"
        brew update && brew upgrade
        
    else
        log "❌ Não foi possível determinar o gerenciador de pacotes. Por favor, atualize os pacotes do sistema manualmente."
        return 1
    fi
    
    log "✅ Atualização dos pacotes do sistema concluída"
    return 0
}

# Função para configurar as configurações do banco de dados
configure_database_settings() {
    log "⚙️ Iniciando verificação das configurações da empresa id=1 na tabela Settings..."

    # Obter caminho do arquivo .env
    ENV_FILE=$(get_env_file)
    
    if [ -z "$ENV_FILE" ]; then
        log "❌ Arquivo .env não encontrado em nenhum local padrão."
        log "📂 Diretório atual: $(pwd)"
        log "📂 Listando arquivos na pasta backend: $(ls -la backend/ 2>/dev/null || echo 'Não acessível')"
        return 1
    fi
    
    log "📄 Carregando variáveis de ambiente do arquivo $ENV_FILE"
    
    # Extrair variáveis do banco de dados do arquivo .env
    DB_HOST=$(grep -E "^DB_HOST=" "$ENV_FILE" | cut -d '=' -f2)
    DB_PORT=$(grep -E "^DB_PORT=" "$ENV_FILE" | cut -d '=' -f2)
    DB_USER=$(grep -E "^DB_USER=" "$ENV_FILE" | cut -d '=' -f2)
    DB_PASS=$(grep -E "^DB_PASS=" "$ENV_FILE" | cut -d '=' -f2)
    DB_NAME=$(grep -E "^DB_NAME=" "$ENV_FILE" | cut -d '=' -f2)

    # Configurações padrão
    DB_HOST=${DB_HOST:-localhost}
    DB_PORT=${DB_PORT:-5432}
    DB_USER=${DB_USER:-postgres}
    DB_PASS=${DB_PASS:-}

    if [ -z "$DB_NAME" ]; then
        log "❌ Nome do banco de dados não configurado no .env"
        return 1
    fi
    
    log "🔍 Usando configurações: DB_HOST=$DB_HOST, DB_PORT=$DB_PORT, DB_USER=$DB_USER, DB_NAME=$DB_NAME"

    # ID da empresa
    COMPANY_ID=1

    # Array de configurações (chave=valor)
    declare -A SETTINGS=(
        ["userRating"]="disabled"
        ["scheduleType"]="company"
        ["CheckMsgIsGroup"]="enabled"
        ["sendGreetingAccepted"]="disabled"
        ["sendMsgTransfTicket"]="disabled"
        ["chatBotType"]="text"
        ["allowSignup"]="enabled"
        ["sendGreetingMessageOneQueues"]="disabled"
        ["callSuport"]="disabled"
        ["displayContactInfo"]="enabled"
        ["trialExpiration"]="7"
        ["sendEmailWhenRegister"]="enabled"
        ["sendMessageWhenRegister"]="enabled"
        ["smtpauth"]="disabled"
        ["usersmtpauth"]="disabled"
        ["clientsecretsmtpauth"]=""
        ["smtpport"]=""
        ["wasuport"]=""
        ["msgsuport"]=""
        ["openaiModel"]="gpt-4"
        ["downloadLimit"]="64"
        ["useOneTicketPerConnection"]="enabled"
        ["enableTicketValueAndSku"]="enabled"
        ["enableReasonWhenCloseTicket"]="disabled"
        ["quickMessages"]="company"
        ["sendQueuePosition"]="disabled"
        ["settingsUserRandom"]="disabled"
        ["displayBusinessInfo"]="disabled"
        ["initialPage"]="login"
        ["enableUPSix"]="disabled"
        ["enableUPSixWebphone"]="disabled"
        ["enableUPSixNotifications"]="disabled"
        ["enableOfficialWhatsapp"]="disabled"
        ["enableSaveCommonContacts"]="disabled"
        ["displayProfileImages"]="disabled"
        ["enableQueueWhenCloseTicket"]="disabled"
        ["queueWhenClosingTicket"]="disabled"
        ["tagsWhenClosingTicket"]="disabled"
        ["enableTagsWhenCloseTicket"]="disabled"
        ["enableMetaPixel"]="enabled"
        ["metaPixelId"]=""
        ["enableSatisfactionSurvey"]="disabled"
    )

    # Função para executar consultas SQL
    execute_query() {
        local query="$1"
        PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "$query"
    }

    # Verifica e insere configurações ausentes
    for key in "${!SETTINGS[@]}"; do
        value="${SETTINGS[$key]}"
        
        # Verifica se a configuração já existe
        result=$(execute_query "SELECT \"value\" FROM \"Settings\" WHERE \"companyId\" = $COMPANY_ID AND \"key\" = '$key';")
        
        if [[ $result == *"(0 rows)"* ]]; then
            # Configuração não existe, insere
            log "➕ Inserindo configuração: $key = $value"
            execute_query "INSERT INTO \"Settings\" (\"companyId\", \"key\", \"value\", \"createdAt\", \"updatedAt\") VALUES ($COMPANY_ID, '$key', '$value', NOW(), NOW());"
        else
            # Configuração existe, verifica se precisa atualizar
            current_value=$(echo "$result" | grep -v "value" | grep -v "row" | grep -v "^$" | xargs)
            
            if [[ "$key" == "chatBotType" && ("$current_value" == "list" || "$current_value" == "button") ]]; then
                log "🔄 Atualizando configuração $key de $current_value para $value"
                execute_query "UPDATE \"Settings\" SET \"value\" = '$value', \"updatedAt\" = NOW() WHERE \"companyId\" = $COMPANY_ID AND \"key\" = '$key';"
            elif [[ "$key" == "useOneTicketPerConnection" && "$current_value" == "disabled" ]]; then
                log "🔄 Atualizando configuração $key de $current_value para $value"
                execute_query "UPDATE \"Settings\" SET \"value\" = '$value', \"updatedAt\" = NOW() WHERE \"companyId\" = $COMPANY_ID AND \"key\" = '$key';"
            else
                log "✅ Configuração existente: $key = $current_value (sem alterações necessárias)"
            fi
        fi
    done

    log "✅ Configurações do banco de dados atualizadas com sucesso!"
}

# Função para limpar o Redis
clean_redis() {
    log "🔄 Iniciando limpeza do Redis..."

    # Obter caminho do arquivo .env
    ENV_FILE=$(get_env_file)
    
    if [ -z "$ENV_FILE" ]; then
        log "❌ Arquivo .env não encontrado em nenhum local padrão."
        log "📂 Diretório atual: $(pwd)"
        log "📂 Listando arquivos na pasta backend: $(ls -la backend/ 2>/dev/null || echo 'Não acessível')"
        return 1
    fi
    
    log "📄 Carregando variáveis de ambiente do arquivo $ENV_FILE"
    
    # Extrair variáveis do Redis do arquivo .env
    REDIS_PASSWORD=$(grep -E "^REDIS_PASSWORD=" "$ENV_FILE" | cut -d '=' -f2)
    
    # Obter o nome da pasta atual (instância atual)
    CURRENT_INSTANCE_NAME=$(basename "$(pwd)")
    log "🔍 Buscando container Redis para a instância: $CURRENT_INSTANCE_NAME"

    # Nome esperado do container Redis
    REDIS_CONTAINER_NAME="redis-${CURRENT_INSTANCE_NAME}"
    log "🔍 Nome esperado do container Redis: $REDIS_CONTAINER_NAME"

    # Verificar se o Docker está disponível
    if command -v docker >/dev/null 2>&1; then
        # Verificar se o container específico existe e está rodando
        CONTAINER_ID=$(docker ps -q --filter "name=$REDIS_CONTAINER_NAME" --filter "status=running")
        
        if [ -n "$CONTAINER_ID" ]; then
            log "✅ Container Redis encontrado: $REDIS_CONTAINER_NAME ($CONTAINER_ID)"
            
            # Configurar comando Redis CLI baseado na senha (se existir)
            AUTH_PARAM=""
            if [ -n "$REDIS_PASSWORD" ]; then
                AUTH_PARAM="-a $REDIS_PASSWORD"
                log "🔐 Usando autenticação Redis com senha configurada"
            fi
            
            # Limpar chaves Bull no Redis via Docker
            log "🧹 Limpando chaves Bull..."
            docker exec $CONTAINER_ID sh -c "redis-cli $AUTH_PARAM keys 'bull:*' | xargs -r redis-cli $AUTH_PARAM del"
            
            # Limpar chaves JWT no Redis via Docker
            log "🧹 Limpando chaves JWT..."
            docker exec $CONTAINER_ID sh -c "redis-cli $AUTH_PARAM keys 'jwt:*' | xargs -r redis-cli $AUTH_PARAM del"
            
            # Limpar chaves de sessão no Redis via Docker
            log "🧹 Limpando chaves de sessão..."
            docker exec $CONTAINER_ID sh -c "redis-cli $AUTH_PARAM keys 'sess:*' | xargs -r redis-cli $AUTH_PARAM del"
            
            log "🔄 Reiniciando container Redis $REDIS_CONTAINER_NAME..."
            docker restart $CONTAINER_ID
            log "✅ Limpeza do Redis concluída para a instância $CURRENT_INSTANCE_NAME"
            return 0
        else
            log "⚠️ Container Redis específico '$REDIS_CONTAINER_NAME' não encontrado ou não está rodando."
            
            # Perguntar se quer procurar outros containers Redis
            read -p "🔄 Procurar por outros containers Redis disponíveis? (s/N): " find_other_redis
            if [[ "$find_other_redis" =~ ^[Ss]$ ]]; then
                OTHER_REDIS_CONTAINERS=$(docker ps --format "{{.Names}}" --filter "name=redis" --filter "status=running")
                
                if [ -n "$OTHER_REDIS_CONTAINERS" ]; then
                    log "🔍 Containers Redis disponíveis:"
                    echo "$OTHER_REDIS_CONTAINERS" | nl
                    
                    read -p "🔄 Digite o número do container Redis que deseja limpar (ou 0 para cancelar): " container_num
                    
                    if [ "$container_num" -gt 0 ] 2>/dev/null; then
                        SELECTED_CONTAINER=$(echo "$OTHER_REDIS_CONTAINERS" | sed -n "${container_num}p")
                        
                        if [ -n "$SELECTED_CONTAINER" ]; then
                            CONTAINER_ID=$(docker ps -q --filter "name=$SELECTED_CONTAINER" --filter "status=running")
                            log "🧹 Limpando Redis no container selecionado: $SELECTED_CONTAINER"
                            
                            # Configurar comando Redis CLI baseado na senha (se existir)
                            AUTH_PARAM=""
                            if [ -n "$REDIS_PASSWORD" ]; then
                                AUTH_PARAM="-a $REDIS_PASSWORD"
                                log "🔐 Usando autenticação Redis com senha configurada"
                            fi
                            
                            # Limpar chaves Bull no Redis via Docker
                            log "🧹 Limpando chaves Bull..."
                            docker exec $CONTAINER_ID sh -c "redis-cli $AUTH_PARAM keys 'bull:*' | xargs -r redis-cli $AUTH_PARAM del"
                            
                            # Limpar chaves JWT no Redis via Docker
                            log "🧹 Limpando chaves JWT..."
                            docker exec $CONTAINER_ID sh -c "redis-cli $AUTH_PARAM keys 'jwt:*' | xargs -r redis-cli $AUTH_PARAM del"
                            
                            # Limpar chaves de sessão no Redis via Docker
                            log "🧹 Limpando chaves de sessão..."
                            docker exec $CONTAINER_ID sh -c "redis-cli $AUTH_PARAM keys 'sess:*' | xargs -r redis-cli $AUTH_PARAM del"
                            
                            log "🔄 Reiniciando container Redis $SELECTED_CONTAINER..."
                            docker restart $CONTAINER_ID
                            log "✅ Limpeza do Redis concluída"
                            return 0
                        else
                            log "❌ Seleção inválida."
                        fi
                    else
                        log "⏭️ Limpeza do Redis cancelada pelo usuário."
                    fi
                else
                    log "❌ Nenhum container Redis encontrado no sistema."
                fi
            else
                log "⏭️ Procura por outros containers Redis ignorada pelo usuário."
            fi
        fi
    else
        log "⚠️ Docker não está disponível. Verificando Redis local..."
    fi

    # Tentar via redis-cli local se Docker não estiver disponível ou opções acima falharem
    if command -v redis-cli >/dev/null 2>&1; then
        log "🔍 Tentando limpar Redis local..."
        
        # Extrair configurações do Redis do arquivo .env
        REDIS_HOST=$(grep -E "^REDIS_HOST=" "$ENV_FILE" | cut -d '=' -f2)
        REDIS_PORT=$(grep -E "^REDIS_PORT=" "$ENV_FILE" | cut -d '=' -f2)
        REDIS_DB=$(grep -E "^REDIS_DB=" "$ENV_FILE" | cut -d '=' -f2)

        # Configurações padrão
        REDIS_HOST=${REDIS_HOST:-127.0.0.1}
        REDIS_PORT=${REDIS_PORT:-6379}
        REDIS_DB=${REDIS_DB:-0}
        
        log "🔍 Usando configurações Redis local: HOST=$REDIS_HOST, PORT=$REDIS_PORT, DB=$REDIS_DB"
        
        # Preparar opções de autenticação
        AUTH_OPTS=""
        if [ -n "$REDIS_PASSWORD" ]; then
            AUTH_OPTS="-a $REDIS_PASSWORD"
            log "🔐 Usando autenticação Redis com senha configurada"
        fi
        if [ -n "$REDIS_DB" ] && [ "$REDIS_DB" != "0" ]; then
            AUTH_OPTS="$AUTH_OPTS -n $REDIS_DB"
        fi
        
        # Verificar se consegue se conectar ao Redis
        if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" $AUTH_OPTS ping >/dev/null 2>&1; then
            log "✅ Conectado ao Redis local. Executando limpeza..."
            
            # Limpar chaves Bull
            redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" $AUTH_OPTS --scan --pattern "bull:*" | \
            xargs -r redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" $AUTH_OPTS del
            
            # Limpar chaves JWT
            redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" $AUTH_OPTS --scan --pattern "jwt:*" | \
            xargs -r redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" $AUTH_OPTS del
            
            # Limpar chaves de sessão
            redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" $AUTH_OPTS --scan --pattern "sess:*" | \
            xargs -r redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" $AUTH_OPTS del
            
            log "✅ Redis local limpo com sucesso!"
            
            # Tentar reiniciar o serviço Redis local se necessário
            log "🔄 Tentando reiniciar serviço Redis local..."
            if command -v systemctl >/dev/null 2>&1 && systemctl is-active --quiet redis-server; then
                sudo systemctl restart redis-server
                log "✅ Serviço Redis reiniciado via systemctl"
            elif command -v systemctl >/dev/null 2>&1 && systemctl is-active --quiet redis; then
                sudo systemctl restart redis
                log "✅ Serviço Redis reiniciado via systemctl"
            elif command -v service >/dev/null 2>&1; then
                sudo service redis-server restart 2>/dev/null || sudo service redis restart 2>/dev/null
                log "✅ Serviço Redis reiniciado via service"
            else
                log "⚠️ Não foi possível reiniciar automaticamente o serviço Redis local. Considere reiniciá-lo manualmente."
            fi
            
            return 0
        else
            log "❌ Não foi possível conectar ao Redis local."
        fi
    else
        log "❌ redis-cli não está disponível no sistema."
    fi

    log "❌ Não foi possível limpar o Redis. Verifique suas configurações no arquivo .env e a disponibilidade do serviço Redis."
    return 1
}

verificar_e_atualizar_redis() {
    log "🔍 Verificando versão do Redis..."
    local redis_version=""
    local redis_service=""
    local redis_connection_error=false
    local redis_reinstall=false

    # Obter caminho do arquivo .env
    ENV_FILE=$(get_env_file)
    
    if [ -z "$ENV_FILE" ]; then
        log "❌ Arquivo .env não encontrado em nenhum local padrão."
        log "📂 Diretório atual: $(pwd)"
        log "📂 Listando arquivos na pasta backend: $(ls -la backend/ 2>/dev/null || echo 'Não acessível')"
        return 1
    fi
    
    log "📄 Carregando variáveis de ambiente do arquivo $ENV_FILE"
    
    # Extrair variáveis do Redis do arquivo .env
    REDIS_HOST=$(grep -E "^REDIS_HOST=" "$ENV_FILE" | cut -d '=' -f2)
    REDIS_PORT=$(grep -E "^REDIS_PORT=" "$ENV_FILE" | cut -d '=' -f2)
    REDIS_PASSWORD=$(grep -E "^REDIS_PASSWORD=" "$ENV_FILE" | cut -d '=' -f2)
    REDIS_DB=$(grep -E "^REDIS_DB=" "$ENV_FILE" | cut -d '=' -f2)

    # Configurações padrão
    REDIS_HOST=${REDIS_HOST:-127.0.0.1}
    REDIS_PORT=${REDIS_PORT:-6379}
    REDIS_DB=${REDIS_DB:-0}
    
    log "🔍 Usando configurações Redis: HOST=$REDIS_HOST, PORT=$REDIS_PORT, DB=$REDIS_DB"
    
    # Montar opções de autenticação para comandos Redis
    AUTH_OPTS=""
    if [ -n "$REDIS_PASSWORD" ]; then
        AUTH_OPTS="-a $REDIS_PASSWORD"
        log "🔐 Usando autenticação Redis com senha configurada"
    fi
    
    # Adicionar opção de DB se não for o padrão
    if [ -n "$REDIS_DB" ] && [ "$REDIS_DB" != "0" ]; then
        AUTH_OPTS="$AUTH_OPTS -n $REDIS_DB"
    fi

    # Verificar qual serviço Redis está sendo usado
    if systemctl is-active --quiet redis-server 2>/dev/null; then
        redis_service="redis-server"
        log "✅ Serviço redis-server está ativo"
    elif systemctl is-active --quiet redis 2>/dev/null; then
        redis_service="redis"
        log "✅ Serviço redis está ativo"
    else
        log "⚠️ Nenhum serviço Redis ativo encontrado"
    fi

    # Verificar versão do Redis instalado no servidor
    if command -v redis-cli >/dev/null 2>&1; then
        # Testar conexão com o Redis antes
        if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" $AUTH_OPTS ping >/dev/null 2>&1; then
            redis_version=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" $AUTH_OPTS info | grep -oP 'redis_version:\K\d+\.\d+\.\d+' || echo "")
            if [ -n "$redis_version" ]; then
                log "✅ Redis instalado no servidor. Versão: $redis_version"
            else
                # Tentar método alternativo
                redis_version=$(redis-cli --version | grep -oP 'redis-cli\s+\K\d+\.\d+\.\d+' || echo "")
                if [ -n "$redis_version" ]; then
                    log "✅ Redis-cli encontrado. Versão: $redis_version"
                else
                    log "⚠️ Redis-cli encontrado, mas não foi possível determinar a versão"
                fi
            fi
        else
            log "⚠️ Não foi possível conectar ao Redis usando as credenciais do .env"
            redis_connection_error=true
            
            # Tentar obter a versão sem autenticação para diagnóstico
            redis_version=$(redis-cli --version | grep -oP 'redis-cli\s+\K\d+\.\d+\.\d+' || echo "")
            if [ -n "$redis_version" ]; then
                log "✅ Redis-cli encontrado. Versão: $redis_version"
            fi
        fi
    fi

    # Verificar se precisamos reinstalar o Redis devido a problemas de conexão
    if [ "$redis_connection_error" = true ]; then
        if [ -n "$redis_service" ]; then
            log "🔄 Redis instalado (versão $redis_version), mas com problemas de autenticação"
            read -p "🔄 Deseja reinstalar o Redis e configurar com a senha correta? (s/N): " reinstall_redis
            if [[ "$reinstall_redis" =~ ^[Ss]$ ]]; then
                redis_reinstall=true
                log "🚀 Usuário optou por reinstalar o Redis"
            else
                log "⏭️ Reinstalação do Redis cancelada pelo usuário"
            fi
        else
            log "⚠️ Redis não está funcionando corretamente"
            read -p "🔄 Deseja reinstalar o Redis? (s/N): " reinstall_redis
            if [[ "$reinstall_redis" =~ ^[Ss]$ ]]; then
                redis_reinstall=true
                log "🚀 Usuário optou por reinstalar o Redis"
            else
                log "⏭️ Reinstalação do Redis cancelada pelo usuário"
            fi
        fi
    elif [ -z "$redis_version" ]; then
        log "⚠️ Redis não encontrado ou versão não detectada"
        read -p "🔄 Redis não encontrado. Deseja instalar Redis $REDIS_TARGET_VERSION? (s/N): " install_redis
        if [[ "$install_redis" =~ ^[Ss]$ ]]; then
            redis_reinstall=true
            log "🚀 Iniciando instalação do Redis $REDIS_TARGET_VERSION..."
        else
            log "⏭️ Instalação do Redis cancelada pelo usuário"
            return 1
        fi
    else
        log "✅ Versão atual do Redis: $redis_version"
        
        # Comparar versões
        if [ "$(printf '%s\n' "$REDIS_MIN_VERSION" "$redis_version" | sort -V | head -n1)" != "$REDIS_MIN_VERSION" ]; then
            log "⚠️ Versão do Redis ($redis_version) é inferior à mínima requerida ($REDIS_MIN_VERSION)"
            
            read -p "🔄 Deseja atualizar para o Redis $REDIS_TARGET_VERSION? (s/N): " update_redis
            if [[ "$update_redis" =~ ^[Ss]$ ]]; then
                redis_reinstall=true
                log "🚀 Iniciando atualização do Redis para $REDIS_TARGET_VERSION..."
            else
                log "⏭️ Atualização do Redis cancelada pelo usuário"
                return 0
            fi
        else
            log "✅ Versão do Redis já satisfatória ($redis_version)"
            
            # Se a versão está OK mas temos problemas de autenticação, perguntar se quer reconfigurar
            if [ "$redis_connection_error" = true ]; then
                read -p "🔄 Deseja reconfigurar o Redis com a senha correta? (s/N): " reconfigure_redis
                if [[ "$reconfigure_redis" =~ ^[Ss]$ ]]; then
                    log "🔄 Reconfigurando o Redis com a senha do arquivo .env"
                    redis_reinstall=true
                else
                    log "⏭️ Reconfiguração do Redis cancelada pelo usuário"
                    return 0
                fi
            else
                return 0
            fi
        fi
    fi
    
    # Realizar reinstalação/reconfiguração se necessário
    if [ "$redis_reinstall" = true ]; then
        # Parar o serviço Redis atual
        if [ -n "$redis_service" ]; then
            log "🛑 Parando serviço $redis_service..."
            if [ "$(whoami)" != "root" ]; then
                sudo systemctl stop $redis_service
            else
                systemctl stop $redis_service
            fi
        fi
        
        # Backup da configuração atual do Redis
        log "📦 Criando backup da configuração do Redis..."
        local redis_conf_backup="/tmp/redis_conf_backup_$(date +%Y%m%d%H%M%S)"
        mkdir -p "$redis_conf_backup"
        
        # Identificar local dos arquivos de configuração
        if [ -f "/etc/redis/redis.conf" ]; then
            if [ "$(whoami)" != "root" ]; then
                sudo cp "/etc/redis/redis.conf" "$redis_conf_backup/"
            else
                cp "/etc/redis/redis.conf" "$redis_conf_backup/"
            fi
            log "✅ Backup de /etc/redis/redis.conf criado"
        elif [ -f "/etc/redis.conf" ]; then
            if [ "$(whoami)" != "root" ]; then
                sudo cp "/etc/redis.conf" "$redis_conf_backup/"
            else
                cp "/etc/redis.conf" "$redis_conf_backup/"
            fi
            log "✅ Backup de /etc/redis.conf criado"
        fi
        
        # Desinstalar o Redis atual
        log "🧹 Removendo instalação atual do Redis..."
        if [ "$(whoami)" != "root" ]; then
            if command -v apt-get >/dev/null 2>&1; then
                sudo apt-get remove -y redis-server redis redis-tools
                sudo apt-get autoremove -y
            elif command -v yum >/dev/null 2>&1; then
                sudo yum remove -y redis
            elif command -v dnf >/dev/null 2>&1; then
                sudo dnf remove -y redis
            fi
        else
            if command -v apt-get >/dev/null 2>&1; then
                apt-get remove -y redis-server redis redis-tools
                apt-get autoremove -y
            elif command -v yum >/dev/null 2>&1; then
                yum remove -y redis
            elif command -v dnf >/dev/null 2>&1; then
                dnf remove -y redis
            fi
        fi
        
        log "🔄 Instalando Redis $REDIS_TARGET_VERSION..."
        
        # Construir comando de instalação
        local install_cmd=""
        
        if command -v apt-get >/dev/null 2>&1; then
            install_cmd="apt-get update && "
            install_cmd+="apt-get install -y software-properties-common && "
            install_cmd+="add-apt-repository ppa:redislabs/redis -y && "
            install_cmd+="apt-get update && "
            install_cmd+="apt-get install -y redis-server && "
            
            # Configurar senha
            if [ -n "$REDIS_PASSWORD" ]; then
                install_cmd+="if [ -f \"/etc/redis/redis.conf\" ]; then "
                install_cmd+="sed -i \"s/^# requirepass.*$/requirepass $REDIS_PASSWORD/\" /etc/redis/redis.conf && "
                install_cmd+="sed -i \"s/^requirepass.*$/requirepass $REDIS_PASSWORD/\" /etc/redis/redis.conf; "
                install_cmd+="else "
                install_cmd+="echo \"⚠️ Arquivo de configuração /etc/redis/redis.conf não encontrado\"; "
                install_cmd+="fi && "
            fi
            
            install_cmd+="systemctl enable redis-server && "
            install_cmd+="systemctl restart redis-server"
            
        elif command -v yum >/dev/null 2>&1; then
            install_cmd="yum install -y epel-release && "
            install_cmd+="yum install -y redis && "
            
            # Configurar senha
            if [ -n "$REDIS_PASSWORD" ]; then
                install_cmd+="if [ -f \"/etc/redis.conf\" ]; then "
                install_cmd+="sed -i \"s/^# requirepass.*$/requirepass $REDIS_PASSWORD/\" /etc/redis.conf && "
                install_cmd+="sed -i \"s/^requirepass.*$/requirepass $REDIS_PASSWORD/\" /etc/redis.conf; "
                install_cmd+="else "
                install_cmd+="echo \"⚠️ Arquivo de configuração /etc/redis.conf não encontrado\"; "
                install_cmd+="fi && "
            fi
            
            install_cmd+="systemctl enable redis && "
            install_cmd+="systemctl restart redis"
            
        elif command -v dnf >/dev/null 2>&1; then
            install_cmd="dnf install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm && "
            install_cmd+="dnf module reset redis -y && "
            install_cmd+="dnf module enable redis:7.4 -y && "
            install_cmd+="dnf install -y redis && "
            
            # Configurar senha
            if [ -n "$REDIS_PASSWORD" ]; then
                install_cmd+="if [ -f \"/etc/redis.conf\" ]; then "
                install_cmd+="sed -i \"s/^# requirepass.*$/requirepass $REDIS_PASSWORD/\" /etc/redis.conf && "
                install_cmd+="sed -i \"s/^requirepass.*$/requirepass $REDIS_PASSWORD/\" /etc/redis.conf; "
                install_cmd+="else "
                install_cmd+="echo \"⚠️ Arquivo de configuração /etc/redis.conf não encontrado\"; "
                install_cmd+="fi && "
            fi
            
            install_cmd+="systemctl enable redis && "
            install_cmd+="systemctl restart redis"
        else
            log "❌ Gerenciador de pacotes não suportado"
            return 1
        fi
        
        # Executar instalação com sudo se necessário
        if [ "$(whoami)" != "root" ]; then
            log "🔐 Executando instalação do Redis como root..."
            sudo bash -c "$install_cmd"
        else
            log "🔐 Executando instalação do Redis..."
            bash -c "$install_cmd"
        fi
        
        # Verificar se a reinstalação foi bem-sucedida
        log "🔍 Verificando a instalação do Redis..."
        sleep 3 # Aguardar o serviço iniciar
        
        # Verificar se o serviço está rodando
        local new_service=""
        if systemctl is-active --quiet redis-server; then
            new_service="redis-server"
            log "✅ Serviço redis-server está rodando"
        elif systemctl is-active --quiet redis; then
            new_service="redis"
            log "✅ Serviço redis está rodando"
        else
            log "⚠️ Serviço Redis não está rodando. Tentando iniciar..."
            if [ "$(whoami)" != "root" ]; then
                sudo systemctl start redis-server 2>/dev/null || sudo systemctl start redis 2>/dev/null
            else
                systemctl start redis-server 2>/dev/null || systemctl start redis 2>/dev/null
            fi
            
            sleep 2
            if systemctl is-active --quiet redis-server; then
                new_service="redis-server"
                log "✅ Serviço redis-server iniciado com sucesso"
            elif systemctl is-active --quiet redis; then
                new_service="redis"
                log "✅ Serviço redis iniciado com sucesso"
            else
                log "❌ Não foi possível iniciar o serviço Redis"
                return 1
            fi
        fi
        
        # Testar conexão com o Redis
        if command -v redis-cli >/dev/null 2>&1; then
            if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" $AUTH_OPTS ping >/dev/null 2>&1; then
                log "✅ Conexão com o Redis estabelecida com sucesso"
                local new_version=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" $AUTH_OPTS info | grep -oP 'redis_version:\K\d+\.\d+\.\d+' || echo "")
                
                if [ -n "$new_version" ]; then
                    log "✅ Redis instalado/reconfigurado com sucesso. Versão: $new_version"
                    return 0
                else
                    log "⚠️ Redis instalado, mas não foi possível obter a versão"
                    return 0
                fi
            else
                log "❌ Redis instalado, mas não foi possível conectar com as credenciais fornecidas"
                log "⚠️ Verifique se a senha no arquivo .env está configurada corretamente"
                
                # Tentar configurar a senha novamente
                log "🔄 Tentando configurar a senha novamente..."
                
                if [ -n "$REDIS_PASSWORD" ]; then
                    local redis_conf=""
                    if [ -f "/etc/redis/redis.conf" ]; then
                        redis_conf="/etc/redis/redis.conf"
                    elif [ -f "/etc/redis.conf" ]; then
                        redis_conf="/etc/redis.conf"
                    fi
                    
                    if [ -n "$redis_conf" ]; then
                        log "📄 Configurando senha no arquivo $redis_conf"
                        if [ "$(whoami)" != "root" ]; then
                            sudo sed -i "s/^# requirepass.*$/requirepass $REDIS_PASSWORD/" "$redis_conf"
                            sudo sed -i "s/^requirepass.*$/requirepass $REDIS_PASSWORD/" "$redis_conf"
                        else
                            sed -i "s/^# requirepass.*$/requirepass $REDIS_PASSWORD/" "$redis_conf"
                            sed -i "s/^requirepass.*$/requirepass $REDIS_PASSWORD/" "$redis_conf"
                        fi
                        
                        # Reiniciar o serviço Redis
                        log "🔄 Reiniciando serviço $new_service..."
                        if [ "$(whoami)" != "root" ]; then
                            sudo systemctl restart $new_service
                        else
                            systemctl restart $new_service
                        fi
                        
                        sleep 2
                        if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" $AUTH_OPTS ping >/dev/null 2>&1; then
                            log "✅ Conexão com o Redis estabelecida após reconfiguração da senha"
                            return 0
                        else
                            log "❌ Ainda não foi possível conectar ao Redis"
                            return 1
                        fi
                    else
                        log "❌ Não foi possível encontrar o arquivo de configuração do Redis"
                        return 1
                    fi
                else
                    log "⚠️ Nenhuma senha definida no arquivo .env"
                    return 1
                fi
            fi
        else
            log "❌ redis-cli não encontrado após a instalação"
            return 1
        fi
    fi
    
    return 0
}

# Guardar os argumentos originais
ORIGINAL_ARGS="$@"

# Flag para controlar a execução como root
CONTINUE_AS_ROOT=false
CONTINUE_AS_USER=false

# Verificar se está executando como continuação após elevação de privilégios
for arg in "$@"; do
    if [ "$arg" = "--continue-as-root" ]; then
        CONTINUE_AS_ROOT=true
    fi
    if [ "$arg" = "--continue-as-user" ]; then
        CONTINUE_AS_USER=true
    fi
done

# Se estiver executando como root após elevação, executar apenas as tarefas privilegiadas
if $CONTINUE_AS_ROOT; then
    log "🔐 Executando tarefas privilegiadas como root"
    
    # Atualizar pacotes do sistema operacional
    if $UPDATE_OS_PACKAGES; then
        atualizar_pacotes_sistema
    fi
    
    # Instalar ffmpeg se necessário
    if [ "$INSTALL_FFMPEG" = "true" ]; then
        comando_existe ffmpeg || {
            log "Instalando ffmpeg como root..."
            if comando_existe apt-get; then
                apt-get update && apt-get install -y ffmpeg
            elif comando_existe yum; then
                yum install -y epel-release
                yum install -y ffmpeg ffmpeg-devel
            elif comando_existe brew; then
                brew update && brew install ffmpeg
            fi
        }
    fi
    
    # Instalar Node.js se necessário
    if [ "$UPDATE_NODE" = "true" ]; then
        log "Atualizando Node.js como root..."
        if comando_existe apt-get; then
            comando_existe curl || apt-get install -y curl
            curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
            apt-get install -y nodejs
        elif comando_existe yum; then
            comando_existe curl || yum install -y curl
            curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
            yum install -y nodejs
        elif comando_existe brew; then
            brew update && brew install node@20
        fi
    fi
    
    # Reiniciar Redis como root se necessário
    if [ "$RESTART_REDIS_AS_ROOT" = "true" ]; then
        log "Reiniciando Redis como root..."
        if [ "$REDIS_CONTAINER_ID" != "" ]; then
            docker restart $REDIS_CONTAINER_ID
            log "✅ Container Redis reiniciado: $REDIS_CONTAINER_ID"
        else
            if command -v systemctl >/dev/null 2>&1; then
                systemctl restart redis-server || systemctl restart redis
                log "✅ Serviço Redis do sistema operacional reiniciado"
            elif command -v service >/dev/null 2>&1; then
                service redis-server restart || service redis restart
                log "✅ Serviço Redis do sistema operacional reiniciado"
            fi
        fi
    fi
    
    # Voltar para o usuário original para continuar o restante do script
    voltar_para_usuario_original
    exit 0
fi

# Se estiver executando como usuário após downgrade, continuar a execução normal
if $CONTINUE_AS_USER; then
    log "👤 Continuando execução como usuário $ORIGINAL_USER"
    # Continuar a execução normal do script...
else
    # Verificar se não foram passados parâmetros
    if [ $# -eq 0 ]; then
        log "Nenhum parâmetro foi informado. Utilizando configuração padrão para atualização completa"
        UPDATE_BACKEND=true
        UPDATE_FRONTEND=true
        UPDATE_NODE_MODULES=true
        RUN_MIGRATIONS=true
    fi

    # Parsing de parâmetros
    while [[ $# -gt 0 ]]; do
        case $1 in
            -bd)
                UPDATE_BACKEND=true
                log "Parâmetro -bd detectado: Backend será atualizado"
                shift
                ;;
            -fd)
                UPDATE_FRONTEND=true
                log "Parâmetro -fd detectado: Frontend será atualizado"
                shift
                ;;
            -nm)
                UPDATE_NODE_MODULES=true
                log "Parâmetro -nm detectado: node_modules serão atualizados"
                shift
                ;;
            -sm)
                RUN_MIGRATIONS=true
                log "Parâmetro -sm detectado: Migrações Sequelize serão executadas"
                shift
                ;;
            -f)
                FORCE_MODE=true
                UPDATE_BACKEND=true
                UPDATE_FRONTEND=true
                log "Parâmetro -f detectado: Modo forçado ativado"
                shift
                ;;
            -bkp)
                BACKUP_MODE=true
                # Configurando para realizar atualização completa com o parâmetro -bkp
                UPDATE_BACKEND=true
                UPDATE_FRONTEND=true
                UPDATE_NODE_MODULES=true
                RUN_MIGRATIONS=true
                log "Parâmetro -bkp detectado: Modo de backup ativado com atualização completa"
                shift
                ;;
            -nk)
                KEEP_SRC=false
                log "Parâmetro -nk detectado: Pastas src não serão mantidas"
                shift
                ;;
            -cr)
                CLEAN_REDIS=true
                log "Parâmetro -cr detectado: Redis será limpo"
                shift
                ;;
            -b|--branch)
                if [ -n "$2" ]; then
                    BRANCH="$2"
                    log "Parâmetro -b/--branch detectado: Branch definida como: $BRANCH"
                    shift 2
                else
                    log "❌ Erro: Parâmetro -b/--branch requer um valor."
                    exit 1
                fi
                ;;
            -h)
                show_help
                ;;
            --continue-as-root)
                # Ignorar este parâmetro interno
                shift
                ;;
            --continue-as-user)
                # Ignorar este parâmetro interno
                shift
                ;;
            *)
                log "❌ Opção inválida: $1"
                show_help
                ;;
        esac
    done

    log "🚀 Iniciando processo de atualização do AutoAtende"

    # Perguntar ao usuário se deseja atualizar os pacotes do sistema operacional
    read -p "🔄 Deseja atualizar os pacotes do sistema operacional? (s/N): " update_os_input
    if [[ "$update_os_input" =~ ^[Ss]$ ]]; then
        UPDATE_OS_PACKAGES=true
        log "Usuário optou por atualizar os pacotes do sistema operacional"
    else
        log "Usuário optou por não atualizar os pacotes do sistema operacional"
    fi

    # Verificar a versão do Node.js
    if ! verificar_node_version; then
        read -p "🔄 A versão do Node.js não atende aos requisitos mínimos. Deseja atualizar? (S/n): " update_node_input
        if [[ "$update_node_input" =~ ^[Nn]$ ]]; then
            log "Usuário optou por não atualizar o Node.js. Continuando com a versão atual..."
        else
            log "Usuário optou por atualizar o Node.js"
            export UPDATE_NODE=true
            alternar_para_root
        fi
    fi

    # Verificar e atualizar o Redis
    verificar_e_atualizar_redis

    # Verificar e instalar o ffmpeg (com confirmação do usuário)
    if ! comando_existe ffmpeg; then
        read -p "🔄 O ffmpeg não está instalado. Deseja instalá-lo agora? (s/N): " install_ffmpeg_input
        if [[ "$install_ffmpeg_input" =~ ^[Ss]$ ]]; then
            log "Usuário optou por instalar o ffmpeg"
            export INSTALL_FFMPEG=true
            alternar_para_root
        else
            log "Usuário optou por não instalar o ffmpeg. Continuando sem ffmpeg..."
        fi
    else
        log "✅ ffmpeg já está instalado"
    fi

    # Atualizar pacotes do sistema operacional se solicitado
    if $UPDATE_OS_PACKAGES; then
        alternar_para_root
    fi

    # Perguntar ao usuário se deseja limpar o Redis (se não foi especificado por parâmetro)
    if ! $CLEAN_REDIS; then
        read -p "🔄 Deseja limpar o cache do Redis (recomendado para resolver problemas de inicialização)? (s/N): " clean_redis_input
        if [[ "$clean_redis_input" =~ ^[Ss]$ ]]; then
            CLEAN_REDIS=true
            log "Usuário optou por limpar o cache do Redis"
        else
            log "Usuário optou por não limpar o cache do Redis"
        fi
    fi
    
    # Perguntar ao usuário se deseja trocar a branch (se não foi especificado por parâmetro)
    if [ "$BRANCH" = "main" ]; then
        read -p "🔄 Deseja usar outra branch que não seja 'main'? (s/N): " change_branch_input
        if [[ "$change_branch_input" =~ ^[Ss]$ ]]; then
            read -p "🔄 Digite o nome da branch que deseja utilizar: " branch_input
            if [ -n "$branch_input" ]; then
                BRANCH="$branch_input"
                log "Usuário optou por usar a branch: $BRANCH"
            else
                log "Nome da branch vazio. Utilizando branch padrão: main"
            fi
        else
            log "Usuário optou por usar a branch padrão: main"
        fi
    fi
fi

# Verificar consistência dos parâmetros
if $RUN_MIGRATIONS && ! $UPDATE_BACKEND; then
    log "❌ Erro: -sm só funciona com -bd."
    exit 1
fi

# Configuração inicial
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
NAME=${DIR##*/}
log "📂 Nome da pasta: $NAME"

# Verificar instância no PM2
HAS_BACKEND=$(pm2 list | grep "$NAME-backend")
if [ -z "$HAS_BACKEND" ]; then
    log "💡 Nenhuma instância backend encontrada no PM2. Usando nome padrão: $NAME."
else
    if [[ $NAME != *"-backend"* ]]; then
        NAME="$NAME-backend"
        log "💡 Instância backend detectada. Ajustando nome para: $NAME."
    fi
fi

# Verificar se a branch existe
log "🔍 Verificando se a branch '$BRANCH' existe no repositório..."
if ! git show-ref --verify --quiet refs/remotes/origin/$BRANCH; then
    log "❌ Branch '$BRANCH' não existe no repositório remoto!"
    read -p "🔄 Deseja continuar com a branch 'main' em vez disso? (S/n): " use_main_branch
    if [[ "$use_main_branch" =~ ^[Nn]$ ]]; then
        log "❌ Atualização cancelada pelo usuário."
        exit 1
    else
        BRANCH="main"
        log "✅ Branch ajustada para: $BRANCH"
    fi
fi

log "✅ Branch definida como: $BRANCH"

# Backup do manifest.json
log "📂 Salvando manifest.json customizado..."
CUSTOM_MANIFEST_PATH="frontend/public/manifest.json"
TEMP_MANIFEST_PATH="/tmp/manifest.json"
if [ -f "$CUSTOM_MANIFEST_PATH" ]; then
    cp "$CUSTOM_MANIFEST_PATH" "$TEMP_MANIFEST_PATH"
    log "✅ Arquivo manifest.json salvo temporariamente."
else
    log "⚠️ Nenhum manifest.json customizado encontrado para salvar."
fi

log "🔄 Sincronizando repositório com origin/$BRANCH..."
git fetch --all --prune
git checkout $BRANCH
git reset --hard origin/$BRANCH
git pull origin $BRANCH

# Limpeza de branches locais (mantendo apenas a branch selecionada e a main)
log "🧹 Removendo branches locais desnecessárias..."
git branch | grep -v " $BRANCH$" | grep -v " main$" | xargs -r git branch -D

# Restauração do manifest.json APÓS a sincronização
log "📂 Restaurando manifest.json customizado..."
if [ -f "$TEMP_MANIFEST_PATH" ]; then
    cp "$TEMP_MANIFEST_PATH" "$CUSTOM_MANIFEST_PATH"
    log "✅ Arquivo manifest.json customizado restaurado."
else
    log "⚠️ Nenhum arquivo manifest.json encontrado para restaurar."
fi

# Limpar Redis se solicitado
if $CLEAN_REDIS; then
    log "🔄 Iniciando limpeza do Redis..."
    if clean_redis; then
        log "✅ Limpeza do Redis concluída com sucesso"
    else
        log "⚠️ Houve problemas durante a limpeza do Redis"
        
        # Verificar se é necessário elevar privilégios para reiniciar o Redis
        read -p "🔄 Deseja tentar reiniciar o Redis como root? (s/N): " restart_redis_input
        if [[ "$restart_redis_input" =~ ^[Ss]$ ]]; then
            # Obter o ID do container Redis, se existir
            REDIS_CONTAINER_ID=$(docker ps | grep redis | awk '{print $1}' | head -1)
            export REDIS_CONTAINER_ID
            export RESTART_REDIS_AS_ROOT=true
            alternar_para_root
        fi
    fi
fi

# Função para realizar backup
perform_backup() {
    if $BACKUP_MODE; then
        TIMESTAMP=$(date +"%Y%m%d%H%M%S")
        BACKUP_DIR="backup_$TIMESTAMP"
        mkdir -p $BACKUP_DIR
        log "📦 Criando diretório de backup: $BACKUP_DIR"

        if $UPDATE_BACKEND && [ -d "backend/dist" ]; then
            log "📦 Realizando backup da pasta backend/dist..."
            tar -czf "$BACKUP_DIR/backend_dist_$TIMESTAMP.tar.gz" -C backend dist
            log "✅ Backup do backend/dist concluído."
        else
            log "⚠️ Pasta backend/dist não encontrada ou backend não será atualizado."
        fi

        if $UPDATE_FRONTEND && [ -d "frontend/build" ]; then
            log "📦 Realizando backup da pasta frontend/build..."
            tar -czf "$BACKUP_DIR/frontend_build_$TIMESTAMP.tar.gz" -C frontend build
            log "✅ Backup do frontend/build concluído."
        else
            log "⚠️ Pasta frontend/build não encontrada ou frontend não será atualizado."
        fi
    fi
}

# Realizar backup antes de atualizar
perform_backup

# Parar PM2
if $UPDATE_BACKEND; then
    log "🛑 Parando instância PM2: $NAME..."
    pm2 stop $NAME
fi

# Atualização do Backend
if $UPDATE_BACKEND; then
    cd backend || exit
    log "📂 Acessando a pasta 'backend'."

    if ! $FORCE_MODE && $UPDATE_NODE_MODULES; then
        log "🧹 Removendo node_modules e package-lock.json do backend..."
        rm -rf node_modules
        rm package-lock.json
        log "📦 Instalando dependências do backend..."
        npm install
        if [ $? -ne 0 ]; then
            log "⚠️ Alerta: Houve erros durante a instalação das dependências do backend."
        else
            log "✅ Dependências do backend instaladas com sucesso."
        fi
    else
        log "⏭️ Modo forçado: pulando atualização de dependências do backend..."
    fi

    log "🏗️ Apagando a dist anterior..."
    rm -rf dist

    log "🏗️ Construindo aplicação..."
    npm run build
    if [ $? -ne 0 ]; then
        log "❌ Erro durante o build do backend. Verifique os logs acima."
        exit 1
    else
        log "✅ Build concluído com sucesso."
    fi

    log "📄 Copiando arquivo .env para a pasta dist..."
    cp .env dist/
    if [ $? -ne 0 ]; then
        log "⚠️ Erro ao copiar o arquivo .env. Verifique se o arquivo existe."
    else
        log "✅ Arquivo .env copiado com sucesso."
    fi

    if ! $FORCE_MODE && $RUN_MIGRATIONS; then
        log "📂 Executando migrações do Sequelize..."
        npx sequelize db:migrate
        if [ $? -ne 0 ]; then
            log "⚠️ Erro durante a execução das migrações. Verifique os logs acima."
        else
            log "✅ Migrações aplicadas com sucesso."
        fi
        
        # Executar a configuração das configurações do banco de dados APÓS as migrações
        log "⚙️ Configurando configurações do banco de dados..."
        if configure_database_settings; then
            log "✅ Configurações do banco de dados atualizadas com sucesso."
        else
            log "⚠️ Houve problemas ao configurar as configurações do banco de dados."
        fi
    else
        log "⏭️ Modo forçado ou migrações desativadas: pulando migrações do Sequelize e configuração do banco..."
    fi

    log "🚀 Reiniciando aplicação no PM2 com ambiente de produção..."
    NODE_ENV=production pm2 start $NAME --update-env --node-args="--max-old-space-size=8192"
    if [ $? -ne 0 ]; then
        log "❌ Erro ao reiniciar a aplicação no PM2. Verifique os logs do PM2."
    else
        log "✅ Aplicação reiniciada com sucesso."
    fi

    if ! $KEEP_SRC; then
        log "🧹 Removendo arquivos 'src' para liberar espaço..."
        rm -rf src
        log "✅ Pastas 'src' removidas com sucesso."
    else
        log "🔒 Mantendo pasta 'src' do backend conforme configuração padrão..."
    fi

    cd ..
fi

# Atualização do Frontend
if $UPDATE_FRONTEND; then
    cd frontend || exit
    log "📂 Acessando a pasta 'frontend'."

    if ! $FORCE_MODE && $UPDATE_NODE_MODULES; then
        log "🧹 Removendo node_modules e package-lock.json do frontend..."
        rm -rf node_modules
        rm package-lock.json
        log "📦 Instalando dependências do frontend..."
        npm install --legacy-peer-deps
        if [ $? -ne 0 ]; then
            log "⚠️ Alerta: Houve erros durante a instalação das dependências do frontend."
        else
            log "✅ Dependências do frontend instaladas com sucesso."
        fi
    else
        log "⏭️ Modo forçado: pulando atualização de dependências do frontend..."
    fi

    log "🏗️ Apagando a build anterior..."
    rm -rf build

    log "🏗️ Construindo aplicação frontend..."
    npm run build
    if [ $? -ne 0 ]; then
        log "❌ Erro durante o build do frontend. Verifique os logs acima."
        exit 1
    else
        log "✅ Build do frontend concluído com sucesso."
    fi

    if ! $KEEP_SRC; then
        log "🧹 Removendo arquivos 'src' do frontend..."
        rm -rf src
        log "✅ Pastas 'src' do frontend removidas com sucesso."
    else
        log "🔒 Mantendo pasta 'src' do frontend conforme configuração padrão..."
    fi

    cd ..
fi

# Limpeza de logs antigos do script
limpar_logs_antigos

log "📊 Resumo da atualização:"
log "- Backend atualizado: $(if $UPDATE_BACKEND; then echo "Sim"; else echo "Não"; fi)"
log "- Frontend atualizado: $(if $UPDATE_FRONTEND; then echo "Sim"; else echo "Não"; fi)"
log "- Node modules atualizados: $(if $UPDATE_NODE_MODULES; then echo "Sim"; else echo "Não"; fi)"
log "- Migrações executadas: $(if $RUN_MIGRATIONS; then echo "Sim"; else echo "Não"; fi)"
log "- Pasta src mantida: $(if $KEEP_SRC; then echo "Sim"; else echo "Não"; fi)"
log "- Branch utilizada: $BRANCH"
log "- Modo forçado: $(if $FORCE_MODE; then echo "Sim"; else echo "Não"; fi)"
log "- Backup realizado: $(if $BACKUP_MODE; then echo "Sim"; else echo "Não"; fi)"
log "- Pacotes do SO atualizados: $(if $UPDATE_OS_PACKAGES; then echo "Sim"; else echo "Não"; fi)"
log "- Redis atualizado: $(if [ $? -eq 0 ]; then echo "Sim"; else echo "Não"; fi)"
log "- Redis limpo: $(if $CLEAN_REDIS; then echo "Sim"; else echo "Não"; fi)"

log "🎉 Atualização concluída com sucesso! Aproveite o AutoAtende! 🚀"
log "📜 Log completo disponível em: $LOG_FILE"