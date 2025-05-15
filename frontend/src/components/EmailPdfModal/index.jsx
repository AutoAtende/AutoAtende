import React, { useState, useEffect, useCallback } from "react";
import {
  TextField,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";
import {
  Send as SendIcon,
  Cancel as CancelIcon,
  PictureAsPdf as PdfIcon,
  Mail as MailIcon
} from '@mui/icons-material';
import html2pdf from "html2pdf.js";
import { i18n } from "../../translate/i18n";
import { useLoading } from "../../hooks/useLoading";
import { toast } from "../../helpers/toast";
import api from "../../services/api";
import BaseModal from "../shared/BaseModal";

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

export default function EmailPdfModal({ open, handleClose, ticketId, onSend }) {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [pdfBlob, setPdfBlob] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { Loading } = useLoading();

  const resetForm = () => {
    setEmail("");
    setSubject("");
    setMessage("");
    setPdfBlob(null);
  };

  const generatePDF = useCallback(async () => {
    if (isGeneratingPDF) return;
    setIsGeneratingPDF(true);

    try {
      const messagesListElement = document.getElementById("messagesList");
      const headerElement = document.getElementById("TicketHeader");

      if (!messagesListElement || !headerElement) {
        throw new Error(i18n.t("ticket.pdfExport.elementsNotFound"));
      }
    
          const containerElement = document.createElement("div");
          containerElement.style.padding = "20px";
          containerElement.style.fontFamily = "Arial, sans-serif";
          containerElement.style.color = "#000"; // Garantir texto preto
          containerElement.style.background = "#fff"; // Garantir fundo branco
    
          // Clone e estiliza o cabeçalho
          const headerClone = headerElement.cloneNode(true);
          headerClone.style.marginBottom = "20px";
          headerClone.style.padding = "15px";
          headerClone.style.border = "1px solid #ddd";
          headerClone.style.borderRadius = "4px";
          headerClone.style.background = "#f9f9f9";
          containerElement.appendChild(headerClone);
    
          // Clone e estiliza a lista de mensagens
          const messagesListClone = messagesListElement.cloneNode(true);
          messagesListClone.style.wordBreak = "break-word";
          
          // Processa cada mensagem individualmente
          const messageItems = messagesListClone.querySelectorAll(".message-item");
          messageItems.forEach(item => {
            item.style.marginBottom = "15px";
            item.style.padding = "12px";
            item.style.border = "1px solid #eee";
            item.style.borderRadius = "4px";
            item.style.background = "#fff";
            
            // Estiliza o timestamp
            const timeElement = item.querySelector(".message-time");
            if (timeElement) {
              timeElement.style.float = "right";
              timeElement.style.color = "#666";
              timeElement.style.fontSize = "0.85em";
            }
    
            // Garante que as imagens têm tamanho máximo
            const images = item.querySelectorAll("img");
            images.forEach(img => {
              img.style.maxWidth = "100%";
              img.style.height = "auto";
            });
    
            // Garante que os links são visíveis
            const links = item.querySelectorAll("a");
            links.forEach(link => {
              link.style.color = "#0066cc";
              link.style.textDecoration = "underline";
            });
          });
    
          containerElement.appendChild(messagesListClone);
    
          const pdfOptions = {
            margin: [20, 20, 20, 20],
            filename: `atendimento_${ticketId}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { 
              scale: 2,
              logging: false,
              dpi: 192,
              letterRendering: true,
              useCORS: true,
              scrollY: -window.scrollY,
              backgroundColor: "#FFF"
            },
            jsPDF: { 
              unit: "mm", 
              format: "a4", 
              orientation: "portrait",
              compress: true
            },
            pagebreak: { mode: ["avoid-all", "css", "legacy"] }
          };
    
          const pdf = await html2pdf().from(containerElement).set(pdfOptions).outputPdf("blob");
          
          if (pdf.size > MAX_PDF_SIZE) {
            throw new Error(i18n.t("ticket.pdfExport.fileTooLarge"));
          }    
      setPdfBlob(pdf);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error(error.message || i18n.t("ticket.pdfExport.generationError"));
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (open) {
      generatePDF();
    } else {
      resetForm();
    }
  }, [open, generatePDF]);

  const handleSendEmail = async () => {
    if (!email || !subject || !message || !pdfBlob) {
      toast.error(i18n.t("ticket.emailPdf.missingInfo"));
      return;
    }

    setIsSending(true);
    Loading?.turnOn();

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("subject", subject);
      formData.append("message", message);
      formData.append("pdfFile", new Blob([pdfBlob], { type: "application/pdf" }), `atendimento_${ticketId}.pdf`);

      await api.post(`/email/send-ticket-pdf/${ticketId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(i18n.t("ticket.emailPdf.success"));
      onSend?.();
      handleClose();
    } catch (error) {
      console.error("Erro ao enviar e-mail com PDF:", error);
      toast.error(error.response?.data?.error || i18n.t("ticket.emailPdf.error"));
    } finally {
      setIsSending(false);
      Loading?.turnOff();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendEmail();
    }
  };

  const modalActions = [
    {
      label: i18n.t("ticket.emailPdf.cancelButton"),
      onClick: handleClose,
      icon: <CancelIcon />,
      color: "inherit",
      disabled: isSending
    },
    {
      label: i18n.t("ticket.emailPdf.sendButton"),
      onClick: handleSendEmail,
      icon: <SendIcon />,
      variant: "contained",
      color: "primary",
      disabled: isGeneratingPDF || !pdfBlob || !email || !subject || !message || isSending,
      loading: isSending
    }
  ];

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title={i18n.t("ticket.emailPdf.title")}
      titleIcon={<MailIcon />}
      actions={modalActions}
      loading={isSending}
      maxWidth="sm"
      helpText={i18n.t("ticket.emailPdf.helpText")}
    >
      <Box sx={{ mt: 2 }}>
        <TextField
          autoFocus
          margin="dense"
          id="email"
          name="email"
          label={i18n.t("ticket.emailPdf.emailLabel")}
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSending}
          required
          onKeyPress={handleKeyPress}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          margin="dense"
          id="subject"
          name="subject"
          label={i18n.t("ticket.emailPdf.subjectLabel")}
          type="text"
          fullWidth
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={isSending}
          required
          onKeyPress={handleKeyPress}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          margin="dense"
          id="message"
          name="message"
          label={i18n.t("ticket.emailPdf.messageLabel")}
          multiline
          rows={4}
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isSending}
          required
          InputLabelProps={{ shrink: true }}
        />

        {isGeneratingPDF && (
          <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2" color="textSecondary">
              {i18n.t("ticket.pdfExport.generating")}
            </Typography>
          </Box>
        )}
      </Box>
    </BaseModal>
  );
}