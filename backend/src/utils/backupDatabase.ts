import { logger } from "./logger";
import { exec } from "child_process";
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import util from 'util';

const execPromise = util.promisify(exec);

export const runBackupDatabase = async (): Promise<string> => {
  function timestamp() {
    const dataAtual = new Date();
    const dia = dataAtual.getDate().toString().padStart(2, "0");
    const mes = (dataAtual.getMonth() + 1).toString().padStart(2, "0");
    const ano = dataAtual.getFullYear();
    const horas = dataAtual.getHours().toString().padStart(2, "0");
    const minutos = dataAtual.getMinutes().toString().padStart(2, "0");
    return `${ano}-${mes}-${dia}-${horas}-${minutos}`;
  }

  // Função para formatar tamanho de arquivo para exibição
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MB";
    else return (bytes / 1073741824).toFixed(2) + " GB";
  }

  const nameDB = `${process.env.DB_NAME}-${timestamp()}`;
  const backendDir = path.resolve(__dirname, "..", "..", "public");
  const backupDir = path.join(backendDir, 'backups');
  const backupPath = path.join(backupDir, nameDB);
  const zipPath = `${backupPath}.zip`;
  const sqlFilePath = `${backupPath}.sql`;

  try {
    logger.info("Iniciando processo de backup do banco de dados...");
    logger.info(`Database: ${process.env.DB_NAME}`);
    logger.info(`Usuário: ${process.env.DB_USER}`);
    logger.info(`Host: localhost`);

    // Garantir que o diretório de backup existe
    if (!fs.existsSync(backupDir)) {
      logger.info(`Criando diretório de backup: ${backupDir}`);
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Criar backup do banco de dados
    const stringBackup = `PGPASSWORD="${process.env.DB_PASS}" pg_dump -Fc -U ${process.env.DB_USER} -h localhost ${process.env.DB_NAME} > "${sqlFilePath}"`;
    logger.info("Executando comando de backup do banco de dados...");
    logger.info(`Comando: pg_dump -Fc -U ${process.env.DB_USER} -h localhost ${process.env.DB_NAME}`);
    
    await execPromise(stringBackup);
    
    // Verificar se o arquivo foi criado
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`Arquivo de backup SQL não foi criado: ${sqlFilePath}`);
    }
    
    // Obter e logar o tamanho do arquivo SQL
    const stats = fs.statSync(sqlFilePath);
    const fileSizeInBytes = stats.size;
    logger.info(`Backup do banco de dados gerado com sucesso! Tamanho: ${formatFileSize(fileSizeInBytes)}`);
    
    // Obter lista de tabelas para debug
    logger.info("Verificando tabelas incluídas no backup...");
    try {
      const { stdout } = await execPromise(
        `PGPASSWORD="${process.env.DB_PASS}" psql -U ${process.env.DB_USER} -h localhost -d ${process.env.DB_NAME} -c "\\dt" -t`
      );
      logger.info(`Tabelas no banco de dados: \n${stdout}`);
    } catch (err) {
      logger.warn("Não foi possível listar as tabelas do banco de dados:", err);
    }

    // Criar arquivo zip
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
      output.on('close', () => {
        const zipStats = fs.statSync(zipPath);
        const zipSizeInBytes = zipStats.size;
        
        logger.info(`Arquivo SQL original: ${formatFileSize(fileSizeInBytes)}`);
        logger.info(`Arquivo zip gerado: ${formatFileSize(zipSizeInBytes)}`);
        logger.info(`Taxa de compressão: ${((1 - zipSizeInBytes / fileSizeInBytes) * 100).toFixed(2)}%`);
        logger.info(`Arquivo zip criado com sucesso: ${zipPath}`);
        
        // Remover arquivo SQL original
        logger.info("Removendo arquivo SQL original...");
        fs.unlinkSync(sqlFilePath);
        logger.info("Arquivo SQL original removido.");

        // Remover backups antigos (mais de 6 horas)
        logger.info("Removendo backups antigos (mais de 6 horas)...");
        exec(`find ${backupDir} -type f -mmin +360 -delete`);
        logger.info("Backups antigos removidos.");

        logger.info("Backup do banco de dados PostgreSQL concluído e comprimido com sucesso!");
        resolve(zipPath);
      });

      archive.on('error', (err) => {
        logger.error('Erro durante a criação do arquivo zip', err);
        reject(err);
      });

      archive.pipe(output);
      archive.file(sqlFilePath, { name: `${nameDB}.sql` });
      archive.finalize();
    });

  } catch (error) {
    logger.error("Não foi possível efetuar o backup e compressão do banco de dados!", error);
    logger.error("Detalhes do erro:", error.message || error);
    if (error.stderr) logger.error("Saída de erro:", error.stderr);
    throw error;
  }
};