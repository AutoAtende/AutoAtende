# AA Optimizer

O **AA Optimizer** é um script de otimização para sistemas SaaS que utilizam PostgreSQL 16, Node.js 20.18, Redis 7 e Nginx. Ele ajusta as configurações desses componentes para melhorar o desempenho e a estabilidade do sistema.

## Como Funciona

O script realiza ajustes nas configurações de cada componente, com base nas melhores práticas para ambientes de alta carga. Abaixo estão as otimizações realizadas:

---

## 📊 Otimizações Realizadas

### **PostgreSQL 16**
- **`shared_buffers`**: Aumenta a quantidade de memória usada para cache de dados, melhorando a performance de leitura.
- **`work_mem`**: Aumenta a memória disponível para operações de ordenação e agregação, otimizando consultas complexas.
- **`maintenance_work_mem`**: Aumenta a memória para operações de manutenção, como `VACUUM`, melhorando a eficiência dessas operações.
- **`checkpoint_timeout`**: Aumenta o tempo entre checkpoints, reduzindo a sobrecarga de I/O.
- **`max_connections`**: Aumenta o número máximo de conexões simultâneas, permitindo mais usuários conectados ao banco de dados.

---

### **Node.js 20.18**
- **`max-old-space-size`**: Aumenta o limite de memória para o Node.js, evitando falhas por falta de memória em aplicações com alto consumo de recursos.
- **`PM2`**: Se estiver usando PM2, o script recarrega os processos para aplicar as novas configurações, garantindo que as otimizações sejam efetivas.

---

### **Redis 7**
- **`maxmemory`**: Define um limite de memória para o Redis, evitando que ele consuma toda a memória disponível no servidor.
- **`maxmemory-policy`**: Define a política de evição para `allkeys-lru`, que remove as chaves menos usadas quando a memória está cheia, garantindo um uso eficiente dos recursos.

---

### **Nginx**
- **`worker_processes`**: Define o número de workers para o número de CPUs disponíveis, maximizando o uso de recursos do servidor.
- **`client_body_buffer_size` e `client_max_body_size`**: Aumenta o tamanho dos buffers para lidar com requisições maiores, como uploads de arquivos.
- **`keepalive_timeout`**: Aumenta o tempo de keepalive, reduzindo a sobrecarga de conexões e melhorando a performance para clientes frequentes.
- **`worker_connections`**: Aumenta o número de conexões simultâneas por worker, permitindo que o Nginx lide com mais requisições ao mesmo tempo.

---

## 🚀 Como Usar

1. **Clone o repositório** (se aplicável):
   ```bash
   git clone https://github.com/seu-usuario/aa_optimizer.git
   cd aa_optimizer