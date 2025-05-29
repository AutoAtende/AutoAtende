import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
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
  Button,
  useTheme,
  useMediaQuery,
  InputLabel,
  Stack
} from '@mui/material';

// Icons
import {
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  PhoneAndroid as PhoneAndroidIcon,
  TableChart as TableChartIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

// Standard Components
import StandardModal from '../../../components/shared/StandardModal';

// Existing Components
import ContactImportModal from './ContactImportModal';

// Helpers e Context
import { toast } from '../../../helpers/toast';
import { i18n } from '../../../translate/i18n';
import { GlobalContext } from '../../../context/GlobalContext';
import { SocketContext } from '../../../context/Socket/SocketContext';
import api from '../../../services/api';

const ImportExportStepper = ({ open, onClose, mode = 'import' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
              {mode === 'import' 
                ? 'Escolha como deseja importar os contatos:' 
                : 'Escolha o formato para exportar os contatos:'}
            </Typography>
            
            <FormControl fullWidth>
              <RadioGroup
                value={importType}
                onChange={handleTypeChange}
                sx={{ gap: 2 }}
              >
                {mode === 'import' && (
                  <FormControlLabel 
                    value="phone" 
                    control={<Radio />} 
                    label={
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <PhoneAndroidIcon color="primary" />
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            Agenda do Telefone
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Importar contatos diretamente do WhatsApp
                          </Typography>
                        </Box>
                      </Stack>
                    }
                    sx={{
                      border: 1,
                      borderColor: importType === 'phone' ? 'primary.main' : 'divider',
                      borderRadius: isMobile ? 3 : 2,
                      p: 2,
                      m: 0,
                      backgroundColor: importType === 'phone' ? 'primary.light' + '10' : 'transparent',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.light' + '05'
                      }
                    }}
                  />
                )}
                
                <FormControlLabel 
                  value="csv" 
                  control={<Radio />} 
                  label={
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <TableChartIcon color="primary" />
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          Arquivo CSV
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {mode === 'import' 
                            ? 'Importar de planilha CSV com separador ponto e vírgula'
                            : 'Exportar para planilha CSV'}
                        </Typography>
                      </Box>
                    </Stack>
                  }
                  sx={{
                    border: 1,
                    borderColor: importType === 'csv' ? 'primary.main' : 'divider',
                    borderRadius: isMobile ? 3 : 2,
                    p: 2,
                    m: 0,
                    backgroundColor: importType === 'csv' ? 'primary.light' + '10' : 'transparent',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'primary.light' + '05'
                    }
                  }}
                />
                
                <FormControlLabel 
                  value="xls" 
                  control={<Radio />} 
                  label={
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <InsertDriveFileIcon color="primary" />
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          Arquivo Excel
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {mode === 'import' 
                            ? 'Importar de planilha Excel (.xlsx ou .xls)'
                            : 'Exportar para planilha Excel'}
                        </Typography>
                      </Box>
                    </Stack>
                  }
                  sx={{
                    border: 1,
                    borderColor: importType === 'xls' ? 'primary.main' : 'divider',
                    borderRadius: isMobile ? 3 : 2,
                    p: 2,
                    m: 0,
                    backgroundColor: importType === 'xls' ? 'primary.light' + '10' : 'transparent',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'primary.light' + '05'
                    }
                  }}
                />
              </RadioGroup>
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Configurações da {mode === 'import' ? 'importação' : 'exportação'}:
            </Typography>
            
            {importType === 'phone' ? (
              <FormControl fullWidth>
                <InputLabel>Conexão WhatsApp</InputLabel>
                <Select
                  value={selectedConnection}
                  onChange={(e) => setSelectedConnection(e.target.value)}
                  label="Conexão WhatsApp"
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
                    <Box sx={{ 
                      border: 2, 
                      borderStyle: 'dashed', 
                      borderColor: 'divider',
                      borderRadius: isMobile ? 3 : 2,
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: 'background.paper'
                    }}>
                      <CloudUploadIcon 
                        sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} 
                      />
                      <Typography variant="body1" gutterBottom>
                        {file ? file.name : 'Nenhum arquivo selecionado'}
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={() => document.getElementById('file-input').click()}
                        startIcon={<CloudUploadIcon />}
                        sx={{
                          borderRadius: isMobile ? 3 : 2,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        {file ? 'Alterar arquivo' : 'Selecionar arquivo'}
                      </Button>
                    </Box>
                  </>
                )}
                
                <FormControlLabel
                  control={
                    <Radio
                      checked={isFullContact}
                      onChange={(e) => setIsFullContact(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Cadastro completo
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Incluir campos adicionais como empresa, cargo e informações extras
                      </Typography>
                    </Box>
                  }
                  sx={{
                    border: 1,
                    borderColor: isFullContact ? 'primary.main' : 'divider',
                    borderRadius: isMobile ? 3 : 2,
                    p: 2,
                    m: 0,
                    backgroundColor: isFullContact ? 'primary.light' + '10' : 'transparent',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'primary.light' + '05'
                    }
                  }}
                />

                <FormControlLabel
                  control={
                    <Radio
                      checked={!isFullContact}
                      onChange={(e) => setIsFullContact(!e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Cadastro básico
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Apenas nome, número e email
                      </Typography>
                    </Box>
                  }
                  sx={{
                    border: 1,
                    borderColor: !isFullContact ? 'primary.main' : 'divider',
                    borderRadius: isMobile ? 3 : 2,
                    p: 2,
                    m: 0,
                    backgroundColor: !isFullContact ? 'primary.light' + '10' : 'transparent',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'primary.light' + '05'
                    }
                  }}
                />

                {importType === 'csv' && (
                  <Alert severity="info" sx={{ borderRadius: isMobile ? 3 : 2 }}>
                    <Typography variant="body2">
                      <strong>Importante:</strong> O arquivo CSV deve conter as colunas "Nome" e "Número" obrigatoriamente, 
                      separadas por ponto e vírgula (;)
                      {isFullContact && '. Campos adicionais como "Email", "Empresa" e "Cargo" são opcionais.'}
                    </Typography>
                  </Alert>
                )}

                {importType === 'xls' && (
                  <Alert severity="info" sx={{ borderRadius: isMobile ? 3 : 2 }}>
                    <Typography variant="body2">
                      <strong>Importante:</strong> A planilha deve conter as colunas "Nome" e "Número" obrigatoriamente
                      {isFullContact && '. Campos adicionais como "Email", "Empresa" e "Cargo" são opcionais.'}
                    </Typography>
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
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom align="center">
                  {mode === 'import' ? 'Importando contatos...' : 'Processando exportação...'}
                </Typography>
                <LinearProgress variant="determinate" value={progress} sx={{ mb: 1 }} />
                <Typography variant="body2" align="center" color="textSecondary">
                  {progress}% concluído
                </Typography>
                {progressMessage && (
                  <Typography variant="caption" align="center" display="block" sx={{ mt: 1 }}>
                    {progressMessage}
                  </Typography>
                )}
              </Box>
            )}

            <Typography variant="h6" sx={{ mb: 3 }}>
              {mode === 'import' 
                ? 'Confirme os dados antes de iniciar a importação:'
                : 'Seu arquivo está pronto para download!'}
            </Typography>

            <Box sx={{ 
              border: 1, 
              borderColor: 'divider',
              borderRadius: isMobile ? 3 : 2,
              p: 3,
              backgroundColor: 'background.paper'
            }}>
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary">
                    Tipo:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {importType === 'phone' ? 'Agenda do Telefone' : 
                     importType === 'csv' ? 'Arquivo CSV' : 'Arquivo Excel'}
                  </Typography>
                </Box>

                {importType !== 'phone' && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="textSecondary">
                      Formato:
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {isFullContact ? 'Cadastro Completo' : 'Cadastro Básico'}
                    </Typography>
                  </Box>
                )}

                {mode === 'import' && importType !== 'phone' && file && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="textSecondary">
                      Arquivo:
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {file.name}
                    </Typography>
                  </Box>
                )}

                {importType === 'phone' && selectedConnection && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="textSecondary">
                      Conexão:
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {connections.find(c => c.id === selectedConnection)?.name || selectedConnection}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>

            {mode === 'export' && (
              <Alert severity="success" sx={{ mt: 3, borderRadius: isMobile ? 3 : 2 }}>
                <Typography variant="body2">
                  Clique em "Concluir" para fazer o download do arquivo de contatos.
                </Typography>
              </Alert>
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

  const getModalActions = () => {
    const actions = [];

    actions.push({
      label: 'Cancelar',
      onClick: onClose,
      disabled: importing,
      color: 'inherit',
      icon: <CancelIcon />
    });

    if (activeStep > 0) {
      actions.push({
        label: 'Voltar',
        onClick: handleBack,
        disabled: importing,
        color: 'inherit',
        icon: <ArrowBackIcon />
      });
    }

    actions.push({
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
    });

    return actions;
  };

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
    <StandardModal
      open={open}
      onClose={onClose}
      title={mode === 'import' ? 'Importar Contatos' : 'Exportar Contatos'}
      subtitle={`Passo ${activeStep + 1} de ${steps.length}: ${steps[activeStep]}`}
      actions={getModalActions()}
      loading={importing}
      size="medium"
      closeOnBackdrop={!importing}
      closeOnEscape={!importing}
    >
      <Box sx={{ mt: 2 }}>
        <Stepper 
          activeStep={activeStep} 
          sx={{ mb: 3 }}
          alternativeLabel={!isMobile}
          orientation={isMobile ? 'vertical' : 'horizontal'}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {renderStepContent(activeStep)}
        {renderProgress()}
      </Box>
    </StandardModal>
  );
};

ImportExportStepper.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['import', 'export']).isRequired
};

export default ImportExportStepper;