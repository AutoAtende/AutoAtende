const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Client } = require('pg');

/**
 * Script para lidar com colunas duplicadas em todas as tabelas do banco de dados
 * Identifica pares de colunas em snake_case e camelCase, analisando se os dados 
 * podem ser migrados com segurança
 * 
 * Para executar: 
 * - Salve este arquivo em backend/devTools
 * - Execute: node devTools/fix-all-tables.js a partir da pasta backend
 */
async function fixAllTables() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
  });

  try {
    console.log('Conectando ao banco de dados...');
    await client.connect();
    console.log('Conexão estabelecida com sucesso\n');

    // Obter todas as tabelas do banco (excluindo tabelas do sistema)
    console.log('Obtendo lista de tabelas...');
    const { rows: tables } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log(`Encontradas ${tables.length} tabelas no banco de dados\n`);

    // Estatísticas gerais
    const stats = {
      tablesToProcess: tables.length,
      tablesProcessed: 0,
      tablesWithDuplicates: 0,
      totalDuplicatePairs: 0,
      columnsRemoved: 0,
      columnsWithIssues: 0,
      tablesWithErrors: 0
    };

    // Registrar detalhes de colunas problemáticas para relatório final
    const problemColumns = [];
    
    // Processar cada tabela
    for (const table of tables) {
      const tableName = table.table_name;
      stats.tablesProcessed++;
      
      try {
        console.log(`\n====== Processando tabela: "${tableName}" (${stats.tablesProcessed}/${stats.tablesToProcess}) ======`);
        
        // Obter colunas da tabela
        const { rows: columns } = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = $1
          AND table_schema = 'public';
        `, [tableName]);
        
        console.log(`Encontradas ${columns.length} colunas na tabela "${tableName}"`);
        
        // Identificar pares de colunas em snake_case e camelCase
        const columnNames = columns.map(col => col.column_name);
        const snakeCaseColumns = columnNames.filter(name => name.includes('_'));
        
        const pairs = snakeCaseColumns.map(snakeName => {
          const camelName = snakeName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
          return {
            snakeName,
            camelName,
            hasBoth: columnNames.includes(camelName)
          };
        }).filter(pair => pair.hasBoth);
        
        if (pairs.length === 0) {
          console.log(`Não foram encontradas colunas duplicadas na tabela "${tableName}"\n`);
          continue;
        }
        
        stats.tablesWithDuplicates++;
        stats.totalDuplicatePairs += pairs.length;
        
        console.log(`\nEncontrados ${pairs.length} pares de colunas duplicadas na tabela "${tableName}":`);
        pairs.forEach(({ snakeName, camelName }) => {
          console.log(`- ${snakeName} e ${camelName}`);
        });
        
        // Verificar dados nas colunas antes de remover
        console.log('\nVerificando dados nas colunas...');
        const dataChecks = [];
        
        for (const { snakeName, camelName } of pairs) {
          const checkQuery = `
            SELECT 
              COUNT(*) as total,
              COUNT(CASE WHEN "${snakeName}" IS NOT NULL AND "${camelName}" IS NULL THEN 1 END) as snake_only,
              COUNT(CASE WHEN "${snakeName}" IS NULL AND "${camelName}" IS NOT NULL THEN 1 END) as camel_only,
              COUNT(CASE WHEN "${snakeName}" IS NOT NULL AND "${camelName}" IS NOT NULL AND 
                          "${snakeName}" != "${camelName}" THEN 1 END) as different_values
            FROM "${tableName}";
          `;
          
          const { rows: [result] } = await client.query(checkQuery);
          dataChecks.push({
            tableName,
            snakeName,
            camelName,
            ...result
          });
          
          console.log(`\nAnálise de "${snakeName}" e "${camelName}" na tabela "${tableName}":`);
          console.log(`- Total de registros: ${result.total}`);
          console.log(`- Registros apenas em ${snakeName}: ${result.snake_only}`);
          console.log(`- Registros apenas em ${camelName}: ${result.camel_only}`);
          console.log(`- Registros com valores diferentes: ${result.different_values}`);
        }
        
        // Verificar se é seguro remover as colunas em snake_case
        const unsafeColumns = dataChecks.filter(c => 
          parseInt(c.snake_only) > 0 || parseInt(c.different_values) > 0
        );
        
        const safeColumns = dataChecks.filter(c => 
          parseInt(c.snake_only) === 0 && parseInt(c.different_values) === 0
        );
        
        if (unsafeColumns.length > 0) {
          console.log('\n⚠️ ALERTA: As seguintes colunas contêm dados exclusivos:');
          unsafeColumns.forEach(c => {
            console.log(`- ${c.snakeName}: tem ${c.snake_only} registros exclusivos e ${c.different_values} registros com valores diferentes`);
            problemColumns.push(c); // Guardar para relatório final
          });
          stats.columnsWithIssues += unsafeColumns.length;
          
          console.log('\nEstas colunas serão processadas usando migração de dados');
          
          // Migrar dados para colunas problemáticas
          await client.query('BEGIN');
          
          try {
            for (const { tableName, snakeName, camelName } of unsafeColumns) {
              console.log(`\nMigrando dados de "${snakeName}" para "${camelName}" na tabela "${tableName}"...`);
              
              await client.query(`
                UPDATE "${tableName}"
                SET "${camelName}" = "${snakeName}"
                WHERE "${snakeName}" IS NOT NULL AND ("${camelName}" IS NULL OR "${camelName}" != "${snakeName}");
              `);
              
              console.log(`Removendo coluna "${snakeName}" da tabela "${tableName}"...`);
              await client.query(`
                ALTER TABLE "${tableName}" DROP COLUMN "${snakeName}";
              `);
              
              stats.columnsRemoved++;
            }
            
            await client.query('COMMIT');
            console.log('\nMigração de dados e remoção de colunas concluídas para colunas problemáticas');
          } catch (migrationError) {
            await client.query('ROLLBACK');
            console.error(`Erro durante a migração de dados para a tabela "${tableName}":`, migrationError);
            stats.tablesWithErrors++;
            continue;
          }
        }
        
        // Processar colunas seguras
        if (safeColumns.length > 0) {
          console.log(`\nAs seguintes colunas podem ser removidas com segurança (${safeColumns.length}):`);
          safeColumns.forEach(c => {
            console.log(`- ${c.snakeName}`);
          });
          
          await client.query('BEGIN');
          
          try {
            for (const { tableName, snakeName } of safeColumns) {
              console.log(`Removendo coluna "${snakeName}" da tabela "${tableName}"...`);
              await client.query(`
                ALTER TABLE "${tableName}" DROP COLUMN "${snakeName}";
              `);
              stats.columnsRemoved++;
            }
            
            await client.query('COMMIT');
            console.log('\nColunas seguras removidas com sucesso!');
          } catch (removalError) {
            await client.query('ROLLBACK');
            console.error(`Erro durante a remoção de colunas seguras para a tabela "${tableName}":`, removalError);
            stats.tablesWithErrors++;
            continue;
          }
        }
        
        console.log(`✅ Processamento concluído para a tabela "${tableName}"\n`);
        
      } catch (tableError) {
        console.error(`❌ Erro ao processar a tabela "${tableName}":`, tableError);
        stats.tablesWithErrors++;
      }
    }
    
    // Exibir relatório final
    console.log('\n============ RELATÓRIO FINAL ============');
    console.log(`Total de tabelas processadas: ${stats.tablesProcessed}/${stats.tablesToProcess}`);
    console.log(`Tabelas com colunas duplicadas: ${stats.tablesWithDuplicates}`);
    console.log(`Total de pares de colunas duplicadas: ${stats.totalDuplicatePairs}`);
    console.log(`Colunas removidas com sucesso: ${stats.columnsRemoved}`);
    console.log(`Colunas com dados exclusivos (migrados): ${stats.columnsWithIssues}`);
    console.log(`Tabelas com erros: ${stats.tablesWithErrors}`);
    
    if (problemColumns.length > 0) {
      console.log('\nDetalhes das colunas que necessitaram de migração de dados:');
      problemColumns.forEach(c => {
        console.log(`- Tabela "${c.tableName}": "${c.snakeName}" -> "${c.camelName}" (${c.snake_only} registros exclusivos, ${c.different_values} valores diferentes)`);
      });
    }
    
    console.log('\nProcessamento finalizado!');
    
  } catch (error) {
    console.error('Erro durante a execução do script:', error);
  } finally {
    if (client && client._connected) {
      try {
        await client.end();
        console.log('Conexão com o banco de dados encerrada');
      } catch (endError) {
        console.error('Erro ao encerrar conexão:', endError);
      }
    }
  }
}

// Executar o script
(async () => {
  console.log('=== Script de Correção de Colunas Duplicadas em Todas as Tabelas ===');
  
  try {
    await fixAllTables();
  } catch (err) {
    console.error('Erro fatal não tratado:', err);
  }
})();