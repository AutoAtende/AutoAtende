const { Sequelize } = require('sequelize');
const { QueryTypes } = require('sequelize');

const sequelize = new Sequelize('autoatende', 'autoatende', 'qwe12345', {
  host: 'localhost',
  dialect: 'postgres',
  port: 5432,
  logging: false
});

async function updateWhatsappIds() {
  try {
    await sequelize.authenticate();
    console.log('Conexão estabelecida com sucesso.');

    // Buscar todas as empresas
    const companies = await sequelize.query(
      'SELECT id FROM "Companies" WHERE "status" = true',
      { type: QueryTypes.SELECT }
    );

    for (const company of companies) {
      // Buscar WhatsApp conectado da empresa
      const connectedWhatsapp = await sequelize.query(
        'SELECT id FROM "Whatsapps" WHERE "companyId" = :companyId AND "status" = :status LIMIT 1',
        {
          replacements: { 
            companyId: company.id,
            status: 'CONNECTED'
          },
          type: QueryTypes.SELECT
        }
      );

      if (connectedWhatsapp.length > 0) {
        const whatsappId = connectedWhatsapp[0].id;
        
        // Atualizar tickets da empresa
        await sequelize.query(
          `UPDATE "Tickets" 
           SET "whatsappId" = :whatsappId 
           WHERE "companyId" = :companyId 
           AND status IN ('open', 'pending', 'closed')`,
          {
            replacements: { 
              whatsappId,
              companyId: company.id
            },
            type: QueryTypes.UPDATE
          }
        );

        console.log(`Empresa ${company.id}: Tickets atualizados para WhatsApp ${whatsappId}`);
      } else {
        console.log(`Empresa ${company.id}: Nenhum WhatsApp conectado encontrado`);
      }
    }

    console.log('Processo finalizado com sucesso');
    await sequelize.close();

  } catch (error) {
    console.error('Erro durante a execução:', error);
    await sequelize.close();
  }
}

updateWhatsappIds();