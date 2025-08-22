# 🚀 Deploy do Frontend SSR

## Pré-requisitos no servidor:
```bash
# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2
sudo npm install -g pm2

# Nginx (se não tiver)
sudo apt update && sudo apt install nginx
```

## 1. Fazer upload dos arquivos:
```bash
# No seu local
rsync -avz --exclude node_modules frontend-ssr/ user@sac.autoatende.com:/var/www/sac.autoatende.com/
```

## 2. No servidor, execute:
```bash
cd /var/www/sac.autoatende.com
chmod +x deploy.sh
./deploy.sh
```

## 3. Configurar Nginx:
```bash
# Copiar configuração
sudo cp nginx-frontend.conf /etc/nginx/sites-available/sac.autoatende.com

# Ativar site
sudo ln -sf /etc/nginx/sites-available/sac.autoatende.com /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

## 4. Verificar funcionamento:
```bash
# Status do PM2
pm2 status

# Logs em tempo real
pm2 logs fonte-frontend-ssr

# Monitoramento
pm2 monit

# Site funcionando
curl -I https://sac.autoatende.com
```

## 5. Comandos úteis:
```bash
# Restart da aplicação
pm2 restart fonte-frontend-ssr

# Update da aplicação
git pull && npm run build && pm2 restart fonte-frontend-ssr

# Ver logs de erro
pm2 logs fonte-frontend-ssr --err

# Status do Nginx
sudo systemctl status nginx
```

## 🔒 Certificado SSL:
Certifique-se de que o certificado SSL está configurado para `*.autoatende.com` ou especificamente para `sac.autoatende.com`.

## 🌐 Acessos:
- **Frontend**: https://sac.autoatende.com
- **Backend**: https://backend.autoatende.com
- **WebSocket**: wss://backend.autoatende.com