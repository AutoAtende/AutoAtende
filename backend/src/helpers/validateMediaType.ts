type MediaTypeResponse = {
  isValid: boolean
  type: string
}

export const isValidMediaType = (media: Express.Multer.File): MediaTypeResponse => {
  const validExtensions = [
    'jpg', 'jpeg', 'png', 'gif', 'webm',
    'mp4', '3gp', 'mkv', 'avi', 'mov', 'm4a',
    'aac', 'mp3', 'wav', 'ogg', 'cdr',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ovpn',
    'ppt', 'pptx', 'txt', 'csv', 'xml', 'pcap',
    'zip', 'rar', 'apk', 'json', 'mpeg', 'tar', 'pfx', 'crt'
  ];
  
  // Extrair a extensão do nome do arquivo
  const extensionMatch = media.originalname.match(/\.([^.]+)$/);
  const fileExtension = extensionMatch ? extensionMatch[1].toLowerCase() : '';
  
  // Verificar o tipo MIME e a extensão
  const isValidExtension = validExtensions.includes(fileExtension);
  
  return {
    isValid: isValidExtension,
    type: fileExtension
  };
};