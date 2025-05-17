import { QueryInterface, where } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {

    const settings = [
      { key: 'userRating', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'scheduleType', value: 'queue', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'CheckMsgIsGroup', value: 'enabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'sendGreetingAccepted', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'sendMsgTransfTicket', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'chatBotType', value: 'text', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'allowSignup', value: 'enabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'sendGreetingMessageOneQueues', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'callSuport', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'displayContactInfo', value: 'enabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'trialExpiration', value: '7', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'sendEmailWhenRegister', value: 'enabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'sendMessageWhenRegister', value: 'enabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'smtpauth', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'usersmtpauth', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'clientsecretsmtpauth', value: '', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'smtpport', value: '', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'wasuport', value: '', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'msgsuport', value: '', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'openaiModel', value: 'gpt-4', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'downloadLimit', value: '64', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'useOneTicketPerConnection', value: 'enabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'enableTicketValueAndSku', value: 'enabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'enableReasonWhenCloseTicket', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'quickMessages', value: 'company', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'sendQueuePosition', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'settingsUserRandom', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'displayBusinessInfo', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'enableUPSix', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'enableUPSixWebphone', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'enableUPSixNotifications', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'enableOfficialWhatsapp', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'enableSaveCommonContacts', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'displayProfileImages', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'enableQueueWhenCloseTicket', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'enableTagsWhenCloseTicket', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() }
    ];

    const removeOldSettings = [
      { key: 'call', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'enableGLPI', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'urlApiGlpi', value: '', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'appTokenGlpi', value: '', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'tokenMasterGlpi', value: '', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'enableOmieInChatbot', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'omieAppKey', value: '', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'omieAppSecret', value: '', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'enableGroupTools', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'enableMessageRules', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'enableZabbix', value: 'disabled', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'zabbixAuth', value: '', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'zabbixBaseUrl', value: '', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'initialPage', value: 'login', companyId: 1, createdAt: new Date(), updatedAt: new Date() },
      { key: 'apiToken', value: '', companyId: 1, createdAt: new Date(), updatedAt: new Date() },    
    ];

    // Remove old settings
    for (let oldSetting of removeOldSettings) {
      await queryInterface.bulkDelete(
        "Settings",
        {
          key: oldSetting.key,
          companyId: oldSetting.companyId
        },
        {}
      );
    }

    for (let setting of settings) {
      const exists = await queryInterface.rawSelect(
        "Settings",
        {
          where: {
            key: setting.key,
            ...(setting.companyId && { companyId: setting.companyId })
          }
        },
        ["id"]
      );

      if (!exists) {
        await queryInterface.bulkInsert(
          "Settings",
          [
            {
              ...setting,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ],
          {}
        );
      }
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const companyId = 1; // Defina o ID da empresa que você deseja deletar as configurações
  
    return queryInterface.bulkDelete(
      "Settings",
      {
        companyId: companyId // Filtra as configurações pelo companyId
      },
      {}
    );
  }
};