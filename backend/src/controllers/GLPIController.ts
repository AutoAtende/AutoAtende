import { Request, Response } from "express";
import User from "../models/User";
import * as buffer from 'buffer';
import axios, { AxiosInstance, AxiosResponse } from "axios";
import Setting from "../models/Setting";
import { logger } from "../utils/logger";

type IndexQuery = {
  workspaceId: string;
};


function encodeToBase64(username: string, password: string): string {
  // Concatenando o nome de usuário e senha com um separador
  const authString = `${username}:${password}`;
  
  // Criando um buffer a partir da string de autenticação
  const bufferObj = buffer.Buffer.from(authString, 'utf8');

  // Codificando o buffer em Base64
  const base64Encoded = bufferObj.toString('base64');

  return base64Encoded;
}

const apiBuilder = async (companyId: number, base64Password: string): Promise<AxiosInstance> => { 
  try {
    const SettingApiGlpi = await Setting.findOne({
      where: {
        key: "urlApiGlpi",
        companyId
       }
    });
    const SettingAppTokenGlpi = await Setting.findOne({
      where: {
        key: "appTokenGlpi",
        companyId
       }
    });
  
    const urlApiGlpi = SettingApiGlpi.value;
    const app_token = SettingAppTokenGlpi.value;
  
    return axios.create({
      baseURL: `${urlApiGlpi}`,
      withCredentials: true,
      headers: {
        Authorization: `Basic ${base64Password}`,
        'App-Token': `${app_token}`,
        Accept: "application/json"
      }
    });
  } catch (error) {
    throw new Error('ERR_AUTHENTICATION_DATA_SEND_GLPI_ERROR')
  }
}

const apiBuilderV2 = async (companyId,sessionToken): Promise<AxiosInstance> => {
  const SettingApiGlpi = await Setting.findOne({
    where: {
      key: "urlApiGlpi",
      companyId
     }
  });
  const SettingAppTokenGlpi = await Setting.findOne({
    where: {
      key: "appTokenGlpi",
      companyId
     }
  });

  const urlApiGlpi = SettingApiGlpi.value;
  const app_token = SettingAppTokenGlpi.value;

  return axios.create({
    baseURL: `${urlApiGlpi}`,
    withCredentials: true,
    headers: {
      'Session-Token': `${sessionToken}`,
      'App-Token': `${app_token}`,
      Accept: "application/json"
    }
  });
}

const apiBuilderV3 = async (companyId): Promise<AxiosInstance> => {
  const SettingApiGlpi = await Setting.findOne({
    where: {
      key: "urlApiGlpi",
      companyId
     }
  });
  const SettingAppTokenGlpi = await Setting.findOne({
    where: {
      key: "appTokenGlpi",
      companyId
     }
  });
  const SettingAppTokenMaster = await Setting.findOne({
    where: {
      key: "tokenMasterGlpi",
      companyId
     }
  });

  const urlApiGlpi = SettingApiGlpi.value;
  const app_token = SettingAppTokenGlpi.value;
  const superAdminToken = SettingAppTokenMaster.value;

  return axios.create({
    baseURL: `${urlApiGlpi}`,
    withCredentials: true,
    headers: {
      Authorization: `user_token ${superAdminToken}`,
      'App-Token': `${app_token}`,
      Accept: "application/json"
    }
  });
}

export const authUser = async (req: Request, res: Response): Promise<Response> => {
  const { id, companyId } = req.user;

  try {
    let username = null;
    let password = null;

    const filterUser = await User.findByPk(id, {
      attributes:['glpiUser', 'glpiPass']
    });

    if (filterUser.glpiUser && filterUser.glpiPass && filterUser.glpiPass !== null && filterUser.glpiUser !== null) {
      username = filterUser.glpiUser;
      password = filterUser.glpiPass;

      const encodedCredentials = encodeToBase64(username, password);

      if (encodedCredentials) {
        const initSession = await apiBuilder(companyId, encodedCredentials);
        // Verificando se a requisição foi bem-sucedida
        const response = await initSession.get('/initSession');
        try {
          if (response && response.status === 200) {
            const sessionToken = response?.data?.session_token;
            return res.json({ success: true, sessionToken }); // Retornando o sessionToken para o frontend
          }
        } catch (error) {
          return res.status(500).json({ error: error?.message });
        }
      }
    }
  } catch (error) {
    logger.error(error?.code);
    let message = ''
    if (error?.code === 'ERR_INVALID_URL') {
      message = 'ERR_INVALID_URL'
    } else {
      message = error?.message
    }
    return res.status(500).json({ error: message });
  }

  return res.json({ success: true });
};


export const creatTicket = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { title, message, sessionToken, status } = req.body;
  try {
    const initSession = await apiBuilderV2(companyId, sessionToken);
    if (initSession) {
      const jsonMessage = {
        "input": {
          "name": `${title}`,
          "content": `${message}`,
          "urgency": status
        }
      };
      const response = await initSession.post('/Ticket', jsonMessage);
      if (response && response.status === 201) {
        const idTicket = response.data.id;
        const pushTicket = await initSession.get(`/Ticket/${idTicket}`);
        if (pushTicket && pushTicket.status === 200) {
          const idUser = pushTicket.data.users_id_lastupdater;
          if (idUser) {
            const infoAtt = {
              "input": {
                "_users_id_requester": idUser
              }
            };
            const newSessionAtt = await apiBuilderV3(companyId)
            const response2 = await newSessionAtt.get('/initSession');
            if(response2 && response2?.status === 200){
              const sessionToken = response2?.data?.session_token;
              if(sessionToken && sessionToken !== undefined){
                const initSession = await apiBuilderV2(companyId, sessionToken);
                const updateTicket = await initSession.patch(`/Ticket/${idTicket}`, infoAtt);
                if (updateTicket && updateTicket.status === 200) {
                  return res.status(200).json({ success: true });
                }
              }
            }
          }
        }
      }
    }
    return res.status(500).json({ error: "ERR_INTERNAL_SERVER_ERROR" });
  } catch (error) {
    logger.error("Erro ao criar ou atualizar ticket GLPI:", error);
    return res.status(500).json({ error: "ERR_INTERNAL_SERVER_ERROR" });
  }
};