export const extractFileNameFromPath = (filePath: string): string | null => {
    const publicIndex = filePath?.indexOf('/public/');
    if (publicIndex !== -1) {
      return filePath?.slice(publicIndex + 8); // Adiciona 8 para compensar o comprimento de '/public/'
    } else {
      return filePath || ''; // Caso '/public/' não seja encontrado
    }
  }