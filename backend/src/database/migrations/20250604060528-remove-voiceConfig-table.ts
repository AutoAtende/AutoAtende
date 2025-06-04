import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // 1. Adicionar coluna assistantId na tabela VoiceMessages
    await queryInterface.addColumn("VoiceMessages", "assistantId", {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Assistants",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });

    // 2. Adicionar novas colunas para melhor rastreamento
    await queryInterface.addColumn("VoiceMessages", "processType", {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'transcription'
    });

    await queryInterface.addColumn("VoiceMessages", "status", {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending'
    });

    await queryInterface.addColumn("VoiceMessages", "processingConfig", {
      type: DataTypes.JSONB,
      allowNull: true
    });

    // 3. Atualizar coluna metadata para permitir null e ter estrutura melhor
    await queryInterface.changeColumn("VoiceMessages", "metadata", {
      type: DataTypes.JSONB,
      allowNull: true
    });

    // 4. Tornar transcription opcional (para casos de apenas síntese)
    await queryInterface.changeColumn("VoiceMessages", "transcription", {
      type: DataTypes.TEXT,
      allowNull: true
    });

    // 5. Adicionar valor padrão para duration
    await queryInterface.changeColumn("VoiceMessages", "duration", {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    });

    // 6. Remover tabela VoiceConfig (não é mais necessária)
    await queryInterface.dropTable("VoiceConfigs");
  },

  down: async (queryInterface: QueryInterface) => {
    // Recrear tabela VoiceConfig
    await queryInterface.createTable("VoiceConfigs", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Companies",
          key: "id"
        }
      },
      voiceId: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'nova'
      },
      speed: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 1.0
      },
      transcriptionModel: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'whisper-1'
      },
      enableVoiceResponses: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      enableVoiceTranscription: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      useStreaming: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      additionalSettings: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // Remover colunas adicionadas
    await queryInterface.removeColumn("VoiceMessages", "assistantId");
    await queryInterface.removeColumn("VoiceMessages", "processType");
    await queryInterface.removeColumn("VoiceMessages", "status");
    await queryInterface.removeColumn("VoiceMessages", "processingConfig");

    // Reverter mudanças nas colunas
    await queryInterface.changeColumn("VoiceMessages", "transcription", {
      type: DataTypes.TEXT,
      allowNull: false
    });

    await queryInterface.changeColumn("VoiceMessages", "duration", {
      type: DataTypes.FLOAT,
      allowNull: false
    });
  }
};