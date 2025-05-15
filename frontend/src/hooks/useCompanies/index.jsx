import api from "../../services/api";

const useCompanies = () => {
    const save = async (data) => {
        const { data: responseData } = await api.request({
            url: '/companies',
            method: 'POST',
            data: {
                name: data.name,
                phone: data.phone,
                planId: data.planId,
                dueDate: data.dueDate,
                recurrence: data.recurrence,
                email: data.email,
                document: data.document,
                status: data.status || true
            }
        });
        return responseData;
    }

    const findAll = async () => {
        const { data } = await api.request({
            url: `/companies/basic/list`, // Nova rota
            method: 'GET'
        });
        return data;
    }

    const list = async () => {
        const { data } = await api.request({
            url: `/companies/basic/list`, // Nova rota
            method: 'GET'
        });
        return data;
    }

    const find = async (id) => {
        const { data } = await api.request({
            url: `/companies/${id}/details`, // Nova rota que inclui mais detalhes
            method: 'GET'
        });
        return data;
    }

    const update = async (data) => {
        const { data: responseData } = await api.request({
            url: `/companies/${data.id}/info`, // Nova rota
            method: 'PUT',
            data: {
                name: data.name,
                phone: data.phone,
                planId: data.planId,
                dueDate: data.dueDate,
                recurrence: data.recurrence,
                email: data.email,
                document: data.document,
                status: data.status
            }
        });
        return responseData;
    }

    const remove = async (id) => {
        const { data } = await api.request({
            url: `/companies/${id}`,
            method: 'DELETE'
        });
        return data;
    }

    const updateSchedules = async (data) => {
        try {
          const response = await api.put(`/companies/${data.id}/schedules`, {
            schedules: data.schedules
          });
          return response.data;
        } catch (error) {
          console.error(error);
          throw error;
        }
      };

    return {
        save,
        update,
        remove,
        list,
        find,
        findAll,
        updateSchedules
    }
}

export default useCompanies;