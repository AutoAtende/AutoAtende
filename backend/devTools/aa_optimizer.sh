#!/bin/bash

# Versão 2.0 - SaaS Optimize Script
# Melhorias principais:
# - Configurações dinâmicas baseadas em recursos do sistema
# - Verificações de segurança e compatibilidade
# - Parâmetros mais balanceados para ambientes heterogêneos
# - Adição de monitoramento básico
# - Melhor tratamento de erros

# Cores para o terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Variáveis globais
TOTAL_MEMORY=$(grep MemTotal /proc/meminfo | awk '{print $2}')
TOTAL_CORES=$(nproc)
MIN_MEMORY=8000000  # 8GB em kB

# Verificação inicial do sistema
check_system() {
    if [ "$EUID" -ne 0 ]; then
        echo -e "${RED}Este script precisa ser executado como root${NC}"
        exit 1
    fi

    if [[ "$TOTAL_MEMORY" -lt "$MIN_MEMORY" ]]; then
        echo -e "${RED}Requer mínimo 4GB de memória RAM${NC}"
        exit 1
    fi

    if ! grep -qEi "ubuntu|debian" /etc/os-release; then
        echo -e "${RED}Somente sistemas baseados em Ubuntu/Debian são suportados${NC}"
        exit 1
    fi
}

# Função para registrar logs
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a /var/log/saas-optimize.log
}

# Função para exibir menu
show_menu() {
    clear
    echo -e "${CYAN}=== SaaS Optimization Suite ===${NC}"
    echo -e "${GREEN}1. Otimizar Sistema"
    echo "2. Otimizar PostgreSQL"
    echo "3. Otimizar Node.js"
    echo "4. Otimizar Redis"
    echo "5. Otimizar Nginx"
    echo "6. Otimizar Tudo"
    echo -e "${YELLOW}7. Desfazer Alterações"
    echo -e "${RED}0. Sair${NC}"
    echo
    echo -e "${CYAN}Recursos do sistema:${NC}"
    echo -e "Memória: $((TOTAL_MEMORY / 1024))MB | CPUs: $TOTAL_CORES"
    echo
    echo -n "Escolha uma opção: "
}

# Função para confirmar ação
confirm_action() {
    local message=$1
    echo -e "${YELLOW}"
    read -p "$message (s/n): " -n 1 -r
    echo -e "${NC}"
    [[ $REPLY =~ ^[Ss]$ ]]
}

# Otimizações do sistema
optimize_system() {
    log_message "Iniciando otimizações do sistema..."
    
    # Backup dos arquivos
    cp /etc/sysctl.conf /etc/sysctl.conf.backup
    cp /etc/security/limits.conf /etc/security/limits.conf.backup

    # Remover configurações antigas se existirem
    sed -i '/# SaaS Optimizations Start/,/# SaaS Optimizations End/d' /etc/sysctl.conf
    sed -i '/deploy soft nofile/d' /etc/security/limits.conf
    sed -i '/deploy hard nofile/d' /etc/security/limits.conf

    # Configurações dinâmicas
    local file_max=$((TOTAL_MEMORY / 2 / 1024))
    local tcp_max_orphan=$((file_max / 2))

    cat << EOF >> /etc/sysctl.conf
# SaaS Optimizations Start
fs.file-max = $file_max
kernel.pid_max = 4194303
kernel.threads-max = 262144
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 300000
net.ipv4.tcp_max_syn_backlog = 300000
net.ipv4.tcp_max_orphans = $tcp_max_orphan
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_probes = 5
net.ipv4.tcp_keepalive_intvl = 15
net.ipv4.tcp_tw_reuse = 1
net.ipv4.ip_local_port_range = 1024 65535
vm.swappiness = 10
vm.dirty_ratio = 60
vm.dirty_background_ratio = 2
vm.overcommit_memory = 1
vm.overcommit_ratio = 90
# Transparent Hugepages (Melhor para PostgreSQL/Redis)
vm.nr_hugepages = $((TOTAL_MEMORY / 2048 / 2))
kernel.shmmax = $((TOTAL_MEMORY * 1024 / 2))
kernel.shmall = $((TOTAL_MEMORY * 1024 / 4096 / 2))
# SaaS Optimizations End
EOF

    # Aplicando configurações
    sysctl -p >/dev/null 2>&1

    # Limites do usuário
    cat << EOF >> /etc/security/limits.conf
# SaaS User Limits
deploy soft nofile 262144
deploy hard nofile 262144
deploy soft nproc 65536
deploy hard nproc 65536
deploy soft memlock unlimited
deploy hard memlock unlimited
EOF

    # Configurar THP
    echo "never" > /sys/kernel/mm/transparent_hugepage/enabled
    echo "never" > /sys/kernel/mm/transparent_hugepage/defrag

    log_message "Otimizações do sistema concluídas"
    log_message "Novos valores: $(sysctl -n fs.file-max net.core.somaxconn)"
}

# Otimizações do PostgreSQL
optimize_postgresql() {
    if ! systemctl is-active --quiet postgresql; then
        log_message "PostgreSQL não está instalado ou ativo"
        return 1
    fi

    log_message "Otimizando PostgreSQL..."
    
    # Backup dinâmico
    local backup_file="/tmp/pg_backup_$(date +%s).sql"
    sudo -u postgres psql -c "SHOW ALL;" > "$backup_file"

    # Cálculos baseados em recursos
    local shared_buffers=$((TOTAL_MEMORY / 4 / 1024))MB
    local work_mem=$(( (TOTAL_MEMORY / 1024 / TOTAL_CORES ) / 8 ))MB
    local maintenance_work_mem=$((TOTAL_MEMORY / 8 / 1024))MB

    sudo -u postgres psql -c "
    ALTER SYSTEM SET shared_buffers = '$shared_buffers';
    ALTER SYSTEM SET work_mem = '$work_mem';
    ALTER SYSTEM SET maintenance_work_mem = '$maintenance_work_mem';
    ALTER SYSTEM SET effective_cache_size = '$((TOTAL_MEMORY * 3 / 4 / 1024))MB';
    ALTER SYSTEM SET max_connections = '500';
    ALTER SYSTEM SET random_page_cost = 1.1;
    ALTER SYSTEM SET effective_io_concurrency = '200';
    ALTER SYSTEM SET checkpoint_timeout = '15min';
    ALTER SYSTEM SET checkpoint_completion_target = '0.9';
    ALTER SYSTEM SET wal_buffers = '16MB';
    ALTER SYSTEM SET max_worker_processes = '$TOTAL_CORES';
    ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
    ALTER SYSTEM SET pg_stat_statements.track = 'all';
    "

    # Reiniciar e aplicar
    systemctl restart postgresql
    sudo -u postgres psql -c "SELECT pg_reload_conf();"

    log_message "PostgreSQL otimizado. Configurações:\n$(sudo -u postgres psql -c 'SHOW ALL;' | grep -E 'shared_buffers|work_mem|effective_cache')"
}

# Otimizações do Node.js
optimize_nodejs() {
    if ! command -v node &> /dev/null; then
        log_message "Node.js não está instalado"
        return 1
    fi

    log_message "Otimizando Node.js..."
    
    # Configurações dinâmicas
    local node_mem=$(( (TOTAL_MEMORY * 70 / 100) / 1024 ))
    local uv_threads=$(( TOTAL_CORES * 4 ))

    # Criar arquivo de ambiente se não existir
    [ -f /etc/systemd/node.env ] || touch /etc/systemd/node.env

    # Configurar variáveis
    cat << EOF > /etc/systemd/node.env
NODE_ENV=production
NODE_OPTIONS="--max-old-space-size=$node_mem --experimental-modules --worker-threads $uv_threads"
UV_THREADPOOL_SIZE=$uv_threads
TZ=America/Sao_Paulo
EOF

    # Configurar PM2
    if command -v pm2 &> /dev/null; then
        local pm2_conf="/home/deploy/ecosystem.config.js"
        [ -f "$pm2_conf" ] && cp "$pm2_conf" "${pm2_conf}.backup"

        cat << EOF > "$pm2_conf"
module.exports = {
  apps: [{
    name: 'saas-api',
    script: 'server.js',
    instances: $TOTAL_CORES,
    exec_mode: 'cluster',
    max_memory_restart: '${node_mem}M',
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production'
    },
    env_file: '/etc/systemd/node.env',
    out_file: '/var/log/nodejs/saas.out.log',
    error_file: '/var/log/nodejs/saas.error.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    kill_timeout: 30000,
    listen_timeout: 5000,
    wait_ready: true,
    shutdown_with_message: true
  }]
}
EOF

        # Atualizar serviço
        sudo -u deploy pm2 reload "$pm2_conf" --update-env
        pm2 save
    fi

    log_message "Node.js otimizado. Memória: ${node_mem}MB, Threads: $uv_threads"
}

# Otimizações do Redis
optimize_redis() {
    if ! systemctl is-active --quiet redis; then
        log_message "Redis não está instalado ou ativo"
        return 1
    fi

    log_message "Otimizando Redis..."
    
    # Configurações dinâmicas
    local redis_mem=$(( TOTAL_MEMORY / 3 / 1024 ))MB
    local max_clients=$(( $(grep '^MemFree' /proc/meminfo | awk '{print $2}') / 1024 / 1024 ))

    cp /etc/redis/redis.conf /etc/redis/redis.conf.backup

    cat << EOF > /etc/redis/redis.conf
bind 127.0.0.1 ::1
port 6379
tcp-backlog 65535
supervised systemd
maxmemory $redis_mem
maxmemory-policy volatile-lru
maxclients $max_clients
tcp-keepalive 300
timeout 0
appendonly yes
appendfsync everysec
no-appendfsync-on-rewrite yes
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
notify-keyspace-events "Ex"
activerehashing yes
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit replica 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60
hz 10
dynamic-hz yes
lazyfree-lazy-eviction yes
lazyfree-lazy-expire yes
lazyfree-lazy-server-del yes
replica-lazy-flush yes
EOF

    systemctl restart redis
    log_message "Redis otimizado. Memória: $redis_mem, Clients: $max_clients"
}

# Otimizações do Nginx
optimize_nginx() {
    if ! systemctl is-active --quiet nginx; then
        log_message "Nginx não está instalado ou ativo"
        return 1
    fi

    log_message "Otimizando Nginx..."
    
    # Configurações dinâmicas
    local worker_conn=$(( $(grep 'fs.file-max' /etc/sysctl.conf | cut -d= -f2) / $(nproc) ))
    worker_conn=$(( worker_conn > 4096 ? 4096 : worker_conn ))

    cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

    cat << EOF > /etc/nginx/nginx.conf
user www-data;
worker_processes auto;
worker_rlimit_nofile 262144;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections $worker_conn;
    multi_accept on;
    use epoll;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 75s;
    keepalive_requests 1000;
    types_hash_max_size 2048;
    server_tokens off;
    client_max_body_size 50M;

    # Buffers
    client_body_buffer_size 16k;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 8k;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # Logging
    log_format saas_format '\$remote_addr - \$remote_user [\$time_local] '
                           '"\$request" \$status \$body_bytes_sent '
                           '"\$http_referer" "\$http_user_agent" '
                           'RT=\$request_time UCT=\$upstream_connect_time UHT=\$upstream_header_time URT=\$upstream_response_time';

    access_log /var/log/nginx/access.log saas_format buffer=64k flush=5s;
    error_log /var/log/nginx/error.log warn;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache
    open_file_cache max=200000 inactive=20s;
    open_file_cache_valid 60s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;

    # Timeouts
    client_body_timeout 12s;
    client_header_timeout 12s;
    send_timeout 10s;
    reset_timedout_connection on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(),midi=(),sync-xhr=(),microphone=(),camera=(),magnetometer=(),gyroscope=(),fullscreen=(self)";

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

    nginx -t && systemctl restart nginx
    log_message "Nginx otimizado. Worker connections: $worker_conn"
}

# Funções de rollback
rollback_system() {
    log_message "Revertendo otimizações do sistema..."
    [ -f /etc/sysctl.conf.backup ] && mv /etc/sysctl.conf.backup /etc/sysctl.conf
    [ -f /etc/security/limits.conf.backup ] && mv /etc/security/limits.conf.backup /etc/security/limits.conf
    sysctl -p >/dev/null 2>&1
    echo "always" > /sys/kernel/mm/transparent_hugepage/enabled
    echo "always" > /sys/kernel/mm/transparent_hugepage/defrag
    log_message "Sistema revertido"
}

rollback_postgresql() {
    local latest_backup=$(ls -t /tmp/pg_backup_*.sql | head -1)
    [ -n "$latest_backup" ] && sudo -u postgres psql -f "$latest_backup"
    systemctl restart postgresql
    log_message "PostgreSQL revertido"
}

rollback_nodejs() {
    [ -f /etc/systemd/node.env.backup ] && mv /etc/systemd/node.env.backup /etc/systemd/node.env
    local pm2_conf="/home/deploy/ecosystem.config.js"
    [ -f "${pm2_conf}.backup" ] && mv "${pm2_conf}.backup" "$pm2_conf"
    sudo -u deploy pm2 reload all
    log_message "Node.js revertido"
}

rollback_redis() {
    [ -f /etc/redis/redis.conf.backup ] && mv /etc/redis/redis.conf.backup /etc/redis/redis.conf
    systemctl restart redis
    log_message "Redis revertido"
}

rollback_nginx() {
    [ -f /etc/nginx/nginx.conf.backup ] && mv /etc/nginx/nginx.conf.backup /etc/nginx/nginx.conf
    nginx -t && systemctl restart nginx
    log_message "Nginx revertido"
}

rollback_all() {
    confirm_action "Isso reiniciará todos os serviços. Continuar?" || return
    rollback_system
    rollback_postgresql
    rollback_nodejs
    rollback_redis
    rollback_nginx
    log_message "Todas as otimizações foram revertidas"
}

# Monitoramento
show_monitoring() {
    watch -n 2 -d "echo '=== SAAS SYSTEM STATUS ===';
    echo -e 'CPU Usage:\t' \$(top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\([0-9.]*\)%* id.*/\1/' | awk '{print 100 - \$1}')'%';
    echo -e 'Memory Usage:\t' \$(free -m | awk '/Mem/{printf \$3*100/\$2}')'%';
    echo -e 'Disk Usage:\t' \$(df -h / | awk 'NR==2{print \$5}');
    echo -e 'Connections:\t' \$(ss -s | grep 'TCP:' | awk '{print \$4}');
    echo -e 'PostgreSQL:\t' \$(sudo -u postgres psql -t -c 'SELECT count(*) FROM pg_stat_activity';);
    echo -e 'Node Processes:\t' \$(pgrep node | wc -l);
    echo -e 'Redis Keys:\t' \$(redis-cli dbsize);
    echo -e 'Nginx Req/s:\t' \$(tail -n 100 /var/log/nginx/access.log | wc -l | awk '{print \$1/60}')"
}

# Menu principal
main() {
    check_system
    while true; do
        show_menu
        read -r opt
        case $opt in
            1) confirm_action "Otimizar Sistema?" && optimize_system ;;
            2) confirm_action "Otimizar PostgreSQL?" && optimize_postgresql ;;
            3) confirm_action "Otimizar Node.js?" && optimize_nodejs ;;
            4) confirm_action "Otimizar Redis?" && optimize_redis ;;
            5) confirm_action "Otimizar Nginx?" && optimize_nginx ;;
            6) confirm_action "Otimizar TUDO?" && { optimize_system; optimize_postgresql; optimize_nodejs; optimize_redis; optimize_nginx; } ;;
            7) confirm_action "Reverter TUDO?" && rollback_all ;;
            8) show_monitoring ;;
            0) echo -e "${GREEN}Saindo...${NC}"; exit 0 ;;
            *) echo -e "${RED}Opção inválida!${NC}"; sleep 1 ;;
        esac
        echo
        read -n 1 -s -r -p "Pressione qualquer tecla para continuar..."
    done
}

# Execução
main