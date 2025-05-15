// utils/exportUtils.js
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Função auxiliar para formatar os dados
const formatTicketData = (tickets) => {
    return tickets.map(ticket => ({
        'ID': ticket.ticket?.id || '',
        'Conexão': ticket.whatsapp?.name || '',
        'Cliente': ticket.ticket?.contact?.name || '',
        'Atendente': ticket.user?.name || '',
        'Fila': ticket.ticket?.queue?.name || 'Sem Fila',
        'Status': getStatusLabel(ticket.ticket?.status),
        'Data Abertura': ticket.createdAt ? format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '',
        'Data Fechamento': ticket.finishedAt ? format(new Date(ticket.finishedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'Em Aberto',
        'Motivo': ticket.ticket?.reason?.name || '',
        'Tags': ticket.ticket?.tags?.map(tag => tag.name).join(', ') || ''
    }));
};

// Função auxiliar para obter o label do status
const getStatusLabel = (status) => {
    const statusMap = {
        open: 'Aberto',
        pending: 'Pendente',
        closed: 'Fechado',
        group: 'Grupo'
    };
    return statusMap[status] || status;
};

// Exportação para Excel
export const exportToExcel = (tickets) => {
    try {
        const formattedData = formatTicketData(tickets);
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        
        // Ajusta a largura das colunas
        const colWidths = [
            { wch: 8 },  // ID
            { wch: 20 }, // Conexão
            { wch: 30 }, // Cliente
            { wch: 25 }, // Atendente
            { wch: 20 }, // Fila
            { wch: 15 }, // Status
            { wch: 20 }, // Data Abertura
            { wch: 20 }, // Data Fechamento
            { wch: 25 }, // Motivo
            { wch: 30 }  // Tags
        ];
        worksheet['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório de Atendimentos');
        XLSX.writeFile(workbook, `relatorio-atendimentos-${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
        
        return true;
    } catch (error) {
        console.error('Erro ao exportar para Excel:', error);
        throw new Error('Não foi possível gerar o arquivo Excel');
    }
};

// Exportação para PDF
export const exportToPDF = (tickets) => {
    try {
        const formattedData = formatTicketData(tickets);
        const doc = new jsPDF();

        // Configuração do cabeçalho
        doc.setFontSize(16);
        doc.text('Relatório de Atendimentos', 14, 15);
        doc.setFontSize(10);
        doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 14, 25);

        // Configuração da tabela
        doc.autoTable({
            startY: 35,
            head: [Object.keys(formattedData[0])],
            body: formattedData.map(Object.values),
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [51, 122, 183] },
            columnStyles: {
                0: { cellWidth: 15 },  // ID
                1: { cellWidth: 25 },  // Conexão
                2: { cellWidth: 35 },  // Cliente
                3: { cellWidth: 25 },  // Atendente
                4: { cellWidth: 25 },  // Fila
                5: { cellWidth: 20 },  // Status
                6: { cellWidth: 25 },  // Data Abertura
                7: { cellWidth: 25 }   // Data Fechamento
            }
        });

        doc.save(`relatorio-atendimentos-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
        
        return true;
    } catch (error) {
        console.error('Erro ao exportar para PDF:', error);
        throw new Error('Não foi possível gerar o arquivo PDF');
    }
};

// Exportação para CSV
export const exportToCSV = (tickets) => {
    try {
        const formattedData = formatTicketData(tickets);
        const headers = Object.keys(formattedData[0]).join(',');
        const rows = formattedData.map(row => Object.values(row).join(','));
        const csvContent = [headers, ...rows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `relatorio-atendimentos-${format(new Date(), 'dd-MM-yyyy')}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return true;
    } catch (error) {
        console.error('Erro ao exportar para CSV:', error);
        throw new Error('Não foi possível gerar o arquivo CSV');
    }
};

// Função para impressão
export const printReport = (tickets) => {
    try {
        const formattedData = formatTicketData(tickets);
        
        // Cria uma nova janela para impressão
        const printWindow = window.open('', '_blank');
        
        // Monta o HTML para impressão
        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Relatório de Atendimentos</title>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f5f5f5; }
                        .header { margin-bottom: 20px; }
                        @media print {
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>Relatório de Atendimentos</h2>
                        <p>Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                    </div>
                    <button class="no-print" onclick="window.print()">Imprimir</button>
                    <table>
                        <thead>
                            <tr>
                                ${Object.keys(formattedData[0]).map(header => `<th>${header}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${formattedData.map(row => `
                                <tr>
                                    ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `;
        
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        return true;
    } catch (error) {
        console.error('Erro ao gerar impressão:', error);
        throw new Error('Não foi possível gerar a visualização para impressão');
    }
};

export default {
    exportToExcel,
    exportToPDF,
    exportToCSV,
    printReport
};