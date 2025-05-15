import api from './api';

export const listMessageRules = async (params) => {
  const { searchParam, pageNumber, pageSize, active } = params;
  let url = '/message-rules?';
  
  if (searchParam) url += `searchParam=${searchParam}&`;
  if (pageNumber) url += `pageNumber=${pageNumber}&`;
  if (pageSize) url += `pageSize=${pageSize}&`;
  if (active !== undefined) url += `active=${active}&`;
  
  return api.get(url);
};

export const getMessageRule = async (id) => {
  return api.get(`/message-rules/${id}`);
};

export const createMessageRule = async (data) => {
  return api.post('/message-rules', data);
};

export const updateMessageRule = async (id, data) => {
  return api.put(`/message-rules/${id}`, data);
};

export const deleteMessageRule = async (id) => {
  return api.delete(`/message-rules/${id}`);
};

export const toggleMessageRuleActive = async (id, active) => {
  return api.patch(`/message-rules/${id}/toggle-active`, { active });
};