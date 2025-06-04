import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Assistants", "voiceConfig", {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {
          enableVoiceResponses: false,
          enableVoiceTranscription: false,
          voiceId: 'nova',
          speed: 1.0,
          transcriptionModel: 'whisper-1',
          useStreaming: false
        }
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Assistants", "voiceConfig")
    ]);
  }
};