// src/pages/EmailDashboard/hooks/useEmailAPI.js
import { useState, useCallback, useRef } from 'react';
import moment from 'moment';
import api from "../../../services/api";
import { i18n } from "../../../translate/i18n";
import { toast } from '../../../helpers/toast';

/**
 * Hook personalizado para gerenciar todas as operações de API relacionadas a emails
 * @param {Object} options - Opções de configuração
 * @param {Function} options.setIsLoading - Função para atualizar estado de carregamento
 * @returns {Object} Métodos e estados para interação com a API de emails
 */
const useEmailAPI = ({ setIsLoading }) => {
  const [sentEmails, setSentEmails] = useState([]);
  const [scheduledEmails, setScheduledEmails] = useState([]);
  
  // Referência para controlar requisições concorrentes
  const pendingRequests = useRef({});

  /**
   * Carrega emails enviados e agendados
   */
  const loadEmails = useCallback(async () => {
    if (pendingRequests.current.loadEmails) return;
    pendingRequests.current.loadEmails = true;
    
    if (setIsLoading) setIsLoading(true);
    try {
      const [sentResponse, scheduledResponse] = await Promise.all([
        api.get('/email/list'),
        api.get('/email/list/schedules')
      ]);
      
      // Verificar se os dados são arrays antes de chamar .map
      const processedSentEmails = Array.isArray(sentResponse.data) 
        ? sentResponse.data.map(email => ({
            ...email,
            sentAt: email.sentAt ? new Date(email.sentAt) : null,
            sendAt: email.sendAt ? new Date(email.sendAt) : null,
          }))
        : [];
      
      const processedScheduledEmails = Array.isArray(scheduledResponse.data)
        ? scheduledResponse.data.map(email => ({
            ...email,
            sentAt: email.sentAt ? new Date(email.sentAt) : null,
            sendAt: email.sendAt ? new Date(email.sendAt) : null,
          }))
        : [];
      
      setSentEmails(processedSentEmails);
      setScheduledEmails(processedScheduledEmails);
    } catch (error) {
      console.error('Erro ao carregar emails:', error);
      toast.error(i18n.t('email.errors.loadEmails'));
    } finally {
      if (setIsLoading) setIsLoading(false);
      delete pendingRequests.current.loadEmails;
    }
  }, [setIsLoading]);

  /**
   * Envia um email imediatamente
   * @param {Object} values - Dados do email
   */
  const sendEmail = useCallback(async (values) => {
    if (setIsLoading) setIsLoading(true);
    try {
      const senderEmails = values.sender.split(',').map(email => email.trim());
      
      for (const email of senderEmails) {
        const payload = {
          email,
          assunto: values.subject,
          mensagem: values.message,
        };
        
        await api.post('/email/send', payload);
      }
      
      toast.success(i18n.t('success.emailSent'));
      await loadEmails();
      return true;
    } catch (error) {
      console.error("Erro na API:", error);
      toast.error(i18n.t('email.errors.apiError'));
      return false;
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  }, [setIsLoading, loadEmails]);

  /**
   * Agenda um email para envio futuro
   * @param {Object} values - Dados do email
   */
  const scheduleEmail = useCallback(async (values) => {
    if (setIsLoading) setIsLoading(true);
    try {
      const senderEmails = values.sender.split(',').map(email => email.trim());
      
      for (const email of senderEmails) {
        const payload = {
          email,
          assunto: values.subject,
          mensagem: values.message,
        };
        
        if (values.sendAt) {
          payload.sendAt = moment(values.sendAt).format('YYYY-MM-DDTHH:mm');
        }
        
        await api.post('/email/scheduleAdd', payload);
      }
      
      toast.success(i18n.t('success.emailScheduled'));
      await loadEmails();
      return true;
    } catch (error) {
      console.error("Erro na API:", error);
      toast.error(i18n.t('email.errors.apiError'));
      return false;
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  }, [setIsLoading, loadEmails]);

  /**
   * Cancela um email agendado
   * @param {number} emailId - ID do email
   */
  const cancelScheduledEmail = useCallback(async (emailId) => {
    if (setIsLoading) setIsLoading(true);
    try {
      await api.post(`/email/cancel/${emailId}`);
      toast.success(i18n.t('success.emailCancelled'));
      await loadEmails();
      return true;
    } catch (error) {
      console.error("Erro ao cancelar email:", error);
      toast.error(i18n.t('email.errors.cancelError'));
      return false;
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  }, [setIsLoading, loadEmails]);

  /**
   * Reagenda um email
   * @param {number} emailId - ID do email
   * @param {Date} newDate - Nova data de envio
   */
  const rescheduleMail = useCallback(async (emailId, newDate) => {
    if (setIsLoading) setIsLoading(true);
    try {
      await api.post(`/email/reschedule/${emailId}`, {
        sendAt: moment(newDate).format('YYYY-MM-DDTHH:mm')
      });
      toast.success(i18n.t('success.emailRescheduled'));
      await loadEmails();
      return true;
    } catch (error) {
      console.error("Erro ao reagendar email:", error);
      toast.error(i18n.t('email.errors.rescheduleError'));
      return false;
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  }, [setIsLoading, loadEmails]);

  /**
   * Exporta emails para PDF
   * @param {Array} emails - Lista de emails para exportar
   */
  const exportEmailsToPdf = useCallback(async (emails) => {
    try {
      // Esta função pode ser implementada com bibliotecas como jsPDF
      // ou através de uma API backend que gere o PDF
      // Por enquanto, retornamos apenas os dados formatados
      return emails;
    } catch (error) {
      console.error("Erro ao exportar emails:", error);
      toast.error(i18n.t('email.errors.exportError'));
      return null;
    }
  }, []);

  return {
    sentEmails,
    scheduledEmails,
    loadEmails,
    sendEmail,
    scheduleEmail,
    cancelScheduledEmail,
    rescheduleMail,
    exportEmailsToPdf
  };
};

export default useEmailAPI;