import { CookieOptions, Response } from "express";

export const SendRefreshToken = (res: Response, token: string): void => {
  const cookieOptions: CookieOptions = {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 dia em milissegundos
  };

  if (process.env.BACKEND_URL.startsWith("https:") ) {
    cookieOptions.sameSite = "none";
    cookieOptions.secure = true;
  } else {
    cookieOptions.sameSite = "lax"; // Para desenvolvimento, considere usar "lax" em vez de "none"
  }

  res.cookie("jrt", token, cookieOptions);
};
