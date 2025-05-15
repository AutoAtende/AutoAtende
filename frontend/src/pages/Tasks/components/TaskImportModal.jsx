import React, { useState, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
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
  Divider,
  CircularProgress,
  IconButton,
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
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Assignment as AssignmentIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Help as HelpIcon,
  Download as DownloadIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useSpring, animated } from 'react-spring';
import { parse } from 'papaparse';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { i18n } from "../../../translate/i18n";
import api from '../../../services/api';
import { toast } from "../../../helpers/toast";
import { AuthContext } from "../../../context/Auth/AuthContext";

// Componentes estilizados
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
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.3s ease',
  minHeight: 200,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: `${theme.palette.primary.light}10`,
  }
}));

const StyledListItem = styled(ListItem)(({ theme, hasError }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  backgroundColor: hasError ? `${theme.palette.error.light}20` : `${theme.palette.success.light}20`,
  borderLeft: `3px solid ${hasError ? theme.palette.error.main : theme.palette.success.main}`,
}));

const TaskImportModal = ({ open, onClose, onSuccess }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);
  
  // Estados
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [mappings, setMappings] = useState({
    title: '',
    description: '',
    dueDate: '',
    category: '',
    responsible: '',
    status: '',
  });
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
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
  
  // Passos do processo de importação
  const steps = [
    i18n.t('tasks.import.steps.selectFile'),
    i18n.t('tasks.import.steps.mapFields'),
    i18n.t('tasks.import.steps.review'),
    i18n.t('tasks.import.steps.result'),
  ];
  
  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 300 }
  });
  
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
      toast.error(i18n.t('tasks.import.errors.invalidFileType'));
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
              toast.error(i18n.t('tasks.import.errors.emptyFile'));
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
            
            // Carregar dados auxiliares
            fetchCategories();
            fetchUsers();
          } catch (error) {
            console.error('Erro ao processar arquivo Excel:', error);
            toast.error(i18n.t('tasks.import.errors.parsingFailed'));
            setFile(null);
          } finally {
            setProcessingData(false);
          }
        };
        
        reader.onerror = () => {
          toast.error(i18n.t('tasks.import.errors.readFailed'));
          setFile(null);
          setProcessingData(false);
        };
        
        reader.readAsArrayBuffer(fileObj);
      } else {
        // Processar arquivo CSV
        parse(fileObj, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data.length === 0) {
              toast.error(i18n.t('tasks.import.errors.emptyFile'));
              setFile(null);
              setProcessingData(false);
              return;
            }
            
            setHeaders(Object.keys(results.data[0]));
            setFileData(results.data);
            setActiveStep(1);
            
            // Carregar dados auxiliares
            fetchCategories();
            fetchUsers();
            setProcessingData(false);
          },
          error: (error) => {
            console.error('Erro ao analisar CSV:', error);
            toast.error(i18n.t('tasks.import.errors.parsingFailed'));
            setFile(null);
            setProcessingData(false);
          }
        });
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast.error(i18n.t('tasks.import.errors.processingFailed'));
      setFile(null);
      setProcessingData(false);
    }
  };
  
  // Buscar categorias e usuários para mapeamento
  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/task/category');
      
      if (data && data.success) {
        setCategories(data.data || []);
      } else {
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast.error(i18n.t('tasks.import.errors.fetchCategoriesFailed'));
    }
  };
  
  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users/list');
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error(i18n.t('tasks.import.errors.fetchUsersFailed'));
    }
  };
  
  // Atualizar mapeamentos de campo
  const handleMappingChange = (field) => (event) => {
    setMappings({
      ...mappings,
      [field]: event.target.value
    });
  };
  
  // Validar mapeamentos e dados
  const validateMappingsAndData = () => {
    const errors = [];
    
    // Verificar se o campo de título foi mapeado
    if (!mappings.title) {
      errors.push({
        message: i18n.t('tasks.import.validation.titleRequired'),
        type: 'mapping'
      });
    }
    
    // Validar dados conforme os mapeamentos
    const dataErrors = [];
    
    fileData.forEach((row, index) => {
      const rowErrors = [];
      
      // Validar título
      if (mappings.title && !row[mappings.title]?.trim()) {
        rowErrors.push({
          field: 'title',
          message: i18n.t('tasks.import.validation.emptyTitle')
        });
      }
      
      // Validar data
      if (mappings.dueDate && row[mappings.dueDate]) {
        const dateValue = row[mappings.dueDate];
        const parsedDate = moment(dateValue);
        
        if (!parsedDate.isValid()) {
          rowErrors.push({
            field: 'dueDate',
            message: i18n.t('tasks.import.validation.invalidDate', { value: dateValue })
          });
        }
      }
      
      // Validar categoria
      if (mappings.category && row[mappings.category]) {
        const categoryName = row[mappings.category].trim();
        const categoryExists = categories.some(cat => 
          cat.name.toLowerCase() === categoryName.toLowerCase()
        );
        
        if (!categoryExists) {
          rowErrors.push({
            field: 'category',
            message: i18n.t('tasks.import.validation.invalidCategory', { category: categoryName })
          });
        }
      }
      
      // Validar responsável
      if (mappings.responsible && row[mappings.responsible]) {
        const responsibleName = row[mappings.responsible].trim();
        const userExists = users.some(user => 
          user.name.toLowerCase() === responsibleName.toLowerCase()
        );
        
        if (!userExists) {
          rowErrors.push({
            field: 'responsible',
            message: i18n.t('tasks.import.validation.invalidUser', { user: responsibleName })
          });
        }
      }
      
      // Adicionar erros da linha, se existirem
      if (rowErrors.length > 0) {
        dataErrors.push({
          row: index + 2, // +2 porque índice começa em 0 e temos o cabeçalho
          errors: rowErrors
        });
      }
    });
    
    if (dataErrors.length > 0) {
      errors.push({
        message: i18n.t('tasks.import.validation.dataErrors', { count: dataErrors.length }),
        type: 'data',
        details: dataErrors
      });
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };
  
  // Avançar para o próximo passo
  const handleNext = () => {
    if (activeStep === 1) {
      // Validar mapeamentos antes de avançar para a revisão
      if (!validateMappingsAndData()) {
        toast.error(i18n.t('tasks.import.errors.validationFailed'));
        return;
      }
    }
    
    if (activeStep === 2) {
      // Iniciar importação
      importTasks();
      return;
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  // Voltar para o passo anterior
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Importar tarefas
  const importTasks = async () => {
    setLoading(true);
    
    try {
      const tasksToImport = fileData.map(row => {
        // Preparar os dados da tarefa
        const task = {
          title: mappings.title ? row[mappings.title] : '',
          text: mappings.description ? row[mappings.description] : '',
          dueDate: mappings.dueDate ? moment(row[mappings.dueDate]).format('YYYY-MM-DD HH:mm:ss') : null,
          done: mappings.status ? row[mappings.status].toLowerCase() === 'concluída' || 
                                 row[mappings.status].toLowerCase() === 'concluida' || 
                                 row[mappings.status].toLowerCase() === 'completed' : false,
        };
        
        // Adicionar categoria
        if (mappings.category && row[mappings.category]) {
          const categoryName = row[mappings.category].trim();
          const category = categories.find(cat => 
            cat.name.toLowerCase() === categoryName.toLowerCase()
          );
          
          if (category) {
            task.taskCategoryId = category.id;
          }
        }
        
        // Adicionar responsável
        if (mappings.responsible && row[mappings.responsible]) {
          const responsibleName = row[mappings.responsible].trim();
          const responsibleUser = users.find(user => 
            user.name.toLowerCase() === responsibleName.toLowerCase()
          );
          
          if (responsibleUser) {
            task.responsibleUserId = responsibleUser.id;
          }
        }
        
        return task;
      });
      
      // Enviar para a API para importação em lote
      const response = await api.post('/task/import', { tasks: tasksToImport });
      
      // Atualizar resultados
      setImportResults({
        total: tasksToImport.length,
        successful: response.data.successful || 0,
        failed: response.data.failed || 0,
        errors: response.data.errors || [],
      });
      
      toast.success(i18n.t('tasks.import.success', { 
        count: response.data.successful 
      }));
      
      // Avançar para o último passo
      setActiveStep(3);
    } catch (error) {
      console.error('Erro na importação:', error);
      toast.error(i18n.t('tasks.import.errors.importFailed'));
      
      // Definir resultados de erro
      setImportResults({
        total: fileData.length,
        successful: 0,
        failed: fileData.length,
        errors: [{
          message: error.response?.data?.error || i18n.t('tasks.import.errors.generalError')
        }],
      });
      
      // Avançar para o último passo mesmo em caso de erro
      setActiveStep(3);
    } finally {
      setLoading(false);
    }
  };
  
  // Baixar modelo de importação
  const downloadTemplate = () => {
    try {
      // Criar planilha modelo
      const worksheet = XLSX.utils.aoa_to_sheet([
        ['Título', 'Descrição', 'Data de Vencimento', 'Categoria', 'Responsável', 'Status'],
        ['Reunião com cliente', 'Discutir novos requisitos', '2023-12-31', 'Reuniões', 'Lucas Saud', 'Pendente'],
        ['Implementar nova feature', 'Adicionar suporte a anexos', '2023-12-15', 'Desenvolvimento', 'Lucas Saud', 'Em Progresso'],
      ]);
      
      // Criar workbook e adicionar a planilha
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Tarefas');
      
      // Gerar arquivo
      XLSX.writeFile(workbook, 'modelo_importacao_tarefas.xlsx');
    } catch (error) {
      console.error('Erro ao gerar modelo:', error);
      toast.error(i18n.t('tasks.import.errors.templateGenerationFailed'));
    }
  };
  
  // Reiniciar o processo
  const handleReset = () => {
    setActiveStep(0);
    setFile(null);
    setFileData([]);
    setMappings({
      title: '',
      description: '',
      dueDate: '',
      category: '',
      responsible: '',
      status: '',
    });
    setHeaders([]);
    setValidationErrors([]);
    setImportResults({
      total: 0,
      successful: 0,
      failed: 0,
      errors: [],
    });
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
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {i18n.t('tasks.import.selectFilePrompt')}
            </Typography>
            
            <input
              accept=".csv,.xlsx,.xls"
              id="task-import-file"
              type="file"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              disabled={processingData}
            />
            
            <label htmlFor="task-import-file">
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
                      {i18n.t('tasks.import.processingFile')}
                    </Typography>
                  </>
                ) : (
                  <>
                    <CloudUploadIcon 
                      color="primary" 
                      sx={{ fontSize: 48, mb: 2 }} 
                    />
                    <Typography variant="body1" gutterBottom>
                      {i18n.t('tasks.import.dragAndDrop')}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {i18n.t('tasks.import.or')}
                    </Typography>
                    <Button
                      variant="outlined"
                      component="span"
                      sx={{ mt: 2 }}
                    >
                      {i18n.t('tasks.import.browse')}
                    </Button>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 2 }}>
                      {i18n.t('tasks.import.supportedFormats')}
                    </Typography>
                  </>
                )}
              </UploadContainer>
            </label>
            
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                {i18n.t('tasks.import.needTemplate')}
              </Typography>
              <Button
                variant="text"
                startIcon={<DownloadIcon />}
                onClick={downloadTemplate}
                disabled={processingData}
              >
                {i18n.t('tasks.import.downloadTemplate')}
              </Button>
            </Box>
          </Box>
        );
        
      case 1:
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {i18n.t('tasks.import.mapFields')}
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              {i18n.t('tasks.import.mapFieldsInfo')}
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>{i18n.t('tasks.form.title')}</InputLabel>
                  <Select
                    value={mappings.title}
                    onChange={handleMappingChange('title')}
                    label={i18n.t('tasks.form.title')}
                  >
                    <MenuItem value="">
                      <em>{i18n.t('tasks.import.selectField')}</em>
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
                  <InputLabel>{i18n.t('tasks.form.description')}</InputLabel>
                  <Select
                    value={mappings.description}
                    onChange={handleMappingChange('description')}
                    label={i18n.t('tasks.form.description')}
                  >
                    <MenuItem value="">
                      <em>{i18n.t('tasks.import.selectField')}</em>
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
                  <InputLabel>{i18n.t('tasks.form.dueDate')}</InputLabel>
                  <Select
                    value={mappings.dueDate}
                    onChange={handleMappingChange('dueDate')}
                    label={i18n.t('tasks.form.dueDate')}
                  >
                    <MenuItem value="">
                      <em>{i18n.t('tasks.import.selectField')}</em>
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
                  <InputLabel>{i18n.t('tasks.form.category')}</InputLabel>
                  <Select
                    value={mappings.category}
                    onChange={handleMappingChange('category')}
                    label={i18n.t('tasks.form.category')}
                  >
                    <MenuItem value="">
                      <em>{i18n.t('tasks.import.selectField')}</em>
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
                  <InputLabel>{i18n.t('tasks.form.responsible')}</InputLabel>
                  <Select
                    value={mappings.responsible}
                    onChange={handleMappingChange('responsible')}
                    label={i18n.t('tasks.form.responsible')}
                  >
                    <MenuItem value="">
                      <em>{i18n.t('tasks.import.selectField')}</em>
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
                  <InputLabel>{i18n.t('tasks.form.status')}</InputLabel>
                  <Select
                    value={mappings.status}
                    onChange={handleMappingChange('status')}
                    label={i18n.t('tasks.form.status')}
                  >
                    <MenuItem value="">
                      <em>{i18n.t('tasks.import.selectField')}</em>
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
            
            {validationErrors.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {i18n.t('tasks.import.validationErrors', { count: validationErrors.length })}
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
                              {i18n.t('tasks.import.errorDetails', { count: error.details.length })}
                            </Typography>
                            <Box sx={{ mt: 1, maxHeight: 100, overflow: 'auto' }}>
                              {error.details.slice(0, 3).map((detail, idx) => (
                                <Typography key={idx} variant="caption" display="block">
                                  {i18n.t('tasks.import.rowError', { 
                                    row: detail.row,
                                    error: detail.errors[0].message
                                  })}
                                </Typography>
                              ))}
                              {error.details.length > 3 && (
                                <Typography variant="caption" color="error">
                                  {i18n.t('tasks.import.moreErrors', { 
                                    count: error.details.length - 3
                                  })}
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
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {i18n.t('tasks.import.reviewAndImport')}
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              {i18n.t('tasks.import.reviewInfo')}
            </Alert>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                {i18n.t('tasks.import.summary')}
              </Typography>
              
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {i18n.t('tasks.import.totalRecords')}
                    </Typography>
                    <Typography variant="h6">
                      {fileData.length}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {i18n.t('tasks.import.validRecords')}
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
                        {i18n.t('tasks.import.invalidRecords')}
                      </Typography>
                      <Typography variant="h6" color="error.main">
                      {validationErrors.reduce((acc, curr) => 
                          curr.type === 'data' ? acc + curr.details.length : acc, 0
                        )}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                {i18n.t('tasks.import.mappedFields')}
              </Typography>
              
              <Paper sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  {Object.entries(mappings).map(([field, value]) => (
                    <Grid item xs={12} sm={6} key={field}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {i18n.t(`tasks.form.${field}`)}
                        </Typography>
                        <Typography variant="body1">
                          {value ? value : <em>{i18n.t('tasks.import.notMapped')}</em>}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {i18n.t('tasks.import.previewData')}
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
                              {i18n.t(`tasks.form.${field}`)}
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Paper>
              
              {fileData.length > 5 && (
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  {i18n.t('tasks.import.showingFirst', { count: 5, total: fileData.length })}
                </Typography>
              )}
            </Box>
          </Box>
        );
        
      case 3:
        return (
          <Box sx={{ p: 2 }}>
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={60} sx={{ mb: 3 }} />
                <Typography variant="h6" gutterBottom>
                  {i18n.t('tasks.import.importingTasks')}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {i18n.t('tasks.import.pleaseWait')}
                </Typography>
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
                        {i18n.t('tasks.import.importComplete')}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <ErrorIcon 
                        color="error" 
                        sx={{ fontSize: 64, mb: 2 }} 
                      />
                      <Typography variant="h6" gutterBottom>
                        {i18n.t('tasks.import.importFailed')}
                      </Typography>
                    </>
                  )}
                </Box>
                
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="textSecondary">
                        {i18n.t('tasks.import.totalProcessed')}
                      </Typography>
                      <Typography variant="h5">
                        {importResults.total}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="textSecondary">
                        {i18n.t('tasks.import.successful')}
                      </Typography>
                      <Typography variant="h5" color="success.main">
                        {importResults.successful}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="textSecondary">
                        {i18n.t('tasks.import.failed')}
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
                      {i18n.t('tasks.import.errors')}
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
                        {i18n.t('tasks.import.moreErrors', { 
                          count: importResults.errors.length - 5 
                        })}
                      </Typography>
                    )}
                  </Box>
                )}
                
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  {importResults.successful > 0 ? (
                    <Typography variant="body1">
                      {i18n.t('tasks.import.successMessage', { 
                        count: importResults.successful 
                      })}
                    </Typography>
                  ) : (
                    <Typography variant="body1" color="error">
                      {i18n.t('tasks.import.failureMessage')}
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

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {i18n.t('tasks.import.title')}
          </Typography>
          
          <IconButton
            onClick={loading ? undefined : onClose}
            disabled={loading}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <Box sx={{ px: 3, pt: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      
      <DialogContent>
        <AnimatedBox style={fadeIn}>
          {renderStepContent()}
        </AnimatedBox>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        {activeStep === 0 ? (
          <Button onClick={onClose} disabled={loading}>
            {i18n.t('buttons.cancel')}
          </Button>
        ) : activeStep === steps.length - 1 ? (
          <>
            <Button onClick={handleReset} disabled={loading}>
              {i18n.t('tasks.import.importAnother')}
            </Button>
            <Button 
              variant="contained" 
              onClick={handleFinish}
              disabled={loading}
            >
              {i18n.t('buttons.finish')}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleBack} disabled={loading}>
              {i18n.t('buttons.back')}
            </Button>
            <Button 
              variant="contained" 
              onClick={handleNext}
              disabled={loading || (activeStep === 1 && !mappings.title)}
            >
              {activeStep === steps.length - 2 
                ? i18n.t('tasks.import.import') 
                : i18n.t('buttons.next')}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};


export default TaskImportModal;