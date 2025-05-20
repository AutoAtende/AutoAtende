import User from "../../models/User";
import AppError from "../../errors/AppError";
import { createAccessToken, createRefreshToken } from "../../helpers/CreateTokens";
import { SerializeUser } from "../../helpers/SerializeUser";
import Queue from "../../models/Queue";
import Company from "../../models/Company";
import Setting from "../../models/Setting";
import { SafeUser, SerializedUser } from "../../@types/User";
import { emitAuthEvent } from "../../libs/socket"; // Importação da função emitAuthEvent
import { logger } from "../../utils/logger";

interface Request {
  email: string;
  password: string;
}

interface Response {
  serializedUser: SerializedUser;
  token: string;
  refreshToken: string;
}

const AuthUserService = async ({
  email,
  password
}: Request): Promise<Response> => {
  const user = await User.findOne({
    where: { email },
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ['id', 'name', 'color']
      }, 
      {
        model: Company,
        include: [{ 
          model: Setting,
          attributes: ['key', 'value']
        }]
      }
    ]
  });

  if (!user) {
    throw new Error("ERR_INVALID_CREDENTIALS");
  }

  const Hr = new Date();
  const hh: number = Hr.getHours() * 60 * 60;
  const mm: number = Hr.getMinutes() * 60;
  const hora = hh + mm;

  const inicio: string = user?.startWork;
  const hhinicio = Number(inicio.split(":")[0]) * 60 * 60;
  const mminicio = Number(inicio.split(":")[1]) * 60;
  const horainicio = hhinicio + mminicio;

  const termino: string = user?.endWork;
  const hhtermino = Number(termino.split(":")[0]) * 60 * 60;
  const mmtermino = Number(termino.split(":")[1]) * 60;
  const horatermino = hhtermino + mmtermino;

  if (hora < horainicio || hora > horatermino) {
    //throw new Error("ERR_OUT_OF_HOURS");
  }

  if (!(await user.checkPassword(password))) {
    throw new Error("ERR_INVALID_CREDENTIALS");
  }

  try {
    user.online = true;
    await user.save();
    await user.incrementTokenVersion();

    await Company.update(
      { lastLogin: new Date() },
      { where: { id: user.companyId } }
    );

  } catch (err) {
    throw new Error("ERR_TOKEN_VERSION_UPDATE_FAILED");
  }

  const safeUser: SafeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    companyId: user.companyId,
    super: user.super,
    tokenVersion: user.tokenVersion
  };

  const token = await createAccessToken(safeUser);
  const refreshToken = await createRefreshToken(safeUser);
  const serializedUser = await SerializeUser(user);

  // Emitir evento de autenticação para notificar outras sessões do mesmo usuário
  try {
    emitAuthEvent(user.companyId, user.id, {
      action: "login",
      user: {
        name: user.name,
        email: user.email,
        profile: user.profile
      },
      deviceInfo: {
        ip: "unknown", // Idealmente, capturar o IP real do cliente
        browser: "unknown", // Idealmente, capturar informações do navegador
        timestamp: new Date()
      }
    });
    
    logger.info(`Evento de autenticação emitido para usuário ${user.id}`);
  } catch (error) {
    logger.error(`Erro ao emitir evento de autenticação: ${error}`);
    // Continuamos com o login mesmo se houver falha na emissão do evento
  }

  console.log("Atualizando lastLogin para companyId:", user.companyId);

  try {
    const [affectedRows] = await Company.update(
      { lastLogin: new Date() },
      { where: { id: user.companyId } }
    );
    
    if (affectedRows === 0) {
      console.error("Nenhuma empresa encontrada com o ID:", user.companyId);
    } else {
      console.log("LastLogin atualizado com sucesso!");
    }
  } catch (error) {
    console.error("Erro ao atualizar a empresa:", error);
    // Opcional: Lançar AppError ou outro tratamento
  }

  return {
    serializedUser,
    token,
    refreshToken
  };
};

export default AuthUserService;