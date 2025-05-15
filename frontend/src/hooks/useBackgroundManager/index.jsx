import { useCallback } from "react";
import api from "../../services/api";
import { toast } from "../../helpers/toast";
import { i18n } from "../../translate/i18n";

// Função de utilidade para remover o caminho do nome do arquivo
const removePathName = (filename) => {
  if (!filename) return "";
  const parts = filename.split("/");
  return parts[parts.length - 1];
};

const useBackgroundManager = (settingsLoaded, currentUser, handleSaveSetting) => {

  const uploadBackground = useCallback(
    async (e, page) => {
      if (!e.target.files || !e.target.files[0]) return;
  
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("page", page);
  
      try {
        const response = await api.post("/settings/background", formData);
        const backgroundUrl = response.data;
        
        // Cria a chave correta para o background
        const settingKey = `${page}Background`;
        
        // Atualiza o setting
        await handleSaveSetting(settingKey, backgroundUrl);
  
        toast.success(i18n.t("whitelabel.success.backgroundUpdated"));
        
        // Força recarregamento da imagem
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (err) {
        console.error("Error uploading background:", err);
        toast.error(i18n.t("whitelabel.errors.backgroundUploadFailed"));
      }
    },
    [handleSaveSetting]
  );

  const deleteBackground = useCallback(
    async (filename, imageKey) => {
      try {
        await api.delete(`/settings/backgrounds/${removePathName(filename)}`);
        await handleSaveSetting(imageKey, "");
        toast.success(i18n.t("whitelabel.success.backgroundDeleted"));
      } catch (err) {
        console.error("Error deleting background:", err);
        toast.error(i18n.t("whitelabel.errors.backgroundDeleteFailed"));
      }
    },
    [handleSaveSetting]
  );

  return { uploadBackground, deleteBackground };
};

export default useBackgroundManager;