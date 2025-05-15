import { useState } from 'react';
import api from '../services/api';

const useContactProfilePic = (contactNumber) => {
  const [loading, setLoading] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [error, setError] = useState(null);

  const updateProfilePic = async () => {
    if (!contactNumber || loading) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const formattedNumber = contactNumber.replace(/\D/g, "");
      const { data } = await api.get(`/contacts/profile-pic/${formattedNumber}`);
      
      if (data && data.profilePicUrl) {
        setProfilePicUrl(data.profilePicUrl);
      }
      
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erro ao atualizar foto de perfil';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    profilePicUrl,
    updateProfilePic,
    error
  };
};

export default useContactProfilePic;