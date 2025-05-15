import { Request, Response, NextFunction } from 'express';
//import { CompanySchema } from '../../validators/api/CompanyValidators';
import Company from "../../models/Company";

/**
 * Cria uma nova empresa com os dados fornecidos.
 *
 * @param req - Requisição do Express, contendo o corpo da solicitação com os dados da empresa.
 * @param res - Resposta do Express, usada para enviar a resposta ao cliente.
 * @param next - Função de callback do Express para passar erros para o middleware de tratamento de erros.
 */
export const createCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Valida os dados da empresa fornecidos no corpo da requisição
    //await CompanySchema.validate(req.body, { abortEarly: false });

    // Cria a nova empresa no banco de dados
    const newCompany = await Company.create(req.body);

    // Responde com uma mensagem de sucesso
    res.status(200).json({ message: 'Empresa criada com sucesso' });
  } catch (error) {
    // Se o erro for de validação, responde com os erros de validação
    if (error.name === 'ValidationError') {
      return res.status(400).json({ errors: error.errors });
    }
    // Passa o erro para o middleware de tratamento de erros
    next(error);
  }
};

/**
 * Atualiza os dados da empresa especificada pelo ID.
 *
 * @param req - Requisição do Express, contendo os parâmetros de URL e o corpo com os dados atualizados da empresa.
 * @param res - Resposta do Express, usada para enviar a resposta ao cliente.
 * @param next - Função de callback do Express para passar erros para o middleware de tratamento de erros.
 */
export const updateCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Valida os dados da empresa fornecidos no corpo da requisição
    //await CompanySchema.validate(req.body);

    const { id } = req.params;
    // Atualiza a empresa no banco de dados
    const [updated] = await Company.update(req.body, { where: { id } });

    if (updated) {
      // Se a empresa for atualizada, busca e retorna os dados atualizados
      const updatedCompany = await Company.findByPk(id);
      res.status(200).json(updatedCompany);
    } else {
      // Se a empresa não for encontrada, responde com um erro 404
      res.status(404).json({ error: 'Company not found' });
    }
  } catch (error) {
    // Se o erro for de validação, responde com os erros de validação
    if (error.name === 'ValidationError') {
      return res.status(400).json({ errors: error.errors });
    }
    // Passa o erro para o middleware de tratamento de erros
    next(error);
  }
};

/**
 * Bloqueia a empresa especificada pelo ID, definindo o status como `false`.
 *
 * @param req - Requisição do Express, contendo os parâmetros de URL com o ID da empresa a ser bloqueada.
 * @param res - Resposta do Express, usada para enviar a resposta ao cliente.
 * @param next - Função de callback do Express para passar erros para o middleware de tratamento de erros.
 */
export const blockCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Valida os dados fornecidos no corpo da requisição (não são necessários para esta função, mas são verificados por segurança)
    //await CompanySchema.validate(req.body);

    const id = req.params?.id || req.body?.companyId;
    // Atualiza o status da empresa para `false` no banco de dados
    const [updated] = await Company.update({ status: false }, { where: { id } });

    if (updated) {
      // Se a empresa for atualizada, busca e retorna os dados bloqueados
      const blockedCompany = await Company.findByPk(id);
      res.status(200).json(blockedCompany);
    } else {
      // Se a empresa não for encontrada, responde com um erro 404
      res.status(404).json({ error: 'Company not found' });
    }
  } catch (error) {
    // Passa o erro para o middleware de tratamento de erros
    next(error);
  }
};
