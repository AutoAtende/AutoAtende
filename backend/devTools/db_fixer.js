const path = require('path');
const MigrationAnalyzer = require('./migration-analyzer');

const migrationsPath = path.join(__dirname, 'src', 'database', 'migrations');
const modelsPath = path.join(__dirname, 'src', 'models');

const analyzer = new MigrationAnalyzer(migrationsPath, modelsPath);

analyzer.processUpdates()
  .then(() => {
    console.log('Processo finalizado com sucesso');
  })
  .catch(error => {
    console.error('Erro durante a execução:', error);
    process.exit(1);
  });