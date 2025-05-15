require('dotenv').config();
const { Sequelize, DataTypes, Op } = require('sequelize');
const moment = require('moment');
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

const Invoices = require('./dist/models/Invoices')(sequelize, DataTypes);

async function cleanDuplicateInvoices() {
  try {
    console.log('Iniciando limpeza de faturas duplicadas...');
    
    // 1. Buscar todas as faturas pendentes agrupadas por empresa
    const allInvoices = await Invoices.findAll({
      where: {
        status: 'open'
      },
      order: [
        ['companyId', 'ASC'],
        ['id', 'ASC'] // Mantém a ordem para sempre pegar a mais antiga primeiro
      ]
    });

    console.log(`Total de faturas encontradas: ${allInvoices.length}`);

    // Agrupar faturas por empresa e mês
    const invoicesByCompanyMonth = new Map();
    const duplicatesToDelete = [];

    for (const invoice of allInvoices) {
      const monthKey = moment(invoice.dueDate).format('YYYY-MM');
      const companyMonthKey = `${invoice.companyId}-${monthKey}`;

      if (!invoicesByCompanyMonth.has(companyMonthKey)) {
        // Primeira fatura deste mês para esta empresa - manter
        invoicesByCompanyMonth.set(companyMonthKey, invoice.id);
      } else {
        // Fatura duplicada - marcar para deletar
        duplicatesToDelete.push({
          id: invoice.id,
          companyId: invoice.companyId,
          month: monthKey
        });
      }
    }

    console.log(`Encontradas ${duplicatesToDelete.length} faturas duplicadas`);

    // Log das faturas que serão deletadas
    console.log('\nFaturas que serão removidas:');
    duplicatesToDelete.forEach(dup => {
      console.log(`ID: ${dup.id}, Empresa: ${dup.companyId}, Mês: ${dup.month}`);
    });

    // Confirmar antes de deletar
    console.log('\nPressione CTRL+C para cancelar ou aguarde 10 segundos para continuar...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Deletar as duplicadas
    if (duplicatesToDelete.length > 0) {
      const deletedInvoices = await Invoices.destroy({
        where: {
          id: {
            [Op.in]: duplicatesToDelete.map(d => d.id)
          }
        }
      });

      console.log(`\nFaturas duplicadas removidas com sucesso: ${deletedInvoices}`);
    } else {
      console.log('\nNenhuma fatura duplicada encontrada para remover.');
    }

    console.log('Processo finalizado!');

  } catch (error) {
    console.error('Erro durante a limpeza:', error);
  }
}

// Executar o script
cleanDuplicateInvoices();