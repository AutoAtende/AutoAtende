import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  useTheme,
  useMediaQuery,
  Tooltip,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  Typography,
  Stack
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Help as HelpIcon,
  Download as DownloadIcon,
  ContactPhone as ContactPhoneIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useSpring, animated } from 'react-spring';
import { parse } from 'papaparse';
import * as XLSX from 'xlsx';

// Standard Components
import StandardModal from "../../../components/shared/StandardModal";

import { i18n } from "../../../translate/i18n";
import api from '../../../services/api';
import { toast } from "../../../helpers/toast";
import { AuthContext } from "../../../context/Auth/AuthContext";
import { GlobalContext } from "../../../context/GlobalContext";
import { SocketContext } from '../../../context/Socket/SocketContext';

// Componentes estilizados com padrão Standard
const AnimatedBox = animated(Box);

const UploadContainer = styled(Paper)(({ theme, isDragActive }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  cursor: 'pointer',
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
  backgroundColor: isDragActive ? `${theme.palette.primary.light}20` : theme.palette.background.paper,
  borderRadius: theme.breakpoints.down('sm') ? 12 : 8,
  transition: 'all 0.3s ease',
  minHeight: 200,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: `${theme.palette.primary.light}10`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    minHeight: 180,
  }
}));

const StyledListItem = styled(ListItem)(({ theme, hasError }) => ({
  borderRadius: theme.breakpoints.down('sm') ? 8 : 6,
  marginBottom: theme.spacing(1),
  backgroundColor: hasError ? `${theme.palette.error.light}20` : `${theme.palette.success.light}20`,
  borderLeft: `3px solid ${hasError ? theme.palette.error.main : theme.palette.success.main}`,
  padding: theme.spacing(1.5),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  }
}));

const ResponsiveButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.breakpoints.down('sm') ? 12 : 8,
  minHeight: theme.breakpoints.down('sm') ? 44 : 40,
  fontWeight: 600,
  textTransform: 'none',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5, 2),
  }
}));

const ContactImportModal = ({ open, onClose, onSuccess }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);
  const { setMakeRequest } = useContext(GlobalContext);
  const socketManager = useContext(SocketContext);
  
  // Estados
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [mappings, setMappings] = useState({
    name: '',
    number: '',
    email: '',
    company: '',
    position: '',
  });
  const [extraFieldMappings, setExtraFieldMappings] = useState({});
  const [employers, setEmployers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [importResults, setImportResults] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    errors: [],
  });
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [headers, setHeaders] = useState([]);
  const [processingData, setProcessingData] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isFullContact, setIsFullContact] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  // Passos do processo de importação
  const steps = [
    i18n.t('contacts.import.steps.selectFile') || 'Selecionar Arquivo',
    i18n.t('contacts.import.steps.mapFields') || 'Mapear Campos',
    i18n.t('contacts.import.steps.review') || 'Revisar',
    i18n.t('contacts.import.steps.result') || 'Resultado',
  ];
  
  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 300 }
  });

  // Efeito para carregar empregadores e posições
  useEffect(() => {
    if (open && activeStep === 1) {
      fetchEmployers();
      fetchPositions();
    }
  }, [open, activeStep]);
  
  // Buscar empregadores e posições para mapeamento
  const fetchEmployers = async () => {
    try {
      const { data } = await api.get('/employers', {
        params: {
          searchParam: '',
          page: 0,
          limit: 999999
        }
      });
      
      if (data && data.employers) {
        setEmployers(data.employers || []);
      } else {
        setEmployers([]);
      }
    } catch (error) {
      console.error('Erro ao buscar empregadores:', error);
      toast.error(i18n.t('contacts.import.errorMessages.fetchEmployersFailed') || 'Erro ao buscar empregadores');
    }
  };
  
  const fetchPositions = async () => {
    try {
      const { data } = await api.get('/positions/simplified', {
        params: {
          searchParam: '',
          page: 1,
          limit: 999999
        }
      });
      
      if (data && data.positions) {
        setPositions(data.positions || []);
      } else {
        setPositions([]);
      }
    } catch (error) {
      console.error('Erro ao buscar posições:', error);
      toast.error(i18n.t('contacts.import.errorMessages.fetchPositionsFailed') || 'Erro ao buscar posições');
    }
  };
  
  // Handlers para upload de arquivo
  const handleFileUpload = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    
    handleFileSelection(selectedFile);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;
    
    handleFileSelection(droppedFile);
  };
  
  const handleFileSelection = (selectedFile) => {
    // Verificar extensão do arquivo
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
      toast.error(i18n.t('contacts.import.errorMessages.invalidFileType') || 'Tipo de arquivo inválido');
      return;
    }
    
    setFile(selectedFile);
    parseFile(selectedFile);
  };
  
  // Analisar o arquivo
  const parseFile = async (fileObj) => {
    setProcessingData(true);
    try {
      // Verificar extensão do arquivo
      const fileExtension = fileObj.name.split('.').pop().toLowerCase();
      
      if (['xlsx', 'xls'].includes(fileExtension)) {
        // Processar arquivo Excel
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Usar a primeira planilha
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length < 2) {
              toast.error(i18n.t('contacts.import.errorMessages.emptyFile') || 'Arquivo vazio');
              setFile(null);
              setProcessingData(false);
              return;
            }
            
            // Obter cabeçalhos (primeira linha)
            const headers = jsonData[0];
            setHeaders(headers);
            
            // Converter o resto para o formato esperado
            const parsedData = jsonData.slice(1).map(row => {
              const rowData = {};
              headers.forEach((header, index) => {
                rowData[header] = row[index];
              });
              return rowData;
            });
            
            setFileData(parsedData);
            setActiveStep(1);
          } catch (error) {
            console.error('Erro ao processar arquivo Excel:', error);
            toast.error(i18n.t('contacts.import.errorMessages.parsingFailed') || 'Falha ao processar arquivo');
            setFile(null);
          } finally {
            setProcessingData(false);
          }
        };
        
        reader.onerror = () => {
          toast.error(i18n.t('contacts.import.errorMessages.readFailed') || 'Falha ao ler arquivo');
          setFile(null);
          setProcessingData(false);
        };
        
        reader.readAsArrayBuffer(fileObj);
      } else {
        // Processar arquivo CSV
        parse(fileObj, {
          header: true,
          skipEmptyLines: true,
          delimiter: ';',
          complete: (results) => {
            if (results.data.length === 0) {
              toast.error(i18n.t('contacts.import.errorMessages.emptyFile') || 'Arquivo vazio');
              setFile(null);
              setProcessingData(false);
              return;
            }
            
            setHeaders(Object.keys(results.data[0]));
            setFileData(results.data);
            setActiveStep(1);
            setProcessingData(false);
          },
          error: (error) => {
            console.error('Erro ao analisar CSV:', error);
            toast.error(i18n.t('contacts.import.errorMessages.parsingFailed') || 'Falha ao processar arquivo');
            setFile(null);
            setProcessingData(false);
          }
        });
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast.error(i18n.t('contacts.import.errorMessages.processingFailed') || 'Falha ao processar arquivo');
      setFile(null);
      setProcessingData(false);
    }
  };
  
  // Atualizar mapeamentos de campo
  const handleMappingChange = (field) => (event) => {
    setMappings({
      ...mappings,
      [field]: event.target.value
    });
  };

  // Adicionar mapeamento de campo extra
  const handleExtraFieldMappingChange = (extraField) => (event) => {
    setExtraFieldMappings({
      ...extraFieldMappings,
      [extraField]: event.target.value
    });
  };

  // Adicionar novo campo extra
  const handleAddExtraField = () => {
    const newField = `extraField${Object.keys(extraFieldMappings).length + 1}`;
    setExtraFieldMappings({
      ...extraFieldMappings,
      [newField]: ''
    });
  };

  // Remover campo extra
  const handleRemoveExtraField = (fieldKey) => {
    const updatedMappings = { ...extraFieldMappings };
    delete updatedMappings[fieldKey];
    setExtraFieldMappings(updatedMappings);
  };
  
  // Validar mapeamentos e dados
  const validateMappingsAndData = async () => {
    const errors = [];
    
    // Verificar se os campos obrigatórios foram mapeados
    if (!mappings.name) {
      errors.push({
        message: i18n.t('contacts.import.validation.nameRequired') || 'O campo Nome é obrigatório',
        type: 'mapping'
      });
    }
    
    if (!mappings.number) {
      errors.push({
        message: i18n.t('contacts.import.validation.numberRequired') || 'O campo Número é obrigatório',
        type: 'mapping'
      });
    }
    
    // Validar dados conforme os mapeamentos
    const dataErrors = [];
    
    for (let i = 0; i < fileData.length; i++) {
      const row = fileData[i];
      const rowErrors = [];
      
      // Validar nome
      if (mappings.name && !row[mappings.name]?.trim()) {
        rowErrors.push({
          field: 'name',
          message: i18n.t('contacts.import.validation.emptyName') || 'Nome em branco'
        });
      }
      
      // Validar número
      if (mappings.number) {
        const numberValue = row[mappings.number]?.toString().trim();
        
        if (!numberValue) {
          rowErrors.push({
            field: 'number',
            message: i18n.t('contacts.import.validation.emptyNumber') || 'Número em branco'
          });
        } else {
          // Validação simples de formato de número
          const cleanNumber = numberValue.replace(/\D/g, "");
          
          if (cleanNumber.length < 8) {
            rowErrors.push({
              field: 'number',
              message: i18n.t('contacts.import.validation.invalidNumberFormat') || 'Formato de número inválido'
            });
          }
        }
      }
      
      // Validar email
      if (mappings.email && row[mappings.email]) {
        const emailValue = row[mappings.email].toString().trim();
        
        // Regex simples para validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (emailValue && !emailRegex.test(emailValue)) {
          rowErrors.push({
            field: 'email',
            message: i18n.t('contacts.import.validation.invalidEmail') || 'Email inválido'
          });
        }
      }
      
      // Validar empresa (opcional)
      if (mappings.company && row[mappings.company]) {
        const companyName = row[mappings.company].toString().trim();
        const companyExists = employers.some(employer => 
          employer.name.toLowerCase() === companyName.toLowerCase()
        );
        
        // Apenas um aviso, não impede a importação
        if (!companyExists && companyName) {
          rowErrors.push({
            field: 'company',
            message: i18n.t('contacts.import.validation.companyNotFound', { company: companyName }) || `Empresa "${companyName}" não encontrada, será criada automaticamente`
          });
        }
      }
      
      // Validar cargo (opcional)
      if (mappings.position && row[mappings.position]) {
        const positionName = row[mappings.position].toString().trim();
        const positionExists = positions.some(position => 
          position.name.toLowerCase() === positionName.toLowerCase()
        );
        
        // Apenas um aviso, não impede a importação
        if (!positionExists && positionName) {
          rowErrors.push({
            field: 'position',
            message: i18n.t('contacts.import.validation.positionNotFound', { position: positionName }) || `Cargo "${positionName}" não encontrado, será criado automaticamente`
          });
        }
      }
      
      // Adicionar erros da linha, se existirem
      if (rowErrors.length > 0) {
        dataErrors.push({
          row: i + 2, // +2 porque índice começa em 0 e temos o cabeçalho
          errors: rowErrors
        });
      }
    }
    
    if (dataErrors.length > 0) {
      errors.push({
        message: i18n.t('contacts.import.validation.dataErrors', { count: dataErrors.length }) || `${dataErrors.length} registros contêm erros`,
        type: 'data',
        details: dataErrors
      });
    }
    
    setValidationErrors(errors);
    return errors.filter(error => 
      error.type !== 'data' || 
      error.details.some(detail => 
        detail.errors.some(err => 
          !err.message.includes('será criado automaticamente')
        )
      )
    ).length === 0;
  };
  
  // Avançar para o próximo passo
  const handleNext = async () => {
    if (activeStep === 1) {
      // Validar mapeamentos antes de avançar para a revisão
      const isValid = await validateMappingsAndData();
      if (!isValid) {
        toast.error(i18n.t('contacts.import.errorMessages.validationFailed') || 'Validação falhou. Corrija os erros antes de continuar.');
        return;
      }
    }
    
    if (activeStep === 2) {
      // Iniciar importação
      importContacts();
      return;
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  // Voltar para o passo anterior
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Importar contatos
  const importContacts = async () => {
    setLoading(true);
    
    try {
      // Preparar os dados para importação
      const formData = new FormData();
      formData.append('type', file.name.endsWith('.csv') ? 'csv' : 'xls');
      formData.append('isFullContact', isFullContact.toString());
      formData.append('file', file);
      
      // Incluir mapeamentos como metadados
      const metadata = {
        mappings,
        extraFieldMappings: isFullContact ? extraFieldMappings : {},
      };
      formData.append('metadata', JSON.stringify(metadata));
      
      // Chamar a API para importação
      const response = await api.post('/contacts/import', formData);
      
      // Atualizar resultados
      if (response.data && response.data.jobId) {
        // Se for processamento assíncrono, iniciar polling
        pollImportStatus(response.data.jobId);
      } else {
        // Processamento síncrono (menos comum)
        setImportResults({
          total: fileData.length,
          successful: response.data.successful || 0,
          failed: response.data.failed || 0,
          errors: response.data.errors || [],
        });
        
        toast.success(i18n.t('contacts.import.success', { 
          count: response.data.successful || 0
        }) || `${response.data.successful || 0} contatos importados com sucesso`);
        
        setActiveStep(3);
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro na importação:', error);
      toast.error(i18n.t('contacts.import.errorMessages.importFailed') || 'Falha na importação');
      
      // Definir resultados de erro
      setImportResults({
        total: fileData.length,
        successful: 0,
        failed: fileData.length,
        errors: [{
          message: error.response?.data?.error || i18n.t('contacts.import.errors.generalError') || 'Erro geral na importação'
        }],
      });
      
      // Avançar para o último passo mesmo em caso de erro
      setActiveStep(3);
      setLoading(false);
    }
  };
  
  // Monitorar status da importação assíncrona
  const pollImportStatus = (jobId) => {
    let attemptCount = 0;
    const maxAttempts = 60; // 5 minutos (60 x 5s)
    
    // Obter o socket com base no ID da empresa
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.GetSocket(companyId);
    const importEventName = `company-${companyId}-contact-import`;
    
    // Função para lidar com eventos do socket
    const handleImportEvent = (data) => {
      console.log("Socket import event received:", data);
      
      if (data.jobId !== jobId) return; // Ignora eventos de outros jobs
      
      if (data.action === "complete") {
        // Importação completada com sucesso
        clearInterval(statusInterval);
        
        setImportResults({
          total: data.data?.total || fileData.length,
          successful: data.data?.successful || 0,
          failed: data.data?.failed || 0,
          errors: data.data?.errors || [],
        });
        
        toast.success(i18n.t("contacts.import.success", { 
          count: data.data?.successful || 0
        }) || `${data.data?.successful || 0} contatos importados com sucesso`);
        
        setActiveStep(3);
        setLoading(false);
        
        // Atualizar lista de contatos após 1 segundo
        setTimeout(() => {
          setMakeRequest(Math.random());
          // Opcional: fechar o modal automaticamente após mais 2 segundos
          setTimeout(() => {
            onClose();
          }, 2000);
        }, 1000);
        
        // Remover listener após conclusão
        socket.off(importEventName, handleImportEvent);
      } 
      else if (data.action === "error") {
        // Erro na importação
        clearInterval(statusInterval);
        
        setImportResults({
          total: fileData.length,
          successful: data.data?.successful || 0,
          failed: data.data?.failed || (fileData.length - (data.data?.successful || 0)),
          errors: [{ 
            message: data.error || i18n.t("contacts.import.errors.generalError") || 'Erro geral na importação'
          }],
        });
        
        toast.error(data.error || i18n.t("contacts.import.errorMessages.importFailed") || 'Falha na importação');
        
        setActiveStep(3);
        setLoading(false);
        
        // Remover listener após conclusão
        socket.off(importEventName, handleImportEvent);
      }
      else if (data.action === "progress") {
        // Atualizar progresso
        if (data.data) {
          setProgress(data.data.percentage || 0);
          setProgressMessage(data.data.message || 'Processando...');
          
          if (data.data.processed) {
            setProgressMessage(prev => 
              `${data.data.message || 'Processando...'} (Processados: ${data.data.processed}, Válidos: ${data.data.valid}, Inválidos: ${data.data.invalid})`
            );
          }
        }
      }
    };
    
    // Adicionar listener para o evento
    socket.on(importEventName, handleImportEvent);
    
    // Configurar verificação periódica como fallback
    const statusInterval = setInterval(async () => {
      try {
        attemptCount++;
        
        if (attemptCount > maxAttempts) {
          clearInterval(statusInterval);
          socket.off(importEventName, handleImportEvent);
          
          throw new Error(i18n.t("contacts.import.errors.timeout") || 'Tempo de importação excedido');
        }
        
        const { data } = await api.get(`/contacts/import-status/${jobId}`);
        
        // Verificação secundária via API (caso o socket não funcione)
        if (data.status === 'completed') {
          clearInterval(statusInterval);
          socket.off(importEventName, handleImportEvent);
          
          setImportResults({
            total: data.total || fileData.length,
            successful: data.successful || 0,
            failed: data.failed || 0,
            errors: data.errors || [],
          });
          
          toast.success(i18n.t("contacts.import.success", { 
            count: data.successful || 0
          }) || `${data.successful || 0} contatos importados com sucesso`);
          
          setActiveStep(3);
          setLoading(false);
          
          // Atualizar lista de contatos
          setMakeRequest(Math.random());
        } 
        else if (data.status === 'error') {
          // Erro na importação
          clearInterval(statusInterval);
          socket.off(importEventName, handleImportEvent);
          
          setImportResults({
            total: fileData.length,
            successful: data.successful || 0,
            failed: data.failed || (fileData.length - (data.successful || 0)),
            errors: data.errors || [{
              message: data.error || i18n.t("contacts.import.errors.generalError") || 'Erro geral na importação'
            }],
          });
          
          toast.error(i18n.t("contacts.import.errorMessages.importFailed") || 'Falha na importação');
          
          setActiveStep(3);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
        
        // Apenas emitir erro e finalizar após várias tentativas ou em caso de erro crítico
        if (attemptCount > maxAttempts / 2 || error.message.includes('excedido')) {
          clearInterval(statusInterval);
          socket.off(importEventName, handleImportEvent);
          
          setImportResults({
            total: fileData.length,
            successful: 0,
            failed: fileData.length,
            errors: [{
              message: error.message || i18n.t("contacts.import.errors.statusCheckFailed") || 'Falha ao verificar status da importação'
            }],
          });
          
          toast.error(i18n.t("contacts.import.errors.statusCheckFailed") || 'Falha ao verificar status da importação');
          
          setActiveStep(3);
          setLoading(false);
        }
      }
    }, 5000); // Verificar a cada 5 segundos

    // Retornamos uma função de cleanup que será chamada quando o componente for desmontado
    return () => {
      clearInterval(statusInterval);
      if (socket) {
        socket.off(importEventName, handleImportEvent);
      }
    };
  };
  
  // Baixar modelo de importação
  const downloadTemplate = () => {
    try {
      // Criar planilha modelo
      const worksheet = XLSX.utils.aoa_to_sheet([
        ['Nome', 'Número', 'Email', 'Empresa', 'Cargo', 'Info Adicional 1', 'Info Adicional 2'],
        ['João Silva', '5511999887766', 'joao@exemplo.com', 'Empresa ABC', 'Gerente', 'Website: www.joao.com', 'Aniversário: 15/05'],
        ['Maria Souza', '5521988776655', 'maria@exemplo.com', 'Empresa XYZ', 'Diretora', 'LinkedIn: /in/maria', 'Idiomas: Português, Inglês'],
      ]);
      
      // Criar workbook e adicionar a planilha
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Contatos');
      
      // Gerar arquivo
      XLSX.writeFile(workbook, 'modelo_importacao_contatos.xlsx');
    } catch (error) {
      console.error('Erro ao gerar modelo:', error);
      toast.error(i18n.t('contacts.import.errors.templateGenerationFailed') || 'Falha ao gerar modelo');
    }
  };
  
  // Reiniciar o processo
  const handleReset = () => {
    setActiveStep(0);
    setFile(null);
    setFileData([]);
    setMappings({
      name: '',
      number: '',
      email: '',
      company: '',
      position: '',
    });
    setExtraFieldMappings({});
    setHeaders([]);
    setValidationErrors([]);
    setImportResults({
      total: 0,
      successful: 0,
      failed: 0,
      errors: [],
    });
    setIsFullContact(false);
  };
  
  // Finalizar e fechar
  const handleFinish = () => {
    if (importResults.successful > 0 && onSuccess) {
      onSuccess();
    }
    handleReset();
    onClose();
  };
  
  // Renderizar conteúdo de acordo com o passo atual
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ p: isMobile ? 2 : 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {i18n.t('contacts.import.selectFilePrompt') || 'Selecione um arquivo CSV ou Excel para importar contatos'}
            </Typography>
            
            <input
              accept=".csv,.xlsx,.xls"
              id="contact-import-file"
              type="file"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              disabled={processingData}
            />
            
            <label htmlFor="contact-import-file">
              <UploadContainer
                isDragActive={dragActive}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {processingData ? (
                  <>
                    <CircularProgress size={40} sx={{ mb: 2 }} />
                    <Typography variant="body1">
                      {i18n.t('contacts.import.processingFile') || 'Processando arquivo...'}
                    </Typography>
                  </>
                ) : (
                  <>
                    <CloudUploadIcon 
                      color="primary" 
                      sx={{ fontSize: { xs: 48, sm: 64 }, mb: 2 }} 
                    />
                    <Typography variant="body1" gutterBottom>
                      {i18n.t('contacts.import.dragAndDrop') || 'Arraste e solte seu arquivo aqui'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {i18n.t('contacts.import.or') || 'ou'}
                    </Typography>
                    <ResponsiveButton
                      variant="outlined"
                      component="span"
                      sx={{ mt: 2 }}
                    >
                      {i18n.t('contacts.import.browse') || 'Procurar'}
                    </ResponsiveButton>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 2 }}>
                      {i18n.t('contacts.import.supportedFormats') || 'Formatos suportados: CSV, XLS, XLSX'}
                    </Typography>
                  </>
                )}
              </UploadContainer>
            </label>
            
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                {i18n.t('contacts.import.needTemplate') || 'Precisa de um modelo?'}
              </Typography>
              <ResponsiveButton
                variant="text"
                startIcon={<DownloadIcon />}
                onClick={downloadTemplate}
                disabled={processingData}
              >
                {i18n.t('contacts.import.downloadTemplate') || 'Baixar modelo'}
              </ResponsiveButton>
            </Box>
          </Box>
        );
        
      case 1:
        return (
          <Box sx={{ p: isMobile ? 2 : 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {i18n.t('contacts.import.mapFields') || 'Mapeie os campos do arquivo com os campos de contato'}
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              {i18n.t('contacts.import.mapFieldsInfo') || 'Selecione quais colunas do seu arquivo correspondem a cada campo de contato. Campos marcados com * são obrigatórios.'}
            </Alert>

            <FormControlLabel
              control={
                <Switch
                  checked={isFullContact}
                  onChange={(e) => setIsFullContact(e.target.checked)}
                  color="primary"
                />
              }
              label={i18n.t('contacts.import.fullContact') || "Importar dados completos (incluir campos adicionais)"}
              sx={{ mb: 3 }}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>{i18n.t('contacts.form.name') || 'Nome'}</InputLabel>
                  <Select
                    value={mappings.name}
                    onChange={handleMappingChange('name')}
                    label={i18n.t('contacts.form.name') || 'Nome'}
                  >
                    <MenuItem value="">
                      <em>{i18n.t('contacts.import.selectField') || 'Selecione um campo'}</em>
                    </MenuItem>
                    {headers.map((header) => (
                      <MenuItem key={header} value={header}>
                        {header}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>{i18n.t('contacts.form.number') || 'Número'}</InputLabel>
                  <Select
                    value={mappings.number}
                    onChange={handleMappingChange('number')}
                    label={i18n.t('contacts.form.number') || 'Número'}
                  >
                    <MenuItem value="">
                      <em>{i18n.t('contacts.import.selectField') || 'Selecione um campo'}</em>
                    </MenuItem>
                    {headers.map((header) => (
                      <MenuItem key={header} value={header}>
                        {header}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{i18n.t('contacts.form.email') || 'Email'}</InputLabel>
                  <Select
                    value={mappings.email}
                    onChange={handleMappingChange('email')}
                    label={i18n.t('contacts.form.email') || 'Email'}
                  >
                    <MenuItem value="">
                      <em>{i18n.t('contacts.import.selectField') || 'Selecione um campo'}</em>
                    </MenuItem>
                    {headers.map((header) => (
                      <MenuItem key={header} value={header}>
                        {header}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{i18n.t('contacts.form.company') || 'Empresa'}</InputLabel>
                  <Select
                    value={mappings.company}
                    onChange={handleMappingChange('company')}
                    label={i18n.t('contacts.form.company') || 'Empresa'}
                  >
                    <MenuItem value="">
                      <em>{i18n.t('contacts.import.selectField') || 'Selecione um campo'}</em>
                    </MenuItem>
                    {headers.map((header) => (
                      <MenuItem key={header} value={header}>
                        {header}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{i18n.t('contacts.form.position') || 'Cargo'}</InputLabel>
                  <Select
                    value={mappings.position}
                    onChange={handleMappingChange('position')}
                    label={i18n.t('contacts.form.position') || 'Cargo'}
                  >
                    <MenuItem value="">
                      <em>{i18n.t('contacts.import.selectField') || 'Selecione um campo'}</em>
                    </MenuItem>
                    {headers.map((header) => (
                      <MenuItem key={header} value={header}>
                        {header}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            {isFullContact && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {i18n.t('contacts.import.extraFields') || 'Campos adicionais'}
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  {i18n.t('contacts.import.extraFieldsInfo') || 'Mapeie campos adicionais que serão importados como informações extras do contato.'}
                </Alert>
                
                {Object.keys(extraFieldMappings).length > 0 ? (
                  <Grid container spacing={2}>
                    {Object.entries(extraFieldMappings).map(([fieldKey, fieldValue], index) => (
                      <Grid item xs={12} sm={6} key={fieldKey}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TextField
                            label={i18n.t('contacts.import.extraFieldName') || 'Nome do campo extra'}
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={fieldKey.replace('extraField', '')}
                            disabled
                            sx={{ mr: 1 }}
                          />
                          <FormControl fullWidth sx={{ flexGrow: 1 }}>
                            <InputLabel>{i18n.t('contacts.import.value') || 'Valor'}</InputLabel>
                            <Select
                              value={fieldValue}
                              onChange={handleExtraFieldMappingChange(fieldKey)}
                              label={i18n.t('contacts.import.value') || 'Valor'}
                              size="small"
                            >
                              <MenuItem value="">
                                <em>{i18n.t('contacts.import.selectField') || 'Selecione um campo'}</em>
                              </MenuItem>
                              {headers.map((header) => (
                                <MenuItem key={header} value={header}>
                                  {header}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <ResponsiveButton
                            onClick={() => handleRemoveExtraField(fieldKey)}
                            color="error"
                            size="small"
                            sx={{ ml: 1, minWidth: 'auto', p: 1 }}
                          >
                            <CloseIcon fontSize="small" />
                          </ResponsiveButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {i18n.t('contacts.import.noExtraFields') || 'Nenhum campo adicional mapeado.'}
                  </Typography>
                )}
                
                <ResponsiveButton
                  variant="outlined"
                  size="small"
                  startIcon={<InfoIcon />}
                  onClick={handleAddExtraField}
                  sx={{ mt: 1 }}
                >
                  {i18n.t('contacts.import.addExtraField') || 'Adicionar campo extra'}
                </ResponsiveButton>
              </Box>
            )}
            
            {validationErrors.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {i18n.t('contacts.import.validationErrors', { count: validationErrors.length }) || `Foram encontrados ${validationErrors.length} erros de validação`}
                </Alert>
                
                <List dense>
                  {validationErrors.map((error, index) => (
                    <StyledListItem key={index} hasError={true}>
                      <ListItemIcon>
                        <ErrorIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={error.message}
                        secondary={error.type === 'data' && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2">
                              {i18n.t('contacts.import.errorDetails', { count: error.details.length }) || `${error.details.length} registros com problemas`}
                            </Typography>
                            <Box sx={{ mt: 1, maxHeight: 100, overflow: 'auto' }}>
                              {error.details.slice(0, 3).map((detail, idx) => (
                                <Typography key={idx} variant="caption" display="block">
                                  {i18n.t('contacts.import.rowError', { 
                                    row: detail.row,
                                    error: detail.errors[0].message
                                  }) || `Linha ${detail.row}: ${detail.errors[0].message}`}
                                </Typography>
                              ))}
                              {error.details.length > 3 && (
                                <Typography variant="caption" color="error">
                                  {i18n.t('contacts.import.moreErrors', { 
                                    count: error.details.length - 3
                                  }) || `...e mais ${error.details.length - 3} erros`}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        )}
                      />
                    </StyledListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ p: isMobile ? 2 : 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {i18n.t('contacts.import.reviewAndImport') || 'Revisar e importar'}
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              {i18n.t('contacts.import.reviewInfo') || 'Verifique se os dados estão corretos antes de iniciar a importação.'}
            </Alert>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                {i18n.t('contacts.import.summary') || 'Resumo'}
              </Typography>
              
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {i18n.t('contacts.import.totalRecords') || 'Total de registros'}
                    </Typography>
                    <Typography variant="h6">
                      {fileData.length}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {i18n.t('contacts.import.validRecords') || 'Registros válidos'}
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {fileData.length - validationErrors.reduce((acc, curr) => 
                        curr.type === 'data' ? acc + curr.details.length : acc, 0
                      )}
                    </Typography>
                  </Box>
                  
                  {validationErrors.some(e => e.type === 'data') && (
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {i18n.t('contacts.import.invalidRecords') || 'Registros com avisos'}
                      </Typography>
                      <Typography variant="h6" color="warning.main">
                      {validationErrors.reduce((acc, curr) => 
                          curr.type === 'data' ? acc + curr.details.length : acc, 0
                        )}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {i18n.t('contacts.import.importMode') || 'Modo de importação'}
                    </Typography>
                    <Typography variant="h6">
                      {isFullContact 
                        ? (i18n.t('contacts.import.fullContactMode') || 'Cadastro completo') 
                        : (i18n.t('contacts.import.basicContactMode') || 'Cadastro básico')}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                {i18n.t('contacts.import.mappedFields') || 'Campos mapeados'}
              </Typography>
              
              <Paper sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  {Object.entries(mappings).map(([field, value]) => (
                    value && (
                      <Grid item xs={12} sm={6} key={field}>
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {i18n.t(`contacts.form.${field}`) || field}
                          </Typography>
                          <Typography variant="body1">
                            {value ? value : <em>{i18n.t('contacts.import.notMapped') || 'Não mapeado'}</em>}
                          </Typography>
                        </Box>
                      </Grid>
                    )
                  ))}

                  {isFullContact && Object.entries(extraFieldMappings).map(([field, value]) => (
                    value && (
                      <Grid item xs={12} sm={6} key={field}>
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {i18n.t('contacts.import.extraField') || 'Campo extra'}: {field.replace('extraField', '')}
                          </Typography>
                          <Typography variant="body1">
                            {value}
                          </Typography>
                        </Box>
                      </Grid>
                    )
                  ))}
                </Grid>
              </Paper>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {i18n.t('contacts.import.previewData') || 'Visualização dos dados'}
              </Typography>
              
              <Paper sx={{ overflow: 'auto', maxHeight: 300 }}>
                <Box sx={{ minWidth: 650 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        {Object.entries(mappings)
                          .filter(([_, value]) => value)
                          .map(([field, value]) => (
                            <TableCell key={field}>
                              {i18n.t(`contacts.form.${field}`) || field}
                            </TableCell>
                          ))}
                        {isFullContact && Object.entries(extraFieldMappings)
                          .filter(([_, value]) => value)
                          .map(([field, _]) => (
                            <TableCell key={field}>
                              {field.replace('extraField', '')}
                            </TableCell>
                          ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fileData.slice(0, 5).map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          {Object.entries(mappings)
                            .filter(([_, value]) => value)
                            .map(([field, value]) => (
                              <TableCell key={field}>
                                {row[value] || '-'}
                              </TableCell>
                            ))}
                          {isFullContact && Object.entries(extraFieldMappings)
                            .filter(([_, value]) => value)
                            .map(([field, value]) => (
                              <TableCell key={field}>
                                {row[value] || '-'}
                              </TableCell>
                            ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Paper>
              
              {fileData.length > 5 && (
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  {i18n.t('contacts.import.showingFirst', { count: 5, total: fileData.length }) || `Mostrando os primeiros 5 de ${fileData.length} registros`}
                </Typography>
              )}
            </Box>
          </Box>
        );
      
      case 3:
        return (
          <Box sx={{ p: isMobile ? 2 : 3 }}>
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={60} sx={{ mb: 3 }} />
                <Typography variant="h6" gutterBottom>
                  {i18n.t('contacts.import.importingContacts') || 'Importando contatos...'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {i18n.t('contacts.import.pleaseWait') || 'Por favor, aguarde. Isso pode levar alguns minutos.'}
                </Typography>
                {progress > 0 && (
                  <Box sx={{ mt: 2, width: '100%' }}>
                    <LinearProgress variant="determinate" value={progress} />
                    <Typography variant="caption" sx={{ mt: 1 }}>
                      {progressMessage}
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  {importResults.successful > 0 ? (
                    <>
                      <CheckCircleIcon 
                        color="success" 
                        sx={{ fontSize: 64, mb: 2 }} 
                      />
                      <Typography variant="h6" gutterBottom>
                        {i18n.t('contacts.import.importComplete') || 'Importação concluída'}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <ErrorIcon 
                        color="error" 
                        sx={{ fontSize: 64, mb: 2 }} 
                      />
                      <Typography variant="h6" gutterBottom>
                        {i18n.t('contacts.import.importFailed') || 'Falha na importação'}
                      </Typography>
                    </>
                  )}
                </Box>
                
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="textSecondary">
                        {i18n.t('contacts.import.totalProcessed') || 'Total processado'}
                      </Typography>
                      <Typography variant="h5">
                        {importResults.total}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="textSecondary">
                        {i18n.t('contacts.import.successful') || 'Sucesso'}
                      </Typography>
                      <Typography variant="h5" color="success.main">
                        {importResults.successful}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="textSecondary">
                        {i18n.t('contacts.import.failed') || 'Falhas'}
                      </Typography>
                      <Typography variant="h5" color="error.main">
                        {importResults.failed}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
                
                {importResults.errors.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      {i18n.t('contacts.import.errors') || 'Erros'}
                    </Typography>
                    
                    <List dense>
                      {importResults.errors.slice(0, 5).map((error, index) => (
                        <StyledListItem key={index} hasError={true}>
                          <ListItemIcon>
                            <ErrorIcon color="error" />
                          </ListItemIcon>
                          <ListItemText
                            primary={error.message}
                            secondary={error.details && (
                              <Typography variant="caption">
                                {error.details}
                              </Typography>
                            )}
                          />
                        </StyledListItem>
                      ))}
                    </List>
                    
                    {importResults.errors.length > 5 && (
                      <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        {i18n.t('contacts.import.moreErrors', { 
                          count: importResults.errors.length - 5 
                        }) || `...e mais ${importResults.errors.length - 5} erros`}
                      </Typography>
                    )}
                  </Box>
                )}
                
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  {importResults.successful > 0 ? (
                    <Typography variant="body1">
                      {i18n.t('contacts.import.successMessage', { 
                        count: importResults.successful 
                      }) || `${importResults.successful} contatos foram importados com sucesso.`}
                    </Typography>
                  ) : (
                    <Typography variant="body1" color="error">
                      {i18n.t('contacts.import.failureMessage') || 'Nenhum contato foi importado. Verifique os erros e tente novamente.'}
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </Box>
        );
      
      default:
        return null;
    }
  };

  // Determinar as ações do modal baseadas no passo atual
  const getModalActions = () => {
    const actions = [];

    if (activeStep === 0) {
      actions.push({
        label: i18n.t('buttons.cancel') || 'Cancelar',
        onClick: onClose,
        disabled: loading || processingData,
        color: 'inherit'
      });
    } else if (activeStep === steps.length - 1) {
      actions.push(
        {
          label: i18n.t('contacts.import.importAnother') || 'Importar mais contatos',
          onClick: handleReset,
          disabled: loading,
          variant: 'outlined'
        },
        {
          label: i18n.t('buttons.finish') || 'Finalizar',
          onClick: handleFinish,
          disabled: loading,
          variant: 'contained'
        }
      );
    } else {
      actions.push(
        {
          label: i18n.t('buttons.back') || 'Voltar',
          onClick: handleBack,
          disabled: loading,
          variant: 'outlined'
        },
        {
          label: activeStep === steps.length - 2 
            ? (i18n.t('contacts.import.import') || 'Importar') 
            : (i18n.t('buttons.next') || 'Avançar'),
          onClick: handleNext,
          disabled: loading || (activeStep === 1 && (!mappings.name || !mappings.number)),
          variant: 'contained'
        }
      );
    }

    return actions;
  };

  return (
    <StandardModal
      open={open}
      onClose={loading ? undefined : onClose}
      title={i18n.t('contacts.import.title') || 'Importar Contatos'}
      subtitle={`Passo ${activeStep + 1} de ${steps.length}: ${steps[activeStep]}`}
      size="large"
      loading={loading}
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
      actions={getModalActions()}
      fullScreenMobile
    >
      <Box sx={{ mb: 3 }}>
        <Stepper 
          activeStep={activeStep} 
          alternativeLabel={!isMobile}
          orientation={isMobile ? 'vertical' : 'horizontal'}
          sx={{
            '& .MuiStepLabel-root': {
              fontSize: isMobile ? '0.875rem' : '0.8125rem'
            }
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      
      <AnimatedBox style={fadeIn}>
        {renderStepContent()}
      </AnimatedBox>
    </StandardModal>
  );
};

ContactImportModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};

export default ContactImportModal;