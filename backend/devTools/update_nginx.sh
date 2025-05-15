#!/bin/bash

# Script de atualização das configurações do Nginx e variáveis de ambiente para o AutoAtende
# Identifica a instância e URLs automaticamente baseado na localização do script

# Função para exibir mensagens
print_message() {
    echo -e "\e[1;34m[AutoAtende]\e[0m $1"
}

print_error() {
    echo -e "\e[1;31m[Erro]\e[0m $1"
}

print_success() {
    echo -e "\e[1;32m[Sucesso]\e[0m $1"
}

# Verifica se está rodando como root
if [ "$EUID" -ne 0 ]; then
    print_error "Este script precisa ser executado como root"
    exit 1
fi

# Identifica o diretório atual e nome da instância
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
INSTANCE_NAME=${DIR##*/}

print_message "📂 Diretório detectado: $DIR"
print_message "📂 Nome base da instância: $INSTANCE_NAME"

# Verifica se existe uma instância no PM2
HAS_BACKEND=$(pm2 list | grep "$INSTANCE_NAME-backend")

if [ -z "$HAS_BACKEND" ]; then
    print_message "💡 Nenhuma instância backend encontrada no PM2. Usando nome padrão: $INSTANCE_NAME"
else
    if [[ $INSTANCE_NAME != *"-backend"* ]]; then
        INSTANCE_NAME="$INSTANCE_NAME-backend"
        print_message "💡 Instância backend detectada. Ajustando nome para: $INSTANCE_NAME"
    fi
fi

# Define os caminhos dos arquivos .env
BACKEND_ENV="$DIR/backend/.env"
FRONTEND_ENV="$DIR/frontend/.env"

# Verifica se os arquivos .env existem
if [ ! -f "$BACKEND_ENV" ]; then
    print_error "Arquivo .env do backend não encontrado em $BACKEND_ENV"
    exit 1
fi

if [ ! -f "$FRONTEND_ENV" ]; then
    print_error "Arquivo .env do frontend não encontrado em $FRONTEND_ENV"
    exit 1
fi

# Função para atualizar o arquivo .env
update_env_file() {
    local env_file=$1
    local temp_file="${env_file}.tmp"
    local has_changes=0

    # Cria uma cópia do arquivo original
    cp "$env_file" "$temp_file"

    # Função auxiliar para adicionar/atualizar uma variável
    add_or_update_var() {
        local key=$1
        local value=$2
        local file=$3
        
        if ! grep -q "^${key}=" "$file"; then
            echo "${key}=${value}" >> "$file"
            has_changes=1
            print_message "Adicionada variável: ${key}"
        fi
    }

    if [[ $env_file == *"backend/.env" ]]; then
        # Extrai os valores existentes
        local backend_url=$(grep "^BACKEND_URL=" "$env_file" | cut -d '=' -f2)
        local frontend_url=$(grep "^FRONTEND_URL=" "$env_file" | cut -d '=' -f2)
        
        # Remove possíveis aspas
        backend_url=$(echo "$backend_url" | tr -d '"' | tr -d "'")
        frontend_url=$(echo "$frontend_url" | tr -d '"' | tr -d "'")

        # Gera URLs WSS/WS
        local backend_host=$(echo "${backend_url/https:\/\/}")
        local backend_wss="wss://${backend_host}"
        local backend_ws="ws://${backend_host}"
        local frontend_host=$(echo "${frontend_url/https:\/\/}")
        local frontend_wss="wss://${frontend_host}"

        # Adiciona variáveis se não existirem
        add_or_update_var "BACKEND_WSS" "$backend_wss" "$temp_file"
        add_or_update_var "BACKEND_WS" "$backend_ws" "$temp_file"
        add_or_update_var "FRONTEND_WSS" "$frontend_wss" "$temp_file"

    elif [[ $env_file == *"frontend/.env" ]]; then
        # Extrai BACKEND_URL existente
        local backend_url=$(grep "^REACT_APP_BACKEND_URL=" "$env_file" | cut -d '=' -f2)
        backend_url=$(echo "$backend_url" | tr -d '"' | tr -d "'")

        # Extrai o host do backend_url
        local backend_host=$(echo "${backend_url/https:\/\/}")

        # Adiciona variáveis se não existirem
        add_or_update_var "REACT_APP_BACKEND_PROTOCOL" "https" "$temp_file"
        add_or_update_var "REACT_APP_BACKEND_HOST" "$backend_host" "$temp_file"
        add_or_update_var "REACT_APP_BACKEND_PORT" "443" "$temp_file"
    fi

    # Se houve mudanças, faz backup do original e move o arquivo temporário
    if [ $has_changes -eq 1 ]; then
        local backup_file="${env_file}.bak_$(date +%Y%m%d_%H%M%S)"
        mv "$env_file" "$backup_file"
        mv "$temp_file" "$env_file"
        print_success "Arquivo .env atualizado. Backup salvo como: $backup_file"
    else
        rm "$temp_file"
        print_message "Arquivo .env já está atualizado."
    fi
}

# Lê as URLs do arquivo .env do backend
print_message "Lendo configurações do backend..."

# Extrai as URLs do arquivo .env
BACKEND_URL=$(grep "^BACKEND_URL=" "$BACKEND_ENV" | cut -d '=' -f2)
FRONTEND_URL=$(grep "^FRONTEND_URL=" "$BACKEND_ENV" | cut -d '=' -f2)

# Remove possíveis aspas das URLs
BACKEND_URL=$(echo "$BACKEND_URL" | tr -d '"' | tr -d "'")
FRONTEND_URL=$(echo "$FRONTEND_URL" | tr -d '"' | tr -d "'")

if [ -z "$BACKEND_URL" ] || [ -z "$FRONTEND_URL" ]; then
    print_error "BACKEND_URL ou FRONTEND_URL não encontrados no arquivo .env"
    exit 1
fi

print_message "URLs identificadas:"
print_message "Backend: $BACKEND_URL"
print_message "Frontend: $FRONTEND_URL"

# Remove https:// das URLs
backend_hostname=$(echo "${BACKEND_URL/https:\/\/}")
frontend_hostname=$(echo "${FRONTEND_URL/https:\/\/}")

# Extrai a porta do backend do arquivo .env
BACKEND_PORT=$(grep "^PORT=" "$BACKEND_ENV" | cut -d '=' -f2)
BACKEND_PORT=$(echo "$BACKEND_PORT" | tr -d '"' | tr -d "'")

if [ -z "$BACKEND_PORT" ]; then
    print_error "PORT não encontrada no arquivo .env"
    exit 1
fi

print_message "Porta do backend identificada: $BACKEND_PORT"

# Backup dos arquivos originais
backup_dir="/root/nginx_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"

# Backup do nginx.conf original
if [ -f "/etc/nginx/nginx.conf" ]; then
    cp "/etc/nginx/nginx.conf" "$backup_dir/nginx.conf.bak"
fi

if [ -f "/etc/nginx/sites-available/${INSTANCE_NAME}-backend" ]; then
    cp "/etc/nginx/sites-available/${INSTANCE_NAME}-backend" "$backup_dir/${INSTANCE_NAME}-backend.bak"
fi

if [ -f "/etc/nginx/sites-available/${INSTANCE_NAME}-frontend" ]; then
    cp "/etc/nginx/sites-available/${INSTANCE_NAME}-frontend" "$backup_dir/${INSTANCE_NAME}-frontend.bak"
fi

print_message "Backup criado em: $backup_dir"

# Atualiza o nginx.conf principal
cat > "/etc/nginx/nginx.conf" << 'EOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 1024; # Aumentado para lidar melhor com WebSocket
    multi_accept on;         # Habilitado para melhor performance
    use epoll;              # Melhor para Linux
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    keepalive_requests 100;
    types_hash_max_size 2048;
    server_tokens off;          # Segurança: não mostrar versão do nginx
    client_max_body_size 50M;   # Para upload de arquivos maiores

    # Buffers
    client_body_buffer_size 128k;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    ssl_protocols TLSv1.2 TLSv1.3;                     # Removido suporte a TLSv1 e TLSv1.1
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    log_format extended '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'upstream: $upstream_addr '
                    'request_time: $request_time '
                    'upstream_response_time: $upstream_response_time '
                    'upstream_connect_time: $upstream_connect_time '
                    'upstream_header_time: $upstream_header_time';

    access_log /var/log/nginx/access.log extended;
    error_log /var/log/nginx/error.log warn;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript application/x-javascript;

    map $http_upgrade $connection_upgrade {
        default upgrade;
        ''      close;
    }

    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Host $host;

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

# Atualiza configuração do backend
cat > "/etc/nginx/sites-available/${INSTANCE_NAME}-backend" << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $backend_hostname;

    location / {
        proxy_pass http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
    }

    # Location para WebSocket
    location /socket.io/ {
        proxy_pass http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
    }

    location ~ /\.(git|env|config|docker) {
        deny all;
        return 404;
    }
}
EOF

# Atualiza configuração do frontend
cat > "/etc/nginx/sites-available/${INSTANCE_NAME}-frontend" << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $frontend_hostname;
    root /home/deploy/${INSTANCE_NAME}/frontend/build;
    index index.html;

    # Configurações de segurança gerais
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Configuração de cache para arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # Bloquear acesso a arquivos sensíveis
    location ~ /\.(git|env|config|docker) {
        deny all;
        return 404;
    }

    # Configurar tamanho máximo de upload
    client_max_body_size 100M;
}
EOF

# Atualiza os arquivos .env
# Atualiza os arquivos .env
print_message "Atualizando arquivos .env..."

# Atualiza .env do backend
update_env_file "$BACKEND_ENV"
update_env_file "$FRONTEND_ENV"

# Verificar sintaxe do Nginx
print_message "Verificando sintaxe do Nginx..."
nginx -t

if [ $? -eq 0 ]; then
    print_success "Configuração do Nginx atualizada com sucesso!"
    
    # Criar links simbólicos se não existirem
    if [ ! -L "/etc/nginx/sites-enabled/${INSTANCE_NAME}-backend" ]; then
        ln -s "/etc/nginx/sites-available/${INSTANCE_NAME}-backend" "/etc/nginx/sites-enabled/${INSTANCE_NAME}-backend"
        print_message "Link simbólico criado para o backend"
    fi
    
    if [ ! -L "/etc/nginx/sites-enabled/${INSTANCE_NAME}-frontend" ]; then
        ln -s "/etc/nginx/sites-available/${INSTANCE_NAME}-frontend" "/etc/nginx/sites-enabled/${INSTANCE_NAME}-frontend"
        print_message "Link simbólico criado para o frontend"
    fi
    
    print_message "Reiniciando o Nginx..."
    systemctl restart nginx
    
    # Após reiniciar o Nginx com sucesso, executar o certbot
    if [ $? -eq 0 ]; then
        print_success "✅ Atualização concluída com sucesso!"
        print_message "Backup das configurações antigas salvo em: $backup_dir"
        print_message "Configurações atualizadas:"
        print_message "- nginx.conf principal"
        print_message "- Virtual host do backend: ${INSTANCE_NAME}-backend"
        print_message "- Virtual host do frontend: ${INSTANCE_NAME}-frontend"
        print_message "- Variáveis de ambiente atualizadas"

        # Executar certbot para os domínios
        print_message "Configurando certificados SSL com Certbot..."
        certbot --nginx -d $backend_hostname -d $frontend_hostname --non-interactive --agree-tos --email suporte@autoatende.com

        if [ $? -eq 0 ]; then
            print_success "✅ Certificados SSL instalados com sucesso!"
        else
            print_error "❌ Erro ao instalar certificados SSL. Por favor, execute manualmente: certbot --nginx -d $backend_hostname -d $frontend_hostname"
        fi
    else
        print_error "❌ Erro ao reiniciar o Nginx."
        exit 1
    fi
else
    print_error "❌ Erro na configuração do Nginx. Restaurando backup..."
    
    # Restaurar nginx.conf
    if [ -f "$backup_dir/nginx.conf.bak" ]; then
        cp "$backup_dir/nginx.conf.bak" "/etc/nginx/nginx.conf"
    fi
    
    # Restaurar configurações do virtual host
    if [ -f "$backup_dir/${INSTANCE_NAME}-backend.bak" ]; then
        cp "$backup_dir/${INSTANCE_NAME}-backend.bak" "/etc/nginx/sites-available/${INSTANCE_NAME}-backend"
    fi
    if [ -f "$backup_dir/${INSTANCE_NAME}-frontend.bak" ]; then
        cp "$backup_dir/${INSTANCE_NAME}-frontend.bak" "/etc/nginx/sites-available/${INSTANCE_NAME}-frontend"
    fi
    
    systemctl restart nginx
    print_error "Backup restaurado. Por favor, verifique os erros e tente novamente."
    exit 1
fi

