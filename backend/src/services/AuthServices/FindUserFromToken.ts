import { verify } from "jsonwebtoken";
import ShowUserService from "../UserServices/ShowUserService";
import { getJwtConfig } from "../../config/auth";
import User from "../../models/User";

interface RefreshTokenPayload {
  id: string;
  tokenVersion: number;
  companyId: number;
}

export default async function FindUserFromToken(token: string): Promise<User> {
    const decoded = verify(token, (await getJwtConfig()).refreshSecret);
    const { id } = decoded as RefreshTokenPayload;
    const user = await ShowUserService(id);
    return user;
}