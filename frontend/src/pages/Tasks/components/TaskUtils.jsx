import api from '../../../services/api';
import { toast } from "../../../helpers/toast";

export const handleApiError = (error) => {
  if (!error) return 'Erro desconhecido ao comunicar com o servidor.';
  
  if (error.response?.data?.details) {
    return error.response.data.details;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  return 'Erro ao comunicar com o servidor. Tente novamente.';
};

export const fetchTaskDetails = async (taskId) => {
  if (!taskId) return null;
  
  try {
    const response = await api.get(`/task/${taskId}`);
    return response.data;
  } catch (err) {
    const errorMessage = handleApiError(err);
    console.error('Erro ao buscar detalhes da tarefa:', errorMessage);
    toast.error(errorMessage);
    return null;
  }
};

export const formatFileSize = (bytes) => {
  if (bytes === 0 || !bytes) return '0 B';
  
  try {
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  } catch (error) {
    console.error('Erro ao formatar tamanho do arquivo:', error);
    return '? B';
  }
};

export const canPreview = (mimeType) => {
  if (!mimeType) return false;
  return mimeType.startsWith('image/') || mimeType === 'application/pdf';
};