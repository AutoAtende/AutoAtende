import { verify } from "jsonwebtoken";
import { Response as Res } from "express";
import { SafeUser, SerializedUser } from "../../@types/User";
import User from "../../models/User";
import AppError from "../../errors/AppError";
import ShowUserService from "../UserServices/ShowUserService";
import { getJwtConfig } from "../../config/auth";
import { SerializeUser } from "../../helpers/SerializeUser";
import { createAccessToken, createRefreshToken } from "../../helpers/CreateTokens";

interface RefreshTokenPayload {
  id: string;
  tokenVersion: number;
  companyId: number;
}

interface Response {
  user: SerializedUser;
  newToken: string;
  refreshToken: string;
}

export const RefreshTokenService = async (
  res: Res,
  token: string
): Promise<Response> => {
  try {
    const decoded = verify(token, (await getJwtConfig()).refreshSecret);
    const { id, tokenVersion } = decoded as RefreshTokenPayload;

    const user = await ShowUserService(id);
    if (!user) { 
      throw new AppError("ERR_USER_NOT_FOUND", 404);
    }

    if (user.tokenVersion !== tokenVersion) {
      res.clearCookie("jrt");
      throw new AppError("ERR_SESSION_EXPIRED", 401);
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

    const newToken = await createAccessToken(safeUser);
    const refreshToken = await createRefreshToken(safeUser);
    const serializedUser = await SerializeUser(user);

    return { user: serializedUser, newToken, refreshToken };
  } catch (err) {
    res.clearCookie("jrt");
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }
};