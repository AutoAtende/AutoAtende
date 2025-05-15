import User from "../../models/User";

/**
 * Função para obter a versão do token do usuário com base no token fornecido.
 * Assumindo que o token é armazenado no campo `refreshToken` do usuário.
 *
 * @param token - O token para verificar a versão.
 * @returns A versão do token se encontrada, ou null se o usuário não for encontrado ou o token for inválido.
 */
const getTokenVersion = async (token: string): Promise<number | null> => {
  try {
    // Encontrar o usuário com base no token.
    // Supondo que o token seja armazenado em um campo `refreshToken` ou similar.
    const user = await User.findOne({
      where: {
        refreshToken: token // Ajustar se o campo for diferente
      }
    });

    // Retornar a versão do token se o usuário for encontrado.
    return user ? user.tokenVersion : null;
  } catch (error) {
    console.error("Error fetching token version:", error);
    return null;
  }
};

export default getTokenVersion;
