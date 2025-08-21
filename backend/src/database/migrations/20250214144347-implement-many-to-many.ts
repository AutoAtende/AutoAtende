import { QueryInterface, DataTypes } from "sequelize";

interface Position {
  id: number;
  name: string;
  employerId: number | null;
}

interface EmployerPosition {
  employerId: number;
  positionId: number;
}

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // 1. Verificar se a coluna employerId existe antes de buscar os dados
    const tableDefinition = await queryInterface.describeTable("ContactPositions");
    let positions: Position[] = [];

    if ("employerId" in tableDefinition) {
      const [result] = await queryInterface.sequelize.query(
        'SELECT id, name, "employerId" FROM "ContactPositions"'
      ) as unknown as [Position[]];

      positions = result;
    }

    // 2. Criar tabela de junção
    await queryInterface.createTable("EmployerPositions", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      employerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "ContactEmployers",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      positionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "ContactPositions",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // Remover índice único existente se ele já estiver no banco
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS "employer_positions_employer_id_position_id";'
    );

    // Criar índice único novamente
    await queryInterface.addIndex("EmployerPositions", 
      ["employerId", "positionId"], 
      { unique: true, name: "employer_positions_employer_id_position_id" }
    );

    // 4. Migrar dados existentes para a nova estrutura, se houver dados salvos
    if (positions.length > 0) {
      for (const pos of positions) {
        if (pos.employerId) {
          await queryInterface.sequelize.query(
            `INSERT INTO "EmployerPositions" ("employerId", "positionId", "createdAt", "updatedAt")
             VALUES (:employerId, :positionId, NOW(), NOW())`,
            {
              replacements: {
                employerId: pos.employerId,
                positionId: pos.id
              }
            }
          );
        }
      }
    }

    // 5. Remover coluna antiga apenas se ela existir
    if ("employerId" in tableDefinition) {
      await queryInterface.removeColumn("ContactPositions", "employerId");
    }

    // 6. Adicionar constraint único no nome da posição
    await queryInterface.addConstraint("ContactPositions", {
      fields: ["name"],
      type: "unique",
      name: "contact_positions_name_unique"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    // 1. Remover constraint único do nome
    await queryInterface.removeConstraint(
      "ContactPositions",
      "contact_positions_name_unique"
    );

    // 2. Adicionar coluna employerId novamente
    await queryInterface.addColumn("ContactPositions", "employerId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "ContactEmployers",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });

    // 3. Recuperar dados da tabela de junção
    const [relations] = await queryInterface.sequelize.query(
      'SELECT "employerId", "positionId" FROM "EmployerPositions"'
    ) as unknown as [EmployerPosition[]];

    // 4. Restaurar dados
    for (const rel of relations) {
      await queryInterface.sequelize.query(
        `UPDATE "ContactPositions" 
         SET "employerId" = :employerId 
         WHERE id = :positionId`,
        {
          replacements: {
            employerId: rel.employerId,
            positionId: rel.positionId
          }
        }
      );
    }

    // 5. Remover tabela de junção
    await queryInterface.dropTable("EmployerPositions");
  }
};
