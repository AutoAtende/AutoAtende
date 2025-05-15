const fs = require('fs');
const path = require('path');
const readline = require('readline');
const util = require('util');

class MigrationAnalyzer {
  constructor(migrationsPath, modelsPath) {
    this.migrationsPath = migrationsPath;
    this.modelsPath = modelsPath;
    this.report = {
      modelsAffected: {},
      migrationImpact: {},
      integrityIssues: []
    };
    this.modelNameMap = new Map();
    this.tableToModelMap = new Map();
    this.readFileAsync = util.promisify(fs.readFile);
    this.writeFileAsync = util.promisify(fs.writeFile);
  }

  async analyzeChanges() {
    this.initializeModelNameMap();
    const migrations = fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.ts'))
      .sort();

    for (const migrationFile of migrations) {
      const content = fs.readFileSync(path.join(this.migrationsPath, migrationFile), 'utf8');
      const changes = this.extractMigrationChanges(content);

      for (const [changeType, changesList] of Object.entries(changes)) {
        changesList.forEach(change => {
          const tableName = change.table || change.name;
          const modelFile = this.findModelForTable(tableName);

          if (modelFile) {
            const modelName = path.basename(modelFile, '.ts');
            if (!this.report.modelsAffected[modelName]) {
              this.report.modelsAffected[modelName] = [];
            }

            this.report.modelsAffected[modelName].push({
              migrationFile,
              changeType,
              details: change
            });
          } else {
            this.report.integrityIssues.push({
              type: 'model_not_found',
              details: `Modelo não encontrado para tabela: ${tableName} (Migration: ${migrationFile})`
            });
          }
        });
      }
    }

    return this.report;
  }

  findModelForTable(tableName) {
    if (!tableName) return null;
    
    const normalized = tableName.toLowerCase();
    const variations = [
      normalized,
      normalized + 's',
      normalized.slice(0, -1),
      this.snakeToCamel(normalized),
      this.snakeToCamel(normalized) + 's',
      this.snakeToCamel(normalized.slice(0, -1))
    ];

    for (const variation of variations) {
      const modelFile = this.modelNameMap.get(variation);
      if (modelFile) {
        return modelFile;
      }
    }

    return null;
  }

  extractMigrationChanges(content) {
    const changes = {
      createTable: [],
      addColumn: [],
      removeColumn: [],
      changeColumn: [],
      addConstraint: [],
      removeConstraint: [],
      addIndex: [],
      removeIndex: [],
      foreignKeys: [],
      manyToMany: [],
      columnModifications: [],
      enums: [],
      jsonFields: []
    };

    // Detecta createTable
    const createTableMatches = content.match(/createTable\(\s*['"]([\w]+)['"],[\s\S]*?{([\s\S]*?)}\s*\)/g);
    if (createTableMatches) {
      createTableMatches.forEach(match => {
        const tableMatch = match.match(/['"]([^'"]+)['"]/);
        if (tableMatch) {
          const tableName = tableMatch[1];
          const columns = this.extractColumnsFromDefinition(match);
          
          changes.createTable.push({
            name: tableName,
            columns: columns
          });

          // Processa foreign keys na criação da tabela
          columns.forEach(column => {
            if (column.references) {
              changes.foreignKeys.push({
                table: tableName,
                column: column.name,
                references: column.references,
                options: {
                  onUpdate: column.onUpdate,
                  onDelete: column.onDelete
                }
              });
            }
          });
        }
      });
    }

    // Detecta alterações condicionais
    this.processConditionalChanges(content, changes);

    // Detecta foreign keys
    const foreignKeyMatches = content.match(/references:\s*{\s*model:\s*['"]([\w]+)['"],\s*key:\s*['"](\w+)['"]\s*}/g);
    if (foreignKeyMatches) {
      this.processForeignKeyReferences(foreignKeyMatches, changes);
    }

    // Detecta índices
    this.processIndices(content, changes);

    // Detecta enums
    if (content.includes('DataTypes.ENUM')) {
      this.processEnumDefinitions(content, changes);
    }

    // Detecta campos JSON/JSONB
    if (content.includes('DataTypes.JSON') || content.includes('DataTypes.JSONB')) {
      this.processJsonFields(content, changes);
    }

    // Detecta many-to-many
    if (this.isJunctionTableMigration(content)) {
      const junctionDetails = this.extractJunctionTableDetails(content);
      if (junctionDetails) {
        changes.manyToMany.push(junctionDetails);
      }
    }

    return changes;
  }

  processConditionalChanges(content, changes) {
    const conditionalBlocks = content.match(/if\s*\(.*?\)\s*{[\s\S]*?}/g);
    if (conditionalBlocks) {
      conditionalBlocks.forEach(block => {
        const columnAdditions = block.match(/addColumn\([^)]+\)/g);
        if (columnAdditions) {
          columnAdditions.forEach(addition => {
            const columnData = this.extractColumnDefinition(addition);
            if (columnData) {
              changes.addColumn.push({
                ...columnData,
                conditional: true
              });
            }
          });
        }
      });
    }
  }

  processForeignKeyReferences(foreignKeyMatches, changes) {
    foreignKeyMatches.forEach(match => {
      const [_, model, key] = match.match(/model:\s*['"]([\w]+)['"],\s*key:\s*['"](\w+)['"]/);
      
      changes.foreignKeys.push({
        referencedModel: model,
        referencedKey: key,
        options: this.extractForeignKeyOptions(match)
      });
    });
  }

  extractForeignKeyOptions(foreignKeyMatch) {
    const options = {};
    
    const updateMatch = foreignKeyMatch.match(/onUpdate:\s*['"](\w+)['"]/);
    if (updateMatch) options.onUpdate = updateMatch[1];

    const deleteMatch = foreignKeyMatch.match(/onDelete:\s*['"](\w+)['"]/);
    if (deleteMatch) options.onDelete = deleteMatch[1];

    return options;
  }

  processIndices(content, changes) {
    // Processa índices do Sequelize
    const sequelizeIndices = this.extractSequelizeIndices(content);
    changes.addIndex.push(...sequelizeIndices);

    // Processa índices SQL
    const sqlIndices = this.extractSQLIndices(content);
    changes.addIndex.push(...sqlIndices);
  }

  processEnumDefinitions(content, changes) {
    const enumMatches = content.match(/DataTypes\.ENUM\((.*?)\)/g);
    if (enumMatches) {
      enumMatches.forEach(enumMatch => {
        const values = enumMatch.match(/['"]([^'"]+)['"]/g);
        if (values) {
          changes.enums.push({
            values: values.map(v => v.replace(/['"]/g, '')),
            raw: enumMatch
          });
        }
      });
    }
  }

  processJsonFields(content, changes) {
    const jsonFieldMatches = content.match(/(\w+):\s*{\s*type:\s*DataTypes\.(JSON|JSONB)/g);
    if (jsonFieldMatches) {
      jsonFieldMatches.forEach(match => {
        const [field] = match.match(/(\w+):/);
        changes.jsonFields.push({
          field: field.replace(':', ''),
          type: match.includes('JSONB') ? 'JSONB' : 'JSON'
        });
      });
    }
  }

  extractColumnsFromDefinition(tableDefinition) {
    const columns = [];
    const columnMatches = tableDefinition.match(/(\w+):\s*{[^}]+}/g) || [];

    columnMatches.forEach(colMatch => {
      const nameMatch = colMatch.match(/(\w+):/);
      if (nameMatch) {
        const columnName = nameMatch[1];
        const parsedDefinition = this.parseColumnDefinition(colMatch);
        columns.push({
          name: columnName,
          ...parsedDefinition
        });
      }
    });

    return columns;
  }

  parseColumnDefinition(definition) {
    const parsed = {
      type: null,
      allowNull: true,
      defaultValue: undefined,
      primaryKey: false,
      autoIncrement: false,
      references: null,
      onUpdate: null,
      onDelete: null
    };

    // Extrai tipo
    const typeMatch = definition.match(/type:\s*(?:Sequelize|DataTypes?)\.([\w\.]+)/i);
    if (typeMatch) {
      parsed.type = typeMatch[1].toUpperCase();
    }

    // Extrai outras propriedades
    const allowNullMatch = definition.match(/allowNull:\s*(true|false)/);
    if (allowNullMatch) {
      parsed.allowNull = allowNullMatch[1] === 'true';
    }

    const defaultValueMatch = definition.match(/defaultValue:\s*([^,}]+)/);
    if (defaultValueMatch) {
      parsed.defaultValue = defaultValueMatch[1].trim();
    }

    const primaryKeyMatch = definition.match(/primaryKey:\s*(true|false)/);
    if (primaryKeyMatch) {
      parsed.primaryKey = primaryKeyMatch[1] === 'true';
    }

    const autoIncrementMatch = definition.match(/autoIncrement:\s*(true|false)/);
    if (autoIncrementMatch) {
      parsed.autoIncrement = autoIncrementMatch[1] === 'true';
    }

    // Extrai referências
    const referencesMatch = definition.match(/references:\s*{([^}]+)}/);
    if (referencesMatch) {
      const modelMatch = referencesMatch[1].match(/model:\s*['"](\w+)['"]/);
      const keyMatch = referencesMatch[1].match(/key:\s*['"](\w+)['"]/);
      
      if (modelMatch && keyMatch) {
        parsed.references = {
          model: modelMatch[1],
          key: keyMatch[1]
        };

        // Extrai onUpdate/onDelete
        const onUpdateMatch = referencesMatch[1].match(/onUpdate:\s*['"](\w+)['"]/);
        if (onUpdateMatch) {
          parsed.onUpdate = onUpdateMatch[1];
        }

        const onDeleteMatch = referencesMatch[1].match(/onDelete:\s*['"](\w+)['"]/);
        if (onDeleteMatch) {
          parsed.onDelete = onDeleteMatch[1];
        }
      }
    }

    return parsed;
  }

  extractSequelizeIndices(content) {
    const indices = [];
    const indexMatches = content.match(/addIndex\([^)]+\)/g) || [];

    indexMatches.forEach(match => {
      const tableMatch = match.match(/['"]([^'"]+)['"]/);
      const columnsMatch = match.match(/\[([\s\S]*?)\]/);
      const optionsMatch = match.match(/{([\s\S]*?)}/);

      if (tableMatch && columnsMatch) {
        indices.push({
          table: tableMatch[1],
          columns: columnsMatch[1]
            .split(',')
            .map(col => col.trim().replace(/['"]/g, '')),
          ...(optionsMatch ? this.parseIndexOptions(optionsMatch[1]) : {}),
          type: 'sequelize'
        });
      }
    });

    return indices;
  }

  extractSQLIndices(content) {
    const indices = [];
    const createIndexMatches = content.match(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(\w+)\s+ON\s+["'](\w+)["']\s*\(([\s\S]*?)\)/ig) || [];

    createIndexMatches.forEach(match => {
      const [_, indexName, tableName, columns] = match.match(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(\w+)\s+ON\s+["'](\w+)["']\s*\(([\s\S]*?)\)/i);
      
      indices.push({
        table: tableName,
        name: indexName,
        columns: columns.split(',').map(col => 
          col.trim().replace(/["']/g, '').split(' ')[0]
        ),
        unique: match.toLowerCase().includes('unique'),
        type: 'sql'
      });
    });

    return indices;
  }

  async analyzeChanges() {
    this.initializeModelNameMap();
    const migrations = fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.ts'))
      .sort();

    for (const migrationFile of migrations) {
      const content = fs.readFileSync(path.join(this.migrationsPath, migrationFile), 'utf8');
      const changes = this.extractMigrationChanges(content);

      for (const [changeType, changesList] of Object.entries(changes)) {
        changesList.forEach(change => {
          const tableName = change.table || change.name;
          const modelFile = this.findModelForTable(tableName);

          if (modelFile) {
            const modelName = path.basename(modelFile, '.ts');
            if (!this.report.modelsAffected[modelName]) {
              this.report.modelsAffected[modelName] = [];
            }

            this.report.modelsAffected[modelName].push({
              migrationFile,
              changeType,
              details: change
            });
          } else {
            this.report.integrityIssues.push({
              type: 'model_not_found',
              details: `Modelo não encontrado para tabela: ${tableName} (Migration: ${migrationFile})`
            });
          }
        });
      }
    }

    return this.report;
  }

  findModelForTable(tableName) {
    if (!tableName) return null;
    
    const normalized = tableName.toLowerCase();
    const variations = [
      normalized,
      normalized + 's',
      normalized.slice(0, -1),
      this.snakeToCamel(normalized),
      this.snakeToCamel(normalized) + 's',
      this.snakeToCamel(normalized.slice(0, -1))
    ];

    for (const variation of variations) {
      const modelFile = this.modelNameMap.get(variation);
      if (modelFile) {
        return modelFile;
      }
    }

    return null;
  }

  addColumnToModel(modelContent, columnDetails, columnDef) {
    // Verifica se a coluna já existe
    const columnExists = new RegExp(`\\s+${columnDetails.column}:\\s*\\w+;`).test(modelContent);
    if (columnExists) {
      return modelContent;
    }

    const classEndMatch = modelContent.match(/class\s+\w+\s+extends\s+Model\s*{/);
    if (!classEndMatch) return modelContent;

    // Adiciona imports necessários
    const imports = [];
    if (columnDef.references) {
      const referencedModel = columnDef.references.model;
      if (!modelContent.includes(`import ${referencedModel}`)) {
        imports.push(`import ${referencedModel} from "./${referencedModel}";`);
      }
      if (!modelContent.includes('ForeignKey')) {
        imports.push('  ForeignKey,');
      }
      if (!modelContent.includes('BelongsTo')) {
        imports.push('  BelongsTo,');
      }
    }

    if (imports.length > 0) {
      modelContent = this.addImports(modelContent, imports);
    }

    // Gera o decorador da coluna
    let decorators = [];
    if (columnDef.references) {
      decorators.push(`  @ForeignKey(() => ${columnDef.references.model})`);
    }

    const columnOptions = [];
    if (columnDef.type) {
      columnOptions.push(`type: DataType.${columnDef.type}`);
    }
    if (columnDef.allowNull === false) {
      columnOptions.push('allowNull: false');
    }
    if (columnDef.defaultValue !== undefined) {
      columnOptions.push(`defaultValue: ${columnDef.defaultValue}`);
    }
    if (columnDef.references) {
      columnOptions.push(`references: { model: '${columnDef.references.model}', key: '${columnDef.references.key}' }`);
    }
    if (columnDef.onUpdate) {
      columnOptions.push(`onUpdate: '${columnDef.onUpdate}'`);
    }
    if (columnDef.onDelete) {
      columnOptions.push(`onDelete: '${columnDef.onDelete}'`);
    }

    const columnDecorator = columnOptions.length > 0
      ? `  @Column({\n    ${columnOptions.join(',\n    ')}\n  })`
      : '  @Column';

    decorators.push(columnDecorator);

    // Monta a definição completa da coluna
    let columnDefinition = `\n${decorators.join('\n')}\n  ${columnDetails.column}: ${this.getTypeScriptType(columnDef.type)};`;

    // Adiciona relacionamento BelongsTo se necessário
    if (columnDef.references) {
      const relationName = columnDetails.column.replace(/Id$/, '');
      columnDefinition += `\n\n  @BelongsTo(() => ${columnDef.references.model})` +
                         `\n  ${relationName}: ${columnDef.references.model};`;
    }

    // Insere a nova coluna no modelo
    const insertPosition = classEndMatch.index + classEndMatch[0].length;
    return modelContent.slice(0, insertPosition) + columnDefinition + modelContent.slice(insertPosition);
  }

  addImports(modelContent, imports) {
    const sequelizeImportMatch = modelContent.match(/import\s*{([^}]+)}\s*from\s*['"]sequelize-typescript['"]/);
    
    if (sequelizeImportMatch) {
      // Adiciona novos imports do sequelize-typescript
      const sequelizeImports = imports.filter(imp => !imp.includes('from'));
      if (sequelizeImports.length > 0) {
        const currentImports = sequelizeImportMatch[1].split(',').map(i => i.trim());
        const newImports = [...new Set([...currentImports, ...sequelizeImports.map(i => i.trim())])];
        const updatedImport = `import { ${newImports.join(', ')} } from "sequelize-typescript"`;
        modelContent = modelContent.replace(sequelizeImportMatch[0], updatedImport);
      }

      // Adiciona imports de modelos
      const modelImports = imports.filter(imp => imp.includes('from'));
      if (modelImports.length > 0) {
        const importPosition = modelContent.indexOf('\n', sequelizeImportMatch.index) + 1;
        modelContent = modelContent.slice(0, importPosition) + 
                      modelImports.join('\n') + '\n' +
                      modelContent.slice(importPosition);
      }
    }

    return modelContent;
  }
  

  initializeModelNameMap() {
    const files = fs.readdirSync(this.modelsPath);
    files.forEach(file => {
      if (file.endsWith('.ts')) {
        const content = fs.readFileSync(path.join(this.modelsPath, file), 'utf8');
        const modelName = this.extractModelName(content);
        const tableName = this.extractTableName(content);
        
        if (modelName) {
          const variations = [
            modelName.toLowerCase(),
            `${modelName.toLowerCase()}s`,
            this.camelToSnake(modelName).toLowerCase(),
            `${this.camelToSnake(modelName).toLowerCase()}s`
          ];

          if (tableName) {
            variations.push(tableName.toLowerCase());
            this.tableToModelMap.set(tableName.toLowerCase(), modelName);
          }

          variations.forEach(variation => {
            this.modelNameMap.set(variation, file);
          });
        }
      }
    });
  }

  extractModelName(content) {
    const classMatch = content.match(/class\s+(\w+)\s+extends\s+Model/);
    return classMatch ? classMatch[1] : null;
  }

  extractTableName(content) {
    const tableMatch = content.match(/@Table\(\s*{?\s*tableName:\s*['"](.*?)['"]/);
    if (tableMatch) return tableMatch[1];
    
    const simpleTableMatch = content.match(/@Table\(['"](.*?)['"]\)/);
    return simpleTableMatch ? simpleTableMatch[1] : null;
  }

  camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  snakeToCamel(str) {
    return str.replace(/_([a-z])/g, g => g[1].toUpperCase());
  }

  extractMigrationChanges(content) {
    const changes = {
      createTable: [],
      addColumn: [],
      removeColumn: [],
      changeColumn: [],
      addConstraint: [],
      removeConstraint: [],
      addIndex: [],
      removeIndex: [],
      foreignKeys: [],
      manyToMany: [],
      columnModifications: [],
      ...this.initializeChangesObject()
    };

    // Detecta createTable
    const createTableMatches = content.match(/createTable\(\s*['"]([\w]+)['"],[\s\S]*?{([\s\S]*?)}\s*\)/g);
    if (createTableMatches) {
      createTableMatches.forEach(match => {
        const tableMatch = match.match(/['"]([^'"]+)['"]/);
        if (tableMatch) {
          const tableName = tableMatch[1];
          const columns = this.extractColumnsFromDefinition(match);
          
          changes.createTable.push({
            name: tableName,
            columns: columns
          });

          // Processa foreign keys na criação da tabela
          columns.forEach(column => {
            if (column.references) {
              changes.foreignKeys.push({
                table: tableName,
                column: column.name,
                references: column.references,
                options: {
                  onUpdate: column.onUpdate,
                  onDelete: column.onDelete
                }
              });
            }
          });
        }
      });
    }

    // Detecta alterações condicionais
    const describeMatch = content.match(/describeTable\(['"]([\w]+)['"].*?\{([\s\S]*?)}/);
    if (describeMatch) {
      const tableName = describeMatch[1];
      
      // Procura por verificações condicionais
      const conditionalChecks = content.match(/if\s*\(!\s*(?:columns|tableDefinition)\['?([\w]+)'?\]\)\s*{([\s\S]*?)}/g);
      if (conditionalChecks) {
        conditionalChecks.forEach(check => {
          const columnMatch = check.match(/['"]?([\w]+)['"]?/);
          if (columnMatch) {
            const columnName = columnMatch[1];
            const columnDefMatch = check.match(/addColumn\([^,]+,\s*['"]\w+['"],\s*({[\s\S]*?})/);
            
            if (columnDefMatch) {
              changes.addColumn.push({
                table: tableName,
                column: columnName,
                definition: this.parseColumnDefinition(columnDefMatch[1]),
                conditional: true
              });
            }
          }
        });
      }
    }

    // Detecta índices
    const indexMatches = [
      ...this.extractSequelizeIndices(content),
      ...this.extractSQLIndices(content)
    ];

    changes.addIndex = indexMatches;

    // Detecta many-to-many relationships
    if (this.isJunctionTableMigration(content)) {
      const junctionDetails = this.extractJunctionTableDetails(content);
      if (junctionDetails) {
        changes.manyToMany.push(junctionDetails);
      }
    }

    return changes;
  }

  extractColumnsFromDefinition(tableDefinition) {
    const columns = [];
    const columnMatches = tableDefinition.match(/(\w+):\s*{[^}]+}/g) || [];

    columnMatches.forEach(colMatch => {
      const nameMatch = colMatch.match(/(\w+):/);
      if (nameMatch) {
        const columnName = nameMatch[1];
        const parsedDefinition = this.parseColumnDefinition(colMatch);
        columns.push({
          name: columnName,
          ...parsedDefinition
        });
      }
    });

    return columns;
  }

  parseColumnDefinition(definition) {
    const parsed = {
      type: null,
      allowNull: true,
      defaultValue: undefined,
      primaryKey: false,
      autoIncrement: false,
      references: null,
      onUpdate: null,
      onDelete: null
    };

    // Extrai tipo
    const typeMatch = definition.match(/type:\s*(?:Sequelize|DataTypes?)\.([\w\.]+)/i);
    if (typeMatch) {
      parsed.type = typeMatch[1].toUpperCase();
    }

    // Extrai outras propriedades
    const allowNullMatch = definition.match(/allowNull:\s*(true|false)/);
    if (allowNullMatch) {
      parsed.allowNull = allowNullMatch[1] === 'true';
    }

    const defaultValueMatch = definition.match(/defaultValue:\s*([^,}]+)/);
    if (defaultValueMatch) {
      parsed.defaultValue = defaultValueMatch[1].trim();
    }

    const primaryKeyMatch = definition.match(/primaryKey:\s*(true|false)/);
    if (primaryKeyMatch) {
      parsed.primaryKey = primaryKeyMatch[1] === 'true';
    }

    const autoIncrementMatch = definition.match(/autoIncrement:\s*(true|false)/);
    if (autoIncrementMatch) {
      parsed.autoIncrement = autoIncrementMatch[1] === 'true';
    }

    // Extrai referências
    const referencesMatch = definition.match(/references:\s*{([^}]+)}/);
    if (referencesMatch) {
      const modelMatch = referencesMatch[1].match(/model:\s*['"](\w+)['"]/);
      const keyMatch = referencesMatch[1].match(/key:\s*['"](\w+)['"]/);
      
      if (modelMatch && keyMatch) {
        parsed.references = {
          model: modelMatch[1],
          key: keyMatch[1]
        };
      }
    }

    // Extrai onUpdate/onDelete
    const onUpdateMatch = definition.match(/onUpdate:\s*['"](\w+)['"]/);
    if (onUpdateMatch) {
      parsed.onUpdate = onUpdateMatch[1];
    }

    const onDeleteMatch = definition.match(/onDelete:\s*['"](\w+)['"]/);
    if (onDeleteMatch) {
      parsed.onDelete = onDeleteMatch[1];
    }

    return parsed;
  }

  extractSequelizeIndices(content) {
    const indices = [];
    const indexMatches = content.match(/addIndex\([^)]+\)/g) || [];

    indexMatches.forEach(match => {
      const tableMatch = match.match(/['"]([^'"]+)['"]/);
      const columnsMatch = match.match(/\[([\s\S]*?)\]/);
      const optionsMatch = match.match(/{([\s\S]*?)}/);

      if (tableMatch && columnsMatch) {
        indices.push({
          table: tableMatch[1],
          columns: columnsMatch[1]
            .split(',')
            .map(col => col.trim().replace(/['"]/g, '')),
          ...(optionsMatch ? this.parseIndexOptions(optionsMatch[1]) : {}),
          type: 'sequelize'
        });
      }
    });

    return indices;
  }

  extractSQLIndices(content) {
    const indices = [];
    const createIndexMatches = content.match(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(\w+)\s+ON\s+["'](\w+)["']\s*\(([\s\S]*?)\)/ig) || [];

    createIndexMatches.forEach(match => {
      const [_, indexName, tableName, columns] = match.match(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(\w+)\s+ON\s+["'](\w+)["']\s*\(([\s\S]*?)\)/i);
      
      indices.push({
        table: tableName,
        name: indexName,
        columns: columns.split(',').map(col => 
          col.trim().replace(/["']/g, '').split(' ')[0]
        ),
        unique: match.toLowerCase().includes('unique'),
        type: 'sql'
      });
    });

    return indices;
  }

  parseIndexOptions(optionsStr) {
    const options = {};
    const matches = optionsStr.match(/(\w+):\s*([^,}]+)/g) || [];
    
    matches.forEach(match => {
      const [key, value] = match.split(':').map(s => s.trim());
      options[key] = value === 'true' ? true : 
                     value === 'false' ? false : 
                     value.replace(/['"]/g, '');
    });

    return options;
  }

  isJunctionTableMigration(content) {
    const foreignKeyCount = (content.match(/references:/g) || []).length;
    const hasUniqueIndex = content.includes('unique: true') || 
                          content.includes('type: "unique"');
    const isJunctionNaming = content.includes('belongsToMany') || 
                           /create.*?junction/i.test(content);
    
    return (foreignKeyCount === 2 && hasUniqueIndex) || isJunctionNaming;
  }

  extractJunctionTableDetails(content) {
    const createTableMatch = content.match(/createTable\(['"]([\w]+)['"],\s*{([\s\S]*?)}\s*\)/);
    if (!createTableMatch) return null;

    const tableName = createTableMatch[1];
    const tableDefinition = createTableMatch[2];
    
    // Extrai as referências
    const references = [];
    const refMatches = tableDefinition.match(/references:\s*{\s*model:\s*['"]([\w]+)['"]/g) || [];
    
    refMatches.forEach(ref => {
      const modelMatch = ref.match(/model:\s*['"]([\w]+)['"]/);
      if (modelMatch) {
        references.push(modelMatch[1]);
      }
    });

    if (references.length === 2) {
      return {
        junctionTable: tableName,
        models: references,
        definition: this.extractColumnsFromDefinition(tableDefinition)
      };
    }

    return null;
  }

  generateModelContent(tableName, columns, relationships) {
    const modelName = this.snakeToCamel(tableName);
    let imports = [
      'import {',
      '  Table,',
      '  Column,',
      '  Model,',
      '  DataType,',
      '  CreatedAt,',
      '  UpdatedAt'
    ];

    // Adiciona imports necessários
    if (relationships.foreignKeys.length > 0) {
      imports.push('  ForeignKey,');
      imports.push('  BelongsTo,');
    }

    if (relationships.manyToMany.length > 0) {
      imports.push('  BelongsToMany,');
    }

    imports.push('} from "sequelize-typescript";');

    // Adiciona imports para relacionamentos
    const relationImports = new Set();
    relationships.foreignKeys.forEach(fk => {
      relationImports.add(`import ${fk.references.model} from "./${fk.references.model}";`);
    });

    relationships.manyToMany.forEach(rel => {
      rel.models.forEach(model => {
        relationImports.add(`import ${model} from "./${model}";`);
      });
    });

    let content = [
      ...imports,
      '',
      Array.from(relationImports).join('\n'),
      '',
      '@Table',
      `class ${modelName} extends Model<${modelName}> {`
    ].join('\n');

    // Adiciona colunas
    columns.forEach(column => {
      content += this.generateColumnDefinition(column);
    });

    // Adiciona relacionamentos
    relationships.foreignKeys.forEach(fk => {
      content += this.generateForeignKeyRelationship(fk);
    });

    relationships.manyToMany.forEach(rel => {
      content += this.generateManyToManyRelationship(rel, modelName);
    });

    content += '\n}\n\nexport default ' + modelName + ';';
    return content;
  }

  generateColumnDefinition(column) {
    let decorators = [];
    
    if (column.primaryKey) {
      decorators.push('@PrimaryKey');
    }
    
    if (column.autoIncrement) {
      decorators.push('@AutoIncrement');
    }

    const columnOptions = [];
    if (column.type) {
      columnOptions.push(`type: DataType.${column.type}`);
    }
    if (column.allowNull === false) {
      columnOptions.push('allowNull: false');
    }
    if (column.defaultValue !== undefined) {
      columnOptions.push(`defaultValue: ${column.defaultValue}`);
    }

    const decorator = columnOptions.length > 0
    ? `  @Column({\n    ${columnOptions.join(',\n    ')}\n  })`
    : '  @Column';

  return `\n${decorators.join('\n')}${decorator}\n  ${column.name}: ${this.getTypeScriptType(column.type)};\n`;
}

generateForeignKeyRelationship(fk) {
  const relationName = this.snakeToCamel(fk.references.model);
  let content = `\n  @ForeignKey(() => ${relationName})`;
  
  if (fk.options) {
    const options = [];
    if (fk.options.onUpdate) options.push(`onUpdate: '${fk.options.onUpdate}'`);
    if (fk.options.onDelete) options.push(`onDelete: '${fk.options.onDelete}'`);
    
    content += `\n  @Column({\n    ${options.join(',\n    ')}\n  })`;
  } else {
    content += '\n  @Column';
  }

  content += `\n  ${fk.column}: number;\n`;
  content += `\n  @BelongsTo(() => ${relationName})`;
  content += `\n  ${this.foreignKeyToRelationName(fk.column)}: ${relationName};\n`;
  
  return content;
}

generateManyToManyRelationship(rel, currentModelName) {
  let content = '';
  const otherModel = rel.models.find(m => m !== currentModelName);
  const junctionModel = rel.junctionTable;

  if (otherModel) {
    content += `\n  @BelongsToMany(() => ${otherModel}, () => ${junctionModel})`;
    content += `\n  ${this.pluralize(otherModel.toLowerCase())}: ${otherModel}[];\n`;
  }

  return content;
}

foreignKeyToRelationName(columnName) {
  return columnName.replace(/Id$/, '').toLowerCase();
}

pluralize(name) {
  return name.endsWith('s') ? name : name + 's';
}

getTypeScriptType(sequelizeType) {
  const typeMap = {
    'INTEGER': 'number',
    'BIGINT': 'number',
    'FLOAT': 'number',
    'DOUBLE': 'number',
    'DECIMAL': 'number',
    'STRING': 'string',
    'CHAR': 'string',
    'TEXT': 'string',
    'DATE': 'Date',
    'DATEONLY': 'Date',
    'BOOLEAN': 'boolean',
    'JSON': 'any',
    'JSONB': 'any',
    'BLOB': 'Buffer',
    'UUID': 'string',
    'ENUM': 'string'
  };
  return typeMap[sequelizeType] || 'any';
}

async askForUpdate() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    const answer = await new Promise(resolve => {
      rl.question('\nDeseja atualizar os modelos e excluir as migrações? (Y/N): ', answer => {
        resolve(answer.toLowerCase());
      });
    });

    return answer === 'y';
  } finally {
    rl.close();
  }
}

async updateModels() {
  console.log('\nIniciando atualização dos modelos...');
  let updatedCount = 0;

  for (const [modelName, changes] of Object.entries(this.report.modelsAffected)) {
    const modelPath = path.join(this.modelsPath, `${modelName}.ts`);
    console.log(`\nProcessando modelo: ${modelName}`);

    try {
      if (!fs.existsSync(modelPath)) {
        console.log(`× Modelo ${modelName} não encontrado`);
        continue;
      }

      let modelContent = await this.readFileAsync(modelPath, 'utf8');
      let updatedContent = modelContent;
      let hasChanges = false;

      for (const change of changes) {
        console.log(`  Aplicando alteração: ${change.changeType}`);
        
        switch (change.changeType) {
          case 'addColumn':
            const columnDef = this.extractColumnDefinitionFromMigration(change.details);
            if (columnDef) {
              updatedContent = this.addColumnToModel(updatedContent, change.details, columnDef);
              hasChanges = true;
            }
            break;
            
          case 'removeColumn':
            updatedContent = this.removeColumnFromModel(updatedContent, change.details);
            hasChanges = true;
            break;
            
          case 'changeColumn':
            const newColumnDef = this.extractColumnDefinitionFromMigration(change.details);
            if (newColumnDef) {
              updatedContent = this.updateColumnInModel(updatedContent, change.details, newColumnDef);
              hasChanges = true;
            }
            break;

          case 'addIndex':
            updatedContent = this.addIndexesToModel(updatedContent, [change.details]);
            hasChanges = true;
            break;

          case 'manyToMany':
            updatedContent = this.updateModelForManyToMany(updatedContent, change.details);
            hasChanges = true;
            break;
        }
      }

      if (hasChanges && updatedContent !== modelContent) {
        await this.writeFileAsync(modelPath, updatedContent);
        console.log(`✓ Modelo ${modelName} atualizado com sucesso`);
        updatedCount++;
      } else {
        console.log(`- Nenhuma alteração necessária em ${modelName}`);
      }

    } catch (error) {
      console.error(`× Erro ao atualizar ${modelName}:`, error.message);
    }
  }

  console.log(`\nTotal de modelos atualizados: ${updatedCount}`);
  return updatedCount;
}

async deleteMigrations() {
  console.log('\nExcluindo migrações...');
  let deletedCount = 0;

  const migrations = fs.readdirSync(this.migrationsPath)
    .filter(file => file.endsWith('.ts'));

  for (const migration of migrations) {
    const migrationPath = path.join(this.migrationsPath, migration);
    
    try {
      fs.unlinkSync(migrationPath);
      console.log(`✓ Excluída migração: ${migration}`);
      deletedCount++;
    } catch (error) {
      console.error(`× Erro ao excluir ${migration}:`, error.message);
    }
  }

  console.log(`\nTotal de migrações excluídas: ${deletedCount}`);
  return deletedCount;
}

async processUpdates() {
  try {
    console.log('Analisando migrações e modelos...\n');
    await this.analyzeChanges();
    console.log(this.generateReport());

    const shouldUpdate = await this.askForUpdate();
    
    if (shouldUpdate) {
      console.log('\nIniciando processo de atualização...');
      
      const updatedModels = await this.updateModels();
      if (updatedModels > 0) {
        console.log('\nModelos atualizados com sucesso!');
      }

      const deletedMigrations = await this.deleteMigrations();
      
      console.log('\nResumo do processo:');
      console.log(`- Modelos atualizados: ${updatedModels}`);
      console.log(`- Migrações excluídas: ${deletedMigrations}`);
      console.log('\nProcesso concluído!');
    } else {
      console.log('\nOperação cancelada pelo usuário.');
    }
  } catch (error) {
    console.error('\nErro durante o processo:', error.message);
    throw error;
  }
}

generateReport() {
  let report = "Relatório de Análise de Migrações e Modelos\n";
  report += "===========================================\n\n";

  report += "Modelos Afetados:\n";
  Object.entries(this.report.modelsAffected).forEach(([model, changes]) => {
    report += `\n${model}:\n`;
    changes.forEach(change => {
      report += `  - ${change.changeType} (${change.migrationFile})\n`;
      report += `    Detalhes: ${JSON.stringify(change.details)}\n`;
    });
  });

  if (this.report.integrityIssues.length > 0) {
    report += "\nProblemas de Integridade Encontrados:\n";
    this.report.integrityIssues.forEach(issue => {
      report += `  - ${issue.type}: ${issue.details}\n`;
    });
  }

  return report;
}
}

module.exports = MigrationAnalyzer;