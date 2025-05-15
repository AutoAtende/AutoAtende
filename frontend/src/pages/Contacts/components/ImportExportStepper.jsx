import React, { useState, useEffect, useContext } from 'react';
import { 
  Stepper,
  Step,
  StepLabel,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  LinearProgress,
  Button
} from '@mui/material';

// Icons
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import TableChartIcon from '@mui/icons-material/TableChart';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Helpers e Context
import { toast } from '../../../helpers/toast';
import { i18n } from '../../../translate/i18n';
import { GlobalContext } from '../../../context/GlobalContext';
import { SocketContext } from '../../../context/Socket/SocketContext';
import BaseModal from '../../../components/shared/BaseModal';
import api from '../../../services/api';
import ContactImportModal from './ContactImportModal';

const ImportExportStepper = ({ open, onClose, mode = 'import' }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [importType, setImportType] = useState('');
  const [selectedConnection, setSelectedConnection] = useState('');
  const [isFullContact, setIsFullContact] = useState(false);
  const [file, setFile] = useState(null);
  const [connections, setConnections] = useState([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const { setMakeRequest } = useContext(GlobalContext);
  const socketManager = useContext(SocketContext);
  const companyId = localStorage.getItem("companyId");
  const [showContactImportModal, setShowContactImportModal] = useState(false);

  const steps = mode === 'import' ? [
    'Escolher tipo de importação',
    'Configurações',
    'Confirmação'
  ] : [
    'Escolher tipo de exportação',
    'Configurações',
    'Download'
  ];

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const { data } = await api.get('/whatsapp');
        setConnections(data);
      } catch (err) {
        toast.error('Erro ao carregar conexões');
      }
    };

    if (open && mode === 'import') {
      fetchConnections();
    }

    return () => {
      if (!open) {
        setActiveStep(0);
        setImportType('');
        setSelectedConnection('');
        setIsFullContact(false);
        setFile(null);
        setProgress(0);
      }
    };
  }, [open, mode]);

  useEffect(() => {
    if (!open) return;
  
    const socket = socketManager.GetSocket(companyId);
    const importEventName = `company-${companyId}-contact-import`;
    
    const handleImportProgress = (data) => {
      console.log('Socket Import Event:', {
        action: data.action,
        data: data.data,
        error: data.error
      });
      if (data.action === "progress" && data.data) {
        setProgress(data.data.percentage || 0);
        setProgressMessage(data.data.message || '');
        
        if (data.data.processed) {
          setProgressMessage(prev => 
            `${data.data.message || 'Processando...'} (Processados: ${data.data.processed}, Válidos: ${data.data.valid}, Inválidos: ${data.data.invalid})`
          );
        }
      }
      else if (data.action === "complete" && data.data) {
        setProgress(100);
        setProgressMessage(data.data.message || 'Importação concluída!');
        setImporting(false);
        
        toast.success(i18n.t("contacts.import.importComplete"));
        
        // Aguarda 1.5s antes de fechar e atualizar
        setTimeout(() => {
          setMakeRequest(Math.random()); // Força atualização da lista
          onClose(); // Fecha o modal
        }, 1500);
      }
      else if (data.action === "error") {
        setImporting(false);
        setProgress(0);
        setProgressMessage(`Erro: ${data.error || 'Erro desconhecido'}`);
        toast.error(data.error || 'Erro na importação');
      }
    };
  
    socket.on(importEventName, handleImportProgress);
  
    return () => {
      if (socket) {
        socket.off(importEventName, handleImportProgress);
      }
    };
  }, [open, companyId, socketManager, onClose, setMakeRequest]);

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setImportType(newType);
    setFile(null);
    setSelectedConnection('');
    setIsFullContact(false);
    
    // Abrir o novo modal para CSV ou XLS
    if (mode === 'import' && (newType === 'csv' || newType === 'xls')) {
      setShowContactImportModal(true);
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleFinish();
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFinish = async () => {
    try {
      setImporting(true);
      setProgress(0);
      setProgressMessage('Iniciando...');
  
      if (mode === 'import') {
        if (importType === 'phone') {
          const formData = new FormData();
          formData.append('type', importType);
          formData.append('connectionId', selectedConnection);
  
          await api.post('/contacts/import', formData).catch(err => {
            console.error('Import Error:', err.response?.data || err);
            throw new Error(err.response?.data?.error || err.message);
          });
        }
      } else {
        // Modo exportação
        const response = await api.post('/contacts/export', {
          type: importType,
          isFullContact
        }, { 
          responseType: 'blob' 
        });
        
        const filename = `contatos_${isFullContact ? 'completo' : 'simples'}.${importType}`;
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success('Exportação concluída com sucesso!');
        onClose();
      }
    } catch (err) {
      console.error('Operation Error:', err);
      toast.error(err.message || 'Erro na operação');
      setImporting(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  const renderProgress = () => {
    if (!importing) return null;

    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress variant="determinate" value={progress} />
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          {progressMessage}
        </Typography>
      </Box>
    );
  };

  const handleContactImportSuccess = () => {
    setMakeRequest(Math.random());
    onClose();
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <RadioGroup
              value={importType}
              onChange={handleTypeChange}
            >
              {mode === 'import' && (
                <FormControlLabel 
                  value="phone" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneAndroidIcon />
                      Agenda do Telefone
                    </Box>
                  }
                />
              )}
              <FormControlLabel 
                value="csv" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TableChartIcon />
                    Arquivo CSV
                  </Box>
                }
              />
              <FormControlLabel 
                value="xls" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InsertDriveFileIcon />
                    Arquivo XLS/XLSX
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        );

      case 1:
        return (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {importType === 'phone' ? (
              <FormControl fullWidth>
                <Select
                  value={selectedConnection}
                  onChange={(e) => setSelectedConnection(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">Selecione uma conexão</MenuItem>
                  {connections.map((conn) => (
                    <MenuItem key={conn.id} value={conn.id}>
                      {conn.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <>
                {mode === 'import' && (
                  <>
                    <input
                      type="file"
                      accept={importType === 'csv' ? '.csv' : '.xls,.xlsx'}
                      onChange={(e) => setFile(e.target.files[0])}
                      style={{ display: 'none' }}
                      id="file-input"
                    />
                    <Button
                      variant="outlined"
                      onClick={() => document.getElementById('file-input').click()}
                      startIcon={<CloudUploadIcon />}
                    >
                      Selecionar arquivo
                    </Button>
                    {file && (
                      <Typography variant="body2">
                        Arquivo selecionado: {file.name}
                      </Typography>
                    )}
                  </>
                )}
                
                <FormControlLabel
                  control={
                    <Radio
                      checked={isFullContact}
                      onChange={(e) => setIsFullContact(e.target.checked)}
                    />
                  }
                  label="Cadastro completo (incluir campos adicionais)"
                />

                {importType === 'csv' && (
                  <Alert severity="info">
                    O arquivo CSV deve conter as colunas "nome" e "número" e "email", separadas por ponto e vírgula (;)
                    {isFullContact && ' e pode incluir campos adicionais como outros campos customizados'}
                  </Alert>
                )}

                {importType === 'xls' && (
                  <Alert severity="info">
                    A planilha deve conter as colunas "nome" e "número" e "email"
                    {isFullContact && ' e pode incluir campos adicionais como outros campos customizados'}
                  </Alert>
                )}
              </>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            {importing && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress variant="determinate" value={progress} />
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                  {progress}% concluído
                </Typography>
              </Box>
            )}

            <Typography variant="h6" sx={{ mb: 2 }}>
              {mode === 'import' 
                ? 'Confirme os dados abaixo antes de iniciar a importação:'
                : 'Seu arquivo está pronto para download!'}
            </Typography>

            <Typography variant="body1" sx={{ mb: 1 }}>
              Tipo: {importType === 'phone' ? 'Agenda do Telefone' : importType.toUpperCase()}
            </Typography>

            {importType !== 'phone' && (
              <Typography variant="body1" sx={{ mb: 1 }}>
                Formato: {isFullContact ? 'Cadastro Completo' : 'Cadastro Básico'}
              </Typography>
            )}

            {mode === 'import' && importType !== 'phone' && file && (
              <Typography variant="body1">
                Arquivo: {file.name}
              </Typography>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  const isNextButtonDisabled = () => {
    if (importing) return true;

    switch (activeStep) {
      case 0:
        return !importType;
      case 1:
        if (mode === 'import') {
          if (importType === 'phone') {
            return !selectedConnection;
          }
          return !file;
        }
        return false;
      case 2:
        return false;
      default:
        return false;
    }
  };

  const modalActions = [
    {
      label: 'Cancelar',
      onClick: onClose,
      disabled: importing,
      color: 'inherit',
      icon: <CancelIcon />
    },
    activeStep > 0 && {
      label: 'Voltar',
      onClick: handleBack,
      disabled: importing,
      color: 'inherit',
      icon: <ArrowBackIcon />
    },
    {
      label: importing ? 'Processando...' : activeStep === steps.length - 1 ? 'Concluir' : 'Próximo',
      onClick: handleNext,
      disabled: isNextButtonDisabled(),
      variant: 'contained',
      icon: activeStep === steps.length - 1 
        ? (mode === 'import' ? <CloudUploadIcon /> : <CloudDownloadIcon />) 
        : importing 
          ? null 
          : activeStep === steps.length - 1 
            ? <CheckCircleIcon />
            : <ArrowForwardIcon />
    }
  ].filter(Boolean);

  // Se estamos mostrando o novo modal de importação
  if (showContactImportModal) {
    return (
      <ContactImportModal
        open={true}
        onClose={() => {
          setShowContactImportModal(false);
          onClose();
        }}
        onSuccess={handleContactImportSuccess}
      />
    );
  }

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={mode === 'import' ? 'Importar Contatos' : 'Exportar Contatos'}
      actions={modalActions}
      loading={importing}
      maxWidth="sm"
    >
      <Box sx={{ mt: 2 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {renderStepContent(activeStep)}
        {renderProgress()}
      </Box>
    </BaseModal>
  );
};

export default ImportExportStepper;