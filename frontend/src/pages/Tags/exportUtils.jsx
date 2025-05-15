// utils/exportUtils.js
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const exportToExcel = (tags) => {
    // Prepara os dados para exportação
    const exportData = tags.map(tag => ({
        'Nome': tag.name,
        'Tickets': tag.tickets?.length || 0,
        'Kanban': tag.kanban ? 'Sim' : 'Não',
        'Cor': tag.color
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tags");
    XLSX.writeFile(wb, "tags.xlsx");
};

export const exportToPDF = (tags) => {
    const doc = new jsPDF();
    
    // Adiciona título
    doc.setFontSize(15);
    doc.text('Relatório de Tags', 14, 15);
    doc.setFontSize(10);
    
    // Prepara os dados para a tabela
    const tableColumn = ['Nome', 'Tickets', 'Kanban', 'Cor'];
    const tableRows = tags.map(tag => [
        tag.name,
        tag.tickets?.length || 0,
        tag.kanban ? 'Sim' : 'Não',
        tag.color
    ]);

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 25,
        styles: {
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak'
        },
        headerStyles: {
            fillColor: [66, 66, 66]
        }
    });

    doc.save('tags.pdf');
};

export const printTags = (tags) => {
    const printWindow = window.open('', '_blank');
    const html = `
        <html>
            <head>
                <title>Tags - Impressão</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; }
                    .tag-color { width: 20px; height: 20px; display: inline-block; border-radius: 4px; }
                    @media print {
                        .no-print { display: none; }
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>Relatório de Tags</h1>
                <div class="no-print">
                    <button onclick="window.print()">Imprimir</button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Tickets</th>
                            <th>Kanban</th>
                            <th>Cor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tags.map(tag => `
                            <tr>
                                <td>${tag.name}</td>
                                <td>${tag.tickets?.length || 0}</td>
                                <td>${tag.kanban ? 'Sim' : 'Não'}</td>
                                <td>
                                    <div class="tag-color" style="background-color: ${tag.color}"></div>
                                    ${tag.color}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
        </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
};