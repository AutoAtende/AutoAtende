require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false,
    dialectOptions: {
      timezone: 'America/Sao_Paulo',
    },
    timezone: 'America/Sao_Paulo'
  }
);

// Função para obter todas as tabelas do banco
async function getAllTables() {
  const query = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
  `;
  const [results] = await sequelize.query(query);
  return results.map(r => r.table_name);
}

// Função para encontrar o nome real da tabela no banco
function findActualTableName(modelName, allTables) {
  // Variações comuns do nome
  const possibilities = [
    modelName,                    // Exato
    modelName.toLowerCase(),      // lowercase
    modelName.toUpperCase(),      // UPPERCASE
    `${modelName}s`,             // Plural
    `${modelName.toLowerCase()}s` // Plural lowercase
  ];

  // Procura por cada possibilidade
  for (const tableName of allTables) {
    if (possibilities.includes(tableName)) {
      return tableName;
    }
  }

  return null;
}

function convertDbTypeToColumnType(dbType) {
  const typeMap = {
    'character varying': 'STRING',
    'varchar': 'STRING',
    'text': 'TEXT',
    'integer': 'INTEGER',
    'boolean': 'BOOLEAN',
    'timestamp with time zone': 'DATE',
    'timestamp': 'DATE',
    'double precision': 'DOUBLE',
    'numeric': 'DECIMAL',
    'jsonb': 'JSONB',
    'json': 'JSON',
    'uuid': 'UUID'
  };

  return typeMap[dbType.toLowerCase()] || dbType.toUpperCase();
}

function generateColumnDecorator(columnInfo) {
  let decoratorOptions = [];

  if (columnInfo.type) {
    if (columnInfo.type.includes('character varying')) {
      decoratorOptions.push('type: DataType.STRING');
    } else if (columnInfo.type === 'text') {
      decoratorOptions.push('type: DataType.TEXT');
    } else if (columnInfo.type === 'timestamp with time zone') {
      decoratorOptions.push('type: DataType.DATE');
    } else if (columnInfo.type === 'jsonb') {
      decoratorOptions.push('type: DataType.JSONB');
    }
  }

  if (columnInfo.allowNull === false) {
    decoratorOptions.push('allowNull: false');
  }

  if (columnInfo.defaultValue !== null) {
    if (typeof columnInfo.defaultValue === 'string') {
      decoratorOptions.push(`defaultValue: "${columnInfo.defaultValue}"`);
    } else {
      decoratorOptions.push(`defaultValue: ${columnInfo.defaultValue}`);
    }
  }

  if (decoratorOptions.length > 0) {
    return `@Column({\n    ${decoratorOptions.join(',\n    ')}\n  })`;
  }
  
  return '@Column';
}

function getSequelizeType(modelType) {
  const typeMap = {
    'string': DataTypes.STRING,
    'STRING': DataTypes.STRING,
    'number': DataTypes.INTEGER,
    'INTEGER': DataTypes.INTEGER,
    'boolean': DataTypes.BOOLEAN,
    'BOOLEAN': DataTypes.BOOLEAN,
    'Date': DataTypes.DATE,
    'DATE': DataTypes.DATE,
    'TEXT': DataTypes.TEXT,
    'DECIMAL': DataTypes.DECIMAL,
    'JSON': DataTypes.JSON,
    'JSONB': DataTypes.JSONB,
    'UUID': DataTypes.UUID,
    'DOUBLE': DataTypes.DOUBLE
  };

  return typeMap[modelType];
}

function isTypeCompatible(modelType, dbType) {
  const compatibilityMap = {
    'STRING': ['STRING', 'TEXT', 'CHAR', 'VARCHAR'],
    'INTEGER': ['INTEGER', 'BIGINT'],
    'BOOLEAN': ['BOOLEAN'],
    'DATE': ['DATE', 'TIMESTAMP'],
    'DECIMAL': ['DECIMAL', 'NUMERIC', 'DOUBLE'],
    'TEXT': ['TEXT', 'STRING'],
    'JSON': ['JSON', 'JSONB'],
    'JSONB': ['JSONB', 'JSON']
  };

  const compatibleTypes = compatibilityMap[modelType] || [modelType];
  return compatibleTypes.includes(dbType);
}

async function standardizeAndUpdateDatabase() {
  try {
    await sequelize.authenticate();
    console.log('\nConexão com banco estabelecida.\n');

    // Obtém lista de todas as tabelas do banco
    const allTables = await getAllTables();
    console.log('Tabelas encontradas no banco:', allTables);

    const modelsDir = path.join(__dirname, 'src', 'models');
    const modelFiles = fs.readdirSync(modelsDir)
      .filter(file => file.endsWith('.ts') && file !== 'index.ts');

    console.log('\nIniciando processo de atualização do banco de dados e modelos...\n');

    for (const file of modelFiles) {
      const filePath = path.join(modelsDir, file);
      let modelContent = fs.readFileSync(filePath, 'utf8');

      if (!modelContent.includes('extends Model')) {
        continue;
      }

      const classMatch = modelContent.match(/class\s+(\w+)\s+extends\s+Model/);
      if (!classMatch) continue;
      
      const className = classMatch[1];
      console.log(`\nProcessando modelo: ${className}`);

      // Encontra o nome real da tabela no banco
      const actualTableName = findActualTableName(className, allTables);
      
      if (!actualTableName) {
        console.log(`Tabela não encontrada para o modelo ${className}. Possíveis nomes procurados:`, 
          [className, className.toLowerCase(), `${className}s`, `${className.toLowerCase()}s`]);
        continue;
      }

      console.log(`Nome da tabela encontrado no banco: ${actualTableName}`);

      // Atualiza o decorador @Table com o nome correto da tabela
      const tableDecorator = `@Table({ tableName: "${actualTableName}" })`;
      modelContent = modelContent.replace(
        /@Table(\s*{[^}]*}|\s*)\n/,
        `${tableDecorator}\n`
      );

      try {
        const tableInfo = await sequelize.getQueryInterface().describeTable(actualTableName);
        
        // Remove colunas com underline
        for (const dbColumnName of Object.keys(tableInfo)) {
          if (dbColumnName.includes('_')) {
            console.log(`Removendo coluna com underline: ${dbColumnName}`);
            await sequelize.getQueryInterface().removeColumn(actualTableName, dbColumnName);
            delete tableInfo[dbColumnName];
          }
        }

        // Extrai informações das colunas do modelo
        const modelColumns = new Map();
        const columnMatches = Array.from(modelContent.matchAll(
          /@(Column|PrimaryKey|AutoIncrement|ForeignKey|CreatedAt|UpdatedAt)(?:\((.*?)\))?\s*[\s\S]*?(\w+):\s*(\w+)/g
        ));

        for (const match of columnMatches) {
          const columnName = match[3];
          modelColumns.set(columnName, {
            type: match[4],
            decorator: match[1],
            options: match[2]
          });
        }

        // Adiciona colunas do banco que não existem no modelo
        let classDefinitionEnd = modelContent.lastIndexOf('}');
        let newColumns = '';
        
        for (const [dbColumnName, columnInfo] of Object.entries(tableInfo)) {
          if (!modelColumns.has(dbColumnName) && !dbColumnName.includes('_')) {
            console.log(`Adicionando coluna do banco ao modelo: ${dbColumnName}`);
            const columnType = convertDbTypeToColumnType(columnInfo.type);
            const decorator = generateColumnDecorator(columnInfo);
            newColumns += `\n  ${decorator}\n  ${dbColumnName}: ${columnType};\n`;
          }
        }

        // Cria colunas faltantes no banco
        for (const [columnName, columnInfo] of modelColumns.entries()) {
          if (!tableInfo[columnName]) {
            console.log(`Criando coluna faltante no banco: ${columnName}`);
            const sequelizeType = getSequelizeType(columnInfo.type);
            
            if (sequelizeType) {
              try {
                await sequelize.getQueryInterface().addColumn(
                  actualTableName,
                  columnName,
                  {
                    type: sequelizeType,
                    allowNull: true
                  }
                );
                console.log(`✓ Coluna ${columnName} criada com sucesso no banco`);
              } catch (error) {
                console.error(`Erro ao criar coluna ${columnName}:`, error.message);
              }
            } else {
              console.warn(`⚠ Tipo não mapeado para coluna ${columnName}: ${columnInfo.type}`);
            }
          }
        }

        if (newColumns) {
          modelContent = modelContent.slice(0, classDefinitionEnd) + 
                        newColumns + 
                        modelContent.slice(classDefinitionEnd);
        }

        // Salva as alterações no arquivo do modelo
        fs.writeFileSync(filePath, modelContent, 'utf8');
        console.log(`✓ Modelo ${className} atualizado com sucesso`);

      } catch (error) {
        console.error(`Erro ao processar tabela ${actualTableName}:`, error.message);
      }
    }

    console.log('\n=== Processo Finalizado ===');
    console.log('Todas as atualizações foram concluídas.');

  } catch (error) {
    console.error('Erro ao executar o script:', error);
  } finally {
    await sequelize.close();
  }
}

// Executa o script
standardizeAndUpdateDatabase()
  .then(() => {
    console.log('Script executado com sucesso');
  })
  .catch(error => {
    console.error('Erro na execução do script:', error);
  });