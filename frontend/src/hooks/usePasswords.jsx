// usePasswords.jsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '../helpers/toast';
import { passwordService } from '../services/passwordService';

export const usePasswords = () => {
  const queryClient = useQueryClient();

  const usePasswordsQuery = (params = {}) => {
    return useQuery(
      ['passwords', params],
      () => passwordService.list(params),
      {
        keepPreviousData: true,
        staleTime: 30000,
        retry: 1,
        onError: (error) => {
          console.error('Erro ao buscar senhas:', error);
          toast.error(`Erro ao carregar senhas: ${error.message}`);
        }
      }
    );
  };

  const createPassword = useMutation(
    (data) => passwordService.create(data),
    {
      onSuccess: () => {
        toast.success('Senha criada com sucesso!');
        queryClient.invalidateQueries('passwords');
      },
      onError: (error) => {
        toast.error(`Erro ao criar senha: ${error.message}`);
        throw error;
      }
    }
  );

  const updatePassword = useMutation(
    ({ id, data }) => passwordService.update(id, data),
    {
      onSuccess: () => {
        toast.success('Senha atualizada com sucesso!');
        queryClient.invalidateQueries('passwords');
      },
      onError: (error) => {
        toast.error(`Erro ao atualizar senha: ${error.message}`);
        throw error;
      }
    }
  );

  const deletePassword = useMutation(
    (id) => passwordService.delete(id),
    {
      onSuccess: () => {
        toast.success('Senha excluída com sucesso!');
        queryClient.invalidateQueries('passwords');
      },
      onError: (error) => {
        toast.error(`Erro ao excluir senha: ${error.message}`);
        throw error;
      }
    }
  );

  const exportPasswords = useMutation(
    (employerId) => passwordService.export(employerId),
    {
      onSuccess: () => {
        toast.success('Senhas exportadas com sucesso!');
      },
      onError: (error) => {
        toast.error(`Erro ao exportar senhas: ${error.message}`);
        throw error;
      }
    }
  );

  return {
    usePasswordsQuery,
    createPassword,
    updatePassword,
    deletePassword,
    exportPasswords
  };
};

export default usePasswords;