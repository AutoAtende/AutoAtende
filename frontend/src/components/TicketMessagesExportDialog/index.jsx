import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogActions } from "@mui/material";
import html2pdf from "html2pdf.js";
import { i18n } from "../../translate/i18n";
import { useLoading } from "../../hooks/useLoading";
import { toast } from "../../helpers/toast";

export default function TicketMessagesExportDialog({ open, handleClose, ticketId }) {
  const [exportedToPDF, setExportedToPDF] = useState(false);
  const { Loading } = useLoading();

  const handleExportToPDF = () => {
    try {
      Loading?.turnOn();
      const messagesListElement = document.getElementById("messagesList");
      const headerElement = document.getElementById("TicketHeader");

      if (!messagesListElement || !headerElement) {
        throw new Error("Elementos necessários não encontrados para exportar.");
      }

      const containerElement = document.createElement("div");
      containerElement.style.padding = "20px";
      containerElement.style.fontFamily = "Arial, sans-serif";

      // Ajuste do cabeçalho
      const headerClone = headerElement.cloneNode(true);
      headerClone.style.marginBottom = "10px";
      headerClone.style.padding = "10px";
      headerClone.style.border = "1px solid #ddd";
      headerClone.style.borderRadius = "4px";
      containerElement.appendChild(headerClone);

      // Ajustes das mensagens
      const messagesListClone = messagesListElement.cloneNode(true);
      messagesListClone.style.wordBreak = "break-word";
      
      // Ajusta o estilo das mensagens individuais
      const messageItems = messagesListClone.querySelectorAll('.message-item');
      messageItems.forEach(item => {
        item.style.marginBottom = "10px";
        item.style.padding = "10px";
        item.style.border = "1px solid #eee";
        item.style.borderRadius = "4px";
        
        // Ajusta o alinhamento da hora
        const timeElement = item.querySelector('.message-time');
        if (timeElement) {
          timeElement.style.float = 'right';
          timeElement.style.marginLeft = '10px';
        }
      });

      containerElement.appendChild(messagesListClone);

      const pdfOptions = {
        margin: [10, 10, 10, 10],
        filename: `relatório_atendimento_${ticketId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          logging: false, 
          dpi: 192, 
          letterRendering: true,
          useCORS: true,
          scrollY: -window.scrollY // Captura a página inteira, incluindo o cabeçalho
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      html2pdf().from(containerElement).set(pdfOptions).save().then(() => {
        setExportedToPDF(true);
        handleClose();
      });

    } catch (error) {
      toast.error(error.message);
    } finally {
      Loading?.turnOff();
    }
  };

  useEffect(() => {
    if (open && !exportedToPDF) {
      handleExportToPDF();
    }
  }, [open, exportedToPDF]);

  return (
    <Dialog maxWidth="md" onClose={handleClose} open={open}>
      <DialogActions>
        <Button onClick={handleExportToPDF} color="primary">
          {i18n.t('ticket.actionButtons.exportPDF')}
        </Button>
        <Button onClick={handleClose} color="primary">
          {i18n.t('ticket.actionButtons.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}