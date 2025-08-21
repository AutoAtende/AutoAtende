import * as dotenv from "dotenv";
import path from "path";

// Carregar as variáveis de ambiente do arquivo .env
dotenv.config({ path: path.join(__dirname, '../.env') });

import { Options } from 'sequelize';

const config: Options = {
  define: {
    charset: "utf8mb4", // Charset que suporta emojis e caracteres especiais
    collate: "utf8mb4_bin", // Collate para comparar strings binariamente, útil para senhas e dados sensíveis
    timestamps: true,
    underscored: false,
    freezeTableName: false
  },
  retry: {
    match: [
      /SequelizeConnectionError/, // Erro de conexão geral
      /SequelizeConnectionRefusedError/, // Conexão recusada pelo servidor
      /SequelizeHostNotFoundError/, // Servidor não encontrado
      /SequelizeHostNotReachableError/, // Servidor não acessível
      /SequelizeInvalidConnectionError/, // Erro de conexão inválida
      /SequelizeConnectionTimedOutError/ // Timeout da conexão
    ],
    max: 10 // Número máximo de tentativas de reconexão em caso de erro
  },
  pool: {
    max: 20, // Número máximo de conexões simultâneas (reduzido para melhor gestão de recursos)
    min: 5, // Número mínimo de conexões no pool
    acquire: 10000, // Tempo máximo para tentar adquirir uma nova conexão (10 segundos)
    idle: 10000, // Tempo máximo que uma conexão pode ficar inativa antes de ser liberada (10 segundos)
    evict: 1000 // Intervalo de validação de conexões (1 segundo)
  },
  dialect: (process.env.DB_DIALECT as any) || "postgres", // Dialeto do banco de dados (por padrão, PostgreSQL)
  timezone: "-03:00", // Fuso horário configurado para UTC-3 (Brasil)
  host: process.env.DB_HOST, // Endereço do host do banco de dados
  port: parseInt(process.env.DB_PORT || '5432'), // Porta padrão do PostgreSQL (5432)
  database: process.env.DB_NAME, // Nome do banco de dados
  username: process.env.DB_USER, // Nome de usuário do banco de dados
  password: process.env.DB_PASS, // Senha do banco de dados
  logging: process.env.DB_DEBUG === "true" ? console.log : false, // Define se o Sequelize deve exibir logs detalhados
  dialectOptions: {
    requestTimeout: 120000, // Tempo limite de requisição em milissegundos (2 minutos)
    encrypt: process.env.NODE_ENV === 'production', // Encripta a conexão para maior segurança em produção
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  }
};

// Export both as named export and default for compatibility
export default config;
module.exports = config;
