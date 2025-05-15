import React, { useState } from 'react';
import { Button, CircularProgress, Typography, Box } from '@mui/material';
import { Description as DescriptionIcon, NavigateBefore, NavigateNext } from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';

// Importante: Configure o worker do PDF.js - adicione isso ao seu public/index.html
// <script src="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js"></script>
// Ou importe o worker diretamente:
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PdfPreview = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error) {
    console.error("Erro ao carregar PDF:", error);
    setError(true);
    setLoading(false);
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function previousPage() {
    if (pageNumber > 1) {
      changePage(-1);
    }
  }

  function nextPage() {
    if (pageNumber < numPages) {
      changePage(1);
    }
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          padding: 2,
          backgroundColor: '#f8f8f8',
          borderRadius: 1
        }}
      >
        <DescriptionIcon sx={{ fontSize: 48, color: '#777', mb: 1 }} />
        <Typography variant="subtitle1" gutterBottom>
          Não foi possível visualizar o PDF
        </Typography>
        <Button 
          variant="contained" 
          href={pdfUrl} 
          target="_blank"
          startIcon={<DescriptionIcon />}
          sx={{ mt: 1 }}
        >
          Abrir PDF
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={40} />
          </Box>
        }
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Page 
            pageNumber={pageNumber} 
            renderTextLayer={false}
            renderAnnotationLayer={false}
            width={300}
            scale={1}
          />
        )}
      </Document>
      
      {numPages && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 1,
          borderTop: '1px solid #eee',
          bgcolor: '#f9f9f9'
        }}>
          <Button 
            onClick={previousPage}
            disabled={pageNumber <= 1}
            startIcon={<NavigateBefore />}
            size="small"
          >
            Anterior
          </Button>
          
          <Typography variant="body2">
            Página {pageNumber} de {numPages}
          </Typography>
          
          <Button 
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            endIcon={<NavigateNext />}
            size="small"
          >
            Próxima
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PdfPreview;