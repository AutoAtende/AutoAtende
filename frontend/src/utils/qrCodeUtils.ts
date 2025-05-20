import QRCode from 'qrcode';

/**
 * Gera um QR Code para uma URL
 * @param url URL para a qual o QR Code será gerado
 * @param options Opções de configuração do QR Code
 * @returns Promise com o QR Code em base64
 */
export const generateQRCode = async (
  url: string,
  options: {
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H',
    size?: number,
    margin?: number,
    color?: {
      dark?: string,
      light?: string
    }
  } = {}
): Promise<string> => {
  const defaultOptions = {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 300,
    margin: 4,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  };

  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    const qrCode = await QRCode.toDataURL(url, mergedOptions);
    return qrCode;
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    throw new Error('Falha ao gerar QR Code');
  }
};

/**
 * Salva um QR Code como arquivo em disco
 * @param url URL para a qual o QR Code será gerado
 * @param filePath Caminho do arquivo onde o QR Code será salvo
 * @param options Opções de configuração do QR Code
 * @returns Promise que resolve quando o arquivo for salvo
 */
export const saveQRCodeToFile = async (
  url: string,
  filePath: string,
  options?: any
): Promise<void> => {
  try {
    await QRCode.toFile(filePath, url, options);
  } catch (error) {
    console.error('Erro ao salvar QR Code em arquivo:', error);
    throw new Error('Falha ao salvar QR Code em arquivo');
  }
};