import { Request, Response } from 'express';
import { Op } from 'sequelize';
import User from '../models/User';
import Tag from '../models/Tag';
import EmployerPassword, {
  CreatePasswordPayload,
  UpdatePasswordPayload,
} from '../models/EmployerPassword';
import ContactEmployer from '../models/ContactEmployer';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import { logger } from '../utils/logger';

interface PlainPassword {
  id: string;
  employerId: number | null;
  application: string;
  url: string;
  username: string;
  _password: string;
  notes: string;
  tag: number | null;
  tagInfo?: {
    id: number;
    name: string;
  } | null;
  employer?: {
    id: number;
    name: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

class PasswordController {
  async create(req: Request, res: Response) {
    try {
      const payload: CreatePasswordPayload = req.body || {};
      const userId = req.user.id;
      const companyId = req.user.companyId;
  
      logger.info(`Payload recebido para criação de senha pelo usuário ${userId} da empresa ${companyId}`);
  
      if (!payload.password) {
        return res.status(400).json({ error: 'Senha é obrigatória' });
      }

      const passwordInstance = EmployerPassword.build({
        companyId,
        createdBy: parseInt(userId),
        employerId: payload.employerId || null,
        application: payload.application || '',
        url: payload.url || '',
        username: payload.username || '',
        notes: payload.notes || '',
        tag: payload.tag || null
      });

      passwordInstance.password = payload.password;
      
      await passwordInstance.save();
  
      logger.info(`Senha criada com sucesso pelo usuário ${userId}, ID: ${passwordInstance.id}`);
  
      return res.status(201).json({
        id: passwordInstance.id,
        createdAt: passwordInstance.createdAt,
      });
    } catch (error) {
      logger.error(`Erro detalhado na criação de senha: ${error.message}`);
      logger.error(error.stack);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Dados inválidos',
          details: error.errors.map(e => e.message)
        });
      }
  
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ 
          error: 'Erro de chave estrangeira. Verifique o ID do empregador.'
        });
      }
  
      return res.status(500).json({ 
        error: 'Erro interno ao criar senha',
        details: error.message
      });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const {
        page = 0,
        pageSize = 10,
        employerId,
        tag
      } = req.query;

      const companyId = req.user.companyId;
      
      const parsedPage = Math.max(0, Number(page));
      const parsedPageSize = Math.min(50, Math.max(1, Number(pageSize)));
      
      const where: any = { companyId };
      
      if (employerId) {
        const parsedEmployerId = Number(employerId);
        if (!isNaN(parsedEmployerId)) {
          where.employerId = parsedEmployerId;
        }
      }
      
      if (tag) {
        where.tag = tag === 'null' ? null : Number(tag);
      }

      try {
        const total = await EmployerPassword.count({ where });
        
        const passwords = await EmployerPassword.findAll({
          where,
          include: [
            {
              model: ContactEmployer,
              as: 'employer',
              attributes: ['id', 'name'],
              required: false
            },
            {
              model: Tag,
              as: 'tagInfo',
              attributes: ['id', 'name'],
              required: false
            }
          ],
          attributes: [
            'id', 
            'employerId',
            'application', 
            'url',
            'username',
            '_password', 
            'notes',
            'tag', 
            'createdAt', 
            'updatedAt'
          ],
          limit: parsedPageSize,
          offset: parsedPage * parsedPageSize,
          order: [['createdAt', 'DESC']],
        });

        logger.info(`Listagem realizada com sucesso. Total: ${total}, Página: ${parsedPage}, Tamanho: ${parsedPageSize}`);

        const mappedPasswords = passwords.map(password => {
          const plainPassword = password.get({ plain: true }) as unknown as PlainPassword;
          
          return {
            ...plainPassword,
            password: password.password,
            _password: undefined,
            tag: plainPassword.tag,
            tagInfo: plainPassword.tagInfo ? {
              id: plainPassword.tagInfo.id,
              name: plainPassword.tagInfo.name
            } : null,
            employer: plainPassword.employer ? {
              id: plainPassword.employer.id,
              name: plainPassword.employer.name
            } : null
          };
        });

        return res.json({
          data: mappedPasswords,
          total,
          page: parsedPage,
          pageSize: parsedPageSize,
          totalPages: Math.ceil(total / parsedPageSize)
        });

      } catch (dbError) {
        logger.error('Erro na consulta ao banco:', dbError);
        throw dbError;
      }

    } catch (error) {
      logger.error('Erro detalhado ao listar senhas:', error);
      logger.error(error.stack);
      
      return res.status(500).json({ 
        error: 'Erro ao listar senhas',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }


  async get(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId;

      const password = await EmployerPassword.findOne({
        where: { id, companyId },
        include: [
          {
            model: ContactEmployer,
            as: 'employer',
            attributes: ['id', 'name'],
            required: false
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name'],
            required: false
          }
        ],
      });

      if (!password) {
        return res.status(404).json({ error: 'Senha não encontrada' });
      }

      logger.info(`Senha ${id} consultada na empresa ${companyId}`);

      return res.json({
        id: password.id,
        employerId: password.employerId,
        employer: password.employer,
        creator: password.creator,
        application: password.application,
        url: password.url,
        username: password.username,
        password: password.password,
        notes: password.notes,
        tag: password.tag,
        createdAt: password.createdAt,
        updatedAt: password.updatedAt,
      });
    } catch (error) {
      logger.error('Erro ao buscar senha:', error);
      return res.status(500).json({ error: 'Erro ao buscar senha' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const payload: UpdatePasswordPayload = req.body || {};
      const companyId = req.user.companyId;

      if (!payload.password) {
        return res.status(400).json({ error: 'Senha é obrigatória' });
      }

      const passwordInstance = await EmployerPassword.findOne({
        where: { id, companyId },
      });

      if (!passwordInstance) {
        return res.status(404).json({ error: 'Senha não encontrada' });
      }

      if (payload.employerId !== undefined) {
        passwordInstance.employerId = payload.employerId;
      }
      
      if (payload.application !== undefined) {
        passwordInstance.application = payload.application;
      }
      
      if (payload.url !== undefined) {
        passwordInstance.url = payload.url;
      }
      
      if (payload.username !== undefined) {
        passwordInstance.username = payload.username;
      }
      
      if (payload.notes !== undefined) {
        passwordInstance.notes = payload.notes;
      }
      
      if (payload.tag !== undefined) {
        passwordInstance.tag = payload.tag;
      }

      passwordInstance.password = payload.password;

      await passwordInstance.save();

      logger.info(`Senha ${id} atualizada na empresa ${companyId}`);

      return res.json({
        id: passwordInstance.id,
        updatedAt: passwordInstance.updatedAt,
      });
    } catch (error) {
      logger.error('Erro ao atualizar senha:', error);
      return res.status(500).json({ 
        error: 'Erro ao atualizar senha',
        details: error.message
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId;

      const password = await EmployerPassword.findOne({
        where: { id, companyId },
      });

      if (!password) {
        return res.status(404).json({ error: 'Senha não encontrada' });
      }

      await password.destroy();
      
      logger.info(`Senha ${id} excluída na empresa ${companyId}`);
      
      return res.status(204).send();
    } catch (error) {
      logger.error('Erro ao excluir senha:', error);
      return res.status(500).json({ error: 'Erro ao excluir senha' });
    }
  }

  async export(req: Request, res: Response) {
    try {
      const { employerId } = req.query;
      const companyId = req.user.companyId;

      const where: any = { companyId };
      if (employerId) where.employerId = employerId;

      const passwords = await EmployerPassword.findAll({
        where,
        include: [
          {
            model: ContactEmployer,
            as: 'employer',
            attributes: ['name'],
            required: false
          },
          {
            model: User,
            as: 'creator',
            attributes: ['name'],
            required: false
          }
        ],
        attributes: ['application', 'url', 'username', 'notes', 'tag', 'createdAt'],
      });

      const csvWriter = createObjectCsvWriter({
        path: path.resolve(__dirname, '../temp/passwords.csv'),
        header: [
          { id: 'employer.name', title: 'Empregador' },
          { id: 'creator.name', title: 'Criado por' },
          { id: 'application', title: 'Aplicação' },
          { id: 'url', title: 'URL' },
          { id: 'username', title: 'Usuário' },
          { id: 'notes', title: 'Notas' },
          { id: 'tag', title: 'Tag' },
          { id: 'createdAt', title: 'Data de Criação' },
        ],
      });

      await csvWriter.writeRecords(passwords);

      logger.info(`Exportação de senhas realizada para empresa ${companyId}`);

      res.download(
        path.resolve(__dirname, '../temp/passwords.csv'),
        'senhas.csv',
        (err) => {
          if (err) {
            logger.error('Erro ao baixar arquivo:', err);
            return res.status(500).json({ error: 'Erro ao exportar senhas' });
          }
        }
      );
    } catch (error) {
      logger.error('Erro ao exportar senhas:', error);
      return res.status(500).json({ error: 'Erro ao exportar senhas' });
    }
  }
}

export default new PasswordController();